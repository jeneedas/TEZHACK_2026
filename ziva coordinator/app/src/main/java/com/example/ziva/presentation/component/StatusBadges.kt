package com.example.ziva.presentation.component

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.BatteryAlert
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudQueue
import androidx.compose.material.icons.filled.Radio
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
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
import com.example.ui.theme.ZivaPrimary
import com.example.ui.theme.ZivaSecondary
import com.example.ui.theme.ZivaSosRed
import com.example.ui.theme.ZivaSuccess
import com.example.ui.theme.ZivaSurfaceVariant
import com.example.ui.theme.ZivaText
import com.example.ui.theme.ZivaWarning

@Composable
fun FreshnessBadge(
    minutesAgo: Long,
    modifier: Modifier = Modifier
) {
    val isStale = minutesAgo > 30 // 30-minute threshold per Success Goal 3
    val bgColor = if (isStale) ZivaSecondary.copy(alpha = 0.25f) else ZivaSuccess.copy(alpha = 0.2f)
    val contentColor = if (isStale) ZivaSecondary else ZivaSuccess
    val text = if (isStale) "Stale (${minutesAgo}m ago)" else "Fresh (${minutesAgo}m ago)"
    val icon = if (isStale) Icons.Default.Warning else Icons.Default.CheckCircle

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(bgColor)
            .border(1.dp, contentColor.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
            .testTag("freshness_badge")
    ) {
        Icon(
            imageVector = icon,
            contentDescription = if (isStale) "Stale data warning" else "Fresh data verified",
            tint = contentColor,
            modifier = Modifier.size(13.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = text,
            color = contentColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun SyncStatusBadge(
    status: String,
    hops: Int = 0,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor, label, icon) = when (status) {
        "SYNCED", "SYNCED_TO_CLOUD" -> Quad(
            ZivaSuccess.copy(alpha = 0.2f),
            ZivaSuccess,
            "SYNCED TO CLOUD",
            Icons.Default.CloudDone
        )
        "RELAYING_BLE" -> Quad(
            ZivaAccent.copy(alpha = 0.2f),
            ZivaAccent,
            "BLE MESH ($hops HOPS)",
            Icons.Default.Radio
        )
        else -> Quad(
            ZivaWarning.copy(alpha = 0.2f),
            ZivaWarning,
            "LOCAL QUEUE",
            Icons.Default.CloudQueue
        )
    }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(bgColor)
            .padding(horizontal = 8.dp, vertical = 4.dp)
            .testTag("sync_status_badge")
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = textColor,
            modifier = Modifier.size(13.dp)
        )
        Spacer(modifier = Modifier.width(5.dp))
        Text(
            text = label,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun LiveStatusBadge(
    isLive: Boolean,
    lastSeenSecondsAgo: Long = 45,
    modifier: Modifier = Modifier
) {
    if (isLive && lastSeenSecondsAgo < 120) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = modifier
                .clip(RoundedCornerShape(8.dp))
                .background(ZivaAccent.copy(alpha = 0.2f))
                .border(1.dp, ZivaAccent.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(ZivaAccent)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "LIVE RESCUE",
                color = ZivaAccent,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
        }
    } else {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = modifier
                .clip(RoundedCornerShape(8.dp))
                .background(ZivaSecondary.copy(alpha = 0.25f))
                .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Icon(
                imageVector = Icons.Default.AccessTime,
                contentDescription = "Stale location",
                tint = ZivaSecondary,
                modifier = Modifier.size(12.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "Last seen ${(lastSeenSecondsAgo / 60) + 1}m ago",
                color = ZivaSecondary,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun BatteryBadge(
    percent: Int,
    isLow: Boolean,
    modifier: Modifier = Modifier
) {
    val color = if (isLow) ZivaSosRed else if (percent < 30) ZivaWarning else ZivaSuccess

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(color.copy(alpha = 0.2f))
            .padding(horizontal = 8.dp, vertical = 4.dp)
            .testTag("battery_status_badge")
    ) {
        if (isLow) {
            Icon(
                imageVector = Icons.Default.BatteryAlert,
                contentDescription = "Low battery warning",
                tint = color,
                modifier = Modifier.size(13.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
        }
        Text(
            text = "$percent% ${if (isLow) "LOW" else ""}",
            color = color,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

private data class Quad<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
