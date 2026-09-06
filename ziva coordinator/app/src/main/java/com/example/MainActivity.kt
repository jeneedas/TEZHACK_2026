package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Emergency
import androidx.compose.material.icons.filled.Inventory
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.ZivaAccent
import com.example.ui.theme.ZivaBackground
import com.example.ui.theme.ZivaPrimary
import com.example.ui.theme.ZivaSecondary
import com.example.ui.theme.ZivaSurface
import com.example.ziva.presentation.component.VoiceNoteDialog
import com.example.ziva.presentation.ui.resources.ResourceDetailDialog
import com.example.ziva.presentation.ui.resources.ResourceListMapScreen
import com.example.ziva.presentation.ui.resources.VolunteerContactDialog
import com.example.ziva.presentation.ui.roles.RoleHubScreen
import com.example.ziva.presentation.ui.sos.RequestHistoryDialog
import com.example.ziva.presentation.ui.sos.SosConfirmationDialog
import com.example.ziva.presentation.ui.sos.SosTriggerScreen
import com.example.ziva.presentation.ui.tracking.AssistanceTrackingScreen
import com.example.ziva.presentation.viewmodel.MainTab
import com.example.ziva.presentation.viewmodel.ZivaViewModel


class MainActivity : ComponentActivity() {

    private val viewModel: ZivaViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                ZivaApp(
                    viewModel = viewModel
                )
            }
        }
    }
}


@Composable
fun ZivaApp(
    viewModel: ZivaViewModel
) {

    // =========================================================
    // COLLECT VIEWMODEL STATE
    // =========================================================

    val uiState by
    viewModel.uiState.collectAsState()

    val latestSos by
    viewModel.latestSosRequest.collectAsState()

    val allSosRequests by
    viewModel.allSosRequests.collectAsState()

    val allResources by
    viewModel.allResources.collectAsState()

    val allVolunteers by
    viewModel.allVolunteers.collectAsState()

    val activeTracking by
    viewModel.activeTrackingSession.collectAsState()

    val bleMeshStats by
    viewModel.bleMeshStats.collectAsState()

    val syncStatus by
    viewModel.syncStatus.collectAsState()

    val simulatedOffline by
    viewModel.simulatedOffline.collectAsState()

    // =========================================================
    // SAVE FOR LATER
    // =========================================================

    val savedResourceIds by
    viewModel.savedResourceIds.collectAsState()

    // =========================================================
    // SNACKBAR
    // =========================================================

    val snackbarHostState =
        remember {
            SnackbarHostState()
        }

    LaunchedEffect(
        uiState.userNotificationMessage
    ) {

        uiState.userNotificationMessage?.let { msg ->

            snackbarHostState.showSnackbar(
                msg
            )

            viewModel.clearNotificationMessage()
        }
    }

    // =========================================================
    // SCAFFOLD
    // =========================================================

    Scaffold(

        modifier =
            Modifier.fillMaxSize(),

        contentWindowInsets =
            WindowInsets.statusBars,

        snackbarHost = {
            SnackbarHost(
                hostState =
                    snackbarHostState
            )
        },

        // =====================================================
        // BOTTOM NAVIGATION
        // =====================================================

        bottomBar = {

            NavigationBar(

                containerColor =
                    ZivaSurface,

                tonalElevation =
                    0.dp,

                windowInsets =
                    WindowInsets.navigationBars,

                modifier =
                    Modifier
                        .testTag(
                            "bottom_navigation_bar"
                        )
                        .drawBehind {

                            drawLine(

                                color =
                                    Color(0x14FFFFFF),

                                start =
                                    Offset(
                                        0f,
                                        0f
                                    ),

                                end =
                                    Offset(
                                        size.width,
                                        0f
                                    ),

                                strokeWidth =
                                    1.dp.toPx()
                            )
                        }

            ) {

                // =================================================
                // 1. SOS TAB
                // =================================================

                NavigationBarItem(

                    selected =
                        uiState.selectedTab ==
                                MainTab.SOS,

                    onClick = {
                        viewModel.selectTab(
                            MainTab.SOS
                        )
                    },

                    icon = {

                        Box {

                            Icon(
                                imageVector =
                                    Icons.Default.Emergency,

                                contentDescription =
                                    "SOS Tab",

                                tint =
                                    if (
                                        uiState.selectedTab ==
                                        MainTab.SOS
                                    )
                                        ZivaPrimary
                                    else
                                        ZivaSecondary,

                                modifier =
                                    Modifier.size(
                                        22.dp
                                    )
                            )

                            if (
                                latestSos != null &&
                                latestSos?.status !=
                                "RESOLVED"
                            ) {

                                Box(
                                    modifier =
                                        Modifier
                                            .size(7.dp)
                                            .clip(
                                                CircleShape
                                            )
                                            .background(
                                                ZivaPrimary
                                            )
                                )
                            }
                        }
                    },

                    label = {

                        Text(
                            text = "SOS",
                            fontWeight =
                                FontWeight.Bold,
                            fontSize = 10.sp,
                            letterSpacing =
                                0.5.sp
                        )
                    },

                    colors =
                        NavigationBarItemDefaults.colors(

                            selectedIconColor =
                                ZivaPrimary,

                            selectedTextColor =
                                ZivaPrimary,

                            unselectedIconColor =
                                ZivaSecondary,

                            unselectedTextColor =
                                ZivaSecondary,

                            indicatorColor =
                                ZivaPrimary.copy(
                                    alpha = 0.15f
                                )
                        ),

                    modifier =
                        Modifier.testTag(
                            "nav_tab_sos"
                        )
                )

                // =================================================
                // 2. HELP TAB
                // =================================================

                NavigationBarItem(

                    selected =
                        uiState.selectedTab ==
                                MainTab.RESOURCES,

                    onClick = {
                        viewModel.selectTab(
                            MainTab.RESOURCES
                        )
                    },

                    icon = {

                        Icon(
                            imageVector =
                                Icons.Default.Inventory,

                            contentDescription =
                                "Resources Tab",

                            modifier =
                                Modifier.size(
                                    22.dp
                                )
                        )
                    },

                    label = {

                        Text(
                            text = "HELP",
                            fontWeight =
                                FontWeight.Bold,
                            fontSize = 10.sp,
                            letterSpacing =
                                0.5.sp
                        )
                    },

                    colors =
                        NavigationBarItemDefaults.colors(

                            selectedIconColor =
                                ZivaPrimary,

                            selectedTextColor =
                                ZivaPrimary,

                            unselectedIconColor =
                                ZivaSecondary,

                            unselectedTextColor =
                                ZivaSecondary,

                            indicatorColor =
                                ZivaPrimary.copy(
                                    alpha = 0.15f
                                )
                        ),

                    modifier =
                        Modifier.testTag(
                            "nav_tab_resources"
                        )
                )

                // =================================================
                // 3. TRACK TAB
                // =================================================

                NavigationBarItem(

                    selected =
                        uiState.selectedTab ==
                                MainTab.TRACK,

                    onClick = {
                        viewModel.selectTab(
                            MainTab.TRACK
                        )
                    },

                    icon = {

                        Box {

                            Icon(
                                imageVector =
                                    Icons.Default.Navigation,

                                contentDescription =
                                    "Track Tab",

                                modifier =
                                    Modifier.size(
                                        22.dp
                                    )
                            )

                            if (
                                activeTracking != null
                            ) {

                                Box(
                                    modifier =
                                        Modifier
                                            .size(7.dp)
                                            .clip(
                                                CircleShape
                                            )
                                            .background(
                                                ZivaAccent
                                            )
                                )
                            }
                        }
                    },

                    label = {

                        Text(
                            text = "TRACK",
                            fontWeight =
                                FontWeight.Bold,
                            fontSize = 10.sp,
                            letterSpacing =
                                0.5.sp
                        )
                    },

                    colors =
                        NavigationBarItemDefaults.colors(

                            selectedIconColor =
                                ZivaPrimary,

                            selectedTextColor =
                                ZivaPrimary,

                            unselectedIconColor =
                                ZivaSecondary,

                            unselectedTextColor =
                                ZivaSecondary,

                            indicatorColor =
                                ZivaPrimary.copy(
                                    alpha = 0.15f
                                )
                        ),

                    modifier =
                        Modifier.testTag(
                            "nav_tab_track"
                        )
                )

                // =================================================
                // 4. USER / ROLES TAB
                // =================================================

                NavigationBarItem(

                    selected =
                        uiState.selectedTab ==
                                MainTab.PROFILE,

                    onClick = {
                        viewModel.selectTab(
                            MainTab.PROFILE
                        )
                    },

                    icon = {

                        Icon(
                            imageVector =
                                Icons.Default.Settings,

                            contentDescription =
                                "User Roles",

                            modifier =
                                Modifier.size(
                                    22.dp
                                )
                        )
                    },

                    label = {

                        Text(
                            text = "USER",
                            fontWeight =
                                FontWeight.Bold,
                            fontSize = 10.sp,
                            letterSpacing =
                                0.5.sp
                        )
                    },

                    colors =
                        NavigationBarItemDefaults.colors(

                            selectedIconColor =
                                ZivaPrimary,

                            selectedTextColor =
                                ZivaPrimary,

                            unselectedIconColor =
                                ZivaSecondary,

                            unselectedTextColor =
                                ZivaSecondary,

                            indicatorColor =
                                ZivaPrimary.copy(
                                    alpha = 0.15f
                                )
                        ),

                    modifier =
                        Modifier.testTag(
                            "nav_tab_settings"
                        )
                )
            }
        }

    ) { innerPadding ->

        Box(
            modifier =
                Modifier
                    .fillMaxSize()
                    .padding(
                        innerPadding
                    )
        ) {

            when (
                uiState.selectedTab
            ) {

                // =================================================
                // SOS
                // =================================================

                MainTab.SOS -> {

                    SosTriggerScreen(

                        uiState =
                            uiState,

                        onTriggerSos = {
                            viewModel.triggerSos()
                        },

                        onEmergencyTypeChange = {
                            viewModel.setEmergencyType(
                                it
                            )
                        },

                        onToggleLoudAlert = {
                            viewModel.toggleLoudAlert(
                                it
                            )
                        },

                        onOpenVoiceDialog = {
                            viewModel.openVoiceDialog(
                                true
                            )
                        },

                        onDismissSilenceWarning = {
                                escalate ->

                            viewModel.dismissSilenceWarning(
                                escalate
                            )
                        },

                        onOpenHistory = {
                            viewModel.toggleHistoryDialog(
                                true
                            )
                        },

                        onSelectLanguage = {
                            viewModel.setLanguage(
                                it
                            )
                        },

                        getString = {
                            viewModel.getString(
                                it
                            )
                        }
                    )
                }


                // =================================================
                // HELP / RESOURCES
                // =================================================

                MainTab.RESOURCES -> {

                    ResourceListMapScreen(

                        uiState =
                            uiState,

                        resources =
                            allResources,

                        volunteers =
                            allVolunteers,

                        savedResourceIds =
                            savedResourceIds,

                        onToggleSaved = { resourceId ->

                            viewModel.toggleSavedResource(
                                resourceId
                            )
                        },

                        onSelectCategory = {
                            viewModel.filterResourceCategory(
                                it
                            )
                        },

                        onToggleFreshOnly = {
                            viewModel.toggleFreshOnly()
                        },

                        onToggleMapView = {
                            viewModel.toggleResourceMapView(
                                it
                            )
                        },

                        onSelectResource = {
                            viewModel.selectResource(
                                it
                            )
                        },

                        onSelectVolunteer = {
                            viewModel.selectVolunteer(
                                it
                            )
                        },

                        getString = {
                            viewModel.getString(
                                it
                            )
                        }
                    )
                }


                // =================================================
                // TRACK
                // =================================================

                MainTab.TRACK -> {

                    AssistanceTrackingScreen(

                        session =
                            activeTracking,

                        onCallHelper = {
                            // presentation-safe
                        },

                        onSmsHelper = {
                            // presentation-safe
                        },

                        onCompleteRescue = { reqId ->

                            viewModel.cancelOrResolveSos(
                                reqId
                            )
                        },

                        getString = {
                            viewModel.getString(
                                it
                            )
                        }
                    )
                }


                // =================================================
                // USER / ROLE SELECTION
                // =================================================

                MainTab.PROFILE -> {

                    RoleHubScreen(

                        sosRequests =
                            allSosRequests,

                        onExit = {

                            viewModel.selectTab(
                                MainTab.SOS
                            )
                        }
                    )
                }
            }


            // =====================================================
            // SOS CONFIRMATION
            // =====================================================

            if (
                uiState.showSosConfirmation
            ) {

                SosConfirmationDialog(

                    sosEntity =
                        latestSos,

                    onNavigateToTrack = {

                        viewModel.dismissSosConfirmation()

                        viewModel.selectTab(
                            MainTab.TRACK
                        )
                    },

                    onCancelSos = { reqId ->

                        viewModel.cancelOrResolveSos(
                            reqId
                        )
                    },

                    onDismiss = {

                        viewModel.dismissSosConfirmation()
                    },

                    getString = {

                        viewModel.getString(
                            it
                        )
                    }
                )
            }


            // =====================================================
            // VOICE NOTE
            // =====================================================

            if (
                uiState.showVoiceDialog
            ) {

                VoiceNoteDialog(

                    initialText =
                        uiState.voiceNoteText,

                    isRecording =
                        uiState.isRecordingVoice,

                    onToggleRecord = {

                        viewModel.toggleSimulateVoiceRecord()
                    },

                    onSaveText = {

                        viewModel.setVoiceNote(
                            it
                        )
                    },

                    onDismiss = {

                        viewModel.openVoiceDialog(
                            false
                        )
                    }
                )
            }


            // =====================================================
            // RESOURCE DETAIL
            // =====================================================

            uiState.selectedResource?.let { resource ->

                ResourceDetailDialog(

                    resource =
                        resource,

                    onDismiss = {

                        viewModel.selectResource(
                            null
                        )
                    },

                    onUpdateAvailability = { newCount ->

                        viewModel.reportResourceUpdate(
                            resource.resourceId,
                            newCount
                        )
                    }
                )
            }


            // =====================================================
            // VOLUNTEER CONTACT
            // =====================================================

            if (
                uiState.showVolunteerContactDialog &&
                uiState.selectedVolunteer != null
            ) {

                VolunteerContactDialog(

                    volunteer =
                        uiState.selectedVolunteer!!,

                    onDismiss = {

                        viewModel.dismissVolunteerDialog()
                    }
                )
            }


            // =====================================================
            // REQUEST HISTORY
            // =====================================================

            if (
                uiState.showHistoryDialog
            ) {

                RequestHistoryDialog(

                    requests =
                        allSosRequests,

                    onDismiss = {

                        viewModel.toggleHistoryDialog(
                            false
                        )
                    }
                )
            }
        }
    }
}