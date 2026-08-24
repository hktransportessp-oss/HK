package com.example.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.example.data.remote.ApiClient
import com.example.data.remote.model.LocationPayload
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.ConcurrentLinkedQueue

class LocationTrackingService : Service(), LocationListener {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var locationManager: LocationManager? = null
    private var currentTripId: String? = null
    private var isTracking = false
    private var lastSentLocation: Location? = null
    private var lastSentTimestamp: Long = 0L

    // Offline pending queue to retry on reconnect
    private val pendingLocationsQueue = ConcurrentLinkedQueue<LocationPayload>()

    companion object {
        private const val TAG = "HKLocationTracking"
        private const val NOTIFICATION_CHANNEL_ID = "hk_tracking_channel"
        private const val NOTIFICATION_ID = 1001

        const val ACTION_START_TRACKING = "com.example.service.START_TRACKING"
        const val ACTION_STOP_TRACKING = "com.example.service.STOP_TRACKING"
        const val ACTION_REPORT_EVENT = "com.example.service.REPORT_EVENT"
        const val EXTRA_TRIP_ID = "extra_trip_id"
        const val EXTRA_EVENT_NAME = "extra_event_name"

        // Policy intervals (milliseconds)
        const val INTERVAL_ACTIVE_TRIP_MS = 90_000L      // 1.5 min
        const val INTERVAL_STOPPED_MS = 300_000L         // 5 min
        const val INTERVAL_IDLE_MS = 600_000L            // 10 min
        const val MIN_MOVING_SPEED_MPS = 0.83f           // ~3 km/h
    }

    override fun onCreate() {
        super.onCreate()
        locationManager = getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_TRACKING -> {
                val tripId = intent.getStringExtra(EXTRA_TRIP_ID)
                startTracking(tripId)
            }
            ACTION_STOP_TRACKING -> {
                stopTracking()
            }
            ACTION_REPORT_EVENT -> {
                val eventName = intent.getStringExtra(EXTRA_EVENT_NAME) ?: "EVENT"
                reportImmediateLocation(eventName)
            }
        }
        return START_STICKY
    }

    private fun startTracking(tripId: String?) {
        if (isTracking && currentTripId == tripId) return

        currentTripId = tripId
        isTracking = true

        val notification = buildPersistentNotification(
            if (tripId != null) "Viagem em andamento: rastreamento ativo" else "Rastreamento operacional ativo"
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        requestLocationUpdates()
        Log.i(TAG, "Rastreamento iniciado para viagem: $tripId")
    }

    private fun stopTracking() {
        isTracking = false
        currentTripId = null
        try {
            locationManager?.removeUpdates(this)
        } catch (e: SecurityException) {
            Log.e(TAG, "Permissão de localização revogada: ${e.message}")
        }
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
        Log.i(TAG, "Rastreamento operacional finalizado")
    }

    private fun requestLocationUpdates() {
        try {
            // Determine interval based on active trip or idle
            val minTimeMs = if (currentTripId != null) INTERVAL_ACTIVE_TRIP_MS else INTERVAL_IDLE_MS
            val minDistanceMeters = 20f

            if (locationManager?.isProviderEnabled(LocationManager.GPS_PROVIDER) == true) {
                locationManager?.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    minTimeMs,
                    minDistanceMeters,
                    this
                )
            } else if (locationManager?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) == true) {
                locationManager?.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER,
                    minTimeMs,
                    minDistanceMeters,
                    this
                )
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "Erro de segurança ao solicitar atualizações de GPS: ${e.message}")
        }
    }

    override fun onLocationChanged(location: Location) {
        val now = System.currentTimeMillis()
        val speedKmh = location.speed * 3.6f

        // Evaluate policy throttle
        val isMoving = location.speed >= MIN_MOVING_SPEED_MPS
        val requiredInterval = when {
            currentTripId != null && isMoving -> INTERVAL_ACTIVE_TRIP_MS
            currentTripId != null && !isMoving -> INTERVAL_STOPPED_MS
            else -> INTERVAL_IDLE_MS
        }

        if (now - lastSentTimestamp < requiredInterval && lastSentLocation != null) {
            // Skipped by policy throttle to save battery
            return
        }

        lastSentLocation = location
        lastSentTimestamp = now

        val payload = LocationPayload(
            latitude = location.latitude,
            longitude = location.longitude,
            accuracy = if (location.hasAccuracy()) location.accuracy else null,
            speed = if (location.hasSpeed()) speedKmh else null,
            heading = if (location.hasBearing()) location.bearing else null,
            capturedAt = formatIso8601(Date(location.time)),
            tripId = currentTripId
        )

        sendLocationToServer(payload)
    }

    private fun reportImmediateLocation(eventName: String) {
        try {
            val lastKnown = locationManager?.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                ?: locationManager?.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)

            if (lastKnown != null) {
                val payload = LocationPayload(
                    latitude = lastKnown.latitude,
                    longitude = lastKnown.longitude,
                    accuracy = if (lastKnown.hasAccuracy()) lastKnown.accuracy else null,
                    speed = if (lastKnown.hasSpeed()) lastKnown.speed * 3.6f else null,
                    heading = if (lastKnown.hasBearing()) lastKnown.bearing else null,
                    capturedAt = formatIso8601(Date()),
                    tripId = currentTripId
                )
                Log.d(TAG, "Evento imediato [$eventName] disparado")
                sendLocationToServer(payload)
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "Erro ao obter localização imediata: ${e.message}")
        }
    }

    private fun sendLocationToServer(payload: LocationPayload) {
        serviceScope.launch {
            try {
                // Retry pending queue first
                while (pendingLocationsQueue.isNotEmpty()) {
                    val pending = pendingLocationsQueue.peek() ?: break
                    val retryResp = ApiClient.getInstance(applicationContext)
                        .trackingApiService
                        .sendLocation(pending)
                    if (retryResp.isSuccessful) {
                        pendingLocationsQueue.poll()
                    } else {
                        break
                    }
                }

                val response = ApiClient.getInstance(applicationContext)
                    .trackingApiService
                    .sendLocation(payload)

                if (!response.isSuccessful) {
                    Log.w(TAG, "Falha HTTP (${response.code()}) ao enviar telemetria. Enfileirando offline.")
                    pendingLocationsQueue.offer(payload)
                }
            } catch (e: Exception) {
                Log.w(TAG, "Falha de rede ao enviar telemetria (${e.message}). Enfileirando offline.")
                pendingLocationsQueue.offer(payload)
            }
        }
    }

    private fun formatIso8601(date: Date): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        return sdf.format(date)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Rastreamento Operacional HK Connect",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Monitoramento de telemetria e posicionamento durante viagens"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun buildPersistentNotification(contentText: String): Notification {
        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("HK Connect — Operação Ativa")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    override fun onProviderEnabled(provider: String) {}
    override fun onProviderDisabled(provider: String) {}
    override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        serviceScope.cancel()
        super.onDestroy()
    }
}
