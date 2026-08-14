package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "trips")
data class TripEntity(
    @PrimaryKey val id: String, // UUID or tripCode
    val tripCode: String,
    val driverId: String = "",
    val vehicleId: String = "",
    val client: String = "HK Transportes",
    val operation: String = "Carga Geral",
    val date: String = "",
    val time: String = "",
    val driverName: String = "",
    val truckPlate: String = "",
    val region: String = "",
    val origin: String = "",
    val destination: String = "",
    val cteNumber: String = "",
    val invoicesCount: Int = 0,
    val deliveriesCount: Int = 0,
    val volumesCount: Int = 0,
    val baseValue: Double = 0.0,
    val additionalValue: Double = 0.0,
    val discountValue: Double = 0.0,
    val tollsValue: Double = 0.0,
    val totalValue: Double = 0.0,
    val status: String = "ASSIGNED", // ASSIGNED, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED
    val notes: String = "",
    val acceptedAt: String = "",
    val startDate: String = "",
    val endDate: String = ""
)

@Entity(tableName = "deliveries")
data class DeliveryEntity(
    @PrimaryKey val id: String,
    val tripId: String,
    val recipient: String,
    val recipientDocument: String = "",
    val address: String,
    val numberAddress: String = "",
    val complement: String = "",
    val neighborhood: String = "",
    val city: String,
    val state: String,
    val postalCode: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val customerId: String = "",
    val customerName: String = "",
    val sequence: Int = 1,
    val optimizedSequence: Int = 1,
    val status: String = "PENDING", // PENDING, IN_ROUTE, ARRIVED, DELIVERED, PARTIAL, REFUSED, OCCURRENCE
    val arrivedAt: String = "",
    val deliveredAt: String = "",
    val notes: String = "",
    val refusalReason: String = "",
    val quantityExpected: Int = 0,
    val quantityDelivered: Int = 0,
    val quantityMissing: Int = 0,
    val volumeCount: Int = 0,
    val weight: Double = 0.0,
    val value: Double = 0.0,
    val deliveryWindowStart: String = "08:00",
    val deliveryWindowEnd: String = "18:00",
    val lunchBreakStart: String = "",
    val lunchBreakEnd: String = "",
    val observations: String = "",
    val podUrl: String = "",
    val podUploadedAt: String = "",
    val podFileHash: String = ""
)

@Entity(tableName = "invoices")
data class InvoiceEntity(
    @PrimaryKey val id: String,
    val number: String,
    val tripId: String,
    val deliveryId: String = "",
    val accessKey: String = "",
    val recipient: String,
    val recipientDocument: String = "",
    val address: String = "",
    val city: String,
    val state: String = "SP",
    val postalCode: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val customerId: String = "",
    val customerName: String = "",
    val value: Double,
    val weight: Double = 0.0,
    val volumeCount: Int = 0,
    val deliveryWindowStart: String = "08:00",
    val deliveryWindowEnd: String = "18:00",
    val lunchBreakStart: String = "",
    val lunchBreakEnd: String = "",
    val observations: String = "",
    val status: String = "PENDING"
)

@Entity(tableName = "occurrences")
data class OccurrenceEntity(
    @PrimaryKey val id: String,
    val tripId: String,
    val deliveryId: String = "",
    val driverId: String = "",
    val title: String,
    val description: String,
    val type: String,
    val status: String = "OPEN",
    val createdAt: String = ""
)

@Entity(tableName = "sync_queue")
data class SyncQueueEntity(
    @PrimaryKey val localOperationId: String,
    val entityId: String,
    val operationType: String, // ACCEPT_TRIP, START_TRIP, COMPLETE_TRIP, ARRIVE_DELIVERY, COMPLETE_DELIVERY, CREATE_OCCURRENCE
    val payload: String, // JSON payload
    val createdAt: Long = System.currentTimeMillis(),
    val attempts: Int = 0,
    val lastError: String = "",
    val syncStatus: String = "PENDING" // PENDING, SYNCING, SYNCED, FAILED
)

@Entity(tableName = "romaneios")
data class RomaneioEntity(
    @PrimaryKey val id: String,
    val operation: String,
    val sentDate: String,
    val sentTime: String,
    val driver: String,
    val fileName: String,
    val notes: String = "",
    val currentStep: Int = 2
)

@Entity(tableName = "tolls")
data class TollReceiptEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val date: String,
    val tripRef: String,
    val value: Double,
    val status: String,
    val notes: String = ""
)

@Entity(tableName = "fechamentos")
data class FechamentoEntity(
    @PrimaryKey val period: String,
    val status: String,
    val tripsCount: Int,
    val invoicesCount: Int,
    val totalGross: Double,
    val totalNet: Double,
    val tripsValue: Double,
    val tollsValue: Double,
    val additionalsValue: Double,
    val discountsValue: Double,
    val hasDivergence: Boolean = false,
    val divergenceMessage: String = ""
)

@Entity(tableName = "notifications")
data class NotificationEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val type: String,
    val title: String,
    val message: String,
    val timeLabel: String,
    val valueLabel: String,
    val valueText: String
)

@Entity(tableName = "user_profile")
data class UserProfileEntity(
    @PrimaryKey val cpf: String,
    val name: String,
    val phone: String,
    val truckModel: String,
    val truckPlate: String,
    val avatarUrl: String,
    val isLoggedIn: Boolean = true
)
