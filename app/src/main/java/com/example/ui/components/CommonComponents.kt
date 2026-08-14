package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*

@Composable
fun StatusBadge(
    status: String,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor) = when (status.uppercase()) {
        "APROVADO", "PAGO", "VINCULADA", "APROVADA" -> SuccessGreenBg to SuccessGreenText
        "EM CONFERÊNCIA", "EM ANÁLISE", "EM PROCESSAMENTO", "PROCESSANDO", "PROCESSADO", "AGENDADO", "ENVIADO" -> SurfaceVariant to PrimaryNavy
        "DIVERGÊNCIA", "FALTA DOC" -> ErrorContainerRed to OnErrorContainerRed
        else -> SurfaceContainerHigh to OnSurfaceVariant
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .padding(horizontal = 10.dp, vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            if (status.uppercase() == "DIVERGÊNCIA" || status.uppercase() == "FALTA DOC") {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = null,
                    tint = textColor,
                    modifier = Modifier.size(12.dp)
                )
            } else if (status.uppercase() == "APROVADO" || status.uppercase() == "PAGO") {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = textColor,
                    modifier = Modifier.size(12.dp)
                )
            }
            Text(
                text = status.uppercase(),
                style = MaterialTheme.typography.labelSmall,
                color = textColor,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp
            )
        }
    }
}

@Composable
fun FinancialCard(
    title: String,
    amount: Double,
    previsto: Double? = null,
    aprovado: Double? = null,
    pago: Double? = null,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = title.uppercase(),
                style = MaterialTheme.typography.labelMedium,
                color = OnSurfaceVariant,
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "R$ ${String.format("%.2f", amount)}",
                style = MaterialTheme.typography.headlineSmall,
                color = PrimaryNavy,
                fontWeight = FontWeight.Bold
            )

            if (previsto != null && aprovado != null && pago != null) {
                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = SurfaceVariant)
                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "PREVISTO",
                            style = MaterialTheme.typography.labelSmall,
                            color = OnSurfaceVariant,
                            fontSize = 10.sp
                        )
                        Text(
                            text = "R$ ${String.format("%.2f", previsto)}",
                            style = MaterialTheme.typography.labelMedium,
                            color = OnSurfaceDark,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Column {
                        Text(
                            text = "APROVADO",
                            style = MaterialTheme.typography.labelSmall,
                            color = OnSurfaceVariant,
                            fontSize = 10.sp
                        )
                        Text(
                            text = "R$ ${String.format("%.2f", aprovado)}",
                            style = MaterialTheme.typography.labelMedium,
                            color = SecondaryOrangeContainer,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Column {
                        Text(
                            text = "PAGO NO PERÍODO",
                            style = MaterialTheme.typography.labelSmall,
                            color = OnSurfaceVariant,
                            fontSize = 10.sp
                        )
                        Text(
                            text = "R$ ${String.format("%.2f", pago)}",
                            style = MaterialTheme.typography.labelMedium,
                            color = OnSurfaceDark,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ProgressTimeline(
    currentStep: Int, // 1: Recebido, 2: Processando, 3: NF-es identificadas, 4: Valor calculado, 5: Aprovado, 6: Fechamento
    modifier: Modifier = Modifier
) {
    val steps = listOf(
        "Recebido" to "Documentos enviados com sucesso",
        "Processando" to "Análise automática via OCR em andamento...",
        "NF-es identificadas" to "Conferência de notas",
        "Valor calculado" to "Cálculo de frete e pedágios",
        "Aprovado" to "Liberação para fechamento",
        "Fechamento" to "Incluso no extrato"
    )

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "PROGRESSO DA ANÁLISE",
                style = MaterialTheme.typography.labelMedium,
                color = OnSurfaceVariant,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(16.dp))

            steps.forEachIndexed { index, (title, subtitle) ->
                val stepNum = index + 1
                val isCompleted = stepNum < currentStep
                val isActive = stepNum == currentStep
                val isPending = stepNum > currentStep

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.Top
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.width(32.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(
                                    when {
                                        isCompleted -> PrimaryNavy
                                        isActive -> SecondaryOrangeContainer
                                        else -> SurfaceContainerHigh
                                    }
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isCompleted) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = null,
                                    tint = SurfaceContainerLowest,
                                    modifier = Modifier.size(14.dp)
                                )
                            } else if (isActive) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(OnSecondaryOrangeContainer)
                                )
                            }
                        }

                        if (index < steps.size - 1) {
                            Box(
                                modifier = Modifier
                                    .width(2.dp)
                                    .height(32.dp)
                                    .background(
                                        if (isCompleted) PrimaryNavy else SurfaceContainerHigh
                                    )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = title,
                            style = MaterialTheme.typography.titleMedium,
                            color = when {
                                isActive -> SecondaryOrangeContainer
                                isCompleted -> PrimaryNavy
                                else -> OnSurfaceVariant.copy(alpha = 0.6f)
                            },
                            fontWeight = if (isActive || isCompleted) FontWeight.Bold else FontWeight.Medium
                        )
                        if (isActive || isCompleted) {
                            Text(
                                text = subtitle,
                                style = MaterialTheme.typography.bodyMedium,
                                color = OnSurfaceVariant,
                                fontSize = 12.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            }
        }
    }
}
