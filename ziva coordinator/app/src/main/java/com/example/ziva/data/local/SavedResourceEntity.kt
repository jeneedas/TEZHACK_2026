package com.example.ziva.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "saved_resources")
data class SavedResourceEntity(
    @PrimaryKey
    val resourceId: String,
    val savedAt: Long = System.currentTimeMillis()
)