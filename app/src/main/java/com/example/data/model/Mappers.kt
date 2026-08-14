package com.example.data.model

import com.example.data.remote.model.*

fun TripDto.toEntity(): TripEntity {
    val plate = vehicle?.let { "${it.brand} ${it.model} • ${it.plate}" } ?: "Veículo HK"
    return TripEntity(
        id = id,
        tripCode = tripCode,
        driverId = driverId ?: "",
        vehicleId = vehicleId ?: "",
        client = "HK Transportes",
        operation = "Lotação / Distribuição",
        date = "",
        time = "",
        driverName = "",
        truckPlate = plate,
        region = "Região Centro-Sul",
        origin = origin,
        destination = destination,
        cteNumber = ctes?.firstOrNull()?.number?.let { "CTe $it" } ?: "CTe -",
        invoicesCount = invoices?.size ?: deliveries?.sumOf { it.invoices?.size ?: 0 } ?: 0,
        deliveriesCount = deliveries?.size ?: 0,
        volumesCount = invoices?.sumOf { it.volumeCount } ?: 100,
        baseValue = ctes?.firstOrNull()?.value ?: 1500.0,
        additionalValue = 0.0,
        discountValue = 0.0,
        tollsValue = 0.0,
        totalValue = ctes?.firstOrNull()?.value ?: 1500.0,
        status = status,
        notes = notes ?: ""
    )
}

fun DeliveryDto.toEntity(): DeliveryEntity {
    return DeliveryEntity(
        id = id,
        tripId = tripId,
        recipient = recipient,
        address = address,
        city = city,
        state = state,
        sequence = sequence,
        optimizedSequence = sequence,
        status = status,
        arrivedAt = arrivedAt ?: "",
        deliveredAt = deliveredAt ?: "",
        notes = notes ?: "",
        refusalReason = refusalReason ?: "",
        quantityExpected = quantityExpected ?: 0,
        quantityDelivered = quantityDelivered ?: 0,
        quantityMissing = quantityMissing ?: 0,
        volumeCount = invoices?.sumOf { it.volumeCount } ?: 0,
        weight = invoices?.sumOf { it.weight } ?: 0.0,
        value = invoices?.sumOf { it.value } ?: 0.0
    )
}

fun InvoiceDto.toEntity(): InvoiceEntity {
    return InvoiceEntity(
        id = id,
        number = "Nº $number",
        tripId = tripId,
        deliveryId = deliveryId ?: "",
        accessKey = accessKey,
        recipient = recipient,
        address = address,
        city = "$city - $state",
        state = state,
        value = value,
        weight = weight,
        volumeCount = volumeCount,
        status = status
    )
}

fun OccurrenceDto.toEntity(): OccurrenceEntity {
    return OccurrenceEntity(
        id = id,
        tripId = tripId,
        deliveryId = deliveryId ?: "",
        driverId = driverId,
        title = title,
        description = description,
        type = type,
        status = status,
        createdAt = createdAt ?: ""
    )
}
