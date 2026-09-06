package com.example.ziva.presentation.ui.tracking

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.ZivaAccent
import com.example.ui.theme.ZivaBackground
import com.example.ui.theme.ZivaCyanTint
import com.example.ui.theme.ZivaPrimary
import com.example.ui.theme.ZivaSecondary
import com.example.ui.theme.ZivaSuccess
import com.example.ui.theme.ZivaSurface
import com.example.ui.theme.ZivaSurfaceVariant
import com.example.ui.theme.ZivaText
import com.example.ziva.data.local.TrackingSessionEntity

@Composable
fun AssistanceTrackingScreen(
    session: TrackingSessionEntity?,
    onCallHelper: () -> Unit,
    onSmsHelper: () -> Unit,
    onCompleteRescue: (String) -> Unit,
    getString: (String) -> String
) {

    // ============================================================
    // NO ACTIVE TRACKING
    // ============================================================

    if (session == null) {

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(ZivaBackground),
            contentAlignment = Alignment.Center
        ) {

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(24.dp)
            ) {

                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .clip(CircleShape)
                        .background(ZivaSurface),
                    contentAlignment = Alignment.Center
                ) {

                    Icon(
                        imageVector = Icons.Default.DirectionsCar,
                        contentDescription = null,
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

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Trigger an SOS or request assistance to start live tracking.",
                    color = ZivaSecondary,
                    fontSize = 13.sp
                )
            }
        }

        return
    }

    // ============================================================
    // ACTIVE TRACKING
    // ============================================================

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ZivaBackground)
            .padding(16.dp)
    ) {

        // --------------------------------------------------------
        // HEADER
        // --------------------------------------------------------

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {

            Column {

                Text(
                    text = "ASSISTANCE TRACKING",
                    color = ZivaSecondary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "${session.etaMinutes} MIN AWAY",
                    color = ZivaPrimary,
                    fontSize = 27.sp,
                    fontWeight = FontWeight.Black
                )
            }

            // Simple LIVE indicator.
            // No animation / graphicsLayer / custom component.

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {

                Box(
                    modifier = Modifier
                        .size(9.dp)
                        .clip(CircleShape)
                        .background(ZivaAccent)
                )

                Spacer(modifier = Modifier.width(6.dp))

                Text(
                    text = if (session.isLive) "LIVE" else "OFFLINE",
                    color = if (session.isLive) {
                        ZivaAccent
                    } else {
                        ZivaSecondary
                    },
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // --------------------------------------------------------
        // MAP / LOCATION PANEL
        // --------------------------------------------------------

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(235.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(ZivaSurface),
            contentAlignment = Alignment.Center
        ) {

            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {

                Box(
                    modifier = Modifier
                        .size(68.dp)
                        .clip(CircleShape)
                        .background(ZivaPrimary),
                    contentAlignment = Alignment.Center
                ) {

                    Icon(
                        imageVector = Icons.Default.DirectionsCar,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(32.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "RESPONDER EN ROUTE",
                    color = ZivaText,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(5.dp))

                Text(
                    text = "Unit #402 • ${session.etaMinutes} minutes away",
                    color = ZivaSecondary,
                    fontSize = 12.sp
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "●  LIVE LOCATION",
                    color = ZivaAccent,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // --------------------------------------------------------
        // RESPONDER
        // --------------------------------------------------------

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(18.dp))
                .background(ZivaSurface)
                .padding(15.dp)
        ) {

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {

                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(ZivaCyanTint),
                    contentAlignment = Alignment.Center
                ) {

                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        tint = ZivaAccent,
                        modifier = Modifier.size(24.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(
                    modifier = Modifier.weight(1f)
                ) {

                    Text(
                        text = session.helperName,
                        color = ZivaText,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(3.dp))

                    Text(
                        text = "${session.helperRole} • Unit #402",
                        color = ZivaAccent,
                        fontSize = 12.sp
                    )
                }

                IconButton(
                    onClick = onSmsHelper,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(ZivaSurfaceVariant)
                ) {

                    Icon(
                        imageVector = Icons.Default.Message,
                        contentDescription = "Message responder",
                        tint = ZivaPrimary
                    )
                }

                Spacer(modifier = Modifier.width(6.dp))

                IconButton(
                    onClick = onCallHelper,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(ZivaPrimary)
                ) {

                    Icon(
                        imageVector = Icons.Default.Phone,
                        contentDescription = "Call responder",
                        tint = Color.White
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // --------------------------------------------------------
        // STATUS
        // --------------------------------------------------------

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(18.dp))
                .background(ZivaSurface)
                .padding(15.dp)
        ) {

            Column {

                Text(
                    text = "RESCUE STATUS",
                    color = ZivaSecondary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(12.dp))

                TrackingStatusRow(
                    title = "SOS REQUESTED",
                    description = "Emergency alert received",
                    active = true
                )

                TrackingStatusRow(
                    title = "RESPONDER ASSIGNED",
                    description = session.helperName,
                    active = true
                )

                TrackingStatusRow(
                    title = "EN ROUTE",
                    description = "Responder is travelling to your location",
                    active = session.status == "EN_ROUTE" ||
                            session.status == "ARRIVED" ||
                            session.status == "COMPLETED"
                )

                TrackingStatusRow(
                    title = "ARRIVED",
                    description = "Responder reached your location",
                    active = session.status == "ARRIVED" ||
                            session.status == "COMPLETED"
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // --------------------------------------------------------
        // COMPLETE
        // --------------------------------------------------------

        Button(
            onClick = {
                onCompleteRescue(session.requestId)
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = ZivaSuccess
            )
        ) {

            Icon(
                imageVector = Icons.Default.CheckCircle,
                contentDescription = null,
                tint = Color.White
            )

            Spacer(modifier = Modifier.width(8.dp))

            Text(
                text = "MARK MYSELF SAFE",
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

// ================================================================
// SIMPLE STATUS ROW
// ================================================================

@Composable
private fun TrackingStatusRow(
    title: String,
    description: String,
    active: Boolean
) {

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {

        Box(
            modifier = Modifier
                .size(25.dp)
                .clip(CircleShape)
                .background(
                    if (active) {
                        ZivaPrimary
                    } else {
                        ZivaSurfaceVariant
                    }
                ),
            contentAlignment = Alignment.Center
        ) {

            if (active) {

                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(15.dp)
                )
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column {

            Text(
                text = title,
                color = if (active) ZivaText else ZivaSecondary,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = description,
                color = ZivaSecondary,
                fontSize = 10.sp
            )
        }
    }
}