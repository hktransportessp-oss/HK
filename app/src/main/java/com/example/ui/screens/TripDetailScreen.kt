package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import com.example.data.model.DeliveryEntity
import com.example.data.model.OccurrenceEntity
import com.example.data.model.TripEntity
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TripDetailScreen(
    trip: TripEntity?,
    deliveries: List<DeliveryEntity> = emptyList(),
    occurrences: List<OccurrenceEntity> = emptyList(),
    onAcceptClick: () -> Unit = {},
    onStartClick: () -> Unit = {},
    onCompleteTripClick: () -> Unit = {},
    onArriveDeliveryClick: (String) -> Unit = {},
    onCompleteDeliverySubmit: (
        deliveryId: String,
        status: String,
        notes: String?,
        refusalReason: String?,
        expected: Int?,
        delivered: Int?,
        missing: Int?
    ) -> Unit = { _, _, _, _, _, _, _ -> },
    onCreateOccurrenceSubmit: (tripId: String, deliveryId: String?, type: String, description: String) -> Unit = { _, _, _, _ -> },
    onBackClick: () -> Unit = {},
    onViewInvoicesClick: (String) -> Unit = {},
    onViewTollsClick: () -> Unit = {},
    onScanNfeClick: () -> Unit = {},
    onViewRouteClick: () -> Unit = {},
    onUploadPodClick: (deliveryId: String) -> Unit = {}
) {
    if (trip == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Viagem não encontrada.")
        }
        return
    }

    var showCompleteDeliveryDialog by remember { mutableStateOf<DeliveryEntity?>(null) }
    var showOccurrenceDialog by remember { mutableStateOf<DeliveryEntity?>(null) }
    var showGeneralOccurrenceDialog by remember { mutableStateOf(false) }

    val allDeliveriesFinished = remember(deliveries) {
        deliveries.isNotEmpty() && deliveries.all {
            it.status == "DELIVERED" || it.status == "PARTIAL" || it.status == "REFUSED" || it.status == "OCCURRENCE"
        }
    }

    Scaffold(
        bottomBar = {
            // Contextual Operational Bar
            Surface(
                tonalElevation = 8.dp,
                shadowElevation = 8.dp,
                color = SurfaceContainerLowest
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .imePadding()
                        .padding(16.dp)
                ) {
                    when (trip.status) {
                        "ASSIGNED", "PENDING" -> {
                            Button(
                                onClick = onAcceptClick,
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryNavy),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp)
                                    .testTag("btn_accept_trip")
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("ACEITAR VIAGEM ATRIBUÍDA", fontWeight = FontWeight.Bold)
                            }
                        }
                        "ACCEPTED" -> {
                            Button(
                                onClick = onStartClick,
                                colors = ButtonDefaults.buttonColors(containerColor = AccentOrange),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp)
                                    .testTag("btn_start_trip")
                            ) {
                                Icon(Icons.Default.PlayArrow, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("INICIAR VIAGEM / ROTA", fontWeight = FontWeight.Bold)
                            }
                        }
                        "IN_PROGRESS" -> {
                            Button(
                                onClick = onCompleteTripClick,
                                enabled = allDeliveriesFinished || deliveries.isEmpty(),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = SuccessGreen,
                                    disabledContainerColor = SurfaceVariant
                                ),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp)
                                    .testTag("btn_complete_trip")
                            ) {
                                Icon(Icons.Default.Flag, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    if (allDeliveriesFinished || deliveries.isEmpty()) "FINALIZAR VIAGEM" else "CONCLUA AS ENTREGAS PARA FINALIZAR",
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                        "COMPLETED" -> {
                            Surface(
                                color = SuccessGreen.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = SuccessGreen)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        "VIAGEM CONCLUÍDA COM SUCESSO",
                                        style = MaterialTheme.typography.titleMedium,
                                        color = SuccessGreen,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                IconButton(
                    onClick = onBackClick,
                    modifier = Modifier.testTag("back_button")
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Voltar",
                        tint = PrimaryNavy
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Viagem ${trip.tripCode}",
                    style = MaterialTheme.typography.titleLarge,
                    color = PrimaryNavy,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Main Trip Card
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
                                text = trip.client,
                                style = MaterialTheme.typography.titleMedium,
                                color = PrimaryNavy,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Rota: ${trip.origin} ➔ ${trip.destination}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = OnSurfaceVariant
                            )
                        }
                        StatusBadge(status = trip.status)
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                    HorizontalDivider(color = SurfaceVariant)
                    Spacer(modifier = Modifier.height(12.dp))

                    DetailItem(label = "Veículo / Placa", value = trip.truckPlate)
                    DetailItem(label = "Operação", value = trip.operation)
                    DetailItem(label = "Documento Fiscal", value = trip.cteNumber)
                    if (trip.notes.isNotBlank()) {
                        DetailItem(label = "Observações", value = trip.notes)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Section Header: Deliveries
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "ENTREGAS E CLIENTES (${deliveries.size})",
                    style = MaterialTheme.typography.titleMedium,
                    color = PrimaryNavy,
                    fontWeight = FontWeight.Bold
                )

                if (trip.status == "IN_PROGRESS") {
                    OutlinedButton(
                        onClick = { showGeneralOccurrenceDialog = true },
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Icon(Icons.Default.Warning, contentDescription = null, modifier = Modifier.size(16.dp), tint = WarningYellow)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("+ Ocorrência Geral", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (deliveries.isEmpty()) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = SurfaceContainerHigh),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Nenhuma entrega cadastrada para esta viagem.",
                        modifier = Modifier.padding(16.dp),
                        style = MaterialTheme.typography.bodyMedium,
                        color = OnSurfaceVariant
                    )
                }
            } else {
                deliveries.forEach { delivery ->
                    DeliveryItemCard(
                        delivery = delivery,
                        tripStatus = trip.status,
                        onArriveClick = { onArriveDeliveryClick(delivery.id) },
                        onCompleteClick = { showCompleteDeliveryDialog = delivery },
                        onOccurrenceClick = { showOccurrenceDialog = delivery }
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Occurrences Section
            if (occurrences.isNotEmpty()) {
                Text(
                    text = "OCORRÊNCIAS REGISTRADAS (${occurrences.size})",
                    style = MaterialTheme.typography.titleMedium,
                    color = WarningYellow,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                occurrences.forEach { occ ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = WarningYellow.copy(alpha = 0.1f)),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(occ.title, fontWeight = FontWeight.Bold, color = OnSurfaceDark)
                            Text(occ.description, style = MaterialTheme.typography.bodyMedium, color = OnSurfaceVariant)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Phase 5 Action Bar
            Column(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onScanNfeClick,
                        colors = ButtonDefaults.buttonColors(containerColor = SecondaryBlue),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("btn_scan_nfe")
                    ) {
                        Icon(Icons.Default.QrCodeScanner, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Bipar NF-e", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = onViewRouteClick,
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryNavy),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("btn_view_route")
                    ) {
                        Icon(Icons.Default.AltRoute, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Rota Inteligente", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { onViewInvoicesClick(trip.id) },
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Description, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("NF-es (${trip.invoicesCount})", fontSize = 12.sp)
                    }

                    OutlinedButton(
                        onClick = onViewTollsClick,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Toll, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Pedágios", fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    // Dialog: Complete Delivery
    showCompleteDeliveryDialog?.let { delivery ->
        CompleteDeliveryDialog(
            delivery = delivery,
            onDismiss = { showCompleteDeliveryDialog = null },
            onSubmit = { status, notes, refusalReason, expected, delivered, missing ->
                onCompleteDeliverySubmit(delivery.id, status, notes, refusalReason, expected, delivered, missing)
                showCompleteDeliveryDialog = null
            }
        )
    }

    // Dialog: Specific Delivery Occurrence
    showOccurrenceDialog?.let { delivery ->
        CreateOccurrenceDialog(
            title = "Ocorrência na Entrega - ${delivery.recipient}",
            onDismiss = { showOccurrenceDialog = null },
            onSubmit = { type, description ->
                onCreateOccurrenceSubmit(trip.id, delivery.id, type, description)
                showOccurrenceDialog = null
            }
        )
    }

    // Dialog: General Trip Occurrence
    if (showGeneralOccurrenceDialog) {
        CreateOccurrenceDialog(
            title = "Registrar Ocorrência na Viagem",
            onDismiss = { showGeneralOccurrenceDialog = false },
            onSubmit = { type, description ->
                onCreateOccurrenceSubmit(trip.id, null, type, description)
                showGeneralOccurrenceDialog = false
            }
        )
    }
}

@Composable
fun DeliveryItemCard(
    delivery: DeliveryEntity,
    tripStatus: String,
    onArriveClick: () -> Unit,
    onCompleteClick: () -> Unit,
    onOccurrenceClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${delivery.sequence}º - ${delivery.recipient}",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = OnSurfaceDark
                )
                StatusBadge(status = delivery.status)
            }

            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "${delivery.address}, ${delivery.city} - ${delivery.state}",
                style = MaterialTheme.typography.bodyMedium,
                color = OnSurfaceVariant
            )

            if (tripStatus == "IN_PROGRESS" && delivery.status != "DELIVERED" && delivery.status != "REFUSED" && delivery.status != "PARTIAL") {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (delivery.status == "PENDING" || delivery.status == "IN_ROUTE") {
                        Button(
                            onClick = onArriveClick,
                            colors = ButtonDefaults.buttonColors(containerColor = AccentOrange),
                            shape = RoundedCornerShape(6.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.LocationOn, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("CHEGUEI", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Button(
                        onClick = onCompleteClick,
                        colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                        shape = RoundedCornerShape(6.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("CONCLUIR", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(
                        onClick = onOccurrenceClick,
                        shape = RoundedCornerShape(6.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Warning, contentDescription = null, modifier = Modifier.size(16.dp), tint = WarningYellow)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("OCORRÊNCIA", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun CompleteDeliveryDialog(
    delivery: DeliveryEntity,
    onDismiss: () -> Unit,
    onSubmit: (status: String, notes: String?, refusalReason: String?, expected: Int?, delivered: Int?, missing: Int?) -> Unit
) {
    var selectedOption by remember { mutableStateOf("DELIVERED") } // DELIVERED, PARTIAL, REFUSED
    var notes by remember { mutableStateOf("") }
    var refusalReason by remember { mutableStateOf("") }
    var qtyExpected by remember { mutableStateOf(delivery.quantityExpected.toString()) }
    var qtyDelivered by remember { mutableStateOf(delivery.quantityExpected.toString()) }
    var qtyMissing by remember { mutableStateOf("0") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Concluir Entrega - ${delivery.recipient}") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Selecione o resultado da entrega:", style = MaterialTheme.typography.labelMedium)

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    FilterChip(
                        selected = selectedOption == "DELIVERED",
                        onClick = { selectedOption = "DELIVERED" },
                        label = { Text("Total") }
                    )
                    FilterChip(
                        selected = selectedOption == "PARTIAL",
                        onClick = { selectedOption = "PARTIAL" },
                        label = { Text("Parcial") }
                    )
                    FilterChip(
                        selected = selectedOption == "REFUSED",
                        onClick = { selectedOption = "REFUSED" },
                        label = { Text("Recusada") }
                    )
                }

                if (selectedOption == "PARTIAL") {
                    OutlinedTextField(
                        value = qtyExpected,
                        onValueChange = { qtyExpected = it },
                        label = { Text("Qtd Prevista") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = qtyDelivered,
                        onValueChange = { qtyDelivered = it },
                        label = { Text("Qtd Entregue") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = qtyMissing,
                        onValueChange = { qtyMissing = it },
                        label = { Text("Qtd Faltante") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                if (selectedOption == "REFUSED" || selectedOption == "PARTIAL") {
                    OutlinedTextField(
                        value = refusalReason,
                        onValueChange = { refusalReason = it },
                        label = { Text("Motivo / Ressalva *") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Observações (opcional)") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val exp = qtyExpected.toIntOrNull()
                    val del = qtyDelivered.toIntOrNull()
                    val mis = qtyMissing.toIntOrNull()
                    onSubmit(selectedOption, notes.ifBlank { null }, refusalReason.ifBlank { null }, exp, del, mis)
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryNavy)
            ) {
                Text("Confirmar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}

@Composable
fun CreateOccurrenceDialog(
    title: String,
    onDismiss: () -> Unit,
    onSubmit: (type: String, description: String) -> Unit
) {
    val types = listOf(
        "DELIVERY_REFUSED" to "Recusa de Entrega",
        "DAMAGED_CARGO" to "Avaria de Carga",
        "MISSING_VOLUME" to "Falta de Volume",
        "ADDRESS_NOT_FOUND" to "Endereço Não Localizado",
        "CUSTOMER_CLOSED" to "Cliente Fechado",
        "VEHICLE_PROBLEM" to "Problema no Veículo",
        "OTHER" to "Outros"
    )

    var selectedType by remember { mutableStateOf("DELIVERED_REFUSED") }
    var description by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Selecione o tipo de ocorrência:", style = MaterialTheme.typography.labelMedium)

                types.take(4).forEach { (code, label) ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedType = code }
                            .padding(vertical = 2.dp)
                    ) {
                        RadioButton(selected = selectedType == code, onClick = { selectedType = code })
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(label, fontSize = 13.sp)
                    }
                }

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Descrição detalhada *") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (description.isNotBlank()) {
                        onSubmit(selectedType, description)
                    }
                },
                enabled = description.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = WarningYellow)
            ) {
                Text("Registrar Ocorrência", color = Color.Black, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}

@Composable
private fun DetailItem(label: String, value: String) {
    Column(modifier = Modifier.padding(vertical = 4.dp)) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = OnSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            color = OnSurfaceDark,
            fontWeight = FontWeight.Medium
        )
    }
}
