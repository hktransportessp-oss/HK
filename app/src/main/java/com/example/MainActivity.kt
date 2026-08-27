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
import com.example.ui.viewmodel.Screen

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
    val isLoggedIn = userProfile?.isLoggedIn ?: false
    val driverName = userProfile?.name ?: ""
    val truckInfo = listOfNotNull(
        userProfile?.truckModel?.ifBlank { null },
        userProfile?.truckPlate?.ifBlank { null }
    ).joinToString(" - ").ifBlank { "Veículo não vinculado" }

    val romaneios by viewModel.romaneios.collectAsStateWithLifecycle()
    val trips by viewModel.trips.collectAsStateWithLifecycle()
    val fechamentos by viewModel.fechamentos.collectAsStateWithLifecycle()
    val tolls by viewModel.tolls.collectAsStateWithLifecycle()
    val notifications by viewModel.notifications.collectAsStateWithLifecycle()

    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Login.route

    val mainTabRoutes = listOf(
        Screen.Home.route,
        Screen.Trips.route,
        Screen.SendRomaneio.route,
        Screen.Finance.route,
        Screen.Profile.route
    )
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
                    truckInfo = truckInfo,
                    avatarUrl = userProfile?.avatarUrl ?: "",
                    unreadNotifications = notifications.isNotEmpty(),
                    onAvatarClick = {
                        if (currentRoute != Screen.Profile.route) {
                            navController.navigate(Screen.Profile.route) {
                                popUpTo(Screen.Home.route) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    },
                    onNotificationClick = {
                        if (currentRoute != Screen.Notifications.route) {
                            navController.navigate(Screen.Notifications.route)
                        }
                    }
                )
            }
        },
        bottomBar = {
            if (showBottomBar) {
                val activeTab = when (currentRoute) {
                    Screen.Home.route -> "home"
                    Screen.Trips.route -> "trips"
                    Screen.SendRomaneio.route -> "send"
                    Screen.Finance.route -> "finance"
                    Screen.Profile.route -> "profile"
                    else -> "home"
                }

                HKBottomNavBar(
                    activeTab = activeTab,
                    onTabSelected = { tab ->
                        val targetRoute = when (tab) {
                            "home" -> Screen.Home.route
                            "trips" -> Screen.Trips.route
                            "send" -> Screen.SendRomaneio.route
                            "finance" -> Screen.Finance.route
                            "profile" -> Screen.Profile.route
                            else -> Screen.Home.route
                        }

                        if (currentRoute != targetRoute) {
                            if (targetRoute == Screen.Home.route) {
                                val popped = navController.popBackStack(Screen.Home.route, inclusive = false)
                                if (!popped) {
                                    navController.navigate(Screen.Home.route) {
                                        popUpTo(Screen.Home.route) { inclusive = true }
                                        launchSingleTop = true
                                    }
                                }
                            } else {
                                navController.navigate(targetRoute) {
                                    popUpTo(Screen.Home.route) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        }
                    }
                )
            }
        },
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = if (isLoggedIn) Screen.Home.route else Screen.Login.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Login.route) {
                LoginScreen(
                    currentServerUrl = viewModel.getServerUrl(),
                    onUpdateServerUrl = { newUrl ->
                        viewModel.updateServerUrl(newUrl)
                    },
                    onLogin = { phone, password, remember, onResult ->
                        viewModel.login(phone, password, remember) { success, errorMsg ->
                            onResult(success, errorMsg)
                            if (success) {
                                navController.navigate(Screen.Home.route) {
                                    popUpTo(Screen.Login.route) { inclusive = true }
                                }
                            }
                        }
                    }
                )
            }

            composable(Screen.Home.route) {
                HomeScreen(
                    driverName = driverName,
                    truckInfo = truckInfo,
                    currentFechamento = fechamentos.firstOrNull(),
                    onNavigateToSendRomaneio = {
                        navController.navigate(Screen.SendRomaneio.route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onNavigateToTrips = {
                        navController.navigate(Screen.Trips.route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onNavigateToTolls = { navController.navigate(Screen.SendToll.route) },
                    onNavigateToFechamentos = {
                        navController.navigate(Screen.Finance.route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onNavigateToPayments = {
                        navController.navigate(Screen.Finance.route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }

            composable(Screen.Trips.route) {
                TripsScreen(
                    tripsList = trips,
                    onTripSelected = { tripId ->
                        selectedTripId = tripId
                        navController.navigate(Screen.TripDetail.createRoute(tripId))
                    }
                )
            }

            composable(
                route = Screen.TripDetail.ROUTE,
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
                        navController.navigate(Screen.LinkedInvoices.createRoute(tripId))
                    },
                    onViewTollsClick = {
                        navController.navigate(Screen.SendToll.route)
                    },
                    onScanNfeClick = {
                        navController.navigate(Screen.ScanInvoice.createRoute(tripId))
                    },
                    onViewRouteClick = {
                        navController.navigate(Screen.TripRoute.createRoute(tripId))
                    }
                )
            }

            composable(
                route = Screen.ScanInvoice.ROUTE,
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
                route = Screen.TripRoute.ROUTE,
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
                route = Screen.LinkedInvoices.ROUTE,
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

            composable(Screen.SendRomaneio.route) {
                SendRomaneioScreen(
                    driverName = driverName,
                    truckPlate = userProfile?.truckPlate ?: "",
                    onSubmitRomaneio = { notes, files ->
                        viewModel.submitRomaneio(notes, files) { romId ->
                            selectedRomaneioId = romId
                            navController.navigate(Screen.RomaneioStatus.route)
                        }
                    }
                )
            }

            composable(Screen.RomaneioStatus.route) {
                val romaneio = romaneios.firstOrNull { it.id == selectedRomaneioId } ?: romaneios.firstOrNull()

                RomaneioStatusScreen(
                    romaneio = romaneio,
                    onBackClick = { navController.popBackStack() },
                    onGoHomeClick = {
                        navController.popBackStack(Screen.Home.route, inclusive = false)
                    }
                )
            }

            composable(Screen.SendToll.route) {
                SendTollScreen(
                    tollsList = tolls,
                    onBackClick = { navController.popBackStack() },
                    onSubmitToll = { value, date, notes ->
                        viewModel.submitToll(value, date, notes) { }
                    }
                )
            }

            composable(Screen.Finance.route) {
                FinanceScreen(
                    fechamentosList = fechamentos,
                    onResolveDivergence = { period ->
                        viewModel.resolveDivergence(period)
                    },
                    onNavigateToSendRomaneio = {
                        navController.navigate(Screen.SendRomaneio.route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }

            composable(Screen.Notifications.route) {
                NotificationsScreen(
                    notificationsList = notifications,
                    onBackClick = { navController.popBackStack() }
                )
            }

            composable(Screen.Profile.route) {
                ProfileScreen(
                    userProfile = userProfile,
                    onLogoutClick = {
                        viewModel.logout()
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    },
                    onNavigateToSendToll = {
                        navController.navigate(Screen.SendToll.route)
                    }
                )
            }
        }
    }
}
