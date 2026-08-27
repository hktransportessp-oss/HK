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
    @Json(name = "phone") val phone: String? = null,
    @Json(name = "role") val role: String? = "DRIVER"
)

@JsonClass(generateAdapter = true)
data class DriverDto(
    @Json(name = "id") val id: String? = null,
    @Json(name = "user_id") val userId: String? = null,
    @Json(name = "cpf") val cpf: String? = null,
    @Json(name = "cnh") val cnh: String? = null,
    @Json(name = "cnh_category") val cnhCategory: String? = null,
    @Json(name = "rntrc") val rntrc: String? = null,
    @Json(name = "status") val status: String? = "ATIVO"
)

@JsonClass(generateAdapter = true)
data class VehicleDto(
    @Json(name = "id") val id: String? = null,
    @Json(name = "driver_id") val driverId: String? = null,
    @Json(name = "plate") val plate: String? = null,
    @Json(name = "model") val model: String? = null,
    @Json(name = "brand") val brand: String? = null
)

@JsonClass(generateAdapter = true)
data class AuthResponse(
    @Json(name = "access_token") val accessToken: String,
    @Json(name = "refresh_token") val refreshToken: String,
    @Json(name = "token_type") val tokenType: String? = "Bearer",
    @Json(name = "expires_in") val expiresIn: Long? = 900, // 15 min
    @Json(name = "user") val user: UserDto,
    @Json(name = "driver") val driver: DriverDto? = null,
    @Json(name = "vehicle") val vehicle: VehicleDto? = null
)

@JsonClass(generateAdapter = true)
data class ApiErrorResponse(
    @Json(name = "status") val statusCode: Int? = null,
    @Json(name = "message") val message: String? = null,
    @Json(name = "error") val error: String? = null
)
