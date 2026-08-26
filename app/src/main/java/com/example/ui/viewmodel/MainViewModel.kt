package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.model.*
import com.example.data.repository.AuthRepository
import com.example.data.repository.LogisticsRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

sealed class Screen {
    object Login : Screen()
    object Home : Screen()
    object Trips : Screen()
    data class TripDetail(val tripId: String) : Screen()
    data class LinkedInvoices(val tripId: String) : Screen()
    object SendRomaneio : Screen()
    data class RomaneioStatus(val romaneioId: String) : Screen()
    object SendToll : Screen()
    object FechamentosList : Screen()
    data class FechamentoDetail(val period: String) : Screen()
    object PaymentsHistory : Screen()
    object Notifications : Screen()
    object Profile : Screen()
}

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: LogisticsRepository
    private val authRepository: AuthRepository

    init {
        val database = AppDatabase.getDatabase(application)
        repository = LogisticsRepository(database.logisticsDao(), application)
        authRepository = AuthRepository(application, database.logisticsDao())
        viewModelScope.launch {
            authRepository.purgeLegacyDemoData()
            repository.purgeLegacyDemoData()
            if (authRepository.hasActiveSession()) {
                repository.refreshTripsFromRemote()
                repository.processPendingSyncQueue()
            }
        }
    }

    // Navigation State
    private val _currentScreen = MutableStateFlow<Screen>(Screen.Home)
    val currentScreen: StateFlow<Screen> = _currentScreen.asStateFlow()

    fun navigateTo(screen: Screen) {
        _currentScreen.value = screen
    }

    // Active Bottom Navigation Tab ("home", "trips", "send", "finance", "profile")
    private val _activeTab = MutableStateFlow("home")
    val activeTab: StateFlow<String> = _activeTab.asStateFlow()

    fun selectTab(tab: String) {
        _activeTab.value = tab
        when (tab) {
            "home" -> _currentScreen.value = Screen.Home
            "trips" -> _currentScreen.value = Screen.Trips
            "send" -> _currentScreen.value = Screen.SendRomaneio
            "finance" -> _currentScreen.value = Screen.FechamentosList
            "profile" -> _currentScreen.value = Screen.Profile
        }
    }

    // Database Flows
    val trips: StateFlow<List<TripEntity>> = repository.allTrips
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val romaneios: StateFlow<List<RomaneioEntity>> = repository.allRomaneios
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val tolls: StateFlow<List<TollReceiptEntity>> = repository.allTolls
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val fechamentos: StateFlow<List<FechamentoEntity>> = repository.allFechamentos
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val notifications: StateFlow<List<NotificationEntity>> = repository.allNotifications
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val userProfile: StateFlow<UserProfileEntity?> = repository.userProfile
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val allInvoices: StateFlow<List<InvoiceEntity>> = repository.allInvoices
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun getTripById(id: String): Flow<TripEntity?> = repository.getTripById(id)
    fun getDeliveriesForTrip(tripId: String): Flow<List<DeliveryEntity>> = repository.getDeliveriesForTrip(tripId)
    fun getInvoicesForTrip(tripId: String): Flow<List<InvoiceEntity>> = repository.getInvoicesForTrip(tripId)
    fun getOccurrencesForTrip(tripId: String): Flow<List<OccurrenceEntity>> = repository.getOccurrencesForTrip(tripId)
    fun getRomaneioById(id: String): Flow<RomaneioEntity?> = repository.getRomaneioById(id)
    fun getFechamentoByPeriod(period: String): Flow<FechamentoEntity?> = repository.getFechamentoByPeriod(period)

    // Operational Actions
    fun refreshTrips() {
        viewModelScope.launch {
            repository.refreshTripsFromRemote()
        }
    }

    fun acceptTrip(tripId: String, onResult: (Boolean) -> Unit = {}) {
        viewModelScope.launch {
            val res = repository.acceptTrip(tripId)
            onResult(res.isSuccess)
        }
    }

    fun startTrip(tripId: String, onResult: (Boolean) -> Unit = {}) {
        viewModelScope.launch {
            val res = repository.startTrip(tripId)
            onResult(res.isSuccess)
        }
    }

    fun completeTrip(tripId: String, onResult: (Boolean) -> Unit = {}) {
        viewModelScope.launch {
            val res = repository.completeTrip(tripId)
            onResult(res.isSuccess)
        }
    }

    fun arriveAtDelivery(deliveryId: String, onResult: (Boolean) -> Unit = {}) {
        viewModelScope.launch {
            val res = repository.arriveAtDelivery(deliveryId)
            onResult(res.isSuccess)
        }
    }

    fun completeDelivery(
        deliveryId: String,
        status: String,
        notes: String? = null,
        refusalReason: String? = null,
        quantityExpected: Int? = null,
        quantityDelivered: Int? = null,
        quantityMissing: Int? = null,
        onResult: (Boolean) -> Unit = {}
    ) {
        viewModelScope.launch {
            val res = repository.completeDelivery(
                deliveryId = deliveryId,
                status = status,
                notes = notes,
                refusalReason = refusalReason,
                quantityExpected = quantityExpected,
                quantityDelivered = quantityDelivered,
                quantityMissing = quantityMissing
            )
            onResult(res.isSuccess)
        }
    }

    fun createOccurrence(
        tripId: String,
        deliveryId: String? = null,
        type: String,
        description: String,
        onResult: (Boolean) -> Unit = {}
    ) {
        viewModelScope.launch {
            val res = repository.createOccurrence(tripId, deliveryId, type, description)
            onResult(res.isSuccess)
        }
    }

    suspend fun scanInvoiceRemote(accessKey: String, tripId: String): Result<com.example.data.remote.model.ScanInvoiceResponse> {
        return repository.scanInvoiceRemote(accessKey, tripId)
    }

    suspend fun optimizeRouteRemote(tripId: String): Result<com.example.data.remote.model.RouteOptimizationResponseDto> {
        return repository.optimizeRouteRemote(tripId)
    }

    suspend fun uploadPodRemote(deliveryId: String, podUrl: String): Result<Unit> {
        return repository.uploadPodRemote(deliveryId, podUrl)
    }

    // Actions
    fun login(cpf: String, password: String, remember: Boolean, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            if (cpf.isNotBlank()) {
                val result = authRepository.loginRemote(phoneOrCpf = cpf, passwordStr = password)
                if (result.isSuccess) {
                    repository.refreshTripsFromRemote()
                    _currentScreen.value = Screen.Home
                    _activeTab.value = "home"
                    onResult(true)
                } else {
                    onResult(false)
                }
            } else {
                onResult(false)
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logoutRemote()
            _currentScreen.value = Screen.Login
        }
    }

    fun submitRomaneio(
        notes: String,
        attachedFiles: List<String>,
        onSuccess: (String) -> Unit
    ) {
        viewModelScope.launch {
            val randomNum = (1000..9999).random()
            val romId = "ROM-$randomNum"
            val dateFormat = SimpleDateFormat("dd MMM yyyy", Locale("pt", "BR"))
            val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
            val date = dateFormat.format(Date())
            val time = timeFormat.format(Date())

            val newRomaneio = RomaneioEntity(
                id = romId,
                operation = "Operação HK Transportes",
                sentDate = date,
                sentTime = time,
                driver = userProfile.value?.name ?: "",
                fileName = if (attachedFiles.isNotEmpty()) attachedFiles.first() else "doc_romaneio_$randomNum.pdf",
                notes = notes,
                currentStep = 2
            )

            repository.addRomaneio(newRomaneio)

            repository.addNotification(
                NotificationEntity(
                    type = "PROCESSADO",
                    title = "Romaneio $romId Recebido",
                    message = "Seu romaneio foi enviado com sucesso e está em análise via OCR.",
                    timeLabel = "Agora",
                    valueLabel = "R$ 1.850,00",
                    valueText = "Valor Estimado"
                )
            )

            onSuccess(romId)
        }
    }

    fun submitToll(
        valueStr: String,
        dateStr: String,
        notesStr: String,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            val valDouble = valueStr.replace(",", ".").toDoubleOrNull() ?: 15.0
            val date = if (dateStr.isNotBlank()) dateStr else "Hoje, " + SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())

            repository.addToll(
                TollReceiptEntity(
                    date = date,
                    tripRef = "Sem ref.",
                    value = valDouble,
                    status = "ENVIADO",
                    notes = notesStr
                )
            )

            repository.addNotification(
                NotificationEntity(
                    type = "PROCESSADO",
                    title = "Comprovante de Pedágio Enviado",
                    message = "Comprovante de R$ ${String.format("%.2f", valDouble)} enviado para conferência.",
                    timeLabel = "Agora",
                    valueLabel = "R$ ${String.format("%.2f", valDouble)}",
                    valueText = "Valor Informado"
                )
            )

            onSuccess()
        }
    }

    fun resolveDivergence(period: String) {
        viewModelScope.launch {
            repository.resolveDivergence(period)
            repository.addNotification(
                NotificationEntity(
                    type = "APROVADO",
                    title = "Pendência Resolvida",
                    message = "Sua pendência referente ao fechamento $period foi enviada para reavaliação.",
                    timeLabel = "Agora",
                    valueLabel = "Em Análise",
                    valueText = "Status"
                )
            )
        }
    }
}
