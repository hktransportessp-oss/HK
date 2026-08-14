package com.example.data.local

import androidx.room.*
import com.example.data.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface LogisticsDao {
    // Trips
    @Query("SELECT * FROM trips ORDER BY date DESC")
    fun getAllTrips(): Flow<List<TripEntity>>

    @Query("SELECT * FROM trips WHERE id = :id LIMIT 1")
    fun getTripById(id: String): Flow<TripEntity?>

    @Query("SELECT * FROM trips WHERE id = :id LIMIT 1")
    suspend fun getTripByIdDirect(id: String): TripEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrips(trips: List<TripEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrip(trip: TripEntity)

    // Deliveries
    @Query("SELECT * FROM deliveries WHERE tripId = :tripId ORDER BY sequence ASC")
    fun getDeliveriesForTrip(tripId: String): Flow<List<DeliveryEntity>>

    @Query("SELECT * FROM deliveries WHERE tripId = :tripId ORDER BY sequence ASC")
    suspend fun getDeliveriesForTripDirect(tripId: String): List<DeliveryEntity>

    @Query("SELECT * FROM deliveries WHERE id = :id LIMIT 1")
    fun getDeliveryById(id: String): Flow<DeliveryEntity?>

    @Query("SELECT * FROM deliveries WHERE id = :id LIMIT 1")
    suspend fun getDeliveryByIdDirect(id: String): DeliveryEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDeliveries(deliveries: List<DeliveryEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDelivery(delivery: DeliveryEntity)

    // Invoices
    @Query("SELECT * FROM invoices WHERE tripId = :tripId")
    fun getInvoicesForTrip(tripId: String): Flow<List<InvoiceEntity>>

    @Query("SELECT * FROM invoices")
    fun getAllInvoices(): Flow<List<InvoiceEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInvoices(invoices: List<InvoiceEntity>)

    // Occurrences
    @Query("SELECT * FROM occurrences WHERE tripId = :tripId ORDER BY createdAt DESC")
    fun getOccurrencesForTrip(tripId: String): Flow<List<OccurrenceEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOccurrence(occurrence: OccurrenceEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOccurrences(occurrences: List<OccurrenceEntity>)

    // Sync Queue
    @Query("SELECT * FROM sync_queue WHERE syncStatus = 'PENDING' ORDER BY createdAt ASC")
    suspend fun getPendingSyncQueue(): List<SyncQueueEntity>

    @Query("SELECT * FROM sync_queue ORDER BY createdAt DESC")
    fun getAllSyncQueue(): Flow<List<SyncQueueEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSyncQueue(syncItem: SyncQueueEntity)

    @Update
    suspend fun updateSyncQueue(syncItem: SyncQueueEntity)

    @Query("DELETE FROM sync_queue WHERE localOperationId = :id")
    suspend fun deleteSyncQueueItem(id: String)

    // Romaneios
    @Query("SELECT * FROM romaneios ORDER BY sentDate DESC")
    fun getAllRomaneios(): Flow<List<RomaneioEntity>>

    @Query("SELECT * FROM romaneios WHERE id = :id LIMIT 1")
    fun getRomaneioById(id: String): Flow<RomaneioEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRomaneio(romaneio: RomaneioEntity)

    // Tolls
    @Query("SELECT * FROM tolls ORDER BY id DESC")
    fun getAllTolls(): Flow<List<TollReceiptEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertToll(toll: TollReceiptEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTolls(tolls: List<TollReceiptEntity>)

    // Fechamentos
    @Query("SELECT * FROM fechamentos")
    fun getAllFechamentos(): Flow<List<FechamentoEntity>>

    @Query("SELECT * FROM fechamentos WHERE period = :period LIMIT 1")
    fun getFechamentoByPeriod(period: String): Flow<FechamentoEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFechamentos(fechamentos: List<FechamentoEntity>)

    @Update
    suspend fun updateFechamento(fechamento: FechamentoEntity)

    // Notifications
    @Query("SELECT * FROM notifications ORDER BY id DESC")
    fun getAllNotifications(): Flow<List<NotificationEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotification(notification: NotificationEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotifications(notifications: List<NotificationEntity>)

    // User Profile
    @Query("SELECT * FROM user_profile LIMIT 1")
    fun getUserProfile(): Flow<UserProfileEntity?>

    @Query("SELECT * FROM user_profile WHERE cpf = :cpf LIMIT 1")
    suspend fun getUserProfileByCpf(cpf: String): UserProfileEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUserProfile(userProfile: UserProfileEntity)

    @Query("UPDATE user_profile SET isLoggedIn = :isLoggedIn WHERE cpf = :cpf")
    suspend fun setLoggedInState(cpf: String, isLoggedIn: Boolean)
}
