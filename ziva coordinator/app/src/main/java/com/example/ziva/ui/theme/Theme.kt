package com.example.ziva.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val ZivaLightColorScheme = lightColorScheme(
    primary = Primary,
    secondary = Secondary,
    tertiary = Tertiary,

    background = Background,
    surface = Surface,

    onPrimary = OnPrimary,
    onSecondary = OnSecondary,
    onTertiary = OnTertiary,

    onBackground = OnBackground,
    onSurface = OnSurface
)

@Composable
fun ZIVATheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = ZivaLightColorScheme,
        typography = Typography,
        content = content
    )
}