package com.example.ziva.presentation.ui.sos

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.Emergency
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.HomeWork
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.NotificationsOff
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.WarningAmber
import androidx.compose.material.icons.filled.WaterDamage
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.ZivaAccent
import com.example.ui.theme.ZivaBackground
import com.example.ui.theme.ZivaBlueTint
import com.example.ui.theme.ZivaCardBorder
import com.example.ui.theme.ZivaCardBorderSubtle
import com.example.ui.theme.ZivaCyanTint
import com.example.ui.theme.ZivaPrimary
import com.example.ui.theme.ZivaSecondary
import com.example.ui.theme.ZivaSosRed
import com.example.ui.theme.ZivaSosRedDark
import com.example.ui.theme.ZivaSuccess
import com.example.ui.theme.ZivaSurface
import com.example.ui.theme.ZivaSurfaceVariant
import com.example.ui.theme.ZivaText
import com.example.ui.theme.ZivaWarning
import com.example.ziva.presentation.component.BatteryBadge
import com.example.ziva.presentation.viewmodel.ZivaUiState
import com.example.ziva.util.AppLanguage

data class EmergencyTypeOption(
    val id: String,
    val label: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector
)

@Composable
fun SosTriggerScreen(
    uiState: ZivaUiState,
    onTriggerSos: () -> Unit,
    onEmergencyTypeChange: (String) -> Unit,
    onToggleLoudAlert: (Boolean) -> Unit,
    onOpenVoiceDialog: () -> Unit,
    onDismissSilenceWarning: (Boolean) -> Unit,
    onOpenHistory: () -> Unit,
    onSelectLanguage: (AppLanguage) -> Unit,
    getString: (String) -> String
) {
    val scrollState = rememberScrollState()
    var showLanguageMenu by remember { mutableStateOf(false) }

    val infiniteTransition = rememberInfiniteTransition(label = "sos_beacon")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.14f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "sos_scale"
    )

    val emergencyTypes = listOf(
        EmergencyTypeOption("GENERAL", "General Emergency", Icons.Default.Emergency),
        EmergencyTypeOption("MEDICAL", "Medical / CPR", Icons.Default.Emergency),
        EmergencyTypeOption("FLOOD_TRAPPED", "Flood / Trapped", Icons.Default.WaterDamage),
        EmergencyTypeOption("FIRE", "Fire Hazard", Icons.Default.ElectricBolt),
        EmergencyTypeOption("SEARCH_RESCUE", "Search & Rescue", Icons.Default.Shield)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ZivaBackground)
            .verticalScroll(scrollState)
            .padding(horizontal = 20.dp, vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top Header Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left: Offline/Online mode indicator with pulse dot
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(
                            if (uiState.telemetry.connectivityState == "OFFLINE") Color(0xFFF97316) else ZivaSuccess
                        )
                )
                Text(
                    text = if (uiState.telemetry.connectivityState == "OFFLINE") "OFFLINE MODE" else "CONNECTED",
                    color = ZivaSecondary,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp
                )
            }

            // Right: Battery status badge & action buttons
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Battery indicator
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0x1AFFFFFF))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = "Battery telemetry",
                        tint = if (uiState.telemetry.isBatteryLow) ZivaSosRed else ZivaText,
                        modifier = Modifier.size(13.dp)
                    )
                    Text(
                        text = "${uiState.telemetry.batteryPercent}%",
                        color = ZivaText,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                // Language Selector Button
                Box {
                    IconButton(
                        onClick = { showLanguageMenu = true },
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(Color(0x1AFFFFFF))
                            .testTag("language_selector_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Language,
                            contentDescription = "Change Language",
                            tint = ZivaAccent,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    DropdownMenu(
                        expanded = showLanguageMenu,
                        onDismissRequest = { showLanguageMenu = false },
                        modifier = Modifier.background(ZivaSurface)
                    ) {
                        AppLanguage.values().forEach { lang ->
                            DropdownMenuItem(
                                text = {
                                    Text(
                                        text = "${lang.nativeName} (${lang.displayName})",
                                        color = if (uiState.selectedLanguage == lang) ZivaAccent else ZivaText
                                    )
                                },
                                onClick = {
                                    onSelectLanguage(lang)
                                    showLanguageMenu = false
                                }
                            )
                        }
                    }
                }

                // History Button
                IconButton(
                    onClick = onOpenHistory,
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(Color(0x1AFFFFFF))
                        .testTag("open_history_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.History,
                        contentDescription = "Past SOS Requests",
                        tint = ZivaText,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Hero Brand Title & Subtitle per Professional Polish specification
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "ZIVA",
                color = ZivaText,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = (-0.5).sp
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "Disaster Response Interface",
                color = ZivaSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Telemetry Chip Row (Battery, Connectivity, GPS Coordinates)
        Card(
            colors = CardDefaults.cardColors(containerColor = ZivaSurface),
            shape = RoundedCornerShape(20.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, ZivaCardBorderSubtle),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Connectivity State
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(
                                if (uiState.telemetry.connectivityState == "OFFLINE") Color(0xFFF97316) else ZivaSuccess
                            )
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (uiState.telemetry.connectivityState == "OFFLINE") "OFFLINE (BLE Mesh)" else uiState.telemetry.connectivityState,
                        color = ZivaText,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                // GPS Location
                Text(
                    text = "GPS: 37.77° N, 122.42° W",
                    color = ZivaSecondary,
                    fontSize = 11.sp
                )

                // Battery Badge
                BatteryBadge(
                    percent = uiState.telemetry.batteryPercent,
                    isLow = uiState.telemetry.isBatteryLow
                )
            }
        }

        // Silence Awareness Banner (Mandated Requirement)
        if (uiState.showSilenceWarning) {
            Spacer(modifier = Modifier.height(10.dp))
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF451A03)),
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, ZivaWarning),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("silence_warning_banner")
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.NotificationsOff,
                            contentDescription = "Silent mode detected",
                            tint = ZivaWarning,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = getString("silence_detected"),
                            color = ZivaText,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        Button(
                            onClick = { onDismissSilenceWarning(false) },
                            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                            modifier = Modifier.testTag("keep_silent_button")
                        ) {
                            Text(getString("keep_silent"), color = ZivaSecondary, fontSize = 12.sp)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = { onDismissSilenceWarning(true) },
                            colors = ButtonDefaults.buttonColors(containerColor = ZivaWarning),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.testTag("escalate_sound_button")
                        ) {
                            Text(getString("confirm_sound"), color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        // Low Battery Preservation Warning (if <= 15%)
        if (uiState.telemetry.isBatteryLow) {
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(ZivaSosRed.copy(alpha = 0.15f))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = "Battery Warning",
                    tint = ZivaSosRed,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = getString("battery_warning"),
                    color = ZivaText,
                    fontSize = 11.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // EMERGENCY TYPE SELECTOR
        Text(
            text = getString("emergency_type").uppercase(),
            color = ZivaSecondary,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            letterSpacing = 1.2.sp,
            modifier = Modifier.align(Alignment.Start)
        )

        Spacer(modifier = Modifier.height(8.dp))

        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(emergencyTypes) { item ->
                val isSelected = uiState.selectedEmergencyType == item.id
                val chipBorder = if (isSelected) ZivaPrimary else ZivaCardBorderSubtle
                val chipBg = if (isSelected) ZivaBlueTint else ZivaSurface

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(14.dp))
                        .background(chipBg)
                        .border(1.dp, chipBorder, RoundedCornerShape(14.dp))
                        .clickable { onEmergencyTypeChange(item.id) }
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                        .testTag("emergency_chip_${item.id.lowercase()}")
                ) {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.label,
                        tint = if (isSelected) ZivaPrimary else ZivaSecondary,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = item.label,
                        color = if (isSelected) ZivaText else ZivaSecondary,
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(26.dp))

        // GIANT ONE-TAP SOS BUTTON (Professional Polish Theme: Blue Button with 8dp #1E293B border & Ambient Glow)
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(240.dp)
                .scale(pulseScale)
        ) {
            // Outer ambient pulsating aura
            Box(
                modifier = Modifier
                    .size(230.dp)
                    .clip(CircleShape)
                    .background(ZivaPrimary.copy(alpha = 0.15f))
            )
            // Middle ring
            Box(
                modifier = Modifier
                    .size(200.dp)
                    .clip(CircleShape)
                    .background(ZivaPrimary.copy(alpha = 0.25f))
            )
            // Core clickable SOS button with 8.dp surface border
            Surface(
                modifier = Modifier
                    .size(176.dp)
                    .clip(CircleShape)
                    .clickable { onTriggerSos() }
                    .testTag("sos_trigger_button"),
                shape = CircleShape,
                color = ZivaPrimary,
                border = androidx.compose.foundation.BorderStroke(8.dp, ZivaSurface),
                shadowElevation = 20.dp
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color(0xFF3B82F6), Color(0xFF2563EB))
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Emergency,
                            contentDescription = "SOS Alert Trigger",
                            tint = Color.White,
                            modifier = Modifier.size(42.dp)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "SOS",
                            color = Color.White,
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 4.sp
                        )
                        Text(
                            text = "ONE-TAP BROADCAST",
                            color = Color.White.copy(alpha = 0.85f),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.5.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        Text(
            text = getString("tap_instruction"),
            color = ZivaSecondary,
            fontSize = 13.sp,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = getString("auto_capture"),
            color = ZivaAccent,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium
        )

        Spacer(modifier = Modifier.height(24.dp))

        // NEARBY RESOURCES PREVIEW CARD (Professional Polish Theme Component)
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = "NEARBY RESOURCES",
                color = ZivaSecondary,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 1.2.sp
            )
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                colors = CardDefaults.cardColors(containerColor = ZivaSurface),
                shape = RoundedCornerShape(24.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, ZivaCardBorderSubtle),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Cyan tinted icon container
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(ZivaCyanTint),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.HomeWork,
                            contentDescription = "Shelter Icon",
                            tint = ZivaAccent,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Relief Center B-4",
                            color = ZivaText,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(ZivaPrimary)
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "Available",
                                    color = Color.White,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Text(
                                text = "800m away",
                                color = ZivaSecondary,
                                fontSize = 11.sp
                            )
                        }
                    }
                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "Open resource detail",
                        tint = ZivaSecondary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Tap or long press to trigger emergency broadcast via BLE relay nodes.",
                color = ZivaSecondary,
                fontSize = 11.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // SOS Controls Card: Siren Toggle & Voice Note Attachment
        Card(
            colors = CardDefaults.cardColors(containerColor = ZivaSurface),
            shape = RoundedCornerShape(24.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, ZivaCardBorderSubtle),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                // Siren Toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (uiState.isLoudAlertEnabled) Icons.Default.NotificationsActive else Icons.Default.NotificationsOff,
                            contentDescription = "Alert siren setting",
                            tint = if (uiState.isLoudAlertEnabled) ZivaAccent else ZivaSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = if (uiState.isLoudAlertEnabled) "Loud Alarm & Vibration" else "Silent Emergency Beacon",
                                color = ZivaText,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = if (uiState.isLoudAlertEnabled) "Escalates siren on SOS" else "Discrete broadcast mode",
                                color = ZivaSecondary,
                                fontSize = 11.sp
                            )
                        }
                    }
                    Switch(
                        checked = uiState.isLoudAlertEnabled,
                        onCheckedChange = onToggleLoudAlert,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = ZivaPrimary,
                            uncheckedThumbColor = ZivaSecondary,
                            uncheckedTrackColor = ZivaSurfaceVariant
                        ),
                        modifier = Modifier.testTag("loud_alert_switch")
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Voice Note / Description preview
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(ZivaBackground)
                        .border(1.dp, ZivaCardBorderSubtle, RoundedCornerShape(14.dp))
                        .clickable { onOpenVoiceDialog() }
                        .padding(horizontal = 14.dp, vertical = 12.dp)
                        .testTag("voice_note_button"),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Mic,
                            contentDescription = "Attach voice note",
                            tint = if (uiState.voiceNoteText.isNotEmpty()) ZivaAccent else ZivaSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (uiState.voiceNoteText.isEmpty()) getString("voice_note") else uiState.voiceNoteText,
                            color = if (uiState.voiceNoteText.isEmpty()) ZivaSecondary else ZivaText,
                            fontSize = 12.sp,
                            maxLines = 1
                        )
                    }
                    Text(
                        text = if (uiState.voiceNoteText.isEmpty()) "Add" else "Edit",
                        color = ZivaPrimary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}
