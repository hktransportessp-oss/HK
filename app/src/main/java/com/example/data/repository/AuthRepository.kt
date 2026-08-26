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

                val truckModel = vehicle?.let { "${it.brand} ${it.model}".trim() } ?: ""
                val truckPlate = vehicle?.plate ?: ""

                // Purge any stale demo or prior session data from Room on fresh login
                logisticsDao.clearTrips()
                logisticsDao.clearDeliveries()
                logisticsDao.clearInvoices()
                logisticsDao.clearOccurrences()
                logisticsDao.clearRomaneios()
                logisticsDao.clearTolls()
                logisticsDao.clearFechamentos()
                logisticsDao.clearNotifications()
                logisticsDao.clearUserProfile()

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
                val errorMsg = if (response.code() == 401) "Credenciais inválidas. Verifique seu CPF e senha." else "Falha na autenticação: ${response.code()}"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            // Fallback for offline login ONLY if an existing matching user session exists locally
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
            logisticsDao.clearUserProfile()
            logisticsDao.clearTrips()
            logisticsDao.clearDeliveries()
            logisticsDao.clearInvoices()
            logisticsDao.clearOccurrences()
            logisticsDao.clearRomaneios()
            logisticsDao.clearTolls()
            logisticsDao.clearFechamentos()
            tokenManager.clearTokensAndSession()
        }
    }

    suspend fun purgeLegacyDemoData() = withContext(Dispatchers.IO) {
        logisticsDao.purgeDemoProfiles()
        if (tokenManager.getUserCpf() == "389.201.849-10" || tokenManager.getUserCpf() == "38920184910" || tokenManager.getUserName() == "João da Silva") {
            tokenManager.clearTokensAndSession()
            logisticsDao.clearUserProfile()
            logisticsDao.clearTrips()
            logisticsDao.clearDeliveries()
            logisticsDao.clearInvoices()
            logisticsDao.clearOccurrences()
            logisticsDao.clearRomaneios()
            logisticsDao.clearTolls()
            logisticsDao.clearFechamentos()
        }
    }

    fun hasActiveSession(): Boolean = tokenManager.hasActiveSession()
}
