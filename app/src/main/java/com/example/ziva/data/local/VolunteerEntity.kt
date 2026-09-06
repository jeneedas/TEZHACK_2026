package com.example.ziva.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "volunteers")
data class VolunteerEntity(
    @PrimaryKey
    val volunteerId: String,
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val distanceKm: Double,
    val availability: String, // "AVAILABLE", "DEPLOYED", "ON_CALL"
    val skills: String,       // e.g. "Paramedic, CPR, Search & Rescue"
    val lastUpdated: Long,
    val phone: String,
    val badge: String = "Verified Volunteer",
    val rating: Float = 4.9f
)
