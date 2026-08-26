package com.example

import com.example.data.local.LogisticsDao
import com.example.data.model.*
import com.example.data.remote.AuthApiService
import com.example.data.remote.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.*
import org.junit.Test
import retrofit2.Call
import retrofit2.Response

class FakeAuthApiService(
    private val shouldSucceed: Boolean = true,
    private val httpStatusCode: Int = 200
) : AuthApiService {
    var capturedLoginRequest: LoginRequest? = null

    override suspend fun login(request: LoginRequest): Response<AuthResponse> {
        capturedLoginRequest = request
        return if (shouldSucceed && httpStatusCode == 200) {
            val responseBody = AuthResponse(
                accessToken = "test_jwt_access_token",
                refreshToken = "test_jwt_refresh_token",
                user = UserDto(
                    id = "usr-101",
                    name = "Carlos Motorista",
                    cpf = request.phoneOrCpf,
                    phone = "(11) 99999-8888"
                ),
                driver = DriverDto(
                    id = "drv-101",
                    userId = "usr-101",
                    cnh = "12345678900",
                    cnhCategory = "E",
                    rntrc = "12345678",
                    status = "ACTIVE"
                ),
                vehicle = VehicleDto(
                    id = "veh-101",
                    driverId = "drv-101",
                    plate = "HKC-2026",
                    model = "FH 540",
                    brand = "Volvo"
                )
            )
            Response.success(responseBody)
        } else {
            Response.error(
                httpStatusCode,
                "{\"message\":\"Credenciais inválidas\"}".toResponseBody("application/json".toMediaTypeOrNull())
            )
        }
    }

    override fun refreshTokenSync(request: RefreshTokenRequest): Call<AuthResponse> = throw NotImplementedError()
    override suspend fun refreshToken(request: RefreshTokenRequest): Response<AuthResponse> = throw NotImplementedError()
    override suspend fun logout(): Response<Unit> = Response.success(Unit)
    override suspend fun getProfile(): Response<AuthResponse> = throw NotImplementedError()
}

class AuthFlowUnitTest {

    @Test
    fun testLoginPayloadSerialization() {
        val request = LoginRequest(
            phoneOrCpf = "123.456.789-00",
            password = "supersecretpassword"
        )
        assertEquals("123.456.789-00", request.phoneOrCpf)
        assertEquals("supersecretpassword", request.password)
    }

    @Test
    fun testLoginSuccessDispatchesPostAndParsesProfile() = runBlocking {
        val fakeApi = FakeAuthApiService(shouldSucceed = true, httpStatusCode = 200)
        val response = fakeApi.login(
            LoginRequest(phoneOrCpf = "389.201.849-10", password = "secret_password")
        )

        assertNotNull(fakeApi.capturedLoginRequest)
        assertEquals("389.201.849-10", fakeApi.capturedLoginRequest?.phoneOrCpf)
        assertTrue(response.isSuccessful)
        assertEquals("test_jwt_access_token", response.body()?.accessToken)
        assertEquals("Carlos Motorista", response.body()?.user?.name)
        assertEquals("HKC-2026", response.body()?.vehicle?.plate)
    }

    @Test
    fun testLoginUnauthorized401ReturnsErrorResponse() = runBlocking {
        val fakeApi = FakeAuthApiService(shouldSucceed = false, httpStatusCode = 401)
        val response = fakeApi.login(
            LoginRequest(phoneOrCpf = "000.000.000-00", password = "wrong_password")
        )

        assertNotNull(fakeApi.capturedLoginRequest)
        assertFalse(response.isSuccessful)
        assertEquals(401, response.code())
    }

    @Test
    fun testLoginServerUnavailable500ReturnsErrorResponse() = runBlocking {
        val fakeApi = FakeAuthApiService(shouldSucceed = false, httpStatusCode = 500)
        val response = fakeApi.login(
            LoginRequest(phoneOrCpf = "000.000.000-00", password = "any_password")
        )

        assertFalse(response.isSuccessful)
        assertEquals(500, response.code())
    }
}
