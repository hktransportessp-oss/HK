package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.FechamentoEntity
import com.example.ui.components.FinancialCard
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*

@Composable
fun HomeScreen(
    driverName: String = "Motorista",
    truckInfo: String = "",
    currentFechamento: FechamentoEntity? = null,
    onNavigateToSendRomaneio: () -> Unit,
    onNavigateToTrips: () -> Unit,
    onNavigateToTolls: () -> Unit,
    onNavigateToFechamentos: () -> Unit,
    onNavigateToPayments: () -> Unit
) {
    val displayName = if (driverName.isNotBlank()) driverName else "Motorista"
    val displayTruck = if (truckInfo.isNotBlank() && truckInfo != " - ") truckInfo else "Veículo não vinculado"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Welcome Header Banner
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = PrimaryNavyContainer),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
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
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(SurfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        tint = PrimaryNavy,
                        modifier = Modifier.size(28.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(
                        text = "Olá, $displayName",
                        style = MaterialTheme.typography.titleLarge,
                        color = SurfaceContainerLowest,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = displayTruck,
                        style = MaterialTheme.typography.bodyMedium,
                        color = OnPrimaryNavyContainer
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Saldo a Receber
        val totalAmount = currentFechamento?.totalNet ?: 0.0
        val valorPrevisto = currentFechamento?.tripsValue ?: 0.0
        val valorAprovado = currentFechamento?.totalGross ?: 0.0
        val valorPago = if (currentFechamento?.status == "PAGO") currentFechamento.totalNet else 0.0

        FinancialCard(
            title = "Saldo a Receber",
            amount = totalAmount,
            previsto = valorPrevisto,
            aprovado = valorAprovado,
            pago = valorPago
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Fechamento Atual Card
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onNavigateToFechamentos() }
                .testTag("fechamento_atual_card")
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "FECHAMENTO ATUAL",
                            style = MaterialTheme.typography.labelMedium,
                            color = OnSurfaceVariant,
                            letterSpacing = 0.5.sp
                        )
                        Text(
                            text = currentFechamento?.period ?: "Nenhum fechamento em aberto",
                            style = MaterialTheme.typography.titleMedium,
                            color = PrimaryNavy,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    StatusBadge(status = currentFechamento?.status ?: "SEM FECHAMENTO")
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (currentFechamento != null) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalShipping,
                            contentDescription = null,
                            tint = OutlineColor,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = "${currentFechamento.tripsCount} Viagens processadas",
                            style = MaterialTheme.typography.bodyMedium,
                            color = OnSurfaceDark
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ReceiptLong,
                            contentDescription = null,
                            tint = OutlineColor,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = "${currentFechamento.invoicesCount} NF-es no período",
                            style = MaterialTheme.typography.bodyMedium,
                            color = OnSurfaceDark
                        )
                    }

                    if (currentFechamento.hasDivergence) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = SecondaryOrangeContainer,
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                text = currentFechamento.divergenceMessage.ifBlank { "1 pendência para conferência" },
                                style = MaterialTheme.typography.bodyMedium,
                                color = SecondaryOrangeContainer,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                } else {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = OutlineColor,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = "Nenhum fechamento ativo no momento.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = OnSurfaceVariant
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Shortcuts Grid
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            // Main Action Button: ENVIAR ROMANEIO
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToSendRomaneio() }
                    .testTag("shortcut_enviar_romaneio")
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(SecondaryOrangeContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.AddCircle,
                            contentDescription = null,
                            tint = SurfaceContainerLowest,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "ENVIAR ROMANEIO",
                        style = MaterialTheme.typography.titleMedium,
                        color = PrimaryNavy,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // 2x2 Grid for Other Shortcuts
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ShortcutCard(
                    title = "MINHAS VIAGENS",
                    icon = Icons.Default.LocalShipping,
                    modifier = Modifier.weight(1f),
                    testTag = "shortcut_viagens",
                    onClick = onNavigateToTrips
                )

                ShortcutCard(
                    title = "PEDÁGIOS",
                    icon = Icons.Default.Toll,
                    modifier = Modifier.weight(1f),
                    testTag = "shortcut_pedagios",
                    onClick = onNavigateToTolls
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ShortcutCard(
                    title = "FECHAMENTOS",
                    icon = Icons.Default.ReceiptLong,
                    modifier = Modifier.weight(1f),
                    testTag = "shortcut_fechamentos",
                    onClick = onNavigateToFechamentos
                )

                ShortcutCard(
                    title = "PAGAMENTOS",
                    icon = Icons.Default.Payments,
                    modifier = Modifier.weight(1f),
                    testTag = "shortcut_pagamentos",
                    onClick = onNavigateToPayments
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun ShortcutCard(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier,
    testTag: String = "",
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier
            .clickable { onClick() }
            .testTag(testTag)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = PrimaryNavy,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall,
                color = OnSurfaceDark,
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp
            )
        }
    }
}
