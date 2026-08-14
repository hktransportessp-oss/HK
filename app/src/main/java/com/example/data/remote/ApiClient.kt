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
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl("https://api.hkconnect.com.br/") // Production REST base URL
        .client(okHttpClient)
        .addConverterFactory(MoshiConverterFactory.create(moshi))
        .build()

    val authApiService: AuthApiService by lazy {
        val service = retrofit.create(AuthApiService::class.java)
        authApiServiceRef = service
        service
    }

    val tripsApiService: TripsApiService by lazy {
        retrofit.create(TripsApiService::class.java)
    }

    private fun createAuthApiService(): AuthApiService {
        val service = retrofit.create(AuthApiService::class.java)
        authApiServiceRef = service
        return service
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
