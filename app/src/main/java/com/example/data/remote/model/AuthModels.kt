package com.example.data.remote.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class LoginRequest(
    @Json(name = "phone_or_cpf") val phoneOrCpf: String,
    @Json(name = "password") val password: String
)

@JsonClass(generateAdapter = true)
data class RefreshTokenRequest(
    @Json(name = "refresh_token") val refreshToken: String
)

@JsonClass(generateAdapter = true)
data class UserDto(
    @Json(name = "id") val id: String,
    @Json(name = "name") val name: String,
    @Json(name = "cpf") val cpf: String,
    @Json(name = "phone") val phone: String,
    @Json(name = "role") val role: String = "DRIVER"
)

@JsonClass(generateAdapter = true)
data class DriverDto(
    @Json(name = "id") val id: String,
    @Json(name = "user_id") val userId: String,
    @Json(name = "cnh") val cnh: String,
    @Json(name = "cnh_category") val cnhCategory: String,
    @Json(name = "rntrc") val rntrc: String,
    @Json(name = "status") val status: String
)

@JsonClass(generateAdapter = true)
data class VehicleDto(
    @Json(name = "id") val id: String,
    @Json(name = "driver_id") val driverId: String,
    @Json(name = "plate") val plate: String,
    @Json(name = "model") val model: String,
    @Json(name = "brand") val brand: String
)

@JsonClass(generateAdapter = true)
data class AuthResponse(
    @Json(name = "access_token") val accessToken: String,
    @Json(name = "refresh_token") val refreshToken: String,
    @Json(name = "token_type") val tokenType: String = "Bearer",
    @Json(name = "expires_in") val expiresIn: Long = 900, // 15 min
    @Json(name = "user") val user: UserDto,
    @Json(name = "driver") val driver: DriverDto?,
    @Json(name = "vehicle") val vehicle: VehicleDto?
)

@JsonClass(generateAdapter = true)
data class ApiErrorResponse(
    @Json(name = "status") val statusCode: Int,
    @Json(name = "message") val message: String,
    @Json(name = "error") val error: String
)
