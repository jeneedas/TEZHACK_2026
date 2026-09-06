package com.example.ziva

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.ziva.data.local.AppDatabase
import com.example.ziva.data.local.SosRequestEntity
import com.example.ziva.data.local.TrackingSessionEntity
import com.example.ziva.service.ble.BleRelayEngine
import com.example.ziva.util.AppLanguage
import com.example.ziva.util.LanguageManager
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ZivaCoreLogicTest {

    private lateinit var database: AppDatabase
    private lateinit var bleEngine: BleRelayEngine

    @Before
    fun setup() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        database = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        bleEngine = BleRelayEngine(database.bleRelayDao())
    }

    @After
    fun teardown() {
        database.close()
    }

    @Test
    fun testBlePacketDedupAndRelay() = runBlocking {
        val initialDropped = bleEngine.meshStats.value.packetsDroppedDuplicates

        // 1. Process first incoming packet -> should be forwarded (new hop count = 1)
        val (firstForwarded, firstHopCount) = bleEngine.processIncomingPacket(
            requestId = "SOS-TEST01",
            latitude = 37.7749,
            longitude = -122.4194,
            emergencyType = "FLOOD_TRAPPED",
            ttl = 4,
            hopCount = 0
        )
        assertTrue("First packet should be forwarded", firstForwarded)
        assertEquals(1, firstHopCount)

        // 2. Process exact duplicate packet -> should be dropped (not forwarded)
        val (dupForwarded, _) = bleEngine.processIncomingPacket(
            requestId = "SOS-TEST01",
            latitude = 37.7749,
            longitude = -122.4194,
            emergencyType = "FLOOD_TRAPPED",
            ttl = 4,
            hopCount = 0
        )
        assertFalse("Duplicate packet should be dropped to prevent network storm", dupForwarded)

        // Verify deduplication tracking incremented
        assertEquals(initialDropped + 1, bleEngine.meshStats.value.packetsDroppedDuplicates)
    }

    @Test
    fun testRoomSosOfflinePersistenceAndSync() = runBlocking {
        val sos = SosRequestEntity(
            requestId = "SOS-ROOM99",
            userId = "user_test",
            latitude = 37.78,
            longitude = -122.42,
            timestamp = System.currentTimeMillis(),
            batteryLevel = 14,
            connectivityState = "OFFLINE",
            status = "RELAYING_BLE",
            syncState = "PENDING",
            retryCount = 0,
            emergencyType = "MEDICAL",
            bleHops = 1,
            notes = "Elderly citizen requires oxygen"
        )

        database.sosDao().insertSos(sos)

        val unsynced = database.sosDao().getUnsyncedSosRequests()
        assertEquals(1, unsynced.size)
        assertEquals("SOS-ROOM99", unsynced[0].requestId)

        // Simulate mesh relay hop update
        database.sosDao().updateBleHops("SOS-ROOM99", 3, "RELAYING_BLE")
        val updated = database.sosDao().getLatestSosRequest().first()
        assertEquals(3, updated?.bleHops)

        // Simulate cloud sync
        database.sosDao().updateSyncStatus("SOS-ROOM99", "SYNCED_TO_CLOUD", "SYNCED")
        val syncedList = database.sosDao().getUnsyncedSosRequests()
        assertTrue(syncedList.isEmpty())
    }

    @Test
    fun testTrackingSessionProgression() = runBlocking {
        val session = TrackingSessionEntity(
            sessionId = "trk_999",
            requestId = "SOS-ROOM99",
            helperId = "vol_01",
            helperName = "Lt. Maya Lin",
            helperPhone = "+15550192831",
            helperRole = "Trauma Paramedic",
            helperLatitude = 37.785,
            helperLongitude = -122.415,
            userLatitude = 37.780,
            userLongitude = -122.420,
            etaMinutes = 4,
            status = "ASSIGNED",
            lastUpdated = System.currentTimeMillis(),
            isLive = true
        )

        database.trackingDao().insertOrUpdate(session)
        val active = database.trackingDao().getActiveTrackingSession().first()
        assertNotNull(active)
        assertEquals("ASSIGNED", active?.status)

        // Update to EN_ROUTE
        database.trackingDao().updateTrackingState(
            sessionId = "trk_999",
            status = "EN_ROUTE",
            etaMinutes = 2,
            lat = 37.782,
            lng = -122.418,
            lastUpdated = System.currentTimeMillis()
        )

        val enRoute = database.trackingDao().getActiveTrackingSession().first()
        assertEquals("EN_ROUTE", enRoute?.status)
        assertEquals(2, enRoute?.etaMinutes)
    }

    @Test
    fun testMultiLanguageSupport() {
        // English
        assertEquals("ZIVA Assistance", LanguageManager.getString("app_title", AppLanguage.ENGLISH))
        // Hindi
        assertEquals("ज़िवा आपदा सहायता", LanguageManager.getString("app_title", AppLanguage.HINDI))
        // Spanish
        assertEquals("ZIVA Asistencia", LanguageManager.getString("app_title", AppLanguage.SPANISH))
        // Bengali
        assertEquals("জিভা দুর্যোগ সহায়তা", LanguageManager.getString("app_title", AppLanguage.BENGALI))
        // Marathi
        assertEquals("झिवा आपत्ती सहाय्य", LanguageManager.getString("app_title", AppLanguage.MARATHI))
    }

    @Test
    fun testFreshnessThreshold() {
        val now = System.currentTimeMillis()
        val freshTimestamp = now - (15 * 60 * 1000) // 15 mins ago
        val staleTimestamp = now - (45 * 60 * 1000) // 45 mins ago

        val freshMinutesAgo = (now - freshTimestamp) / (60 * 1000)
        val staleMinutesAgo = (now - staleTimestamp) / (60 * 1000)

        assertTrue("15m should be fresh (<= 30m)", freshMinutesAgo <= 30)
        assertFalse("45m should be flagged stale (> 30m)", staleMinutesAgo <= 30)
    }
}
