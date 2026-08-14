package com.example.data.remote

import com.example.data.remote.model.*
import retrofit2.Response
import retrofit2.http.*

interface TripsApiService {

    @GET("api/v1/trips")
    suspend fun getTrips(): Response<List<TripDto>>

    @GET("api/v1/trips/{id}")
    suspend fun getTripById(@Path("id") id: String): Response<TripDto>

    @POST("api/v1/trips/{id}/accept")
    suspend fun acceptTrip(
        @Path("id") id: String,
        @Header("Idempotency-Key") idempotencyKey: String? = null
    ): Response<TripDto>

    @POST("api/v1/trips/{id}/start")
    suspend fun startTrip(
        @Path("id") id: String,
        @Header("Idempotency-Key") idempotencyKey: String? = null
    ): Response<TripDto>

    @POST("api/v1/trips/{id}/complete")
    suspend fun completeTrip(
        @Path("id") id: String,
        @Header("Idempotency-Key") idempotencyKey: String? = null
    ): Response<TripDto>

    @POST("api/v1/deliveries/{id}/arrive")
    suspend fun arriveAtDelivery(
        @Path("id") id: String,
        @Header("Idempotency-Key") idempotencyKey: String? = null
    ): Response<DeliveryDto>

    @POST("api/v1/deliveries/{id}/complete")
    suspend fun completeDelivery(
        @Path("id") id: String,
        @Body request: CompleteDeliveryRequest,
        @Header("Idempotency-Key") idempotencyKey: String? = null
    ): Response<DeliveryDto>

    @POST("api/v1/occurrences")
    suspend fun createOccurrence(
        @Body request: CreateOccurrenceRequest,
        @Header("Idempotency-Key") idempotencyKey: String? = null
    ): Response<OccurrenceDto>

    @GET("api/v1/occurrences/trip/{tripId}")
    suspend fun getOccurrencesForTrip(@Path("tripId") tripId: String): Response<List<OccurrenceDto>>

    @POST("api/v1/invoices/scan")
    suspend fun scanInvoice(
        @Body request: ScanInvoiceRequest,
        @Header("Idempotency-Key") idempotencyKey: String? = null
    ): Response<ScanInvoiceResponse>

    @POST("api/v1/trips/{id}/optimize-route")
    suspend fun optimizeRoute(
        @Path("id") id: String
    ): Response<RouteOptimizationResponseDto>

    @POST("api/v1/deliveries/{id}/pod")
    suspend fun uploadPod(
        @Path("id") id: String,
        @Body request: UploadPodRequest
    ): Response<DeliveryDto>
}
