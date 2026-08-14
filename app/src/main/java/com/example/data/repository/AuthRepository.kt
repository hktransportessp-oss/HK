package com.example.data.repository

import android.content.Context
import com.example.data.local.LogisticsDao
import com.example.data.model.UserProfileEntity
import com.example.data.remote.ApiClient
import com.example.data.remote.TokenManager
import com.example.data.remote.model.LoginRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

class AuthRepository(
    context: Context,
    private val logisticsDao: LogisticsDao
) {
    private val apiClient = ApiClient.getInstance(context)
    private val tokenManager: TokenManager = apiClient.tokenManager

    val userProfile: Flow<UserProfileEntity?> = logisticsDao.getUserProfile()

    suspend fun loginRemote(
        phoneOrCpf: String,
        passwordStr: String
    ): Result<UserProfileEntity> = withContext(Dispatchers.IO) {
        try {
            val response = apiClient.authApiService.login(
                LoginRequest(
                    phoneOrCpf = phoneOrCpf,
                    password = passwordStr
                )
            )

            if (response.isSuccessful && response.body() != null) {
                val authData = response.body()!!

                // Save JWT Tokens
                tokenManager.saveTokens(
                    accessToken = authData.accessToken,
                    refreshToken = authData.refreshToken
                )

                val user = authData.user
                val driver = authData.driver
                val vehicle = authData.vehicle

                val truckModel = vehicle?.let { "${it.brand} ${it.model}" } ?: "Volvo FH 540"
                val truckPlate = vehicle?.plate ?: "ABC-1234"

                tokenManager.saveUserProfile(
                    userId = user.id,
                    name = user.name,
                    cpf = user.cpf,
                    phone = user.phone,
                    truckModel = truckModel,
                    truckPlate = truckPlate
                )

                val userProfileEntity = UserProfileEntity(
                    cpf = user.cpf,
                    name = user.name,
                    phone = user.phone,
                    truckModel = truckModel,
                    truckPlate = truckPlate,
                    avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCY4aOhJdXtyk551zTOZSjh9icmjoZcrNG9iBYsOXku7MeB5aOHvWxq_6gMjDmu-Uh03NIP8jDgcL5X1obduYCNjmJo159Cf2ZA4HMXnWYNnN15JJoxuvnm9rnrdtU73QykpX7FerRwXg03c01xLOATx7zqpOIDirE259AIaDLTNKshpf7ENDFGQfUuXUhko4fshrvH_XpWrDJfA51H9KuX4ZZjOUuWs_0wVs7hfuCWJ1sR7T9ttAPCZg",
                    isLoggedIn = true
                )

                logisticsDao.insertUserProfile(userProfileEntity)
                Result.success(userProfileEntity)
            } else {
                Result.failure(Exception("Falha na autenticação remota: ${response.code()}"))
            }
        } catch (e: Exception) {
            // Fallback for offline login if session/user exists locally
            if (tokenManager.hasActiveSession()) {
                val cachedCpf = tokenManager.getUserCpf()
                val profile = logisticsDao.getUserProfileByCpf(cachedCpf)
                if (profile != null) {
                    Result.success(profile.copy(isLoggedIn = true))
                } else {
                    Result.failure(e)
                }
            } else {
                Result.failure(e)
            }
        }
    }

    suspend fun logoutRemote() = withContext(Dispatchers.IO) {
        try {
            apiClient.authApiService.logout()
        } catch (_: Exception) {
            // Ignore network errors on logout
        } finally {
            val cpf = tokenManager.getUserCpf()
            if (cpf.isNotBlank()) {
                logisticsDao.setLoggedInState(cpf, false)
            }
            tokenManager.clearTokensAndSession()
        }
    }

    fun hasActiveSession(): Boolean = tokenManager.hasActiveSession()
}
