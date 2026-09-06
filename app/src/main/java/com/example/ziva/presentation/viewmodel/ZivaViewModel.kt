package com.example.ziva.presentation.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.ziva.data.local.AppDatabase
import com.example.ziva.data.local.ResourceEntity
import com.example.ziva.data.local.SavedResourceEntity
import com.example.ziva.data.local.SosRequestEntity
import com.example.ziva.data.local.TrackingSessionEntity
import com.example.ziva.data.local.VolunteerEntity
import com.example.ziva.data.remote.FirebaseSosService
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
import kotlinx.coroutines.flow.map
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
    val selectedResourceCategory: String = "ALL",
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

    // =========================================================
    // DATABASE
    // =========================================================

    private val database =
        AppDatabase.getInstance(application)

    private val telemetryManager =
        TelemetryManager(application)

    private val bleEngine =
        BleRelayEngine(database.bleRelayDao())


    // =========================================================
    // FIREBASE
    // =========================================================

    private val firebaseSosService =
        FirebaseSosService()


    // =========================================================
    // REPOSITORY
    // =========================================================

    private val repository =
        ZivaRepository(
            database = database,
            bleEngine = bleEngine,
            telemetryManager = telemetryManager,
            firebaseSosService = firebaseSosService
        )


    // =========================================================
    // UI STATE
    // =========================================================

    private val _uiState =
        MutableStateFlow(ZivaUiState())

    val uiState: StateFlow<ZivaUiState> =
        _uiState.asStateFlow()


    // =========================================================
    // SOS DATA
    // =========================================================

    val allSosRequests: StateFlow<List<SosRequestEntity>> =
        repository.allSosRequests
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(5000),
                emptyList()
            )


    val latestSosRequest: StateFlow<SosRequestEntity?> =
        repository.latestSosRequest
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(5000),
                null
            )


    // =========================================================
    // RESOURCES
    // =========================================================

    val allResources: StateFlow<List<ResourceEntity>> =
        repository.allResources
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(5000),
                emptyList()
            )


    // =========================================================
    // SAVED RESOURCES
    // =========================================================

    /**
     * Contains the resource IDs that the user has saved.
     *
     * Example:
     * ["res_water_01", "res_food_02"]
     */
    val savedResourceIds: StateFlow<Set<String>> =
        database.savedResourceDao()
            .getAllSavedResources()
            .map { savedResources ->
                savedResources
                    .map { it.resourceId }
                    .toSet()
            }
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(5000),
                emptySet()
            )


    // =========================================================
    // VOLUNTEERS
    // =========================================================

    val allVolunteers: StateFlow<List<VolunteerEntity>> =
        repository.allVolunteers
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(5000),
                emptyList()
            )


    // =========================================================
    // TRACKING
    // =========================================================

    val activeTrackingSession: StateFlow<TrackingSessionEntity?> =
        repository.activeTrackingSession
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(5000),
                null
            )


    // =========================================================
    // BLE + SYNC
    // =========================================================

    val bleMeshStats: StateFlow<BleMeshStats> =
        repository.bleMeshStats

    val syncStatus: StateFlow<SyncQueueStatus> =
        repository.syncStatus

    val simulatedOffline: StateFlow<Boolean> =
        repository.simulatedOffline


    private var silenceEscalationJob: Job? = null


    // =========================================================
    // INITIALIZATION
    // =========================================================

    init {

        refreshTelemetry()

        // Check if device is in silent mode
        val telemetry =
            repository.getTelemetry()

        if (telemetry.isSilentMode) {

            _uiState.value =
                _uiState.value.copy(
                    showSilenceWarning = true
                )

            startSilenceEscalationTimer()
        }
    }


    // =========================================================
    // TELEMETRY
    // =========================================================

    fun refreshTelemetry() {

        val telemetry =
            repository.getTelemetry()

        _uiState.value =
            _uiState.value.copy(
                telemetry = telemetry
            )
    }


    // =========================================================
    // NAVIGATION
    // =========================================================

    fun selectTab(tab: MainTab) {

        _uiState.value =
            _uiState.value.copy(
                selectedTab = tab
            )
    }


    // =========================================================
    // LANGUAGE
    // =========================================================

    fun setLanguage(language: AppLanguage) {

        _uiState.value =
            _uiState.value.copy(
                selectedLanguage = language
            )
    }


    fun getString(key: String): String {

        return LanguageManager.getString(
            key,
            _uiState.value.selectedLanguage
        )
    }


    // =========================================================
    // SOS SETTINGS
    // =========================================================

    fun setEmergencyType(type: String) {

        _uiState.value =
            _uiState.value.copy(
                selectedEmergencyType = type
            )
    }


    fun toggleLoudAlert(enabled: Boolean) {

        _uiState.value =
            _uiState.value.copy(
                isLoudAlertEnabled = enabled
            )
    }


    // =========================================================
    // VOICE NOTE
    // =========================================================

    fun setVoiceNote(note: String) {

        _uiState.value =
            _uiState.value.copy(
                voiceNoteText = note
            )
    }


    fun openVoiceDialog(show: Boolean) {

        _uiState.value =
            _uiState.value.copy(
                showVoiceDialog = show
            )
    }


    fun toggleSimulateVoiceRecord() {

        val current =
            _uiState.value.isRecordingVoice

        if (!current) {

            _uiState.value =
                _uiState.value.copy(
                    isRecordingVoice = true
                )

            viewModelScope.launch {

                delay(2000)

                _uiState.value =
                    _uiState.value.copy(

                        isRecordingVoice = false,

                        voiceNoteText =
                            "Trapped on roof, flash flood rising rapidly. Need immediate boat evac.",

                        showVoiceDialog = false,

                        userNotificationMessage =
                            "Voice note transcribed and attached to SOS."
                    )
            }

        } else {

            _uiState.value =
                _uiState.value.copy(
                    isRecordingVoice = false
                )
        }
    }


    // =========================================================
    // SOS
    // =========================================================

    fun triggerSos() {

        silenceEscalationJob?.cancel()

        viewModelScope.launch {

            val entity =
                repository.createSosRequest(

                    emergencyType =
                        _uiState.value.selectedEmergencyType,

                    notes =
                        _uiState.value.voiceNoteText,

                    loudAlert =
                        _uiState.value.isLoudAlertEnabled
                )


            _uiState.value =
                _uiState.value.copy(

                    isSosActive = true,

                    activeSosRequestId =
                        entity.requestId,

                    showSosConfirmation = true,

                    showSilenceWarning = false
                )
        }
    }


    fun dismissSosConfirmation() {

        _uiState.value =
            _uiState.value.copy(
                showSosConfirmation = false
            )
    }


    fun cancelOrResolveSos(
        requestId: String
    ) {

        viewModelScope.launch {

            repository.stopAlertTone()

            repository.resolveSos(requestId)

            _uiState.value =
                _uiState.value.copy(

                    isSosActive = false,

                    activeSosRequestId = null,

                    showSosConfirmation = false,

                    userNotificationMessage =
                        "SOS $requestId marked as resolved."
                )
        }
    }


    // =========================================================
    // SILENCE WARNING
    // =========================================================

    fun dismissSilenceWarning(
        escalateSound: Boolean
    ) {

        silenceEscalationJob?.cancel()

        _uiState.value =
            _uiState.value.copy(

                showSilenceWarning = false,

                isLoudAlertEnabled = escalateSound
            )


        if (escalateSound) {

            repository.triggerAlertFeedback(
                withSound = true
            )

            viewModelScope.launch {

                delay(1500)

                repository.stopAlertTone()
            }
        }
    }


    private fun startSilenceEscalationTimer() {

        silenceEscalationJob?.cancel()

        silenceEscalationJob =
            viewModelScope.launch {

                // 10 second silence timeout
                delay(10000)

                if (_uiState.value.showSilenceWarning) {

                    _uiState.value =
                        _uiState.value.copy(

                            showSilenceWarning = false,

                            isLoudAlertEnabled = true,

                            userNotificationMessage =
                                "Escalated to loud siren due to silence timeout."
                        )

                    repository.triggerAlertFeedback(
                        withSound = true
                    )

                    delay(2000)

                    repository.stopAlertTone()
                }
            }
    }


    // =========================================================
    // RESOURCES
    // =========================================================

    fun filterResourceCategory(
        cat: String
    ) {

        _uiState.value =
            _uiState.value.copy(
                selectedResourceCategory = cat
            )
    }


    fun toggleFreshOnly() {

        _uiState.value =
            _uiState.value.copy(
                onlyFreshResources =
                    !_uiState.value.onlyFreshResources
            )
    }


    fun toggleResourceMapView(
        isMap: Boolean
    ) {

        _uiState.value =
            _uiState.value.copy(
                isResourceMapView = isMap
            )
    }


    fun selectResource(
        resource: ResourceEntity?
    ) {

        _uiState.value =
            _uiState.value.copy(
                selectedResource = resource
            )
    }


    // =========================================================
    // SAVE FOR LATER
    // =========================================================

    /**
     * Saves a resource if it isn't saved.
     * Removes it if it is already saved.
     */
    fun toggleSavedResource(
        resourceId: String
    ) {

        viewModelScope.launch {

            val dao =
                database.savedResourceDao()

            val alreadySaved =
                dao.isResourceSavedOnce(resourceId)

            if (alreadySaved) {

                dao.removeSavedResource(resourceId)

                _uiState.value =
                    _uiState.value.copy(
                        userNotificationMessage =
                            "Resource removed from Saved."
                    )

            } else {

                dao.saveResource(
                    SavedResourceEntity(
                        resourceId = resourceId
                    )
                )

                _uiState.value =
                    _uiState.value.copy(
                        userNotificationMessage =
                            "Resource saved for later."
                    )
            }
        }
    }


    // =========================================================
    // VOLUNTEERS
    // =========================================================

    fun selectVolunteer(
        volunteer: VolunteerEntity?
    ) {

        _uiState.value =
            _uiState.value.copy(

                selectedVolunteer = volunteer,

                showVolunteerContactDialog =
                    volunteer != null
            )
    }


    fun dismissVolunteerDialog() {

        _uiState.value =
            _uiState.value.copy(

                showVolunteerContactDialog = false,

                selectedVolunteer = null
            )
    }


    // =========================================================
    // HISTORY
    // =========================================================

    fun toggleHistoryDialog(
        show: Boolean
    ) {

        _uiState.value =
            _uiState.value.copy(
                showHistoryDialog = show
            )
    }


    // =========================================================
    // BLE
    // =========================================================

    fun toggleBleMesh(
        enabled: Boolean
    ) {

        repository.toggleBleMesh(
            enabled
        )
    }


    // =========================================================
    // OFFLINE SIMULATION
    // =========================================================

    fun toggleSimulatedOffline(
        offline: Boolean
    ) {

        repository.setSimulatedOffline(
            offline
        )

        refreshTelemetry()
    }


    // =========================================================
    // FIREBASE SYNC
    // =========================================================

    fun forceSync() {

        viewModelScope.launch {

            val success =
                repository.triggerManualSync()


            _uiState.value =
                _uiState.value.copy(

                    userNotificationMessage =
                        if (success) {

                            "Queue successfully synced to cloud!"

                        } else {

                            "Sync failed: Network offline. Stored in Room."
                        }
                )
        }
    }


    // =========================================================
    // RESOURCE UPDATE
    // =========================================================

    fun reportResourceUpdate(
        resourceId: String,
        newCount: Int
    ) {

        viewModelScope.launch {

            repository.updateResourceAvailability(
                resourceId,
                newCount
            )

            _uiState.value =
                _uiState.value.copy(

                    selectedResource = null,

                    userNotificationMessage =
                        "Resource availability updated & flagged fresh."
                )
        }
    }


    // =========================================================
    // NOTIFICATIONS
    // =========================================================

    fun clearNotificationMessage() {

        _uiState.value =
            _uiState.value.copy(
                userNotificationMessage = null
            )
    }
}