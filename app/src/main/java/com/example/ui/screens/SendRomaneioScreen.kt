package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SendRomaneioScreen(
    driverName: String = "João da Silva",
    truckPlate: String = "Scania R450 • ABC-1234",
    onSubmitRomaneio: (notes: String, files: List<String>) -> Unit
) {
    var notes by remember { mutableStateOf("Conferido sem avarias no descarregamento.") }
    val filesAttached = remember { mutableStateListOf("doc_cte_9823.pdf") }
    var isSubmitting by remember { mutableStateOf(false) }

    val docPhotoUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuA-SGHYyFwUF44KJd16pFOmLkG0-x_ALPMhza6_Vk6_ftFtBsYvaypdirug1HPlhFx7hwpn8UpEjZLPQlLIHmDtcsYZH-c9Zp6P--yXGqrDcz2tHEJJOSSLx2wzMhIDStJ0ZH_9T5H5MN5ihh0PE_QOlQl677EYwy2jmnCLgbp8cUr4skz51fWdlijJULGajoh-tN20WkrXD2LKoRaGF13ghQYF-CGI5VzQpnnehXFG5ld4FbJIlDV9JA"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .navigationBarsPadding()
            .imePadding()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Text(
            text = "Enviar Romaneio",
            style = MaterialTheme.typography.headlineMedium,
            color = PrimaryNavy,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Tire fotos legíveis dos canhotos das notas para processamento automático.",
            style = MaterialTheme.typography.bodyMedium,
            color = OnSurfaceVariant
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Prefilled Driver Info
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "DADOS DO MOTORISTA",
                    style = MaterialTheme.typography.labelMedium,
                    color = OnSurfaceVariant,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = driverName,
                            style = MaterialTheme.typography.titleMedium,
                            color = PrimaryNavy,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = truckPlate,
                            style = MaterialTheme.typography.bodyMedium,
                            color = OnSurfaceVariant
                        )
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(SuccessGreenBg)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "ATIVO",
                            style = MaterialTheme.typography.labelSmall,
                            color = SuccessGreenText,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Upload Attachment Box
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier
                .fillMaxWidth()
                .clickable {
                    filesAttached.add("comprovante_${filesAttached.size + 1}.jpg")
                }
                .testTag("upload_attachment_box")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(SurfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.CloudUpload,
                        contentDescription = "Tirar Foto ou Anexar",
                        tint = SecondaryOrangeContainer,
                        modifier = Modifier.size(32.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Tire uma foto ou selecione o arquivo PDF",
                    style = MaterialTheme.typography.titleMedium,
                    color = PrimaryNavy,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = "Formatos aceitos: JPG, PNG, PDF (Máx. 15MB)",
                    style = MaterialTheme.typography.bodyMedium,
                    color = OnSurfaceVariant,
                    fontSize = 12.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Attached Files Preview
        if (filesAttached.isNotEmpty()) {
            Text(
                text = "DOCUMENTOS ANEXADOS (${filesAttached.size})",
                style = MaterialTheme.typography.labelMedium,
                color = OnSurfaceVariant,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(8.dp))

            filesAttached.forEachIndexed { index, fileName ->
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
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
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
                                AsyncImage(
                                    model = docPhotoUrl,
                                    contentDescription = "Preview documento",
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            }

                            Column {
                                Text(
                                    text = fileName,
                                    style = MaterialTheme.typography.bodyLarge,
                                    color = OnSurfaceDark,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "2.4 MB • Anexado agora",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = OnSurfaceVariant,
                                    fontSize = 12.sp
                                )
                            }
                        }

                        IconButton(
                            onClick = { filesAttached.removeAt(index) }
                        ) {
                            Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = "Remover",
                                tint = ErrorRed
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Notes Field
        Text(
            text = "OBSERVAÇÕES (OPCIONAL)",
            style = MaterialTheme.typography.labelMedium,
            color = OnSurfaceVariant,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
        )

        Spacer(modifier = Modifier.height(6.dp))

        OutlinedTextField(
            value = notes,
            onValueChange = { notes = it },
            placeholder = { Text("Informe detalhes como reentrega, avaria ou canhoto faltante...", color = OutlineColor) },
            minLines = 3,
            shape = RoundedCornerShape(8.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = SurfaceContainerLowest,
                unfocusedContainerColor = SurfaceContainerLowest,
                focusedBorderColor = PrimaryNavy,
                unfocusedBorderColor = OutlineVariant
            ),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("notes_input")
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Submit Button
        Button(
            onClick = {
                isSubmitting = true
                onSubmitRomaneio(notes, filesAttached.toList())
            },
            enabled = !isSubmitting,
            colors = ButtonDefaults.buttonColors(containerColor = SecondaryOrangeContainer),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
                .testTag("submit_romaneio_button")
        ) {
            if (isSubmitting) {
                CircularProgressIndicator(
                    color = SurfaceContainerLowest,
                    modifier = Modifier.size(24.dp)
                )
            } else {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = null,
                    tint = SurfaceContainerLowest,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "ENVIAR PARA CONFERÊNCIA",
                    style = MaterialTheme.typography.titleMedium,
                    color = SurfaceContainerLowest,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(36.dp))
    }
}
