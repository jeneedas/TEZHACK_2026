package com.example.ziva.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sos_requests")
data class SosRequestEntity(
    @PrimaryKey
    val requestId: String,
    val userId: String,
    val latitude: Double,
    val longitude: Double,
    val timestamp: Long,
    val batteryLevel: Int,
    val connectivityState: String, // "OFFLINE", "CELLULAR", "WIFI", "BLE_ONLY"
    val status: String,            // "QUEUED", "RELAYING_BLE", "SYNCED", "ACKNOWLEDGED", "RESOLVED"
    val syncState: String,         // "PENDING", "SYNCED", "FAILED"
    val retryCount: Int = 0,
    val emergencyType: String = "GENERAL", // "GENERAL", "MEDICAL", "FLOOD_TRAPPED", "FIRE", "SEARCH_RESCUE"
    val bleHops: Int = 0,
    val notes: String = ""
)
