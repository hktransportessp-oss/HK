package com.example.data.remote

import android.content.Context
import android.content.SharedPreferences

class TokenManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS_NAME = "hk_connect_secure_prefs"
        private const val KEY_ACCESS_TOKEN = "jwt_access_token"
        private const val KEY_REFRESH_TOKEN = "jwt_refresh_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USER_NAME = "user_name"
        private const val KEY_USER_CPF = "user_cpf"
        private const val KEY_USER_PHONE = "user_phone"
        private const val KEY_TRUCK_MODEL = "truck_model"
        private const val KEY_TRUCK_PLATE = "truck_plate"
        private const val KEY_SERVER_URL = "server_base_url"
        private const val DEFAULT_SERVER_URL = "https://api.hkconnect.com.br/"

        @Volatile
        private var instance: TokenManager? = null

        fun getInstance(context: Context): TokenManager {
            return instance ?: synchronized(this) {
                instance ?: TokenManager(context.applicationContext).also { instance = it }
            }
        }
    }

    fun saveTokens(accessToken: String, refreshToken: String) {
        prefs.edit()
            .putString(KEY_ACCESS_TOKEN, accessToken)
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .apply()
    }

    fun saveUserProfile(
        userId: String,
        name: String,
        cpf: String,
        phone: String,
        truckModel: String,
        truckPlate: String
    ) {
        prefs.edit()
            .putString(KEY_USER_ID, userId)
            .putString(KEY_USER_NAME, name)
            .putString(KEY_USER_CPF, cpf)
            .putString(KEY_USER_PHONE, phone)
            .putString(KEY_TRUCK_MODEL, truckModel)
            .putString(KEY_TRUCK_PLATE, truckPlate)
            .apply()
    }

    fun getAccessToken(): String? = prefs.getString(KEY_ACCESS_TOKEN, null)

    fun getRefreshToken(): String? = prefs.getString(KEY_REFRESH_TOKEN, null)

    fun getUserId(): String? = prefs.getString(KEY_USER_ID, null)

    fun getUserName(): String = prefs.getString(KEY_USER_NAME, "") ?: ""

    fun getUserCpf(): String = prefs.getString(KEY_USER_CPF, "") ?: ""

    fun getUserPhone(): String = prefs.getString(KEY_USER_PHONE, "") ?: ""

    fun getTruckModel(): String = prefs.getString(KEY_TRUCK_MODEL, "") ?: ""

    fun getTruckPlate(): String = prefs.getString(KEY_TRUCK_PLATE, "") ?: ""

    fun getServerUrl(): String = prefs.getString(KEY_SERVER_URL, DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL

    fun setServerUrl(url: String) {
        val cleanUrl = if (url.endsWith("/")) url else "$url/"
        prefs.edit().putString(KEY_SERVER_URL, cleanUrl).apply()
    }

    fun hasActiveSession(): Boolean {
        return !getAccessToken().isNull_or_empty_custom() && !getRefreshToken().isNull_or_empty_custom()
    }

    fun clearTokensAndSession() {
        prefs.edit().clear().apply()
    }

    private fun String?.isNull_or_empty_custom(): Boolean {
        return this == null || this.trim().isEmpty()
    }
}
