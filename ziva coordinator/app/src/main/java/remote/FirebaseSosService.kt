package com.example.ziva.data.remote

import com.example.ziva.data.local.SosRequestEntity
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class FirebaseSosService {

    private val firestore =
        FirebaseFirestore.getInstance()

    private val sosCollection =
        firestore.collection("sos_requests")

    suspend fun uploadSos(
        sos: SosRequestEntity
    ): Boolean =
        suspendCancellableCoroutine { continuation ->

            val data = hashMapOf<String, Any?>(
                "requestId" to sos.requestId,
                "userId" to sos.userId,
                "latitude" to sos.latitude,
                "longitude" to sos.longitude,
                "timestamp" to sos.timestamp,
                "serverReceivedAt" to FieldValue.serverTimestamp(),
                "batteryLevel" to sos.batteryLevel,
                "connectivityState" to sos.connectivityState,
                "status" to sos.status,
                "syncState" to "SYNCED",
                "retryCount" to sos.retryCount,
                "emergencyType" to sos.emergencyType,
                "bleHops" to sos.bleHops,
                "notes" to sos.notes
            )

            sosCollection
                .document(sos.requestId)
                .set(data)
                .addOnSuccessListener {
                    if (continuation.isActive) {
                        continuation.resume(true)
                    }
                }
                .addOnFailureListener {
                    if (continuation.isActive) {
                        continuation.resume(false)
                    }
                }
        }

    suspend fun updateSosStatus(
        requestId: String,
        status: String
    ): Boolean =
        suspendCancellableCoroutine { continuation ->

            sosCollection
                .document(requestId)
                .update(
                    mapOf(
                        "status" to status,
                        "updatedAt" to FieldValue.serverTimestamp()
                    )
                )
                .addOnSuccessListener {
                    if (continuation.isActive) {
                        continuation.resume(true)
                    }
                }
                .addOnFailureListener {
                    if (continuation.isActive) {
                        continuation.resume(false)
                    }
                }
        }

    suspend fun updateBleHops(
        requestId: String,
        hops: Int,
        status: String
    ): Boolean =
        suspendCancellableCoroutine { continuation ->

            sosCollection
                .document(requestId)
                .update(
                    mapOf(
                        "bleHops" to hops,
                        "status" to status,
                        "updatedAt" to FieldValue.serverTimestamp()
                    )
                )
                .addOnSuccessListener {
                    if (continuation.isActive) {
                        continuation.resume(true)
                    }
                }
                .addOnFailureListener {
                    if (continuation.isActive) {
                        continuation.resume(false)
                    }
                }
        }
}