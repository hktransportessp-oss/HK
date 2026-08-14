package com.example.data.remote

import com.example.data.remote.model.AuthResponse
import com.example.data.remote.model.LoginRequest
import com.example.data.remote.model.RefreshTokenRequest
import com.example.data.remote.model.UserDto
import retrofit2.Call
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AuthApiService {

    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("api/v1/auth/refresh")
    fun refreshTokenSync(@Body request: RefreshTokenRequest): Call<AuthResponse>

    @POST("api/v1/auth/refresh")
    suspend fun refreshToken(@Body request: RefreshTokenRequest): Response<AuthResponse>

    @POST("api/v1/auth/logout")
    suspend fun logout(): Response<Unit>

    @GET("api/v1/users/me")
    suspend fun getProfile(): Response<AuthResponse>
}
