package com.example.data.remote.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class TripDto(
    @Json(name = "id") val id: String,
    @Json(name = "tripCode") val tripCode: String,
    @Json(name = "driverId") val driverId: String?,
    @Json(name = "vehicleId") val vehicleId: String?,
    @Json(name = "origin") val origin: String,
    @Json(name = "destination") val destination: String,
    @Json(name = "status") val status: String, // PENDING, ASSIGNED, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED
    @Json(name = "notes") val notes: String?,
    @Json(name = "vehicle") val vehicle: VehicleDto?,
    @Json(name = "stops") val stops: List<TripStopDto>? = emptyList(),
    @Json(name = "deliveries") val deliveries: List<DeliveryDto>? = emptyList(),
    @Json(name = "invoices") val invoices: List<InvoiceDto>? = emptyList(),
    @Json(name = "ctes") val ctes: List<CTeDto>? = emptyList(),
    @Json(name = "occurrences") val occurrences: List<OccurrenceDto>? = emptyList()
)

@JsonClass(generateAdapter = true)
data class TripStopDto(
    @Json(name = "id") val id: String,
    @Json(name = "tripId") val tripId: String,
    @Json(name = "stopOrder") val stopOrder: Int,
    @Json(name = "locationName") val locationName: String,
    @Json(name = "address") val address: String,
    @Json(name = "status") val status: String
)

@JsonClass(generateAdapter = true)
data class DeliveryDto(
    @Json(name = "id") val id: String,
    @Json(name = "tripId") val tripId: String,
    @Json(name = "recipient") val recipient: String,
    @Json(name = "address") val address: String,
    @Json(name = "city") val city: String,
    @Json(name = "state") val state: String,
    @Json(name = "sequence") val sequence: Int = 1,
    @Json(name = "status") val status: String, // PENDING, IN_ROUTE, ARRIVED, DELIVERED, PARTIAL, REFUSED, RETURNED, OCCURRENCE
    @Json(name = "arrivedAt") val arrivedAt: String? = null,
    @Json(name = "deliveredAt") val deliveredAt: String? = null,
    @Json(name = "notes") val notes: String? = null,
    @Json(name = "refusalReason") val refusalReason: String? = null,
    @Json(name = "quantityExpected") val quantityExpected: Int? = null,
    @Json(name = "quantityDelivered") val quantityDelivered: Int? = null,
    @Json(name = "quantityMissing") val quantityMissing: Int? = null,
    @Json(name = "invoices") val invoices: List<InvoiceDto>? = emptyList()
)

@JsonClass(generateAdapter = true)
data class InvoiceDto(
    @Json(name = "id") val id: String,
    @Json(name = "tripId") val tripId: String,
    @Json(name = "deliveryId") val deliveryId: String?,
    @Json(name = "number") val number: String,
    @Json(name = "accessKey") val accessKey: String,
    @Json(name = "recipient") val recipient: String,
    @Json(name = "address") val address: String,
    @Json(name = "city") val city: String,
    @Json(name = "state") val state: String,
    @Json(name = "value") val value: Double,
    @Json(name = "weight") val weight: Double,
    @Json(name = "volumeCount") val volumeCount: Int,
    @Json(name = "status") val status: String
)

@JsonClass(generateAdapter = true)
data class CTeDto(
    @Json(name = "id") val id: String,
    @Json(name = "tripId") val tripId: String,
    @Json(name = "number") val number: String,
    @Json(name = "accessKey") val accessKey: String,
    @Json(name = "status") val status: String,
    @Json(name = "value") val value: Double
)

@JsonClass(generateAdapter = true)
data class OccurrenceDto(
    @Json(name = "id") val id: String,
    @Json(name = "tripId") val tripId: String,
    @Json(name = "deliveryId") val deliveryId: String?,
    @Json(name = "driverId") val driverId: String,
    @Json(name = "title") val title: String,
    @Json(name = "description") val description: String,
    @Json(name = "type") val type: String,
    @Json(name = "status") val status: String = "OPEN",
    @Json(name = "createdAt") val createdAt: String? = null
)

@JsonClass(generateAdapter = true)
data class CompleteDeliveryRequest(
    @Json(name = "status") val status: String, // DELIVERED, PARTIAL, REFUSED
    @Json(name = "notes") val notes: String? = null,
    @Json(name = "refusalReason") val refusalReason: String? = null,
    @Json(name = "quantityExpected") val quantityExpected: Int? = null,
    @Json(name = "quantityDelivered") val quantityDelivered: Int? = null,
    @Json(name = "quantityMissing") val quantityMissing: Int? = null
)

@JsonClass(generateAdapter = true)
data class CreateOccurrenceRequest(
    @Json(name = "tripId") val tripId: String,
    @Json(name = "deliveryId") val deliveryId: String? = null,
    @Json(name = "type") val type: String,
    @Json(name = "title") val title: String? = null,
    @Json(name = "description") val description: String
)

@JsonClass(generateAdapter = true)
data class ScanInvoiceRequest(
    @Json(name = "accessKey") val accessKey: String,
    @Json(name = "tripId") val tripId: String? = null,
    @Json(name = "idempotencyKey") val idempotencyKey: String? = null
)

@JsonClass(generateAdapter = true)
data class ScanInvoiceResponse(
    @Json(name = "message") val message: String,
    @Json(name = "invoice") val invoice: InvoiceDto?,
    @Json(name = "delivery") val delivery: DeliveryDto?,
    @Json(name = "erpConnected") val erpConnected: Boolean = false,
    @Json(name = "erpStatus") val erpStatus: String = "AGUARDANDO CONEXÃO REAL COM ERP"
)

@JsonClass(generateAdapter = true)
data class RouteStopDto(
    @Json(name = "sequence") val sequence: Int,
    @Json(name = "deliveryId") val deliveryId: String,
    @Json(name = "customer") val customer: String,
    @Json(name = "recipientDocument") val recipientDocument: String? = null,
    @Json(name = "address") val address: String,
    @Json(name = "latitude") val latitude: Double,
    @Json(name = "longitude") val longitude: Double,
    @Json(name = "distanceFromPreviousKm") val distanceFromPreviousKm: Double,
    @Json(name = "durationFromPreviousMinutes") val durationFromPreviousMinutes: Int,
    @Json(name = "estimatedArrival") val estimatedArrival: String,
    @Json(name = "deliveryWindow") val deliveryWindow: String,
    @Json(name = "deliveryWindowStart") val deliveryWindowStart: String? = null,
    @Json(name = "deliveryWindowEnd") val deliveryWindowEnd: String? = null,
    @Json(name = "volumeCount") val volumeCount: Int,
    @Json(name = "invoiceCount") val invoiceCount: Int,
    @Json(name = "status") val status: String,
    @Json(name = "warning") val warning: String? = null
)

@JsonClass(generateAdapter = true)
data class RouteOptimizationResponseDto(
    @Json(name = "routeId") val routeId: String,
    @Json(name = "tripId") val tripId: String,
    @Json(name = "totalDistanceKm") val totalDistanceKm: Double,
    @Json(name = "estimatedDurationMinutes") val estimatedDurationMinutes: Int,
    @Json(name = "erpConnected") val erpConnected: Boolean = false,
    @Json(name = "mapsProviderStatus") val mapsProviderStatus: String = "AGUARDANDO CREDENCIAL GOOGLE MAPS",
    @Json(name = "stops") val stops: List<RouteStopDto> = emptyList()
)

@JsonClass(generateAdapter = true)
data class UploadPodRequest(
    @Json(name = "podUrl") val podUrl: String,
    @Json(name = "podFileHash") val podFileHash: String? = null
)
