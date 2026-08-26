package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.UserProfileEntity
import com.example.ui.theme.*

@Composable
fun ProfileScreen(
    userProfile: UserProfileEntity? = null,
    onLogoutClick: () -> Unit,
    onNavigateToSendToll: () -> Unit
) {
    val displayName = userProfile?.name?.ifBlank { "Motorista" } ?: "Motorista"
    val displayCpf = if (userProfile?.cpf?.isNotBlank() == true) "CPF: ${userProfile.cpf}" else ""
    val displayPhone = if (userProfile?.phone?.isNotBlank() == true) "Telefone: ${userProfile.phone}" else ""
    val displayVehicle = if (userProfile?.truckPlate?.isNotBlank() == true) {
        "Placa: ${userProfile.truckPlate}${if (userProfile.truckModel.isNotBlank()) " (${userProfile.truckModel})" else ""}"
    } else {
        "Nenhum veículo vinculado"
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Text(
            text = "Perfil do Motorista",
            style = MaterialTheme.typography.headlineMedium,
            color = PrimaryNavy,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Profile Card
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = PrimaryNavy),
            elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(SecondaryOrangeContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        tint = SurfaceContainerLowest,
                        modifier = Modifier.size(36.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = displayName,
                    style = MaterialTheme.typography.titleLarge,
                    color = SurfaceContainerLowest,
                    fontWeight = FontWeight.Bold
                )

                if (displayCpf.isNotBlank() || displayPhone.isNotBlank()) {
                    Text(
                        text = listOf(displayCpf, displayPhone).filter { it.isNotBlank() }.joinToString(" • "),
                        style = MaterialTheme.typography.bodyMedium,
                        color = SurfaceVariant
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Surface(
                    color = SurfaceContainerLowest.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalShipping,
                            contentDescription = null,
                            tint = SecondaryOrangeContainer,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = displayVehicle,
                            style = MaterialTheme.typography.labelSmall,
                            color = SurfaceContainerLowest,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Menu Sections
        Text(
            text = "CONFIGURAÇÕES & CONTA",
            style = MaterialTheme.typography.labelMedium,
            color = OnSurfaceVariant,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
        )

        Spacer(modifier = Modifier.height(8.dp))

        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column {
                ProfileMenuItem(
                    icon = Icons.Default.AccountBalance,
                    title = "Dados Bancários & PIX",
                    subtitle = "Chave vinculada ao CPF",
                    onClick = { }
                )
                HorizontalDivider(color = SurfaceVariant)
                ProfileMenuItem(
                    icon = Icons.Default.Receipt,
                    title = "Reembolso de Pedágio",
                    subtitle = "Envio de notas e recibos",
                    onClick = onNavigateToSendToll
                )
                HorizontalDivider(color = SurfaceVariant)
                ProfileMenuItem(
                    icon = Icons.Default.LocalShipping,
                    title = "Dados do Veículo",
                    subtitle = if (userProfile?.truckPlate?.isNotBlank() == true) "${userProfile.truckPlate} - ${userProfile.truckModel}" else "Não cadastrado",
                    onClick = { }
                )
                HorizontalDivider(color = SurfaceVariant)
                ProfileMenuItem(
                    icon = Icons.Default.SupportAgent,
                    title = "Suporte HK Transportes",
                    subtitle = "Atendimento 24h WhatsApp e Telefone",
                    onClick = { }
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Logout Button
        Button(
            onClick = onLogoutClick,
            colors = ButtonDefaults.buttonColors(containerColor = ErrorContainerRed),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .testTag("btn_logout")
        ) {
            Icon(imageVector = Icons.AutoMirrored.Filled.ExitToApp, contentDescription = null, tint = OnErrorContainerRed)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "SAIR DA CONTA",
                style = MaterialTheme.typography.titleMedium,
                color = OnErrorContainerRed,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun ProfileMenuItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        color = SurfaceContainerLowest,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(SurfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = null, tint = PrimaryNavy, modifier = Modifier.size(20.dp))
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    color = OnSurfaceDark,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = OnSurfaceVariant,
                    fontSize = 12.sp
                )
            }

            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = OutlineColor
            )
        }
    }
}
