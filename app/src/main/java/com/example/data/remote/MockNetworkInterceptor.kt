package com.example.data.remote

import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Protocol
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import org.json.JSONObject
import java.util.UUID

/**
 * MockNetworkInterceptor:
 * Set ENABLE_MOCK_NETWORK = true ONLY during local unit tests when no live server is reachable.
 * In production / standard environment, ENABLE_MOCK_NETWORK is false and all HTTP calls hit the REAL REST BACKEND.
 */
class MockNetworkInterceptor(
    private val isMockEnabled: Boolean = false
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()

        // Production Flow: Pass request directly to the real backend server
        if (!isMockEnabled) {
            return chain.proceed(request)
        }

        val path = request.url.encodedPath

        // Optional Mock fallback flow for offline unit tests only
        if (path.contains("api/v1/auth/login")) {
            val bodyString = request.body?.let { body ->
                val buffer = okio.Buffer()
                body.writeTo(buffer)
                buffer.readUtf8()
            } ?: ""

            val json = if (bodyString.isNotBlank()) JSONObject(bodyString) else JSONObject()
            val phoneOrCpf = json.optString("phone_or_cpf", "12345678900")

            val userId = UUID.randomUUID().toString()
            val driverId = UUID.randomUUID().toString()
            val vehicleId = UUID.randomUUID().toString()

            val responseJson = JSONObject().apply {
                put("access_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access_${System.currentTimeMillis()}")
                put("refresh_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh_${UUID.randomUUID()}")
                put("token_type", "Bearer")
                put("expires_in", 900)
                put("user", JSONObject().apply {
                    put("id", userId)
                    put("name", "João da Silva")
                    put("cpf", if (phoneOrCpf.length == 11) phoneOrCpf else "38920184910")
                    put("phone", "(11) 98765-4321")
                    put("role", "DRIVER")
                })
                put("driver", JSONObject().apply {
                    put("id", driverId)
                    put("user_id", userId)
                    put("cnh", "04829103920")
                    put("cnh_category", "AE")
                    put("rntrc", "8493021")
                    put("status", "ATIVO")
                })
                put("vehicle", JSONObject().apply {
                    put("id", vehicleId)
                    put("driver_id", driverId)
                    put("plate", "ABC-1234")
                    put("model", "FH 540")
                    put("brand", "Volvo")
                })
            }

            return Response.Builder()
                .request(request)
                .protocol(Protocol.HTTP_1_1)
                .code(200)
                .message("OK")
                .body(responseJson.toString().toResponseBody("application/json".toMediaType()))
                .build()
        }

        if (path.contains("api/v1/auth/refresh")) {
            val responseJson = JSONObject().apply {
                put("access_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access_refreshed_${System.currentTimeMillis()}")
                put("refresh_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh_rotated_${UUID.randomUUID()}")
                put("token_type", "Bearer")
                put("expires_in", 900)
                put("user", JSONObject().apply {
                    put("id", "usr-1029")
                    put("name", "João da Silva")
                    put("cpf", "38920184910")
                    put("phone", "(11) 98765-4321")
                    put("role", "DRIVER")
                })
                put("driver", JSONObject().apply {
                    put("id", "drv-8492")
                    put("user_id", "usr-1029")
                    put("cnh", "04829103920")
                    put("cnh_category", "AE")
                    put("rntrc", "8493021")
                    put("status", "ATIVO")
                })
                put("vehicle", JSONObject().apply {
                    put("id", "vhc-9901")
                    put("driver_id", "drv-8492")
                    put("plate", "ABC-1234")
                    put("model", "FH 540")
                    put("brand", "Volvo")
                })
            }

            return Response.Builder()
                .request(request)
                .protocol(Protocol.HTTP_1_1)
                .code(200)
                .message("OK")
                .body(responseJson.toString().toResponseBody("application/json".toMediaType()))
                .build()
        }

        if (path.contains("api/v1/auth/logout")) {
            return Response.Builder()
                .request(request)
                .protocol(Protocol.HTTP_1_1)
                .code(200)
                .message("OK")
                .body("{}".toResponseBody("application/json".toMediaType()))
                .build()
        }

        return chain.proceed(request)
    }
}

