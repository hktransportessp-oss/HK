package com.example.data.remote.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class LocationPayload(
    @Json(name = "latitude") val latitude: Double,
    @Json(name = "longitude") val longitude: Double,
    @Json(name = "accuracy") val accuracy: Float? = null,
    @Json(name = "speed") val speed: Float? = null,
    @Json(name = "heading") val heading: Float? = null,
    @Json(name = "capturedAt") val capturedAt: String,
    @Json(name = "tripId") val tripId: String? = null
)

@JsonClass(generateAdapter = true)
data class LocationResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "locationId") val locationId: String? = null,
    @Json(name = "driverId") val driverId: String? = null,
    @Json(name = "receivedAt") val receivedAt: String? = null,
    @Json(name = "acknowledged") val acknowledged: Boolean? = null,
    @Json(name = "duplicate") val duplicate: Boolean? = null
)
