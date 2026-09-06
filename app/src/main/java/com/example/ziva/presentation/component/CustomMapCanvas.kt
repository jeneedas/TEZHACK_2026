package com.example.ziva.presentation.component

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ziva.data.local.ResourceEntity

@Composable
fun CustomMapCanvas(
    modifier: Modifier = Modifier,
    userPos: Pair<Float, Float>,
    resources: List<ResourceEntity>,
    onMarkerClick: () -> Unit
) {

    Box(
        modifier = modifier
            .background(Color(0xFFE8F0E8))
            .clickable {
                if (resources.isNotEmpty()) {
                    onMarkerClick()
                }
            }
    ) {

        Canvas(
            modifier = Modifier.fillMaxSize()
        ) {

            // Map-style background grid
            val gridColor = Color(0xFFCFDCCF)

            for (x in 0..10) {
                val xPos = size.width * x / 10f

                drawLine(
                    color = gridColor,
                    start = Offset(xPos, 0f),
                    end = Offset(xPos, size.height),
                    strokeWidth = 2f
                )
            }

            for (y in 0..10) {
                val yPos = size.height * y / 10f

                drawLine(
                    color = gridColor,
                    start = Offset(0f, yPos),
                    end = Offset(size.width, yPos),
                    strokeWidth = 2f
                )
            }

            // Roads
            drawLine(
                color = Color.White,
                start = Offset(0f, size.height * 0.35f),
                end = Offset(size.width, size.height * 0.55f),
                strokeWidth = 18f
            )

            drawLine(
                color = Color.White,
                start = Offset(size.width * 0.25f, 0f),
                end = Offset(size.width * 0.65f, size.height),
                strokeWidth = 14f
            )

            // Resource markers
            resources.forEachIndexed { index, _ ->

                val x =
                    size.width * (0.15f + (index % 4) * 0.22f)

                val y =
                    size.height * (0.25f + (index % 3) * 0.22f)

                drawCircle(
                    color = Color(0xFFE85D75),
                    radius = 13f,
                    center = Offset(x, y)
                )

                drawCircle(
                    color = Color.White,
                    radius = 5f,
                    center = Offset(x, y)
                )
            }

            // User location
            drawCircle(
                color = Color(0xFF2878D8),
                radius = 17f,
                center = Offset(
                    size.width * userPos.first,
                    size.height * userPos.second
                )
            )

            drawCircle(
                color = Color.White,
                radius = 7f,
                center = Offset(
                    size.width * userPos.first,
                    size.height * userPos.second
                )
            )
        }

        Text(
            text = "LIVE RELIEF MAP",
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(12.dp),
            color = Color(0xFF26352B),
            fontSize = 11.sp
        )

        Text(
            text = "${resources.size} relief points",
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(12.dp),
            color = Color(0xFF26352B),
            fontSize = 11.sp
        )
    }
}