package com.example.ziva.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        SosRequestEntity::class,
        ResourceEntity::class,
        VolunteerEntity::class,
        TrackingSessionEntity::class,
        BleRelayHashEntity::class,
        SavedResourceEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun sosDao(): SosDao

    abstract fun resourceDao(): ResourceDao

    abstract fun volunteerDao(): VolunteerDao

    abstract fun trackingDao(): TrackingDao

    abstract fun bleRelayDao(): BleRelayDao

    abstract fun savedResourceDao(): SavedResourceDao

    companion object {

        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {

            return INSTANCE ?: synchronized(this) {

                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "ziva_disaster_db"
                )
                    .fallbackToDestructiveMigration()
                    .addCallback(object : Callback() {

                        override fun onCreate(
                            db: SupportSQLiteDatabase
                        ) {
                            super.onCreate(db)

                            CoroutineScope(Dispatchers.IO).launch {
                                seedInitialData(
                                    getInstance(context)
                                )
                            }
                        }
                    })
                    .build()

                INSTANCE = instance

                instance
            }
        }

        suspend fun seedInitialData(
            database: AppDatabase
        ) {

            val now = System.currentTimeMillis()

            // ============================================
            // SEED INITIAL DISASTER VERIFIED RESOURCES
            // ============================================

            val initialResources = listOf(

                ResourceEntity(
                    resourceId = "res_water_01",
                    type = "WATER",
                    name = "Central Relief Water Filtration Point",
                    latitude = 37.7749,
                    longitude = -122.4194,
                    availability = 2400,
                    unit = "liters potable water",
                    accessibility = "Wheelchair Accessible • Ramp equipped",
                    freshnessMinutesAgo = 8,
                    lastUpdated = now - (8 * 60 * 1000),
                    verifiedBy = "Disaster Management Authority",
                    contactPhone = "+1 (800) 555-0199",
                    notes = "Clean drinking water distribution with clean container distribution available."
                ),

                ResourceEntity(
                    resourceId = "res_food_02",
                    type = "FOOD",
                    name = "Red Cross Community Kitchen & Rations",
                    latitude = 37.7790,
                    longitude = -122.4230,
                    availability = 850,
                    unit = "hot meals & ready-to-eat packs",
                    accessibility = "Ground level access",
                    freshnessMinutesAgo = 14,
                    lastUpdated = now - (14 * 60 * 1000),
                    verifiedBy = "Red Cross Incident Command",
                    contactPhone = "+1 (800) 555-0142",
                    notes = "MREs, baby formula, high-calorie biscuit packs available."
                ),

                ResourceEntity(
                    resourceId = "res_med_03",
                    type = "MEDICINE",
                    name = "Emergency Triage & Medical Supply Unit",
                    latitude = 37.7710,
                    longitude = -122.4140,
                    availability = 120,
                    unit = "emergency first-aid & trauma kits",
                    accessibility = "Wheelchair Accessible • Triage Ward",
                    freshnessMinutesAgo = 5,
                    lastUpdated = now - (5 * 60 * 1000),
                    verifiedBy = "City Paramedic Corps",
                    contactPhone = "+1 (800) 555-0112",
                    notes = "Insulin storage (generator backup), burn dressings, saline & antibiotics."
                ),

                ResourceEntity(
                    resourceId = "res_shelter_04",
                    type = "SHELTER",
                    name = "Civic Arena Safe Evacuation Shelter",
                    latitude = 37.7830,
                    longitude = -122.4110,
                    availability = 42,
                    unit = "cots & heated family pods",
                    accessibility = "Elevator & wide ramps operational",
                    freshnessMinutesAgo = 18,
                    lastUpdated = now - (18 * 60 * 1000),
                    verifiedBy = "Municipal Emergency Ops",
                    contactPhone = "+1 (800) 555-0188",
                    notes = "Pet-friendly annex, solar charging stations, secure emergency sleep quarters."
                ),

                ResourceEntity(
                    resourceId = "res_water_05",
                    type = "WATER",
                    name = "St. Jude Water Bowsers & Purification",
                    latitude = 37.7650,
                    longitude = -122.4280,
                    availability = 320,
                    unit = "liters potable water",
                    accessibility = "Stairs only (assistance available)",
                    freshnessMinutesAgo = 45,
                    lastUpdated = now - (45 * 60 * 1000),
                    verifiedBy = "Local Relief Volunteer",
                    contactPhone = "+1 (800) 555-0176",
                    notes = "Water tanker supply was being replenished. Needs fresh status verification."
                )
            )

            database
                .resourceDao()
                .insertAll(initialResources)


            // ============================================
            // SEED VERIFIED VOLUNTEERS
            // ============================================

            val initialVolunteers = listOf(

                VolunteerEntity(
                    volunteerId = "vol_01",
                    name = "Lt. Maya Lin",
                    latitude = 37.7755,
                    longitude = -122.4180,
                    distanceKm = 0.4,
                    availability = "AVAILABLE",
                    skills = "Search & Rescue, EMT-Basic, HAM Radio Operator",
                    lastUpdated = now - (3 * 60 * 1000),
                    phone = "+1 (555) 019-2831",
                    badge = "Certified First Responder",
                    rating = 4.95f
                ),

                VolunteerEntity(
                    volunteerId = "vol_02",
                    name = "Dr. Rohan Patel",
                    latitude = 37.7780,
                    longitude = -122.4210,
                    distanceKm = 0.8,
                    availability = "AVAILABLE",
                    skills = "Trauma Surgeon, Critical Care, Disaster Triage",
                    lastUpdated = now - (7 * 60 * 1000),
                    phone = "+1 (555) 018-9922",
                    badge = "Medical Officer",
                    rating = 5.0f
                ),

                VolunteerEntity(
                    volunteerId = "vol_03",
                    name = "Elena Rostova",
                    latitude = 37.7715,
                    longitude = -122.4250,
                    distanceKm = 1.2,
                    availability = "DEPLOYED",
                    skills = "4x4 Emergency Transport, Swiftwater Evac",
                    lastUpdated = now - (12 * 60 * 1000),
                    phone = "+1 (555) 017-3310",
                    badge = "Field Evac Specialist",
                    rating = 4.88f
                ),

                VolunteerEntity(
                    volunteerId = "vol_04",
                    name = "Kofi Mensah",
                    latitude = 37.7810,
                    longitude = -122.4130,
                    distanceKm = 1.5,
                    availability = "AVAILABLE",
                    skills = "Disaster Mental Health, Child Relief, Spanish/English",
                    lastUpdated = now - (10 * 60 * 1000),
                    phone = "+1 (555) 016-7788",
                    badge = "Community Relief Lead",
                    rating = 4.92f
                )
            )

            database
                .volunteerDao()
                .insertAll(initialVolunteers)


            // ============================================
            // SEED ACTIVE TRACKING SESSION
            // ============================================

            val demoTracking = TrackingSessionEntity(
                sessionId = "track_active_01",
                requestId = "REQ-DEMO-9912",
                helperId = "vol_01",
                helperName = "Lt. Maya Lin",
                helperPhone = "+1 (555) 019-2831",
                helperRole = "Paramedic & Rescue Lead",
                helperLatitude = 37.7795,
                helperLongitude = -122.4225,
                userLatitude = 37.7749,
                userLongitude = -122.4194,
                etaMinutes = 3,
                status = "EN_ROUTE",
                lastUpdated = now - (45 * 1000),
                isLive = true
            )

            database
                .trackingDao()
                .insertOrUpdate(demoTracking)
        }
    }
}