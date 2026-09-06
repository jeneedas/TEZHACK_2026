package com.example.ziva.presentation.component

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.example.ui.theme.ZivaAccent
import com.example.ui.theme.ZivaBackground
import com.example.ui.theme.ZivaPrimary
import com.example.ui.theme.ZivaSecondary
import com.example.ui.theme.ZivaSosRed
import com.example.ui.theme.ZivaSurface
import com.example.ziva.data.local.ResourceEntity

data class MapMarker(
    val id: String,
    val title: String,
    val relativeX: Float, // 0.0f to 1.0f
    val relativeY: Float, // 0.0f to 1.0f
    val color: Color,
    val type: String
)

@Composable
fun CustomMapCanvas(
    modifier: Modifier = Modifier,
    userPos: Pair<Float, Float> = Pair(0.5f, 0.65f),
    helperPos: Pair<Float, Float>? = Pair(0.75f, 0.35f),
    resources: List<ResourceEntity> = emptyList(),
    onMarkerClick: ((String) -> Unit)? = null
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseRadius by infiniteTransition.animateFloat(
        initialValue = 12f,
        targetValue = 38f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "pulse_radius"
    )
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 0.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "pulse_alpha"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(ZivaSurface)
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectTapGestures { offset ->
                        // Detect taps near markers
                        onMarkerClick?.invoke("marker_tapped")
                    }
                }
        ) {
            val w = size.width
            val h = size.height

            // 1. Draw Offline Disaster Grid Lines (topographic coordinates)
            val gridSpacing = 48.dp.toPx()
            var x = 0f
            while (x < w) {
                drawLine(
                    color = Color(0xFF26354A),
                    start = Offset(x, 0f),
                    end = Offset(x, h),
                    strokeWidth = 1f
                )
                x += gridSpacing
            }
            var y = 0f
            while (y < h) {
                drawLine(
                    color = Color(0xFF26354A),
                    start = Offset(0f, y),
                    end = Offset(w, y),
                    strokeWidth = 1f
                )
                y += gridSpacing
            }

            // 2. Draw Relief Sector Corridors (Simulated roads & safe evacuation paths)
            val roadPath = Path().apply {
                moveTo(w * 0.15f, h * 0.9f)
                cubicTo(w * 0.35f, h * 0.75f, w * 0.45f, h * 0.6f, w * 0.5f, h * 0.65f)
                cubicTo(w * 0.55f, h * 0.7f, w * 0.65f, h * 0.5f, w * 0.75f, h * 0.35f)
                lineTo(w * 0.88f, h * 0.15f)
            }
            drawPath(
                path = roadPath,
                color = Color(0xFF334A68),
                style = Stroke(width = 8.dp.toPx(), miter = 4f)
            )

            // 3. Draw Route Polyline from Helper to User (if helper is active)
            if (helperPos != null) {
                val helperOffset = Offset(helperPos.first * w, helperPos.second * h)
                val userOffset = Offset(userPos.first * w, userPos.second * h)

                val routePath = Path().apply {
                    moveTo(helperOffset.x, helperOffset.y)
                    quadraticBezierTo(
                        (helperOffset.x + userOffset.x) / 2 + 30f,
                        (helperOffset.y + userOffset.y) / 2 - 20f,
                        userOffset.x,
                        userOffset.y
                    )
                }

                // Route halo
                drawPath(
                    path = routePath,
                    color = ZivaPrimary.copy(alpha = 0.3f),
                    style = Stroke(width = 6.dp.toPx())
                )

                // Route line (dashed primary #3B82F6)
                drawPath(
                    path = routePath,
                    color = ZivaPrimary,
                    style = Stroke(
                        width = 3.dp.toPx(),
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(20f, 12f), 0f)
                    )
                )

                // Helper marker (Primary #3B82F6 vehicle/medic)
                drawCircle(
                    color = ZivaPrimary.copy(alpha = 0.25f),
                    radius = 24.dp.toPx(),
                    center = helperOffset
                )
                drawCircle(
                    color = ZivaPrimary,
                    radius = 12.dp.toPx(),
                    center = helperOffset
                )
                drawCircle(
                    color = Color.White,
                    radius = 5.dp.toPx(),
                    center = helperOffset
                )
            }

            // 4. Draw Resource Pins if provided
            resources.take(4).forEachIndexed { index, res ->
                val rx = when (index) {
                    0 -> w * 0.28f
                    1 -> w * 0.78f
                    2 -> w * 0.22f
                    else -> w * 0.65f
                }
                val ry = when (index) {
                    0 -> h * 0.45f
                    1 -> h * 0.72f
                    2 -> h * 0.25f
                    else -> h * 0.82f
                }
                val pinColor = when (res.type) {
                    "WATER" -> Color(0xFF38BDF8)
                    "FOOD" -> Color(0xFFFBBF24)
                    "MEDICINE" -> Color(0xFFF43F5E)
                    else -> Color(0xFFA855F7)
                }

                drawCircle(
                    color = pinColor.copy(alpha = 0.3f),
                    radius = 16.dp.toPx(),
                    center = Offset(rx, ry)
                )
                drawCircle(
                    color = pinColor,
                    radius = 8.dp.toPx(),
                    center = Offset(rx, ry)
                )
                drawCircle(
                    color = Color.White,
                    radius = 3.dp.toPx(),
                    center = Offset(rx, ry)
                )
            }

            // 5. Draw User Marker (Accent #06B6D4 with pulsating radio waves)
            val userOffset = Offset(userPos.first * w, userPos.second * h)

            // Animated pulse wave
            drawCircle(
                color = ZivaAccent.copy(alpha = pulseAlpha),
                radius = pulseRadius.dp.toPx(),
                center = userOffset,
                style = Stroke(width = 2.dp.toPx())
            )
            // Outer glow
            drawCircle(
                color = ZivaAccent.copy(alpha = 0.35f),
                radius = 18.dp.toPx(),
                center = userOffset
            )
            // Solid center
            drawCircle(
                color = ZivaAccent,
                radius = 10.dp.toPx(),
                center = userOffset
            )
            drawCircle(
                color = Color.White,
                radius = 4.dp.toPx(),
                center = userOffset
            )
        }
    }
}
