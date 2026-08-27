package com.example.data.repository

import android.content.Context
import android.util.Log
import com.example.data.local.LogisticsDao
import com.example.data.model.UserProfileEntity
import com.example.data.remote.ApiClient
import com.example.data.remote.TokenManager
import com.example.data.remote.model.LoginRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

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
        Log.d("HK_CONNECT_AUTH", "[ANDROID LOGIN] Repository.login iniciado")
        try {
            Log.d("HK_CONNECT_AUTH", "[ANDROID LOGIN] POST /api/v1/auth/login iniciado")
            val cleanCpfOrPhone = phoneOrCpf.trim()
            val response = apiClient.authApiService.login(
                LoginRequest(
                    phoneOrCpf = cleanCpfOrPhone,
                    password = passwordStr
                )
            )

            val statusCode = response.code()
            Log.d("HK_CONNECT_AUTH", "[ANDROID LOGIN] HTTP status = $statusCode")

            if (response.isSuccessful && response.body() != null) {
                val authData = response.body()!!
                Log.d("HK_CONNECT_AUTH", "[ANDROID LOGIN] sucesso no login remoto (userId=${authData.user.id})")

                // Save JWT Tokens
                tokenManager.saveTokens(
                    accessToken = authData.accessToken,
                    refreshToken = authData.refreshToken
                )

                val user = authData.user
                val vehicle = authData.vehicle

                val truckModel = vehicle?.let {
                    val brand = it.brand.orEmpty()
                    val model = it.model.orEmpty()
                    "$brand $model".trim()
                }.orEmpty()
                val truckPlate = vehicle?.plate.orEmpty()

                val resolvedCpf = user.cpf.ifBlank { authData.driver?.cpf.orEmpty() }
                val resolvedName = user.name.ifBlank { "Motorista" }
                val resolvedPhone = user.phone.orEmpty()

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
                    name = resolvedName,
                    cpf = resolvedCpf,
                    phone = resolvedPhone,
                    truckModel = truckModel,
                    truckPlate = truckPlate
                )

                val userProfileEntity = UserProfileEntity(
                    cpf = resolvedCpf,
                    name = resolvedName,
                    phone = resolvedPhone,
                    truckModel = truckModel,
                    truckPlate = truckPlate,
                    avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCY4aOhJdXtyk551zTOZSjh9icmjoZcrNG9iBYsOXku7MeB5aOHvWxq_6gMjDmu-Uh03NIP8jDgcL5X1obduYCNjmJo159Cf2ZA4HMXnWYNnN15JJoxuvnm9rnrdtU73QykpX7FerRwXg03c01xLOATx7zqpOIDirE259AIaDLTNKshpf7ENDFGQfUuXUhko4fshrvH_XpWrDJfA51H9KuX4ZZjOUuWs_0wVs7hfuCWJ1sR7T9ttAPCZg",
                    isLoggedIn = true
                )

                logisticsDao.insertUserProfile(userProfileEntity)
                Result.success(userProfileEntity)
            } else {
                val errorMsg = when (statusCode) {
                    400 -> "Dados de acesso inválidos. Verifique CPF e senha."
                    401 -> "CPF ou senha incorretos."
                    403 -> "Acesso não autorizado ou conta inativa."
                    404 -> "Motorista não encontrado no sistema."
                    500, 502, 503 -> "Servidor indisponível no momento ($statusCode). Tente novamente."
                    else -> "Falha na autenticação (Código HTTP $statusCode)."
                }
                Log.e("HK_CONNECT_AUTH", "[ANDROID LOGIN] erro: $errorMsg")
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e("HK_CONNECT_AUTH", "[ANDROID LOGIN] erro exceção: ${e.javaClass.simpleName} - ${e.message}")
            
            // Check if there is an offline cached session for THIS specific user
            if (tokenManager.hasActiveSession()) {
                val cachedCpf = tokenManager.getUserCpf()
                val cleanInput = phoneOrCpf.replace(".", "").replace("-", "").trim()
                val cleanCached = cachedCpf.replace(".", "").replace("-", "").trim()
                if (cleanInput == cleanCached) {
                    val profile = logisticsDao.getUserProfileByCpf(cachedCpf)
                    if (profile != null) {
                        Log.d("HK_CONNECT_AUTH", "[ANDROID LOGIN] sessão offline reutilizada com sucesso")
                        return@withContext Result.success(profile.copy(isLoggedIn = true))
                    }
                }
            }

            val humanError = when (e) {
                is UnknownHostException -> "Não foi possível conectar ao servidor (${apiClient.tokenManager.getServerUrl()}). Verifique sua conexão à internet ou URL do backend."
                is ConnectException -> "Conexão recusada pelo servidor. Verifique se a API está online."
                is SocketTimeoutException -> "Tempo limite de conexão esgotado. Verifique sua rede."
                else -> e.message ?: "Erro de conexão ao tentar autenticar."
            }
            Result.failure(Exception(humanError))
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

    fun getServerUrl(): String = tokenManager.getServerUrl()

    fun updateServerUrl(url: String) {
        apiClient.updateBaseUrl(url)
    }
}
