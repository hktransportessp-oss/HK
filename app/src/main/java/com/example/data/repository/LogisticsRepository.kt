package com.example.data.repository

import android.content.Context
import com.example.data.local.LogisticsDao
import com.example.data.model.*
import com.example.data.remote.ApiClient
import com.example.data.remote.model.CompleteDeliveryRequest
import com.example.data.remote.model.CreateOccurrenceRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.withContext
import java.util.UUID

class LogisticsRepository(
    private val dao: LogisticsDao,
    private val context: Context? = null
) {
    private val apiService by lazy {
        context?.let { ApiClient.getInstance(it).tripsApiService }
    }

    val allTrips: Flow<List<TripEntity>> = dao.getAllTrips()
    val allRomaneios: Flow<List<RomaneioEntity>> = dao.getAllRomaneios()
    val allTolls: Flow<List<TollReceiptEntity>> = dao.getAllTolls()
    val allFechamentos: Flow<List<FechamentoEntity>> = dao.getAllFechamentos()
    val allNotifications: Flow<List<NotificationEntity>> = dao.getAllNotifications()
    val userProfile: Flow<UserProfileEntity?> = dao.getUserProfile()
    val allInvoices: Flow<List<InvoiceEntity>> = dao.getAllInvoices()

    fun getTripById(id: String): Flow<TripEntity?> = dao.getTripById(id)
    fun getDeliveriesForTrip(tripId: String): Flow<List<DeliveryEntity>> = dao.getDeliveriesForTrip(tripId)
    fun getInvoicesForTrip(tripId: String): Flow<List<InvoiceEntity>> = dao.getInvoicesForTrip(tripId)
    fun getOccurrencesForTrip(tripId: String): Flow<List<OccurrenceEntity>> = dao.getOccurrencesForTrip(tripId)
    fun getRomaneioById(id: String): Flow<RomaneioEntity?> = dao.getRomaneioById(id)
    fun getFechamentoByPeriod(period: String): Flow<FechamentoEntity?> = dao.getFechamentoByPeriod(period)

    // Remote Refresh with Room Cache fallback
    suspend fun refreshTripsFromRemote(): Result<Unit> = withContext(Dispatchers.IO) {
        val service = apiService ?: return@withContext Result.failure(Exception("Service unavailable"))
        try {
            val response = service.getTrips()
            if (response.isSuccessful && response.body() != null) {
                val dtos = response.body()!!
                val tripEntities = dtos.map { it.toEntity() }
                dao.insertTrips(tripEntities)

                // Cache nested deliveries and invoices
                dtos.forEach { tripDto ->
                    tripDto.deliveries?.forEach { delDto ->
                        dao.insertDelivery(delDto.toEntity())
                        delDto.invoices?.forEach { invDto ->
                            dao.insertInvoices(listOf(invDto.toEntity()))
                        }
                    }
                    tripDto.invoices?.forEach { invDto ->
                        dao.insertInvoices(listOf(invDto.toEntity()))
                    }
                    tripDto.occurrences?.forEach { occDto ->
                        dao.insertOccurrence(occDto.toEntity())
                    }
                }
                Result.success(Unit)
            } else {
                Result.failure(Exception("HTTP ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun acceptTrip(tripId: String): Result<Unit> = withContext(Dispatchers.IO) {
        val idempotencyKey = UUID.randomUUID().toString()
        // Update Room local state immediately (Offline-first)
        val localTrip = dao.getTripByIdDirect(tripId)
        if (localTrip != null) {
            dao.insertTrip(localTrip.copy(status = "ACCEPTED"))
        }

        val service = apiService
        if (service == null) {
            queueOfflineOperation("ACCEPT_TRIP", tripId, idempotencyKey)
            return@withContext Result.success(Unit)
        }

        try {
            val response = service.acceptTrip(tripId, idempotencyKey)
            if (response.isSuccessful && response.body() != null) {
                dao.insertTrip(response.body()!!.toEntity())
                Result.success(Unit)
            } else {
                queueOfflineOperation("ACCEPT_TRIP", tripId, idempotencyKey)
                Result.success(Unit)
            }
        } catch (e: Exception) {
            queueOfflineOperation("ACCEPT_TRIP", tripId, idempotencyKey)
            Result.success(Unit)
        }
    }

    suspend fun startTrip(tripId: String): Result<Unit> = withContext(Dispatchers.IO) {
        val idempotencyKey = UUID.randomUUID().toString()
        val localTrip = dao.getTripByIdDirect(tripId)
        if (localTrip != null) {
            dao.insertTrip(localTrip.copy(status = "IN_PROGRESS"))
        }

        val service = apiService
        if (service == null) {
            queueOfflineOperation("START_TRIP", tripId, idempotencyKey)
            return@withContext Result.success(Unit)
        }

        try {
            val response = service.startTrip(tripId, idempotencyKey)
            if (response.isSuccessful && response.body() != null) {
                dao.insertTrip(response.body()!!.toEntity())
                Result.success(Unit)
            } else {
                queueOfflineOperation("START_TRIP", tripId, idempotencyKey)
                Result.success(Unit)
            }
        } catch (e: Exception) {
            queueOfflineOperation("START_TRIP", tripId, idempotencyKey)
            Result.success(Unit)
        }
    }

    suspend fun completeTrip(tripId: String): Result<Unit> = withContext(Dispatchers.IO) {
        val idempotencyKey = UUID.randomUUID().toString()
        val localTrip = dao.getTripByIdDirect(tripId)
        if (localTrip != null) {
            dao.insertTrip(localTrip.copy(status = "COMPLETED"))
        }

        val service = apiService
        if (service == null) {
            queueOfflineOperation("COMPLETE_TRIP", tripId, idempotencyKey)
            return@withContext Result.success(Unit)
        }

        try {
            val response = service.completeTrip(tripId, idempotencyKey)
            if (response.isSuccessful && response.body() != null) {
                dao.insertTrip(response.body()!!.toEntity())
                Result.success(Unit)
            } else {
                queueOfflineOperation("COMPLETE_TRIP", tripId, idempotencyKey)
                Result.success(Unit)
            }
        } catch (e: Exception) {
            queueOfflineOperation("COMPLETE_TRIP", tripId, idempotencyKey)
            Result.success(Unit)
        }
    }

    suspend fun arriveAtDelivery(deliveryId: String): Result<Unit> = withContext(Dispatchers.IO) {
        val idempotencyKey = UUID.randomUUID().toString()
        val localDelivery = dao.getDeliveryByIdDirect(deliveryId)
        if (localDelivery != null) {
            dao.insertDelivery(localDelivery.copy(status = "ARRIVED"))
        }

        val service = apiService
        if (service == null) {
            queueOfflineOperation("ARRIVE_DELIVERY", deliveryId, idempotencyKey)
            return@withContext Result.success(Unit)
        }

        try {
            val response = service.arriveAtDelivery(deliveryId, idempotencyKey)
            if (response.isSuccessful && response.body() != null) {
                dao.insertDelivery(response.body()!!.toEntity())
                Result.success(Unit)
            } else {
                queueOfflineOperation("ARRIVE_DELIVERY", deliveryId, idempotencyKey)
                Result.success(Unit)
            }
        } catch (e: Exception) {
            queueOfflineOperation("ARRIVE_DELIVERY", deliveryId, idempotencyKey)
            Result.success(Unit)
        }
    }

    suspend fun completeDelivery(
        deliveryId: String,
        status: String,
        notes: String? = null,
        refusalReason: String? = null,
        quantityExpected: Int? = null,
        quantityDelivered: Int? = null,
        quantityMissing: Int? = null
    ): Result<Unit> = withContext(Dispatchers.IO) {
        val idempotencyKey = UUID.randomUUID().toString()
        val localDelivery = dao.getDeliveryByIdDirect(deliveryId)
        if (localDelivery != null) {
            dao.insertDelivery(
                localDelivery.copy(
                    status = status,
                    notes = notes ?: "",
                    refusalReason = refusalReason ?: "",
                    quantityExpected = quantityExpected ?: localDelivery.quantityExpected,
                    quantityDelivered = quantityDelivered ?: localDelivery.quantityDelivered,
                    quantityMissing = quantityMissing ?: localDelivery.quantityMissing
                )
            )
        }

        val service = apiService
        if (service == null) {
            queueOfflineOperation("COMPLETE_DELIVERY", deliveryId, idempotencyKey)
            return@withContext Result.success(Unit)
        }

        try {
            val req = CompleteDeliveryRequest(
                status = status,
                notes = notes,
                refusalReason = refusalReason,
                quantityExpected = quantityExpected,
                quantityDelivered = quantityDelivered,
                quantityMissing = quantityMissing
            )
            val response = service.completeDelivery(deliveryId, req, idempotencyKey)
            if (response.isSuccessful && response.body() != null) {
                dao.insertDelivery(response.body()!!.toEntity())
                Result.success(Unit)
            } else {
                queueOfflineOperation("COMPLETE_DELIVERY", deliveryId, idempotencyKey)
                Result.success(Unit)
            }
        } catch (e: Exception) {
            queueOfflineOperation("COMPLETE_DELIVERY", deliveryId, idempotencyKey)
            Result.success(Unit)
        }
    }

    suspend fun createOccurrence(
        tripId: String,
        deliveryId: String? = null,
        type: String,
        description: String
    ): Result<Unit> = withContext(Dispatchers.IO) {
        val idempotencyKey = UUID.randomUUID().toString()
        val occId = UUID.randomUUID().toString()
        dao.insertOccurrence(
            OccurrenceEntity(
                id = occId,
                tripId = tripId,
                deliveryId = deliveryId ?: "",
                driverId = "",
                title = "Ocorrência: $type",
                description = description,
                type = type,
                status = "OPEN",
                createdAt = "Hoje"
            )
        )

        if (deliveryId != null) {
            val localDelivery = dao.getDeliveryByIdDirect(deliveryId)
            if (localDelivery != null) {
                dao.insertDelivery(localDelivery.copy(status = "OCCURRENCE"))
            }
        }

        val service = apiService
        if (service == null) {
            queueOfflineOperation("CREATE_OCCURRENCE", tripId, idempotencyKey)
            return@withContext Result.success(Unit)
        }

        try {
            val req = CreateOccurrenceRequest(
                tripId = tripId,
                deliveryId = deliveryId,
                type = type,
                description = description
            )
            val response = service.createOccurrence(req, idempotencyKey)
            if (response.isSuccessful && response.body() != null) {
                dao.insertOccurrence(response.body()!!.toEntity())
                Result.success(Unit)
            } else {
                queueOfflineOperation("CREATE_OCCURRENCE", tripId, idempotencyKey)
                Result.success(Unit)
            }
        } catch (e: Exception) {
            queueOfflineOperation("CREATE_OCCURRENCE", tripId, idempotencyKey)
            Result.success(Unit)
        }
    }

    suspend fun scanInvoiceRemote(accessKey: String, tripId: String): Result<com.example.data.remote.model.ScanInvoiceResponse> = withContext(Dispatchers.IO) {
        val service = apiService ?: return@withContext Result.failure(Exception("Serviço backend indisponível"))
        try {
            val idempotencyKey = UUID.randomUUID().toString()
            val req = com.example.data.remote.model.ScanInvoiceRequest(accessKey = accessKey, tripId = tripId)
            val response = service.scanInvoice(req, idempotencyKey)
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                body.delivery?.let { dao.insertDelivery(it.toEntity()) }
                body.invoice?.let { dao.insertInvoices(listOf(it.toEntity())) }
                Result.success(body)
            } else {
                val errorMsg = response.errorBody()?.string() ?: response.message()
                Result.failure(Exception("Erro backend: $errorMsg"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun optimizeRouteRemote(tripId: String): Result<com.example.data.remote.model.RouteOptimizationResponseDto> = withContext(Dispatchers.IO) {
        val service = apiService ?: return@withContext Result.failure(Exception("Serviço backend indisponível"))
        try {
            val response = service.optimizeRoute(tripId)
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                // Update local Room delivery sequences
                result.stops.forEach { stop ->
                    val localDel = dao.getDeliveryByIdDirect(stop.deliveryId)
                    if (localDel != null) {
                        dao.insertDelivery(
                            localDel.copy(
                                sequence = stop.sequence,
                                optimizedSequence = stop.sequence,
                                latitude = stop.latitude,
                                longitude = stop.longitude,
                                deliveryWindowStart = stop.deliveryWindowStart ?: localDel.deliveryWindowStart,
                                deliveryWindowEnd = stop.deliveryWindowEnd ?: localDel.deliveryWindowEnd
                            )
                        )
                    }
                }
                Result.success(result)
            } else {
                Result.failure(Exception("Erro na otimização de rota: HTTP ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun uploadPodRemote(deliveryId: String, podUrl: String, fileHash: String? = null): Result<Unit> = withContext(Dispatchers.IO) {
        val localDelivery = dao.getDeliveryByIdDirect(deliveryId)
        if (localDelivery != null) {
            dao.insertDelivery(localDelivery.copy(podUrl = podUrl, podUploadedAt = "Agora", podFileHash = fileHash ?: ""))
        }
        val service = apiService
        if (service == null) {
            queueOfflineOperation("UPLOAD_POD", deliveryId, podUrl)
            return@withContext Result.success(Unit)
        }
        try {
            val req = com.example.data.remote.model.UploadPodRequest(podUrl = podUrl, podFileHash = fileHash)
            val response = service.uploadPod(deliveryId, req)
            if (response.isSuccessful && response.body() != null) {
                dao.insertDelivery(response.body()!!.toEntity())
                Result.success(Unit)
            } else {
                queueOfflineOperation("UPLOAD_POD", deliveryId, podUrl)
                Result.success(Unit)
            }
        } catch (e: Exception) {
            queueOfflineOperation("UPLOAD_POD", deliveryId, podUrl)
            Result.success(Unit)
        }
    }

    private suspend fun queueOfflineOperation(operationType: String, entityId: String, payload: String) {
        dao.insertSyncQueue(
            SyncQueueEntity(
                localOperationId = UUID.randomUUID().toString(),
                entityId = entityId,
                operationType = operationType,
                payload = payload,
                syncStatus = "PENDING"
            )
        )
    }

    suspend fun processPendingSyncQueue(): Result<Int> = withContext(Dispatchers.IO) {
        val pendingItems = dao.getPendingSyncQueue()
        if (pendingItems.isEmpty()) return@withContext Result.success(0)

        val service = apiService ?: return@withContext Result.failure(Exception("Service offline"))
        var syncedCount = 0

        for (item in pendingItems) {
            try {
                dao.updateSyncQueue(item.copy(syncStatus = "SYNCING"))
                val success = when (item.operationType) {
                    "ACCEPT_TRIP" -> service.acceptTrip(item.entityId, item.payload).isSuccessful
                    "START_TRIP" -> service.startTrip(item.entityId, item.payload).isSuccessful
                    "COMPLETE_TRIP" -> service.completeTrip(item.entityId, item.payload).isSuccessful
                    "ARRIVE_DELIVERY" -> service.arriveAtDelivery(item.entityId, item.payload).isSuccessful
                    else -> true
                }
                if (success) {
                    dao.updateSyncQueue(item.copy(syncStatus = "SYNCED"))
                    syncedCount++
                } else {
                    dao.updateSyncQueue(item.copy(syncStatus = "FAILED", attempts = item.attempts + 1))
                }
            } catch (e: Exception) {
                dao.updateSyncQueue(
                    item.copy(
                        syncStatus = "FAILED",
                        attempts = item.attempts + 1,
                        lastError = e.localizedMessage ?: "Network error"
                    )
                )
            }
        }
        Result.success(syncedCount)
    }

    suspend fun addRomaneio(romaneio: RomaneioEntity) {
        dao.insertRomaneio(romaneio)
    }

    suspend fun addToll(toll: TollReceiptEntity) {
        dao.insertToll(toll)
    }

    suspend fun addNotification(notification: NotificationEntity) {
        dao.insertNotification(notification)
    }

    suspend fun updateUserProfile(profile: UserProfileEntity) {
        dao.insertUserProfile(profile)
    }

    suspend fun setLoggedIn(cpf: String, isLoggedIn: Boolean) {
        dao.setLoggedInState(cpf, isLoggedIn)
    }

    suspend fun resolveDivergence(period: String) {
        val current = dao.getFechamentoByPeriod(period).firstOrNull()
        if (current != null) {
            dao.updateFechamento(
                current.copy(
                    hasDivergence = false,
                    divergenceMessage = "",
                    status = "EM CONFERÊNCIA"
                )
            )
        }
    }

    suspend fun purgeLegacyDemoData() {
        dao.purgeDemoProfiles()
    }

    suspend fun seedInitialDataIfEmpty() {
        // No-op: Pure production/homologation mode. No fictitious data is ever inserted.
        purgeLegacyDemoData()
    }
}
