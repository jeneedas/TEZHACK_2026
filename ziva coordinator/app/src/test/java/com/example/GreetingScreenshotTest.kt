package com.example

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import com.example.ui.theme.MyApplicationTheme
import com.example.ziva.presentation.ui.sos.SosTriggerScreen
import com.example.ziva.presentation.viewmodel.ZivaUiState
import com.example.ziva.util.AppLanguage
import com.example.ziva.util.LanguageManager
import com.github.takahirom.roborazzi.RobolectricDeviceQualifiers
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = RobolectricDeviceQualifiers.Pixel8, sdk = [36])
class GreetingScreenshotTest {

  @get:Rule val composeTestRule = createComposeRule()

  @Test
  fun ziva_sos_screen_screenshot() {
    val state = ZivaUiState(
      selectedLanguage = AppLanguage.ENGLISH,
      selectedEmergencyType = "GENERAL"
    )

    composeTestRule.setContent {
      MyApplicationTheme {
        SosTriggerScreen(
          uiState = state,
          onTriggerSos = {},
          onEmergencyTypeChange = {},
          onToggleLoudAlert = {},
          onOpenVoiceDialog = {},
          onDismissSilenceWarning = {},
          onOpenHistory = {},
          onSelectLanguage = {},
          getString = { LanguageManager.getString(it, AppLanguage.ENGLISH) }
        )
      }
    }

    composeTestRule.onRoot().captureRoboImage(filePath = "src/test/screenshots/ziva_sos.png")
  }
}
