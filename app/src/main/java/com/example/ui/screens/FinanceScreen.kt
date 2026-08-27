package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.FechamentoEntity
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*

@Composable
fun FinanceScreen(
    fechamentosList: List<FechamentoEntity>,
    onResolveDivergence: (period: String) -> Unit,
    onNavigateToSendRomaneio: () -> Unit
) {
    var selectedTab by remember { mutableStateOf("Atual") }

    val currentFechamento = fechamentosList.firstOrNull { it.period.contains("01/08") || it.status == "EM CONFERÊNCIA" }
        ?: fechamentosList.firstOrNull()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Gestão Financeira",
            style = MaterialTheme.typography.headlineMedium,
            color = PrimaryNavy,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Subtabs: Atual | Histórico | Pagamentos
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(SurfaceContainerHigh)
                .padding(4.dp)
        ) {
            FinanceTabItem(
                title = "Fechamento Atual",
                isSelected = selectedTab == "Atual",
                onClick = { selectedTab = "Atual" },
                modifier = Modifier.weight(1f)
            )
            FinanceTabItem(
                title = "Histórico",
                isSelected = selectedTab == "Historico",
                onClick = { selectedTab = "Historico" },
                modifier = Modifier.weight(1f)
            )
            FinanceTabItem(
                title = "Pagamentos",
                isSelected = selectedTab == "Pagamentos",
                onClick = { selectedTab = "Pagamentos" },
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        when (selectedTab) {
            "Atual" -> {
                if (currentFechamento != null) {
                    FechamentoDetailView(
                        fechamento = currentFechamento,
                        onResolveDivergence = onResolveDivergence,
                        onNavigateToSendRomaneio = onNavigateToSendRomaneio
                    )
                } else {
                    Text("Nenhum fechamento ativo encontrado.")
                }
            }
            "Historico" -> {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(bottom = 32.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(fechamentosList, key = { it.period }) { fechamento ->
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    // Switch to detail view
                                }
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = fechamento.period,
                                        style = MaterialTheme.typography.titleMedium,
                                        color = PrimaryNavy,
                                        fontWeight = FontWeight.Bold
                                    )
                                    StatusBadge(status = fechamento.status)
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column {
                                        Text("Viagens", style = MaterialTheme.typography.labelSmall, color = OnSurfaceVariant)
                                        Text("${fechamento.tripsCount}", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                                    }
                                    Column {
                                        Text("Total Bruto", style = MaterialTheme.typography.labelSmall, color = OnSurfaceVariant)
                                        Text("R$ ${String.format("%.2f", fechamento.totalGross)}", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                                    }
                                    Column {
                                        Text("Total Líquido", style = MaterialTheme.typography.labelSmall, color = OnSurfaceVariant)
                                        Text("R$ ${String.format("%.2f", fechamento.totalNet)}", style = MaterialTheme.typography.titleMedium, color = PrimaryNavy, fontWeight = FontWeight.Bold)
                                    }
                                }

                                if (fechamento.hasDivergence) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Icon(imageVector = Icons.Default.Warning, contentDescription = null, tint = ErrorRed, modifier = Modifier.size(16.dp))
                                        Text(
                                            text = "Atenção: Contém pendência documental",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = ErrorRed
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
            "Pagamentos" -> {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(bottom = 32.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    item {
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "CONTA DE RECEBIMENTO CADASTRADA",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = OnSurfaceVariant,
                                    fontWeight = FontWeight.Bold
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(44.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(SurfaceVariant),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(imageVector = Icons.Default.AccountBalance, contentDescription = null, tint = PrimaryNavy)
                                    }

                                    Column {
                                        Text(
                                            text = "Banco Itaú Unibanco S.A.",
                                            style = MaterialTheme.typography.titleMedium,
                                            color = OnSurfaceDark,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Ag: 0482 • Conta: 98231-4 • Chave PIX (CPF)",
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = OnSurfaceVariant
                                        )
                                    }
                                }
                            }
                        }
                    }

                    item {
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "ÚLTIMO PAGAMENTO REALIZADO",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = OnSurfaceVariant,
                                    fontWeight = FontWeight.Bold
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text("16/07 a 31/07/2023", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                        Text("Transferido em 02/08/2023 às 10:15", style = MaterialTheme.typography.bodyMedium, color = OnSurfaceVariant, fontSize = 12.sp)
                                    }
                                    Text("R$ 2.840,00", style = MaterialTheme.typography.titleLarge, color = SuccessGreenText, fontWeight = FontWeight.Bold)
                                }

                                Spacer(modifier = Modifier.height(12.dp))

                                OutlinedButton(
                                    onClick = { },
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(imageVector = Icons.Default.Download, contentDescription = null)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("BAIXAR COMPROVANTE PIX")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun FechamentoDetailView(
    fechamento: FechamentoEntity,
    onResolveDivergence: (period: String) -> Unit,
    onNavigateToSendRomaneio: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Divergence Card if exists
        if (fechamento.hasDivergence) {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = ErrorContainerRed),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Warning, contentDescription = null, tint = OnErrorContainerRed)
                        Text(
                            text = "PENDÊNCIA ENCONTRADA",
                            style = MaterialTheme.typography.titleMedium,
                            color = OnErrorContainerRed,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = fechamento.divergenceMessage.ifBlank {
                            "Comprovante de entrega ilegível. Necessário reenvio para aprovação na Viagem #4992."
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        color = OnErrorContainerRed
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = {
                            onResolveDivergence(fechamento.period)
                            onNavigateToSendRomaneio()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = SecondaryOrangeContainer),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("btn_fix_divergence")
                    ) {
                        Text(
                            text = "ENVIAR COMPROVANTE CORRIGIDO",
                            color = SurfaceContainerLowest,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // Summary Card
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "PERÍODO DE FECHAMENTO",
                            style = MaterialTheme.typography.labelSmall,
                            color = OnSurfaceVariant
                        )
                        Text(
                            text = fechamento.period,
                            style = MaterialTheme.typography.titleMedium,
                            color = PrimaryNavy,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    StatusBadge(status = fechamento.status)
                }

                Spacer(modifier = Modifier.height(16.dp))
                HorizontalDivider(color = SurfaceVariant)
                Spacer(modifier = Modifier.height(16.dp))

                FinancialSummaryRow("Valor de Fretes (${fechamento.tripsCount} Viagens)", fechamento.tripsValue)
                FinancialSummaryRow("Reembolso de Pedágios", fechamento.tollsValue)
                FinancialSummaryRow("Diárias e Adicionais", fechamento.additionalsValue)
                FinancialSummaryRow("Descontos", fechamento.discountsValue, isNegative = true)

                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = SurfaceVariant)
                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "TOTAL LÍQUIDO",
                        style = MaterialTheme.typography.titleMedium,
                        color = OnSurfaceDark,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "R$ ${String.format("%.2f", fechamento.totalNet)}",
                        style = MaterialTheme.typography.headlineSmall,
                        color = PrimaryNavy,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
private fun FinancialSummaryRow(label: String, value: Double, isNegative: Boolean = false) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyMedium, color = OnSurfaceVariant)
        Text(
            text = "${if (isNegative && value > 0) "- " else "" }R$ ${String.format("%.2f", value)}",
            style = MaterialTheme.typography.bodyMedium,
            color = if (isNegative && value > 0) ErrorRed else OnSurfaceDark,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
private fun FinanceTabItem(
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(if (isSelected) PrimaryNavy else Color.Transparent)
            .clickable { onClick() }
            .padding(vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.labelMedium,
            color = if (isSelected) SurfaceContainerLowest else OnSurfaceVariant,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            fontSize = 12.sp
        )
    }
}
