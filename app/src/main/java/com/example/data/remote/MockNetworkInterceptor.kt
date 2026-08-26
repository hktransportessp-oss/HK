package com.example.data.remote

import okhttp3.Interceptor
import okhttp3.Response

/**
 * MockNetworkInterceptor:
 * Strictly disabled in production and homologation.
 * All HTTP calls hit the REAL REST BACKEND.
 */
class MockNetworkInterceptor(
    private val isMockEnabled: Boolean = false
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        // Production/Homologation: Always pass request directly to real backend
        return chain.proceed(request)
    }
}


