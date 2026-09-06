package com.example.ziva.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "resources")
data class ResourceEntity(
    @PrimaryKey
    val resourceId: String,
    val type: String, // "WATER", "FOOD", "MEDICINE", "SHELTER"
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val availability: Int,
    val unit: String, // "liters", "meals", "first-aid kits", "beds"
    val accessibility: String, // "Wheelchair Accessible", "Ramp Access", "Ground Level", "Stairs only"
    val freshnessMinutesAgo: Long,
    val lastUpdated: Long,
    val verifiedBy: String,
    val contactPhone: String,
    val notes: String
)
