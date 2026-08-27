package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.model.RomaneioEntity
import com.example.ui.components.ProgressTimeline
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*

@Composable
fun RomaneioStatusScreen(
    romaneio: RomaneioEntity?,
    onBackClick: () -> Unit,
    onGoHomeClick: () -> Unit
) {
    val romId = romaneio?.id ?: "ROM-9823"
    val dateStr = romaneio?.sentDate ?: "24 Out 2023"
    val timeStr = romaneio?.sentTime ?: "14:32"
    val driverStr = romaneio?.driver ?: "João Silva"
    val currentStep = romaneio?.currentStep ?: 2

    Column(
        modifier = Modifier
            .fillMaxSize()
            .navigationBarsPadding()
            .imePadding()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Back Header
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            IconButton(
                onClick = onBackClick,
                modifier = Modifier.testTag("back_button_status")
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Voltar",
                    tint = PrimaryNavy
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = "Status do Romaneio",
                    style = MaterialTheme.typography.titleLarge,
                    color = PrimaryNavy,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "$romId • $dateStr, $timeStr",
                    style = MaterialTheme.typography.bodyMedium,
                    color = OnSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

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
                    Text(
                        text = "RESUMO DO ENVIO",
                        style = MaterialTheme.typography.labelMedium,
                        color = OnSurfaceVariant,
                        fontWeight = FontWeight.Bold
                    )
                    StatusBadge(status = "EM PROCESSAMENTO")
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Motorista:", style = MaterialTheme.typography.bodyMedium, color = OnSurfaceVariant)
                    Text(driverStr, style = MaterialTheme.typography.bodyMedium, color = OnSurfaceDark, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(4.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Operação:", style = MaterialTheme.typography.bodyMedium, color = OnSurfaceVariant)
                    Text(romaneio?.operation ?: "Cliente X", style = MaterialTheme.typography.bodyMedium, color = OnSurfaceDark, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(4.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Arquivo:", style = MaterialTheme.typography.bodyMedium, color = OnSurfaceVariant)
                    Text(romaneio?.fileName ?: "doc_cte.pdf", style = MaterialTheme.typography.bodyMedium, color = PrimaryNavy, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Timeline Progress
        ProgressTimeline(currentStep = currentStep)

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = onGoHomeClick,
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryNavy),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .testTag("btn_go_home")
        ) {
            Text(
                text = "VOLTAR AO INÍCIO",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(36.dp))
    }
}
