package com.example.ziva.util

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioManager
import android.media.ToneGenerator
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.BatteryManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log

data class TelemetryState(
    val batteryPercent: Int = 85,
    val isBatteryLow: Boolean = false, // <= 15%
    val isCharging: Boolean = false,
    val connectivityState: String = "OFFLINE", // OFFLINE, CELLULAR, WIFI, BLE_ONLY
    val isSilentMode: Boolean = false,
    val latitude: Double = 37.7749,
    val longitude: Double = -122.4194
)

class TelemetryManager(private val context: Context) {

    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
    private var toneGenerator: ToneGenerator? = null

    init {
        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_ALARM, 100)
        } catch (e: Exception) {
            Log.e("TelemetryManager", "Error initializing ToneGenerator", e)
        }
    }

    fun getTelemetryState(simulatedOffline: Boolean = false): TelemetryState {
        val batteryStatus = getBatteryInfo()
        val connectivity = if (simulatedOffline) "OFFLINE" else getNetworkState()
        val isSilent = isDeviceSilent()

        return TelemetryState(
            batteryPercent = batteryStatus.first,
            isBatteryLow = batteryStatus.first <= 15,
            isCharging = batteryStatus.second,
            connectivityState = connectivity,
            isSilentMode = isSilent,
            latitude = 37.7749,
            longitude = -122.4194
        )
    }

    private fun getBatteryInfo(): Pair<Int, Boolean> {
        return try {
            val ifilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
            val batteryStatus: Intent? = context.registerReceiver(null, ifilter)
            val level: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
            val scale: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
            val status: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
            val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                    status == BatteryManager.BATTERY_STATUS_FULL

            val pct = if (level >= 0 && scale > 0) {
                ((level.toFloat() / scale.toFloat()) * 100).toInt()
            } else {
                78 // Fallback standard percentage
            }
            Pair(pct, isCharging)
        } catch (e: Exception) {
            Pair(78, false)
        }
    }

    private fun getNetworkState(): String {
        return try {
            val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
                ?: return "OFFLINE"
            val activeNetwork = cm.activeNetwork ?: return "OFFLINE"
            val capabilities = cm.getNetworkCapabilities(activeNetwork) ?: return "OFFLINE"

            when {
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "WIFI"
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "CELLULAR"
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_BLUETOOTH) -> "BLE_ONLY"
                else -> "OFFLINE"
            }
        } catch (e: Exception) {
            "OFFLINE"
        }
    }

    fun isDeviceSilent(): Boolean {
        return try {
            val ringerMode = audioManager?.ringerMode ?: AudioManager.RINGER_MODE_NORMAL
            ringerMode == AudioManager.RINGER_MODE_SILENT || ringerMode == AudioManager.RINGER_MODE_VIBRATE
        } catch (e: Exception) {
            false
        }
    }

    fun triggerEmergencyVibration() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                val vibrator = vibratorManager?.defaultVibrator
                val pattern = longArrayOf(0, 400, 200, 400, 200, 800)
                vibrator?.vibrate(VibrationEffect.createWaveform(pattern, -1))
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                val pattern = longArrayOf(0, 400, 200, 400, 200, 800)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator?.vibrate(VibrationEffect.createWaveform(pattern, -1))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator?.vibrate(pattern, -1)
                }
            }
        } catch (e: Exception) {
            Log.e("TelemetryManager", "Vibration failed", e)
        }
    }

    fun triggerLoudTone() {
        try {
            toneGenerator?.startTone(ToneGenerator.TONE_CDMA_EMERGENCY_RINGBACK, 1500)
        } catch (e: Exception) {
            Log.e("TelemetryManager", "Tone trigger failed", e)
        }
    }

    fun stopTone() {
        try {
            toneGenerator?.stopTone()
        } catch (e: Exception) {
            Log.e("TelemetryManager", "Stop tone failed", e)
        }
    }
}
