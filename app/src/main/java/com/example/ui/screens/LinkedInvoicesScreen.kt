package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.model.InvoiceEntity
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LinkedInvoicesScreen(
    tripId: String,
    invoicesList: List<InvoiceEntity>,
    onBackClick: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }

    val filteredInvoices = remember(searchQuery, invoicesList) {
        if (searchQuery.isBlank()) invoicesList
        else invoicesList.filter {
            it.number.contains(searchQuery, ignoreCase = true) ||
            it.recipient.contains(searchQuery, ignoreCase = true) ||
            it.city.contains(searchQuery, ignoreCase = true)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Back Header
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            IconButton(
                onClick = onBackClick,
                modifier = Modifier.testTag("back_button_invoices")
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Voltar",
                    tint = PrimaryNavy
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "${invoicesList.size} NF-es Vinculadas",
                style = MaterialTheme.typography.titleLarge,
                color = PrimaryNavy,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Buscar NF-e ou Destinatário...", color = OutlineColor) },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = null,
                    tint = OutlineColor
                )
            },
            singleLine = true,
            shape = RoundedCornerShape(8.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = SurfaceContainerLowest,
                unfocusedContainerColor = SurfaceContainerLowest,
                focusedBorderColor = PrimaryNavy,
                unfocusedBorderColor = OutlineVariant
            ),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("invoice_search_input")
        )

        Spacer(modifier = Modifier.height(16.dp))

        // List of Invoices
        if (filteredInvoices.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Nenhuma nota fiscal encontrada.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = OnSurfaceVariant
                )
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filteredInvoices, key = { it.number }) { invoice ->
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
                                    text = invoice.number,
                                    style = MaterialTheme.typography.titleMedium,
                                    color = PrimaryNavy,
                                    fontWeight = FontWeight.Bold
                                )
                                StatusBadge(status = invoice.status)
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            Text(
                                text = invoice.recipient,
                                style = MaterialTheme.typography.bodyLarge,
                                color = OnSurfaceDark,
                                fontWeight = FontWeight.Medium
                            )

                            Text(
                                text = "Destino: ${invoice.city}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = OnSurfaceVariant
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.End
                            ) {
                                Text(
                                    text = "R$ ${String.format("%.2f", invoice.value)}",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = PrimaryNavy,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
