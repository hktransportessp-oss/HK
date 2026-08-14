package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ui.theme.*

@Composable
fun HKTopAppBar(
    driverName: String = "João, João",
    truckInfo: String = "Scania R450 - ABC-1234",
    avatarUrl: String = "",
    unreadNotifications: Boolean = true,
    onAvatarClick: () -> Unit = {},
    onNotificationClick: () -> Unit = {}
) {
    Surface(
        color = MaterialTheme.colorScheme.background,
        tonalElevation = 2.dp,
        shadowElevation = 2.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable { onAvatarClick() }
                    .padding(4.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(SurfaceVariant)
                        .border(1.dp, OutlineVariant, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    if (avatarUrl.isNotBlank()) {
                        AsyncImage(
                            model = avatarUrl,
                            contentDescription = "Foto do Motorista",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = PrimaryNavy
                        )
                    }
                }

                Column {
                    Text(
                        text = "HK Connect",
                        style = MaterialTheme.typography.titleLarge,
                        color = PrimaryNavy,
                        fontWeight = FontWeight.Bold
                    )
                    if (truckInfo.isNotBlank()) {
                        Text(
                            text = truckInfo,
                            style = MaterialTheme.typography.labelMedium,
                            color = OnSurfaceVariant
                        )
                    }
                }
            }

            Box {
                IconButton(
                    onClick = onNotificationClick,
                    modifier = Modifier.testTag("notifications_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Notifications,
                        contentDescription = "Notificações",
                        tint = PrimaryNavy
                    )
                }
                if (unreadNotifications) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .align(Alignment.TopEnd)
                            .offset(x = (-8).dp, y = 8.dp)
                            .clip(CircleShape)
                            .background(SecondaryOrangeContainer)
                    )
                }
            }
        }
    }
}

@Composable
fun HKBottomNavBar(
    activeTab: String,
    onTabSelected: (String) -> Unit
) {
    Surface(
        color = PrimaryNavy,
        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
        shadowElevation = 8.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(vertical = 8.dp, horizontal = 4.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.Bottom
        ) {
            // Tab 1: Início
            HKNavItem(
                label = "Início",
                iconSelected = Icons.Filled.Home,
                iconUnselected = Icons.Outlined.Home,
                isSelected = activeTab == "home",
                onClick = { onTabSelected("home") },
                testTag = "nav_home"
            )

            // Tab 2: Viagens
            HKNavItem(
                label = "Viagens",
                iconSelected = Icons.Filled.LocalShipping,
                iconUnselected = Icons.Outlined.LocalShipping,
                isSelected = activeTab == "trips",
                onClick = { onTabSelected("trips") },
                testTag = "nav_trips"
            )

            // Central FAB Action: Enviar
            Box(
                modifier = Modifier
                    .offset(y = (-14).dp)
                    .clickable { onTabSelected("send") }
                    .testTag("nav_send_fab"),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(SecondaryOrangeContainer)
                            .border(4.dp, PrimaryNavy, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.AddCircle,
                            contentDescription = "Enviar Romaneio",
                            tint = SurfaceContainerLowest,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                    Text(
                        text = "Enviar",
                        style = MaterialTheme.typography.labelMedium,
                        color = SecondaryFixed,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp
                    )
                }
            }

            // Tab 4: Financeiro
            HKNavItem(
                label = "Financeiro",
                iconSelected = Icons.Filled.Payments,
                iconUnselected = Icons.Outlined.Payments,
                isSelected = activeTab == "finance",
                onClick = { onTabSelected("finance") },
                testTag = "nav_finance"
            )

            // Tab 5: Perfil
            HKNavItem(
                label = "Perfil",
                iconSelected = Icons.Filled.Person,
                iconUnselected = Icons.Outlined.Person,
                isSelected = activeTab == "profile",
                onClick = { onTabSelected("profile") },
                testTag = "nav_profile"
            )
        }
    }
}

@Composable
private fun HKNavItem(
    label: String,
    iconSelected: androidx.compose.ui.graphics.vector.ImageVector,
    iconUnselected: androidx.compose.ui.graphics.vector.ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit,
    testTag: String
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(horizontal = 8.dp, vertical = 4.dp)
            .testTag(testTag)
    ) {
        Icon(
            imageVector = if (isSelected) iconSelected else iconUnselected,
            contentDescription = label,
            tint = if (isSelected) SecondaryFixed else OnPrimaryNavyContainer,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = if (isSelected) SecondaryFixed else OnPrimaryNavyContainer,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
            fontSize = 11.sp
        )
    }
}
