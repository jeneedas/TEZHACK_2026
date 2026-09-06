package com.example.ziva.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "ble_relay_hashes")
data class BleRelayHashEntity(
    @PrimaryKey
    val hash: String,
    val requestId: String,
    val receivedAt: Long,
    val ttl: Int,
    val hopCount: Int,
    val sourceDeviceId: String = "Nearby-Relay"
)
