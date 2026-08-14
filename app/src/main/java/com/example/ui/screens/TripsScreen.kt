package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.TripEntity
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*

@Composable
fun TripsScreen(
    tripsList: List<TripEntity>,
    onTripSelected: (String) -> Unit
) {
    var selectedFilter by remember { mutableStateOf("Todos") }
    val filters = listOf("Todos", "Hoje", "7 dias", "Status")

    val filteredTrips = remember(selectedFilter, tripsList) {
        when (selectedFilter) {
            "Hoje" -> tripsList.filter { it.date.contains("Hoje") || it.date.contains("07 AGO") }
            "7 dias" -> tripsList.take(4)
            "Status" -> tripsList.filter { it.status == "DIVERGÊNCIA" || it.status == "APROVADO" }
            else -> tripsList
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Minhas Viagens",
            style = MaterialTheme.typography.headlineMedium,
            color = PrimaryNavy,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Filter Chips Row
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(filters) { filter ->
                val isSelected = filter == selectedFilter
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (isSelected) PrimaryNavy else SurfaceContainerHigh)
                        .clickable { selectedFilter = filter }
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(
                            text = filter,
                            style = MaterialTheme.typography.labelMedium,
                            color = if (isSelected) SurfaceContainerLowest else OnSurfaceVariant,
                            fontWeight = FontWeight.Bold
                        )
                        if (filter == "Status") {
                            Icon(
                                imageVector = Icons.Default.ArrowDropDown,
                                contentDescription = null,
                                tint = if (isSelected) SurfaceContainerLowest else OnSurfaceVariant,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Trips List
        if (filteredTrips.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Nenhuma viagem encontrada para este filtro.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = OnSurfaceVariant
                )
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filteredTrips, key = { it.id }) { trip ->
                    TripCardItem(
                        trip = trip,
                        onClick = { onTripSelected(trip.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun TripCardItem(
    trip: TripEntity,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .testTag("trip_card_${trip.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${trip.date} • ${trip.time}",
                    style = MaterialTheme.typography.labelSmall,
                    color = OutlineColor
                )
                StatusBadge(status = trip.status)
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = trip.client,
                style = MaterialTheme.typography.titleMedium,
                color = OnSurfaceDark,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "Operação: ${trip.operation}",
                style = MaterialTheme.typography.bodyMedium,
                color = OnSurfaceVariant,
                fontSize = 13.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Column {
                        Text(
                            text = "NF-es",
                            style = MaterialTheme.typography.labelSmall,
                            color = OutlineColor
                        )
                        Text(
                            text = "${trip.invoicesCount}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = OnSurfaceDark,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Column {
                        Text(
                            text = "Entregas",
                            style = MaterialTheme.typography.labelSmall,
                            color = OutlineColor
                        )
                        Text(
                            text = "${trip.deliveriesCount}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = OnSurfaceDark,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Text(
                    text = "R$ ${String.format("%.2f", trip.totalValue)}",
                    style = MaterialTheme.typography.titleLarge,
                    color = PrimaryNavy,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
