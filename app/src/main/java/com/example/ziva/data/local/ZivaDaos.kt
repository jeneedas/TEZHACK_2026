package com.example.ziva.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface SosDao {
    @Query("SELECT * FROM sos_requests ORDER BY timestamp DESC")
    fun getAllSosRequests(): Flow<List<SosRequestEntity>>

    @Query("SELECT * FROM sos_requests ORDER BY timestamp DESC LIMIT 1")
    fun getLatestSosRequest(): Flow<SosRequestEntity?>

    @Query("SELECT * FROM sos_requests WHERE requestId = :requestId")
    suspend fun getSosById(requestId: String): SosRequestEntity?

    @Query("SELECT * FROM sos_requests WHERE syncState = 'PENDING'")
    suspend fun getUnsyncedSosRequests(): List<SosRequestEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSos(sos: SosRequestEntity)

    @Update
    suspend fun updateSos(sos: SosRequestEntity)

    @Query("UPDATE sos_requests SET status = :status, syncState = :syncState, retryCount = retryCount + 1 WHERE requestId = :requestId")
    suspend fun updateSyncStatus(requestId: String, status: String, syncState: String)

    @Query("UPDATE sos_requests SET bleHops = :hops, status = :status WHERE requestId = :requestId")
    suspend fun updateBleHops(requestId: String, hops: Int, status: String)

    @Query("DELETE FROM sos_requests WHERE requestId = :requestId")
    suspend fun deleteSos(requestId: String)
}

@Dao
interface ResourceDao {
    @Query("SELECT * FROM resources ORDER BY availability DESC")
    fun getAllResources(): Flow<List<ResourceEntity>>

    @Query("SELECT * FROM resources WHERE type = :type")
    fun getResourcesByType(type: String): Flow<List<ResourceEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(resources: List<ResourceEntity>)

    @Query("UPDATE resources SET availability = :newCount, lastUpdated = :timestamp WHERE resourceId = :resourceId")
    suspend fun updateAvailability(resourceId: String, newCount: Int, timestamp: Long)

    @Query("SELECT COUNT(*) FROM resources")
    suspend fun getCount(): Int
}

@Dao
interface VolunteerDao {
    @Query("SELECT * FROM volunteers ORDER BY distanceKm ASC")
    fun getAllVolunteers(): Flow<List<VolunteerEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(volunteers: List<VolunteerEntity>)

    @Query("SELECT COUNT(*) FROM volunteers")
    suspend fun getCount(): Int
}

@Dao
interface TrackingDao {
    @Query("SELECT * FROM tracking_sessions ORDER BY lastUpdated DESC LIMIT 1")
    fun getActiveTrackingSession(): Flow<TrackingSessionEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(session: TrackingSessionEntity)

    @Query("UPDATE tracking_sessions SET status = :status, etaMinutes = :etaMinutes, helperLatitude = :lat, helperLongitude = :lng, lastUpdated = :lastUpdated WHERE sessionId = :sessionId")
    suspend fun updateTrackingState(sessionId: String, status: String, etaMinutes: Int, lat: Double, lng: Double, lastUpdated: Long)
}

@Dao
interface BleRelayDao {
    @Query("SELECT * FROM ble_relay_hashes ORDER BY receivedAt DESC")
    fun getAllHashes(): Flow<List<BleRelayHashEntity>>

    @Query("SELECT EXISTS(SELECT 1 FROM ble_relay_hashes WHERE hash = :hash)")
    suspend fun hashExists(hash: String): Boolean

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertHash(entry: BleRelayHashEntity): Long

    @Query("SELECT COUNT(*) FROM ble_relay_hashes")
    suspend fun getTotalPacketsRelayed(): Int
}
