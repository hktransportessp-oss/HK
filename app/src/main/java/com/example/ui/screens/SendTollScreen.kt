package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddAPhoto
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.TollReceiptEntity
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SendTollScreen(
    tollsList: List<TollReceiptEntity>,
    onSubmitToll: (value: String, date: String, notes: String) -> Unit
) {
    var tollValue by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var isSubmitting by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Text(
            text = "Reembolso de Pedágio",
            style = MaterialTheme.typography.headlineMedium,
            color = PrimaryNavy,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Envie os recibos de praças de pedágio não integradas no Sem Parar / Tag.",
            style = MaterialTheme.typography.bodyMedium,
            color = OnSurfaceVariant
        )

        Spacer(modifier = Modifier.height(16.dp))

        // New Toll Input Card
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "NOVO COMPROVANTE DE PEDÁGIO",
                    style = MaterialTheme.typography.labelMedium,
                    color = OnSurfaceVariant,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Value
                OutlinedTextField(
                    value = tollValue,
                    onValueChange = { tollValue = it },
                    label = { Text("Valor do Pedágio (R$)") },
                    placeholder = { Text("Ex: 45.50") },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.AttachMoney, contentDescription = null, tint = PrimaryNavy)
                    },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true,
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryNavy,
                        unfocusedBorderColor = OutlineVariant
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("toll_value_input")
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Notes / Praça
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Praça de Pedágio / Rodovia") },
                    placeholder = { Text("Ex: Régis Bittencourt KM 320") },
                    singleLine = true,
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryNavy,
                        unfocusedBorderColor = OutlineVariant
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("toll_notes_input")
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Upload Photo Fake Action
                OutlinedButton(
                    onClick = { },
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(imageVector = Icons.Default.AddAPhoto, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("ANEXAR FOTO DO COMPROVANTE")
                }

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        if (tollValue.isNotBlank()) {
                            isSubmitting = true
                            onSubmitToll(tollValue, "", notes)
                            tollValue = ""
                            notes = ""
                            isSubmitting = false
                        }
                    },
                    enabled = !isSubmitting && tollValue.isNotBlank(),
                    colors = ButtonDefaults.buttonColors(containerColor = SecondaryOrangeContainer),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("btn_submit_toll")
                ) {
                    Icon(imageVector = Icons.Default.Send, contentDescription = null, tint = SurfaceContainerLowest)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "ENVIAR COMPROVANTE",
                        style = MaterialTheme.typography.titleMedium,
                        color = SurfaceContainerLowest,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Tolls History List
        Text(
            text = "HISTÓRICO DE ENVIOS",
            style = MaterialTheme.typography.labelMedium,
            color = OnSurfaceVariant,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
        )

        Spacer(modifier = Modifier.height(10.dp))

        tollsList.forEach { toll ->
            Card(
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "R$ ${String.format("%.2f", toll.value)}",
                            style = MaterialTheme.typography.titleMedium,
                            color = PrimaryNavy,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${toll.date} • ${toll.tripRef}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = OnSurfaceVariant,
                            fontSize = 12.sp
                        )
                        if (toll.notes.isNotBlank()) {
                            Text(
                                text = toll.notes,
                                style = MaterialTheme.typography.bodyMedium,
                                color = OnSurfaceDark,
                                fontSize = 12.sp
                            )
                        }
                    }

                    StatusBadge(status = toll.status)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}
