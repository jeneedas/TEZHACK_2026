package com.example.ziva.presentation.ui.tracking

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.NearMe
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Security
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
import androidx.compose.ui.text.font.FontWeight
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
import com.example.ui.theme.ZivaSuccess
import com.example.ui.theme.ZivaSurface
import com.example.ui.theme.ZivaSurfaceVariant
import com.example.ui.theme.ZivaText
import com.example.ziva.data.local.TrackingSessionEntity
import com.example.ziva.presentation.component.CustomMapCanvas
import com.example.ziva.presentation.component.LiveStatusBadge

@Composable
fun AssistanceTrackingScreen(
    session: TrackingSessionEntity?,
    onCallHelper: () -> Unit,
    onSmsHelper: () -> Unit,
    onCompleteRescue: (String) -> Unit,
    getString: (String) -> String
) {
    val scrollState = rememberScrollState()

    if (session == null) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(ZivaBackground)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .clip(CircleShape)
                        .background(ZivaSurface),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.DirectionsCar,
                        contentDescription = "No active rescue",
                        tint = ZivaSecondary,
                        modifier = Modifier.size(36.dp)
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "No Active Assistance Tracking",
                    color = ZivaText,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Trigger an SOS alert or request a volunteer to start live ride-hailing style tracking.",
                    color = ZivaSecondary,
                    fontSize = 13.sp,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }
        }
        return
    }

    val secondsAgo = ((System.currentTimeMillis() - session.lastUpdated) / 1000).coerceAtLeast(0)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ZivaBackground)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Top Status Header: ETA & Live Status
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = getString("eta_label").uppercase(),
                    color = ZivaSecondary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "${session.etaMinutes} MIN AWAY",
                    color = ZivaPrimary,
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Black
                )
            }

            // Stale vs Live indicator
            LiveStatusBadge(
                isLive = session.isLive,
                lastSeenSecondsAgo = secondsAgo
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Live Vector Map Canvas with Helper & User marker
        CustomMapCanvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(260.dp)
                .testTag("tracking_live_map"),
            userPos = Pair(0.5f, 0.7f),
            helperPos = Pair(0.72f, 0.32f)
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Assigned Helper Profile Card
        Card(
            colors = CardDefaults.cardColors(containerColor = ZivaSurface),
            shape = RoundedCornerShape(20.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, ZivaCardBorderSubtle),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(ZivaCyanTint),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = "Assigned Responder",
                                tint = ZivaAccent,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = session.helperName,
                                color = ZivaText,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${session.helperRole} • Unit #402",
                                color = ZivaAccent,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    // Contact Actions
                    Row {
                        IconButton(
                            onClick = onSmsHelper,
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(ZivaSurfaceVariant)
                                .testTag("sms_responder_button")
                        ) {
                            Icon(Icons.Default.Message, contentDescription = "SMS Responder", tint = ZivaPrimary, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        IconButton(
                            onClick = onCallHelper,
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(ZivaPrimary)
                                .testTag("call_responder_button")
                        ) {
                            Icon(Icons.Default.Phone, contentDescription = "Call Responder", tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // STATUS TIMELINE: Requested -> Assigned -> En Route -> Arrived -> Completed
        Card(
            colors = CardDefaults.cardColors(containerColor = ZivaSurface),
            shape = RoundedCornerShape(20.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, ZivaCardBorderSubtle),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Rescue Mission Timeline",
                    color = ZivaText,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(14.dp))

                val steps = listOf(
                    Triple("REQUESTED", "Emergency SOS Logged", "Captured in local Room DB & BLE beacon"),
                    Triple("ASSIGNED", "First Responder Dispatched", "Lt. Maya Lin accepted rescue task"),
                    Triple("EN_ROUTE", "Rescuer En Route (ETA 3m)", "Equipped with swiftwater/first-aid gear"),
                    Triple("ARRIVED", "Arrived at GPS Location", "Making direct visual contact"),
                    Triple("COMPLETED", "Evacuated & Safe", "Rescue mission closed successfully")
                )

                val currentStepIndex = when (session.status) {
                    "REQUESTED" -> 0
                    "ASSIGNED" -> 1
                    "EN_ROUTE" -> 2
                    "ARRIVED" -> 3
                    "COMPLETED" -> 4
                    else -> 2
                }

                steps.forEachIndexed { index, step ->
                    val isDone = index <= currentStepIndex
                    val isCurrent = index == currentStepIndex

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.Top
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.width(28.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(22.dp)
                                    .clip(CircleShape)
                                    .background(
                                        when {
                                            isDone -> ZivaPrimary
                                            else -> ZivaSurfaceVariant
                                        }
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                if (isDone) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(14.dp)
                                    )
                                } else {
                                    Box(
                                        modifier = Modifier
                                            .size(6.dp)
                                            .clip(CircleShape)
                                            .background(ZivaSecondary)
                                    )
                                }
                            }

                            if (index < steps.size - 1) {
                                Box(
                                    modifier = Modifier
                                        .width(2.dp)
                                        .height(34.dp)
                                        .background(if (index < currentStepIndex) ZivaPrimary else ZivaSurfaceVariant)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.padding(bottom = 12.dp)) {
                            Text(
                                text = step.second,
                                color = if (isDone) ZivaText else ZivaSecondary,
                                fontSize = 13.sp,
                                fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.SemiBold
                            )
                            Text(
                                text = step.third,
                                color = ZivaSecondary,
                                fontSize = 11.sp
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Complete Rescue Action
        Button(
            onClick = { onCompleteRescue(session.requestId) },
            colors = ButtonDefaults.buttonColors(containerColor = ZivaSuccess),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .testTag("mark_safe_button")
        ) {
            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color.White)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Mark Myself Safe / Mission Completed",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}
