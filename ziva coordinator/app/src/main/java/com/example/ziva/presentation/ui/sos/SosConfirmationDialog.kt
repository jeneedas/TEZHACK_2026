package com.example.ziva.presentation.ui.sos

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.Radio
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.ui.theme.ZivaAccent
import com.example.ui.theme.ZivaBackground
import com.example.ui.theme.ZivaCardBorder
import com.example.ui.theme.ZivaPrimary
import com.example.ui.theme.ZivaSecondary
import com.example.ui.theme.ZivaSosRed
import com.example.ui.theme.ZivaSuccess
import com.example.ui.theme.ZivaSurface
import com.example.ui.theme.ZivaText
import com.example.ziva.data.local.SosRequestEntity
import com.example.ziva.presentation.component.SyncStatusBadge

@Composable
fun SosConfirmationDialog(
    sosEntity: SosRequestEntity?,
    onNavigateToTrack: () -> Unit,
    onCancelSos: (String) -> Unit,
    onDismiss: () -> Unit,
    getString: (String) -> String
) {
    if (sosEntity == null) return

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            colors = CardDefaults.cardColors(containerColor = ZivaSurface),
            shape = RoundedCornerShape(24.dp),
            border = androidx.compose.foundation.BorderStroke(1.5.dp, ZivaAccent),
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .padding(12.dp)
                .testTag("sos_confirmation_dialog")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header with close
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(ZivaSuccess.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "SOS Transmitted",
                                tint = ZivaSuccess,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "SOS Broadcast Active",
                            color = ZivaText,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Dismiss",
                            tint = ZivaSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // MANDATORY: Request ID Display in Accent #06B6D4
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(ZivaBackground)
                        .border(1.dp, ZivaAccent.copy(alpha = 0.6f), RoundedCornerShape(14.dp))
                        .padding(vertical = 14.dp, horizontal = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = getString("request_id_label"),
                        color = ZivaSecondary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = sosEntity.requestId,
                        color = ZivaAccent, // Accent #06B6D4 for request ID display
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 2.sp,
                        modifier = Modifier.testTag("sos_request_id_text")
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Saved locally in Room queue with persistent UUID",
                        color = ZivaSecondary,
                        fontSize = 11.sp
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Status row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Transmission Status:",
                        color = ZivaSecondary,
                        fontSize = 13.sp
                    )
                    SyncStatusBadge(
                        status = sosEntity.status,
                        hops = sosEntity.bleHops
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Auto-captured data list
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(ZivaBackground)
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Emergency Type", color = ZivaSecondary, fontSize = 12.sp)
                        Text(sosEntity.emergencyType, color = ZivaText, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("GPS Coordinates", color = ZivaSecondary, fontSize = 12.sp)
                        Text("${sosEntity.latitude}°, ${sosEntity.longitude}°", color = ZivaText, fontSize = 12.sp)
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Battery Level", color = ZivaSecondary, fontSize = 12.sp)
                        Text("${sosEntity.batteryLevel}%", color = ZivaText, fontSize = 12.sp)
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("BLE Multi-Hop Relay", color = ZivaSecondary, fontSize = 12.sp)
                        Text("${sosEntity.bleHops} hops across mesh", color = ZivaAccent, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                    if (sosEntity.notes.isNotEmpty()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Attached Notes", color = ZivaSecondary, fontSize = 12.sp)
                            Text(sosEntity.notes, color = ZivaText, fontSize = 12.sp, maxLines = 1)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Action Buttons
                Button(
                    onClick = {
                        onDismiss()
                        onNavigateToTrack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = ZivaPrimary),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("track_assistance_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Navigation,
                        contentDescription = "Track Help",
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Track Arriving Assistance",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedButton(
                    onClick = {
                        onCancelSos(sosEntity.requestId)
                    },
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, ZivaSosRed.copy(alpha = 0.5f)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("cancel_sos_button")
                ) {
                    Text(
                        text = "Cancel SOS / Mark Safe",
                        color = ZivaSosRed,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}
