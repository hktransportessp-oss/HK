package com.example.data.remote

import android.content.Context
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit

class ApiClient private constructor(context: Context) {

    val tokenManager: TokenManager = TokenManager.getInstance(context)

    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    private val authInterceptor = AuthInterceptor(tokenManager)

    private var authApiServiceRef: AuthApiService? = null

    private val tokenAuthenticator = TokenAuthenticator(tokenManager) {
        authApiServiceRef ?: createAuthApiService()
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(MockNetworkInterceptor(isMockEnabled = false)) // Mock disabled for production real backend connection
        .addInterceptor(authInterceptor)
        .authenticator(tokenAuthenticator)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .writeTimeout(20, TimeUnit.SECONDS)
        .build()

    private fun buildRetrofit(): Retrofit {
        val baseUrl = tokenManager.getServerUrl()
        val formattedUrl = if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"
        return Retrofit.Builder()
            .baseUrl(formattedUrl)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
    }

    private var retrofitInstance = buildRetrofit()

    val authApiService: AuthApiService
        get() {
            if (authApiServiceRef == null) {
                authApiServiceRef = retrofitInstance.create(AuthApiService::class.java)
            }
            return authApiServiceRef!!
        }

    val tripsApiService: TripsApiService
        get() = retrofitInstance.create(TripsApiService::class.java)

    private fun createAuthApiService(): AuthApiService {
        val service = retrofitInstance.create(AuthApiService::class.java)
        authApiServiceRef = service
        return service
    }

    fun updateBaseUrl(newUrl: String) {
        tokenManager.setServerUrl(newUrl)
        retrofitInstance = buildRetrofit()
        authApiServiceRef = null
    }

    companion object {
        @Volatile
        private var instance: ApiClient? = null

        fun getInstance(context: Context): ApiClient {
            return instance ?: synchronized(this) {
                instance ?: ApiClient(context.applicationContext).also { instance = it }
            }
        }
    }
}
