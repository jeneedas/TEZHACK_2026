package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val ZivaColorScheme = darkColorScheme(
    primary = ZivaPrimary,
    onPrimary = ZivaText,
    secondary = ZivaSecondary,
    onSecondary = ZivaText,
    tertiary = ZivaAccent,
    onTertiary = ZivaBackground,
    background = ZivaBackground,
    onBackground = ZivaText,
    surface = ZivaSurface,
    onSurface = ZivaText,
    surfaceVariant = ZivaSurfaceVariant,
    onSurfaceVariant = ZivaTextSecondary,
    error = ZivaSosRed,
    onError = ZivaText
)

@Composable
fun MyApplicationTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = ZivaColorScheme,
        typography = Typography,
        content = content
    )
}
