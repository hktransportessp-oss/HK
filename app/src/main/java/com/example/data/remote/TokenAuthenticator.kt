package com.example.data.remote

import com.example.data.remote.model.RefreshTokenRequest
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route

class TokenAuthenticator(
    private val tokenManager: TokenManager,
    private val authApiServiceProvider: () -> AuthApiService
) : Authenticator {

    @Synchronized
    override fun authenticate(route: Route?, response: Response): Request? {
        // If request failed more than once, abort retry to avoid infinite loop
        if (responseCount(response) >= 2) {
            tokenManager.clearTokensAndSession()
            return null
        }

        val currentRefreshToken = tokenManager.getRefreshToken() ?: run {
            tokenManager.clearTokensAndSession()
            return null
        }

        return try {
            val refreshCall = authApiServiceProvider().refreshTokenSync(RefreshTokenRequest(currentRefreshToken))
            val refreshResponse = refreshCall.execute()

            if (refreshResponse.isSuccessful && refreshResponse.body() != null) {
                val authData = refreshResponse.body()!!
                tokenManager.saveTokens(authData.accessToken, authData.refreshToken)

                // Retry original request with newly acquired access token
                response.request.newBuilder()
                    .header("Authorization", "Bearer ${authData.accessToken}")
                    .build()
            } else {
                tokenManager.clearTokensAndSession()
                null
            }
        } catch (e: Exception) {
            tokenManager.clearTokensAndSession()
            null
        }
    }

    private fun responseCount(response: Response): Int {
        var count = 1
        var priorResponse = response.priorResponse
        while (priorResponse != null) {
            count++
            priorResponse = priorResponse.priorResponse
        }
        return count
    }
}
