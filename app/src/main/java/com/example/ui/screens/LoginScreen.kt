package com.example.ui.screens

import android.util.Log
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    currentServerUrl: String = "https://api.hkconnect.com.br/",
    onUpdateServerUrl: (String) -> Unit = {},
    onLogin: (cpf: String, password: String, remember: Boolean, onResult: (Boolean, String?) -> Unit) -> Unit
) {
    var cpf by remember { mutableStateOf("") }
    var senha by remember { mutableStateOf("") }
    var rememberAccess by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var showServerDialog by remember { mutableStateOf(false) }
    var editedServerUrl by remember { mutableStateOf(currentServerUrl) }

    val focusManager = LocalFocusManager.current
    val logoUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuASF2lTyM4JHmJ-XY8RNWTgdSf_ULPYJRbe3U_tzQ7sIfVLgNdFD2HBqPC6ZyTMImp41bp6bE6d5g8JQ4LK_5GUgAZWc-tGoi0Xh0AXY0A9FXPMdn1LS-eMuxRk5by9DhCw7B6HKWvDn4GuanVmtLwzo5a-3uWlVC3E5WJnIIPys-WXAL82MJ3R1pv9TK89kzQe9WxrMWQGwlo3wCTPLMy_i1UqlDxCAQNuEOhWigM6OSJm7F_qBAz88iUwGBRO9n6zjoI"

    fun executeLogin() {
        val cleanCpf = cpf.trim()
        val cleanSenha = senha.trim()

        if (cleanCpf.isBlank()) {
            errorMessage = "Informe seu CPF ou telefone para continuar"
            return
        }
        if (cleanSenha.isBlank()) {
            errorMessage = "Informe sua senha de acesso"
            return
        }

        errorMessage = ""
        isLoading = true
        Log.d("HK_CONNECT_AUTH", "[ANDROID LOGIN] botão clicado")

        onLogin(cleanCpf, cleanSenha, rememberAccess) { success, error ->
            isLoading = false
            if (success) {
                errorMessage = ""
                Log.d("HK_CONNECT_AUTH", "[ANDROID LOGIN] sucesso no retorno para tela de login")
            } else {
                errorMessage = error ?: "Não foi possível realizar o login. Tente novamente."
                Log.e("HK_CONNECT_AUTH", "[ANDROID LOGIN] erro exibido na tela: $errorMessage")
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBackground)
            .systemBarsPadding(),
        contentAlignment = Alignment.Center
    ) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // HK Transportes Logo
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .background(SurfaceVariant)
                        .border(1.dp, OutlineVariant, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    AsyncImage(
                        model = logoUrl,
                        contentDescription = "HK Transportes Logo",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "HK Connect",
                    style = MaterialTheme.typography.headlineMedium,
                    color = PrimaryNavy,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = "Acesso do Motorista",
                    style = MaterialTheme.typography.bodyMedium,
                    color = OnSurfaceVariant
                )

                Spacer(modifier = Modifier.height(20.dp))

                // CPF / Telefone Field
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "CPF ou Telefone",
                        style = MaterialTheme.typography.labelMedium,
                        color = OnSurfaceVariant,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = cpf,
                        onValueChange = {
                            cpf = it
                            if (errorMessage.isNotEmpty()) errorMessage = ""
                        },
                        placeholder = { Text("000.000.000-00", color = OutlineColor) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Badge,
                                contentDescription = null,
                                tint = if (cpf.isNotBlank()) PrimaryNavy else OutlineColor
                            )
                        },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Number,
                            imeAction = ImeAction.Next
                        ),
                        keyboardActions = KeyboardActions(
                            onNext = { focusManager.moveFocus(FocusDirection.Down) }
                        ),
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFFF8FAFC),
                            unfocusedContainerColor = Color(0xFFF8FAFC),
                            focusedBorderColor = PrimaryNavy,
                            unfocusedBorderColor = OutlineVariant
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("cpf_input")
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Password Field
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Senha",
                        style = MaterialTheme.typography.labelMedium,
                        color = OnSurfaceVariant,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = senha,
                        onValueChange = {
                            senha = it
                            if (errorMessage.isNotEmpty()) errorMessage = ""
                        },
                        placeholder = { Text("••••••••", color = OutlineColor) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = null,
                                tint = if (senha.isNotBlank()) PrimaryNavy else OutlineColor
                            )
                        },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Password,
                            imeAction = ImeAction.Done
                        ),
                        keyboardActions = KeyboardActions(
                            onDone = {
                                focusManager.clearFocus()
                                executeLogin()
                            }
                        ),
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFFF8FAFC),
                            unfocusedContainerColor = Color(0xFFF8FAFC),
                            focusedBorderColor = PrimaryNavy,
                            unfocusedBorderColor = OutlineVariant
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("password_input")
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Options Row (Lembrar acesso / Esqueci minha senha)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable { rememberAccess = !rememberAccess }
                    ) {
                        Checkbox(
                            checked = rememberAccess,
                            onCheckedChange = { rememberAccess = it },
                            colors = CheckboxDefaults.colors(checkedColor = PrimaryNavy)
                        )
                        Text(
                            text = "Lembrar acesso",
                            style = MaterialTheme.typography.bodyMedium,
                            color = OnSurfaceVariant,
                            fontSize = 13.sp
                        )
                    }

                    Text(
                        text = "Esqueci a senha",
                        style = MaterialTheme.typography.bodyMedium,
                        color = PrimaryNavy,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 13.sp,
                        modifier = Modifier.clickable {
                            errorMessage = "Para redefinir sua senha, solicite ao suporte da HK Transportes."
                        }
                    )
                }

                // Error Message Card
                AnimatedVisibility(visible = errorMessage.isNotEmpty()) {
                    Card(
                        shape = RoundedCornerShape(8.dp),
                        colors = CardDefaults.cardColors(containerColor = ErrorContainerRed),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 10.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ErrorOutline,
                                contentDescription = "Erro",
                                tint = OnErrorContainerRed,
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                text = errorMessage,
                                style = MaterialTheme.typography.bodyMedium,
                                color = OnErrorContainerRed,
                                fontWeight = FontWeight.Medium,
                                fontSize = 13.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Login Button
                Button(
                    onClick = {
                        focusManager.clearFocus()
                        executeLogin()
                    },
                    enabled = !isLoading,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = SecondaryOrangeContainer,
                        disabledContainerColor = SecondaryOrangeContainer.copy(alpha = 0.6f)
                    ),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                        .testTag("login_button")
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            color = Color.White,
                            strokeWidth = 2.5.dp,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "AUTENTICANDO...",
                            style = MaterialTheme.typography.titleMedium,
                            color = SurfaceContainerLowest,
                            fontWeight = FontWeight.Bold
                        )
                    } else {
                        Text(
                            text = "ENTRAR",
                            style = MaterialTheme.typography.titleMedium,
                            color = SurfaceContainerLowest,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Server Endpoint Configuration Trigger (for homologation & production setup)
                Row(
                    modifier = Modifier
                        .clickable {
                            editedServerUrl = currentServerUrl
                            showServerDialog = true
                        }
                        .padding(4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "Configurar Servidor",
                        tint = OutlineColor,
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = "Servidor: ${currentServerUrl.removePrefix("https://").removePrefix("http://").removeSuffix("/")}",
                        style = MaterialTheme.typography.labelSmall,
                        color = OutlineColor,
                        fontSize = 11.sp
                    )
                }
            }
        }
    }

    // Dialog to customize / inspect the backend API URL
    if (showServerDialog) {
        AlertDialog(
            onDismissRequest = { showServerDialog = false },
            title = { Text("Configurar Endpoint da API", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Informe o endereço base do backend REST (produção ou homologação Railway):",
                        style = MaterialTheme.typography.bodyMedium,
                        color = OnSurfaceVariant
                    )
                    OutlinedTextField(
                        value = editedServerUrl,
                        onValueChange = { editedServerUrl = it },
                        singleLine = true,
                        placeholder = { Text("https://api.hkconnect.com.br/") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val finalUrl = editedServerUrl.trim()
                        if (finalUrl.isNotBlank()) {
                            onUpdateServerUrl(finalUrl)
                        }
                        showServerDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryNavy)
                ) {
                    Text("Salvar")
                }
            },
            dismissButton = {
                TextButton(onClick = { showServerDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }
}
