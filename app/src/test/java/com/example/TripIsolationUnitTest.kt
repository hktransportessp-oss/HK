package com.example

import com.example.data.local.LogisticsDao
import com.example.data.model.*
import com.example.data.repository.LogisticsRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class FakeLogisticsDao : LogisticsDao {
    private val trips = mutableMapOf<String, TripEntity>()

    fun setTrip(trip: TripEntity) {
        trips[trip.id] = trip
    }

    fun getTrip(id: String): TripEntity? = trips[id]

    override fun getAllTrips(): Flow<List<TripEntity>> = flowOf(trips.values.toList())
    override fun getTripById(id: String): Flow<TripEntity?> = flowOf(trips[id])
    override suspend fun getTripByIdDirect(id: String): TripEntity? = trips[id]

    override suspend fun insertTrips(trips: List<TripEntity>) {
        trips.forEach { this.trips[it.id] = it }
    }

    override suspend fun insertTrip(trip: TripEntity) {
        trips[trip.id] = trip
    }

    override fun getDeliveriesForTrip(tripId: String): Flow<List<DeliveryEntity>> = flowOf(emptyList())
    override suspend fun getDeliveriesForTripDirect(tripId: String): List<DeliveryEntity> = emptyList()
    override fun getDeliveryById(id: String): Flow<DeliveryEntity?> = flowOf(null)
    override suspend fun getDeliveryByIdDirect(id: String): DeliveryEntity? = null
    override suspend fun insertDeliveries(deliveries: List<DeliveryEntity>) {}
    override suspend fun insertDelivery(delivery: DeliveryEntity) {}
    override fun getInvoicesForTrip(tripId: String): Flow<List<InvoiceEntity>> = flowOf(emptyList())
    override fun getAllInvoices(): Flow<List<InvoiceEntity>> = flowOf(emptyList())
    override suspend fun insertInvoices(invoices: List<InvoiceEntity>) {}
    override fun getOccurrencesForTrip(tripId: String): Flow<List<OccurrenceEntity>> = flowOf(emptyList())
    override suspend fun insertOccurrence(occurrence: OccurrenceEntity) {}
    override suspend fun insertOccurrences(occurrences: List<OccurrenceEntity>) {}
    override suspend fun getPendingSyncQueue(): List<SyncQueueEntity> = emptyList()
    override fun getAllSyncQueue(): Flow<List<SyncQueueEntity>> = flowOf(emptyList())
    override suspend fun insertSyncQueue(syncItem: SyncQueueEntity) {}
    override suspend fun updateSyncQueue(syncItem: SyncQueueEntity) {}
    override suspend fun deleteSyncQueueItem(id: String) {}
    override fun getAllRomaneios(): Flow<List<RomaneioEntity>> = flowOf(emptyList())
    override fun getRomaneioById(id: String): Flow<RomaneioEntity?> = flowOf(null)
    override suspend fun insertRomaneio(romaneio: RomaneioEntity) {}
    override fun getAllTolls(): Flow<List<TollReceiptEntity>> = flowOf(emptyList())
    override suspend fun insertToll(toll: TollReceiptEntity) {}
    override suspend fun insertTolls(tolls: List<TollReceiptEntity>) {}
    override fun getAllFechamentos(): Flow<List<FechamentoEntity>> = flowOf(emptyList())
    override fun getFechamentoByPeriod(period: String): Flow<FechamentoEntity?> = flowOf(null)
    override suspend fun insertFechamentos(fechamentos: List<FechamentoEntity>) {}
    override suspend fun updateFechamento(fechamento: FechamentoEntity) {}
    override fun getAllNotifications(): Flow<List<NotificationEntity>> = flowOf(emptyList())
    override suspend fun insertNotification(notification: NotificationEntity) {}
    override suspend fun insertNotifications(notifications: List<NotificationEntity>) {}
    override fun getUserProfile(): Flow<UserProfileEntity?> = flowOf(null)
    override suspend fun getUserProfileByCpf(cpf: String): UserProfileEntity? = null
    override suspend fun insertUserProfile(userProfile: UserProfileEntity) {}
    override suspend fun setLoggedInState(cpf: String, isLoggedIn: Boolean) {}
}

class TripIsolationUnitTest {

    @Test
    fun `completing trip A must only update trip A leaving trip B in progress`() = runBlocking {
        val fakeDao = FakeLogisticsDao()

        val tripA = TripEntity(
            id = "TRIP-1001",
            tripCode = "TRIP-1001",
            driverId = "driver-1",
            vehicleId = "veh-1",
            client = "HK Transportes",
            operation = "Operação 1",
            date = "15 AGO 2026",
            time = "08:00",
            driverName = "João",
            truckPlate = "ABC-1234",
            origin = "SP",
            destination = "RJ",
            cteNumber = "CTE-1",
            invoicesCount = 1,
            deliveriesCount = 1,
            volumesCount = 10,
            totalValue = 1000.0,
            status = "IN_PROGRESS"
        )

        val tripB = TripEntity(
            id = "TRIP-1002",
            tripCode = "TRIP-1002",
            driverId = "driver-1",
            vehicleId = "veh-1",
            client = "HK Transportes",
            operation = "Operação 2",
            date = "15 AGO 2026",
            time = "09:00",
            driverName = "João",
            truckPlate = "ABC-1234",
            origin = "SP",
            destination = "MG",
            cteNumber = "CTE-2",
            invoicesCount = 1,
            deliveriesCount = 1,
            volumesCount = 20,
            totalValue = 2000.0,
            status = "IN_PROGRESS"
        )

        fakeDao.setTrip(tripA)
        fakeDao.setTrip(tripB)

        val repository = LogisticsRepository(fakeDao, null)

        // Complete Trip A
        repository.completeTrip("TRIP-1001")

        // Assert Trip A is COMPLETED
        val updatedTripA = fakeDao.getTrip("TRIP-1001")
        assertNotNull(updatedTripA)
        assertEquals("COMPLETED", updatedTripA?.status)

        // Assert Trip B is STILL IN_PROGRESS
        val updatedTripB = fakeDao.getTrip("TRIP-1002")
        assertNotNull(updatedTripB)
        assertEquals("IN_PROGRESS", updatedTripB?.status)
    }
}
