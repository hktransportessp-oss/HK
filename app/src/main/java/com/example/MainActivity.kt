package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.example.data.local.AppDatabase
import com.example.data.model.*
import com.example.data.repository.LogisticsRepository
import com.example.ui.components.HKBottomNavBar
import com.example.ui.components.HKTopAppBar
import com.example.ui.screens.*
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                HKConnectApp()
            }
        }
    }
}

@Composable
fun HKConnectApp() {
    val viewModel: MainViewModel = viewModel()

    val userProfile by viewModel.userProfile.collectAsStateWithLifecycle()
    val isLoggedIn = userProfile?.isLoggedIn ?: true
    val driverName = userProfile?.name ?: "João Silva"

    val romaneios by viewModel.romaneios.collectAsStateWithLifecycle()
    val trips by viewModel.trips.collectAsStateWithLifecycle()
    val fechamentos by viewModel.fechamentos.collectAsStateWithLifecycle()
    val tolls by viewModel.tolls.collectAsStateWithLifecycle()
    val notifications by viewModel.notifications.collectAsStateWithLifecycle()

    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: "login"

    val mainTabRoutes = listOf("home", "trips", "send_romaneio", "finance", "profile")
    val showTopBar = isLoggedIn && currentRoute in mainTabRoutes
    val showBottomBar = isLoggedIn && currentRoute in mainTabRoutes

    // Selected state helpers for details
    var selectedTripId by remember { mutableStateOf<String?>(null) }
    var selectedRomaneioId by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            if (showTopBar) {
                HKTopAppBar(
                    driverName = driverName,
                    truckInfo = "${userProfile?.truckModel ?: "Scania R450"} - ${userProfile?.truckPlate ?: "ABC-1234"}",
                    avatarUrl = userProfile?.avatarUrl ?: "",
                    unreadNotifications = notifications.isNotEmpty(),
                    onAvatarClick = { navController.navigate("profile") },
                    onNotificationClick = { navController.navigate("notifications") }
                )
            }
        },
        bottomBar = {
            if (showBottomBar) {
                val activeTab = when (currentRoute) {
                    "home" -> "home"
                    "trips" -> "trips"
                    "send_romaneio" -> "send"
                    "finance" -> "finance"
                    "profile" -> "profile"
                    else -> "home"
                }

                HKBottomNavBar(
                    activeTab = activeTab,
                    onTabSelected = { tab ->
                        val targetRoute = when (tab) {
                            "home" -> "home"
                            "trips" -> "trips"
                            "send" -> "send_romaneio"
                            "finance" -> "finance"
                            "profile" -> "profile"
                            else -> "home"
                        }
                        navController.navigate(targetRoute) {
                            popUpTo("home") { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        },
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = if (isLoggedIn) "home" else "login",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("login") {
                LoginScreen(
                    onLoginSuccess = { phone, password, remember ->
                        viewModel.login(phone, password, remember) {
                            navController.navigate("home") {
                                popUpTo("login") { inclusive = true }
                            }
                        }
                    }
                )
            }

            composable("home") {
                HomeScreen(
                    driverName = driverName,
                    truckInfo = "${userProfile?.truckModel ?: "Scania R450"} - ${userProfile?.truckPlate ?: "ABC-1234"}",
                    currentFechamento = fechamentos.firstOrNull(),
                    onNavigateToSendRomaneio = { navController.navigate("send_romaneio") },
                    onNavigateToTrips = { navController.navigate("trips") },
                    onNavigateToTolls = { navController.navigate("send_toll") },
                    onNavigateToFechamentos = { navController.navigate("finance") },
                    onNavigateToPayments = { navController.navigate("finance") }
                )
            }

            composable("trips") {
                TripsScreen(
                    tripsList = trips,
                    onTripSelected = { tripId ->
                        selectedTripId = tripId
                        navController.navigate("trip_detail/$tripId")
                    }
                )
            }

            composable(
                route = "trip_detail/{tripId}",
                arguments = listOf(navArgument("tripId") { type = NavType.StringType })
            ) { backStackEntry ->
                val tripId = backStackEntry.arguments?.getString("tripId") ?: selectedTripId ?: ""
                val trip = trips.firstOrNull { it.id == tripId }
                val deliveries by viewModel.getDeliveriesForTrip(tripId).collectAsStateWithLifecycle(emptyList())
                val occurrences by viewModel.getOccurrencesForTrip(tripId).collectAsStateWithLifecycle(emptyList())

                TripDetailScreen(
                    trip = trip,
                    deliveries = deliveries,
                    occurrences = occurrences,
                    onAcceptClick = { viewModel.acceptTrip(tripId) },
                    onStartClick = { viewModel.startTrip(tripId) },
                    onCompleteTripClick = { viewModel.completeTrip(tripId) },
                    onArriveDeliveryClick = { deliveryId -> viewModel.arriveAtDelivery(deliveryId) },
                    onCompleteDeliverySubmit = { delId, status, notes, refusal, exp, del, mis ->
                        viewModel.completeDelivery(delId, status, notes, refusal, exp, del, mis)
                    },
                    onCreateOccurrenceSubmit = { tId, delId, type, desc ->
                        viewModel.createOccurrence(tId, delId, type, desc)
                    },
                    onBackClick = { navController.popBackStack() },
                    onViewInvoicesClick = {
                        navController.navigate("linked_invoices/$tripId")
                    },
                    onViewTollsClick = {
                        navController.navigate("send_toll")
                    },
                    onScanNfeClick = {
                        navController.navigate("scan_invoice/$tripId")
                    },
                    onViewRouteClick = {
                        navController.navigate("trip_route/$tripId")
                    }
                )
            }

            composable(
                route = "scan_invoice/{tripId}",
                arguments = listOf(navArgument("tripId") { type = NavType.StringType })
            ) { backStackEntry ->
                val tripId = backStackEntry.arguments?.getString("tripId") ?: selectedTripId ?: ""
                ScanInvoiceScreen(
                    tripId = tripId,
                    onBackClick = { navController.popBackStack() },
                    onScanSuccess = {
                        // Refresh local data
                        viewModel.refreshTrips()
                    },
                    onScanRemoteApi = { accessKey ->
                        viewModel.scanInvoiceRemote(accessKey, tripId)
                    }
                )
            }

            composable(
                route = "trip_route/{tripId}",
                arguments = listOf(navArgument("tripId") { type = NavType.StringType })
            ) { backStackEntry ->
                val tripId = backStackEntry.arguments?.getString("tripId") ?: selectedTripId ?: ""
                var routeData by remember { mutableStateOf<com.example.data.remote.model.RouteOptimizationResponseDto?>(null) }
                var isOptimizing by remember { mutableStateOf(false) }

                LaunchedEffect(tripId) {
                    isOptimizing = true
                    val res = viewModel.optimizeRouteRemote(tripId)
                    isOptimizing = false
                    res.onSuccess { routeData = it }
                }

                TripRouteScreen(
                    tripId = tripId,
                    routeData = routeData,
                    isLoading = isOptimizing,
                    onBackClick = { navController.popBackStack() },
                    onOptimizeClick = {
                        isOptimizing = true
                        viewModel.viewModelScope.launch {
                            val res = viewModel.optimizeRouteRemote(tripId)
                            isOptimizing = false
                            res.onSuccess { routeData = it }
                        }
                    }
                )
            }

            composable(
                route = "linked_invoices/{tripId}",
                arguments = listOf(navArgument("tripId") { type = NavType.StringType })
            ) { backStackEntry ->
                val tripId = backStackEntry.arguments?.getString("tripId") ?: selectedTripId ?: ""
                val allInvoices by viewModel.allInvoices.collectAsStateWithLifecycle()
                val tripInvoices = remember(allInvoices, tripId) {
                    allInvoices.filter { it.tripId == tripId }.ifEmpty { allInvoices }
                }

                LinkedInvoicesScreen(
                    tripId = tripId,
                    invoicesList = tripInvoices,
                    onBackClick = { navController.popBackStack() }
                )
            }

            composable("send_romaneio") {
                SendRomaneioScreen(
                    driverName = driverName,
                    truckPlate = userProfile?.truckPlate ?: "ABC-1234",
                    onSubmitRomaneio = { notes, files ->
                        viewModel.submitRomaneio(notes, files) { romId ->
                            selectedRomaneioId = romId
                            navController.navigate("romaneio_status")
                        }
                    }
                )
            }

            composable("romaneio_status") {
                val romaneio = romaneios.firstOrNull { it.id == selectedRomaneioId } ?: romaneios.firstOrNull()

                RomaneioStatusScreen(
                    romaneio = romaneio,
                    onBackClick = { navController.popBackStack() },
                    onGoHomeClick = {
                        navController.navigate("home") {
                            popUpTo("home") { inclusive = true }
                        }
                    }
                )
            }

            composable("send_toll") {
                SendTollScreen(
                    tollsList = tolls,
                    onSubmitToll = { value, date, notes ->
                        viewModel.submitToll(value, date, notes) { }
                    }
                )
            }

            composable("finance") {
                FinanceScreen(
                    fechamentosList = fechamentos,
                    onResolveDivergence = { period ->
                        viewModel.resolveDivergence(period)
                    },
                    onNavigateToSendRomaneio = {
                        navController.navigate("send_romaneio")
                    }
                )
            }

            composable("notifications") {
                NotificationsScreen(
                    notificationsList = notifications,
                    onBackClick = { navController.popBackStack() }
                )
            }

            composable("profile") {
                ProfileScreen(
                    onLogoutClick = {
                        viewModel.logout()
                        navController.navigate("login") {
                            popUpTo(0) { inclusive = true }
                        }
                    },
                    onNavigateToSendToll = {
                        navController.navigate("send_toll")
                    }
                )
            }
        }
    }
}
