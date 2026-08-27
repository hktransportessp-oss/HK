package com.example.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import android.util.Size
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.example.data.remote.model.ScanInvoiceResponse
import com.example.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScanInvoiceScreen(
    tripId: String,
    onBackClick: () -> Unit,
    onScanSuccess: (ScanInvoiceResponse) -> Unit,
    onScanRemoteApi: suspend (accessKey: String) -> Result<ScanInvoiceResponse>
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val coroutineScope = rememberCoroutineScope()

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    var manualKeyInput by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var scanResult by remember { mutableStateOf<ScanInvoiceResponse?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBackground)
            .imePadding()
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
                modifier = Modifier.testTag("back_button_scan")
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Voltar",
                    tint = PrimaryNavy
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Bipagem de NF-e (HK ERP)",
                style = MaterialTheme.typography.titleLarge,
                color = PrimaryNavy,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Banner ERP HK
        Card(
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = PrimaryNavy.copy(alpha = 0.08f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.QrCodeScanner,
                    contentDescription = null,
                    tint = PrimaryNavy
                )
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "INTEGRAÇÃO REAL HK ERP",
                        style = MaterialTheme.typography.labelLarge,
                        color = PrimaryNavy,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "A chave de 44 dígitos é validada no ERP HK e agrupada por cliente/destino.",
                        style = MaterialTheme.typography.bodySmall,
                        color = OnSurfaceDark
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Camera Preview Frame
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(220.dp)
                .background(Color.Black, shape = RoundedCornerShape(12.dp))
                .border(2.dp, PrimaryNavy, shape = RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.Center
        ) {
            if (hasCameraPermission) {
                AndroidView(
                    factory = { ctx ->
                        val previewView = PreviewView(ctx)
                        val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                        cameraProviderFuture.addListener({
                            val cameraProvider = cameraProviderFuture.get()
                            val preview = Preview.Builder().build().also {
                                it.setSurfaceProvider(previewView.surfaceProvider)
                            }
                            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
                            try {
                                cameraProvider.unbindAll()
                                cameraProvider.bindToLifecycle(
                                    lifecycleOwner,
                                    cameraSelector,
                                    preview
                                )
                            } catch (e: Exception) {
                                e.printStackTrace()
                            }
                        }, ContextCompat.getMainExecutor(ctx))
                        previewView
                    },
                    modifier = Modifier.fillMaxSize()
                )

                // Overlay Scanner Frame
                Box(
                    modifier = Modifier
                        .width(260.dp)
                        .height(100.dp)
                        .border(2.dp, Color.Green, RoundedCornerShape(8.dp))
                )
            } else {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(16.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CameraAlt,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Permissão de câmera necessária",
                        color = Color.White,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Button(
                        onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryNavy)
                    ) {
                        Text("Solicitar Permissão")
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Manual Key Entry Field
        Text(
            text = "Chave de Acesso (44 Dígitos):",
            style = MaterialTheme.typography.titleMedium,
            color = PrimaryNavy,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(6.dp))

        OutlinedTextField(
            value = manualKeyInput,
            onValueChange = { input ->
                val digits = input.filter { it.isDigit() }
                if (digits.length <= 44) {
                    manualKeyInput = digits
                }
            },
            placeholder = { Text("35260838920184910001925500100014589210000001") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            singleLine = true,
            modifier = Modifier
                .fillMaxWidth()
                .testTag("access_key_input")
        )

        Text(
            text = "${manualKeyInput.length} / 44 dígitos",
            style = MaterialTheme.typography.bodySmall,
            color = if (manualKeyInput.length == 44) StatusGreenText else OnSurfaceVariant,
            modifier = Modifier.padding(top = 4.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Process Scan Button
        Button(
            onClick = {
                if (manualKeyInput.length != 44) {
                    errorMessage = "A chave de acesso deve conter exatamente 44 dígitos numéricos."
                    return@Button
                }
                isLoading = true
                errorMessage = null
                scanResult = null
                coroutineScope.launch {
                    val result = onScanRemoteApi(manualKeyInput)
                    isLoading = false
                    result.onSuccess { resp ->
                        scanResult = resp
                        onScanSuccess(resp)
                    }.onFailure { err ->
                        errorMessage = err.localizedMessage ?: "Erro ao processar chave no ERP HK."
                    }
                }
            },
            enabled = !isLoading && manualKeyInput.length == 44,
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryNavy),
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .testTag("submit_scan_button")
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            } else {
                Text(
                    text = "VALIDAR E AGROUPAR NO ERP",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        errorMessage?.let { err ->
            Spacer(modifier = Modifier.height(12.dp))
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = err,
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(12.dp)
                )
            }
        }

        scanResult?.let { res ->
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = StatusGreenText
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = res.message,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = StatusGreenText
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Status ERP: ${res.erpStatus}",
                        style = MaterialTheme.typography.bodySmall,
                        color = OnSurfaceVariant
                    )

                    res.invoice?.let { inv ->
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("NF-e: Nº ${inv.number}", fontWeight = FontWeight.Bold)
                        Text("Destinatário: ${inv.recipient}")
                        Text("Cidade: ${inv.city}")
                        Text("Volumes: ${inv.volumeCount} | Peso: ${inv.weight} kg")
                        Text("Valor: R$ ${String.format("%.2f", inv.value)}", fontWeight = FontWeight.Bold, color = PrimaryNavy)
                    }
                }
            }
        }
    }
}
