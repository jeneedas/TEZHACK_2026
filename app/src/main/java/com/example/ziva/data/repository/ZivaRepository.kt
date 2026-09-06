package com.example.ziva.data.repository

import com.example.ziva.data.local.AppDatabase
import com.example.ziva.data.local.ResourceEntity
import com.example.ziva.data.local.SosRequestEntity
import com.example.ziva.data.local.TrackingSessionEntity
import com.example.ziva.data.local.VolunteerEntity
import com.example.ziva.service.ble.BleMeshStats
import com.example.ziva.service.ble.BleRelayEngine
import com.example.ziva.util.TelemetryManager
import com.example.ziva.util.TelemetryState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

data class SyncQueueStatus(
    val unsyncedCount: Int = 0,
    val lastSyncTimestamp: Long = 0L,
    val isSyncing: Boolean = false,
    val lastError: String? = null
)

class ZivaRepository(
    private val database: AppDatabase,
    private val bleEngine: BleRelayEngine,
    private val telemetryManager: TelemetryManager
) {
    private val scope = CoroutineScope(Dispatchers.IO)

    val allSosRequests: Flow<List<SosRequestEntity>> = database.sosDao().getAllSosRequests()
    val latestSosRequest: Flow<SosRequestEntity?> = database.sosDao().getLatestSosRequest()
    val allResources: Flow<List<ResourceEntity>> = database.resourceDao().getAllResources()
    val allVolunteers: Flow<List<VolunteerEntity>> = database.volunteerDao().getAllVolunteers()
    val activeTrackingSession: Flow<TrackingSessionEntity?> = database.trackingDao().getActiveTrackingSession()
    val bleMeshStats: StateFlow<BleMeshStats> = bleEngine.meshStats

    private val _syncStatus = MutableStateFlow(SyncQueueStatus())
    val syncStatus: StateFlow<SyncQueueStatus> = _syncStatus.asStateFlow()

    private val _simulatedOffline = MutableStateFlow(false)
    val simulatedOffline: StateFlow<Boolean> = _simulatedOffline.asStateFlow()

    fun setSimulatedOffline(offline: Boolean) {
        _simulatedOffline.value = offline
    }

    fun getTelemetry(): TelemetryState {
        return telemetryManager.getTelemetryState(_simulatedOffline.value)
    }

    fun triggerAlertFeedback(withSound: Boolean) {
        telemetryManager.triggerEmergencyVibration()
        if (withSound) {
            telemetryManager.triggerLoudTone()
        }
    }

    fun stopAlertTone() {
        telemetryManager.stopTone()
    }

    suspend fun createSosRequest(
        emergencyType: String,
        notes: String,
        loudAlert: Boolean
    ): SosRequestEntity {
        val telemetry = getTelemetry()
        val requestId = "SOS-" + UUID.randomUUID().toString().take(8).uppercase()
        val timestamp = System.currentTimeMillis()

        triggerAlertFeedback(loudAlert)

        // 1. Immediate local save to Room DB (offline-first)
        val entity = SosRequestEntity(
            requestId = requestId,
            userId = "citizen_" + UUID.randomUUID().toString().take(6),
            latitude = telemetry.latitude,
            longitude = telemetry.longitude,
            timestamp = timestamp,
            batteryLevel = telemetry.batteryPercent,
            connectivityState = telemetry.connectivityState,
            status = if (telemetry.connectivityState == "OFFLINE") "RELAYING_BLE" else "SYNCED",
            syncState = if (telemetry.connectivityState == "OFFLINE") "PENDING" else "SYNCED",
            retryCount = 0,
            emergencyType = emergencyType,
            bleHops = if (telemetry.connectivityState == "OFFLINE") 1 else 0,
            notes = notes
        )
        database.sosDao().insertSos(entity)

        // 2. Broadcast via BLE store-and-forward relay
        scope.launch {
            bleEngine.createAndBroadcastSosPacket(
                requestId = requestId,
                lat = telemetry.latitude,
                lng = telemetry.longitude,
                emergencyType = emergencyType
            )

            // Simulate multi-hop propagation across local relief mesh
            delay(1500)
            database.sosDao().updateBleHops(requestId, 2, "RELAYING_BLE")
            delay(2000)
            database.sosDao().updateBleHops(requestId, 3, "RELAYING_BLE")

            // If connected or mesh reaches an internet-connected node, auto-sync
            if (!_simulatedOffline.value && telemetry.connectivityState != "OFFLINE") {
                delay(1200)
                database.sosDao().updateSyncStatus(requestId, "SYNCED_TO_CLOUD", "SYNCED")
            }
        }

        // 3. Automatically initiate tracking session with nearest first responder
        createTrackingSessionForRequest(requestId, emergencyType, telemetry.latitude, telemetry.longitude)

        updateSyncCount()
        return entity
    }

    private suspend fun createTrackingSessionForRequest(
        requestId: String,
        emergencyType: String,
        userLat: Double,
        userLng: Double
    ) {
        val now = System.currentTimeMillis()
        val tracking = TrackingSessionEntity(
            sessionId = "trk_" + UUID.randomUUID().toString().take(8),
            requestId = requestId,
            helperId = "vol_01",
            helperName = "Lt. Maya Lin",
            helperPhone = "+1 (555) 019-2831",
            helperRole = if (emergencyType == "MEDICAL") "Trauma Paramedic" else "Disaster Search & Rescue",
            helperLatitude = userLat + 0.0055,
            helperLongitude = userLng + 0.0040,
            userLatitude = userLat,
            userLongitude = userLng,
            etaMinutes = 4,
            status = "ASSIGNED",
            lastUpdated = now,
            isLive = true
        )
        database.trackingDao().insertOrUpdate(tracking)

        // Simulate live progression of assistance
        scope.launch {
            delay(3000)
            database.trackingDao().updateTrackingState(
                sessionId = tracking.sessionId,
                status = "EN_ROUTE",
                etaMinutes = 3,
                lat = userLat + 0.0035,
                lng = userLng + 0.0025,
                lastUpdated = System.currentTimeMillis()
            )
        }
    }

    suspend fun triggerManualSync(): Boolean {
        _syncStatus.value = _syncStatus.value.copy(isSyncing = true, lastError = null)
        val unsynced = database.sosDao().getUnsyncedSosRequests()

        if (unsynced.isEmpty()) {
            _syncStatus.value = _syncStatus.value.copy(
                isSyncing = false,
                lastSyncTimestamp = System.currentTimeMillis()
            )
            return true
        }

        if (_simulatedOffline.value) {
            delay(800)
            _syncStatus.value = _syncStatus.value.copy(
                isSyncing = false,
                lastError = "Network unavailable. Retaining in local Room queue."
            )
            return false
        }

        delay(1200) // Simulating network upload with exponential backoff logic
        for (item in unsynced) {
            database.sosDao().updateSyncStatus(item.requestId, "SYNCED_TO_CLOUD", "SYNCED")
        }

        _syncStatus.value = _syncStatus.value.copy(
            isSyncing = false,
            unsyncedCount = 0,
            lastSyncTimestamp = System.currentTimeMillis()
        )
        return true
    }

    private suspend fun updateSyncCount() {
        val unsynced = database.sosDao().getUnsyncedSosRequests()
        _syncStatus.value = _syncStatus.value.copy(unsyncedCount = unsynced.size)
    }

    suspend fun updateResourceAvailability(resourceId: String, delta: Int) {
        val current = database.resourceDao().getAllResources()
        // Simple update
        val now = System.currentTimeMillis()
        database.resourceDao().updateAvailability(resourceId, delta, now)
    }

    suspend fun resolveSos(requestId: String) {
        database.sosDao().updateSyncStatus(requestId, "RESOLVED", "SYNCED")
    }

    fun toggleBleMesh(enabled: Boolean) {
        bleEngine.toggleMeshRelay(enabled)
    }
}
