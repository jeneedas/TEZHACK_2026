package com.example.ziva.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tracking_sessions")
data class TrackingSessionEntity(
    @PrimaryKey
    val sessionId: String,
    val requestId: String,
    val helperId: String,
    val helperName: String,
    val helperPhone: String,
    val helperRole: String, // "First Responder", "Community Medic", "Rescue Team"
    val helperLatitude: Double,
    val helperLongitude: Double,
    val userLatitude: Double,
    val userLongitude: Double,
    val etaMinutes: Int,
    val status: String, // "REQUESTED", "ASSIGNED", "EN_ROUTE", "ARRIVED", "COMPLETED"
    val lastUpdated: Long,
    val isLive: Boolean = true
)
