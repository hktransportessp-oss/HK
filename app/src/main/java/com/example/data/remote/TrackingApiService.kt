package com.example.data.remote

import com.example.data.remote.model.LocationPayload
import com.example.data.remote.model.LocationResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface TrackingApiService {
    @POST("api/v1/tracking/location")
    suspend fun sendLocation(
        @Body payload: LocationPayload
    ): Response<LocationResponse>
}
