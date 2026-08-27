package com.example

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.*
import androidx.test.core.app.ApplicationProvider
import com.example.ui.viewmodel.MainViewModel
import com.example.ui.viewmodel.Screen
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class NavigationFlowUnitTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun testScreenRoutesDefinition() {
        assertEquals("login", Screen.Login.route)
        assertEquals("home", Screen.Home.route)
        assertEquals("trips", Screen.Trips.route)
        assertEquals("send_romaneio", Screen.SendRomaneio.route)
        assertEquals("finance", Screen.Finance.route)
        assertEquals("profile", Screen.Profile.route)
        assertEquals("notifications", Screen.Notifications.route)
        assertEquals("send_toll", Screen.SendToll.route)
        assertEquals("romaneio_status", Screen.RomaneioStatus.route)
        assertEquals("trip_detail/123", Screen.TripDetail.createRoute("123"))
    }

    @Test
    fun testViewModelTabSelectionMapping() {
        val app = ApplicationProvider.getApplicationContext<android.app.Application>()
        val viewModel = MainViewModel(app)

        viewModel.selectTab("home")
        assertEquals(Screen.Home, viewModel.currentScreen.value)
        assertEquals("home", viewModel.activeTab.value)

        viewModel.selectTab("trips")
        assertEquals(Screen.Trips, viewModel.currentScreen.value)
        assertEquals("trips", viewModel.activeTab.value)

        viewModel.selectTab("send")
        assertEquals(Screen.SendRomaneio, viewModel.currentScreen.value)
        assertEquals("send", viewModel.activeTab.value)

        viewModel.selectTab("finance")
        assertEquals(Screen.Finance, viewModel.currentScreen.value)
        assertEquals("finance", viewModel.activeTab.value)

        viewModel.selectTab("profile")
        assertEquals(Screen.Profile, viewModel.currentScreen.value)
        assertEquals("profile", viewModel.activeTab.value)

        viewModel.selectTab("home")
        assertEquals(Screen.Home, viewModel.currentScreen.value)
        assertEquals("home", viewModel.activeTab.value)
    }

    @Test
    fun testNavigationCyclesAndIntegrity() {
        val app = ApplicationProvider.getApplicationContext<android.app.Application>()
        val viewModel = MainViewModel(app)

        // Flow: Início -> Viagens -> Financeiro -> Perfil -> Início
        viewModel.selectTab("home")
        assertTrue(viewModel.currentScreen.value is Screen.Home)

        viewModel.selectTab("trips")
        assertTrue(viewModel.currentScreen.value is Screen.Trips)

        viewModel.selectTab("finance")
        assertTrue(viewModel.currentScreen.value is Screen.Finance)

        viewModel.selectTab("profile")
        assertTrue(viewModel.currentScreen.value is Screen.Profile)

        viewModel.selectTab("home")
        assertTrue(viewModel.currentScreen.value is Screen.Home)
        assertFalse(viewModel.currentScreen.value is Screen.Profile)
    }
}
