package com.example.ziva.presentation.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.ziva.data.local.AppDatabase
import com.example.ziva.data.local.ResourceEntity
import com.example.ziva.data.local.SosRequestEntity
import com.example.ziva.data.local.TrackingSessionEntity
import com.example.ziva.data.local.VolunteerEntity
import com.example.ziva.data.repository.SyncQueueStatus
import com.example.ziva.data.repository.ZivaRepository
import com.example.ziva.service.ble.BleMeshStats
import com.example.ziva.service.ble.BleRelayEngine
import com.example.ziva.util.AppLanguage
import com.example.ziva.util.LanguageManager
import com.example.ziva.util.TelemetryManager
import com.example.ziva.util.TelemetryState
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class MainTab {
    SOS,
    RESOURCES,
    TRACK,
    PROFILE
}

data class ZivaUiState(
    val selectedTab: MainTab = MainTab.SOS,
    val selectedLanguage: AppLanguage = AppLanguage.ENGLISH,
    val telemetry: TelemetryState = TelemetryState(),
    val selectedEmergencyType: String = "GENERAL",
    val isSosActive: Boolean = false,
    val activeSosRequestId: String? = null,
    val showSosConfirmation: Boolean = false,
    val showSilenceWarning: Boolean = false,
    val isLoudAlertEnabled: Boolean = true,
    val voiceNoteText: String = "",
    val showVoiceDialog: Boolean = false,
    val isRecordingVoice: Boolean = false,
    // Resource screen filters
    val selectedResourceCategory: String = "ALL", // ALL, WATER, FOOD, MEDICINE, SHELTER
    val onlyFreshResources: Boolean = false,
    val isResourceMapView: Boolean = false,
    val selectedResource: ResourceEntity? = null,
    // Tracking & Helper
    val selectedVolunteer: VolunteerEntity? = null,
    val showVolunteerContactDialog: Boolean = false,
    val showHistoryDialog: Boolean = false,
    val userNotificationMessage: String? = null
)

class ZivaViewModel(application: Application) : AndroidViewModel(application) {

    private val database = AppDatabase.getInstance(application)
    private val telemetryManager = TelemetryManager(application)
    private val bleEngine = BleRelayEngine(database.bleRelayDao())
    private val repository = ZivaRepository(database, bleEngine, telemetryManager)

    private val _uiState = MutableStateFlow(ZivaUiState())
    val uiState: StateFlow<ZivaUiState> = _uiState.asStateFlow()

    val allSosRequests: StateFlow<List<SosRequestEntity>> = repository.allSosRequests
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val latestSosRequest: StateFlow<SosRequestEntity?> = repository.latestSosRequest
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val allResources: StateFlow<List<ResourceEntity>> = repository.allResources
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allVolunteers: StateFlow<List<VolunteerEntity>> = repository.allVolunteers
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val activeTrackingSession: StateFlow<TrackingSessionEntity?> = repository.activeTrackingSession
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val bleMeshStats: StateFlow<BleMeshStats> = repository.bleMeshStats
    val syncStatus: StateFlow<SyncQueueStatus> = repository.syncStatus
    val simulatedOffline: StateFlow<Boolean> = repository.simulatedOffline

    private var silenceEscalationJob: Job? = null

    init {
        refreshTelemetry()
        // Check if device is in silent mode to prompt silence awareness
        val telemetry = repository.getTelemetry()
        if (telemetry.isSilentMode) {
            _uiState.value = _uiState.value.copy(showSilenceWarning = true)
            startSilenceEscalationTimer()
        }
    }

    fun refreshTelemetry() {
        val telemetry = repository.getTelemetry()
        _uiState.value = _uiState.value.copy(telemetry = telemetry)
    }

    fun selectTab(tab: MainTab) {
        _uiState.value = _uiState.value.copy(selectedTab = tab)
    }

    fun setLanguage(language: AppLanguage) {
        _uiState.value = _uiState.value.copy(selectedLanguage = language)
    }

    fun getString(key: String): String {
        return LanguageManager.getString(key, _uiState.value.selectedLanguage)
    }

    fun setEmergencyType(type: String) {
        _uiState.value = _uiState.value.copy(selectedEmergencyType = type)
    }

    fun toggleLoudAlert(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(isLoudAlertEnabled = enabled)
    }

    fun setVoiceNote(note: String) {
        _uiState.value = _uiState.value.copy(voiceNoteText = note)
    }

    fun openVoiceDialog(show: Boolean) {
        _uiState.value = _uiState.value.copy(showVoiceDialog = show)
    }

    fun toggleSimulateVoiceRecord() {
        val current = _uiState.value.isRecordingVoice
        if (!current) {
            _uiState.value = _uiState.value.copy(isRecordingVoice = true)
            viewModelScope.launch {
                delay(2000)
                _uiState.value = _uiState.value.copy(
                    isRecordingVoice = false,
                    voiceNoteText = "Trapped on roof, flash flood rising rapidly. Need immediate boat evac.",
                    showVoiceDialog = false,
                    userNotificationMessage = "Voice note transcribed and attached to SOS."
                )
            }
        } else {
            _uiState.value = _uiState.value.copy(isRecordingVoice = false)
        }
    }

    fun triggerSos() {
        silenceEscalationJob?.cancel()
        viewModelScope.launch {
            val entity = repository.createSosRequest(
                emergencyType = _uiState.value.selectedEmergencyType,
                notes = _uiState.value.voiceNoteText,
                loudAlert = _uiState.value.isLoudAlertEnabled
            )
            _uiState.value = _uiState.value.copy(
                isSosActive = true,
                activeSosRequestId = entity.requestId,
                showSosConfirmation = true,
                showSilenceWarning = false
            )
        }
    }

    fun dismissSosConfirmation() {
        _uiState.value = _uiState.value.copy(showSosConfirmation = false)
    }

    fun cancelOrResolveSos(requestId: String) {
        viewModelScope.launch {
            repository.stopAlertTone()
            repository.resolveSos(requestId)
            _uiState.value = _uiState.value.copy(
                isSosActive = false,
                activeSosRequestId = null,
                showSosConfirmation = false,
                userNotificationMessage = "SOS $requestId marked as resolved."
            )
        }
    }

    fun dismissSilenceWarning(escalateSound: Boolean) {
        silenceEscalationJob?.cancel()
        _uiState.value = _uiState.value.copy(
            showSilenceWarning = false,
            isLoudAlertEnabled = escalateSound
        )
        if (escalateSound) {
            repository.triggerAlertFeedback(withSound = true)
            viewModelScope.launch {
                delay(1500)
                repository.stopAlertTone()
            }
        }
    }

    private fun startSilenceEscalationTimer() {
        silenceEscalationJob?.cancel()
        silenceEscalationJob = viewModelScope.launch {
            // Per spec: Silence Awareness: If no acknowledgment within N seconds (10s), escalates to loud alert.
            delay(10000)
            if (_uiState.value.showSilenceWarning) {
                _uiState.value = _uiState.value.copy(
                    showSilenceWarning = false,
                    isLoudAlertEnabled = true,
                    userNotificationMessage = "Escalated to loud siren due to silence timeout."
                )
                repository.triggerAlertFeedback(withSound = true)
                delay(2000)
                repository.stopAlertTone()
            }
        }
    }

    fun filterResourceCategory(cat: String) {
        _uiState.value = _uiState.value.copy(selectedResourceCategory = cat)
    }

    fun toggleFreshOnly() {
        _uiState.value = _uiState.value.copy(onlyFreshResources = !_uiState.value.onlyFreshResources)
    }

    fun toggleResourceMapView(isMap: Boolean) {
        _uiState.value = _uiState.value.copy(isResourceMapView = isMap)
    }

    fun selectResource(resource: ResourceEntity?) {
        _uiState.value = _uiState.value.copy(selectedResource = resource)
    }

    fun selectVolunteer(volunteer: VolunteerEntity?) {
        _uiState.value = _uiState.value.copy(
            selectedVolunteer = volunteer,
            showVolunteerContactDialog = volunteer != null
        )
    }

    fun dismissVolunteerDialog() {
        _uiState.value = _uiState.value.copy(showVolunteerContactDialog = false, selectedVolunteer = null)
    }

    fun toggleHistoryDialog(show: Boolean) {
        _uiState.value = _uiState.value.copy(showHistoryDialog = show)
    }

    fun toggleBleMesh(enabled: Boolean) {
        repository.toggleBleMesh(enabled)
    }

    fun toggleSimulatedOffline(offline: Boolean) {
        repository.setSimulatedOffline(offline)
        refreshTelemetry()
    }

    fun forceSync() {
        viewModelScope.launch {
            val success = repository.triggerManualSync()
            _uiState.value = _uiState.value.copy(
                userNotificationMessage = if (success) "Queue successfully synced to cloud!" else "Sync failed: Network offline. Stored in Room."
            )
        }
    }

    fun clearNotificationMessage() {
        _uiState.value = _uiState.value.copy(userNotificationMessage = null)
    }

    fun reportResourceUpdate(resourceId: String, newCount: Int) {
        viewModelScope.launch {
            repository.updateResourceAvailability(resourceId, newCount)
            _uiState.value = _uiState.value.copy(
                selectedResource = null,
                userNotificationMessage = "Resource availability updated & flagged fresh."
            )
        }
    }
}
