package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onLoginSuccess: (cpf: String, password: String, remember: Boolean) -> Unit
) {
    var cpf by remember { mutableStateOf("") }
    var senha by remember { mutableStateOf("") }
    var rememberAccess by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf("") }

    val logoUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuASF2lTyM4JHmJ-XY8RNWTgdSf_ULPYJRbe3U_tzQ7sIfVLgNdFD2HBqPC6ZyTMImp41bp6bE6d5g8JQ4LK_5GUgAZWc-tGoi0Xh0AXY0A9FXPMdn1LS-eMuxRk5by9DhCw7B6HKWvDn4GuanVmtLwzo5a-3uWlVC3E5WJnIIPys-WXAL82MJ3R1pv9TK89kzQe9WxrMWQGwlo3wCTPLMy_i1UqlDxCAQNuEOhWigM6OSJm7F_qBAz88iUwGBRO9n6zjoI"

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
                .fillMaxWidth(0.9f)
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
                        .size(110.dp)
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

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "HK Connect",
                    style = MaterialTheme.typography.headlineMedium,
                    color = PrimaryNavy,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(24.dp))

                // CPF Field
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "CPF",
                        style = MaterialTheme.typography.labelMedium,
                        color = OnSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = cpf,
                        onValueChange = { cpf = it },
                        placeholder = { Text("000.000.000-00", color = OutlineColor) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Badge,
                                contentDescription = null,
                                tint = OutlineColor
                            )
                        },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFFF1F5F9),
                            unfocusedContainerColor = Color(0xFFF1F5F9),
                            focusedBorderColor = PrimaryNavy,
                            unfocusedBorderColor = OutlineVariant
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("cpf_input")
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Password Field
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Senha",
                        style = MaterialTheme.typography.labelMedium,
                        color = OnSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = senha,
                        onValueChange = { senha = it },
                        placeholder = { Text("••••••••", color = OutlineColor) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = null,
                                tint = OutlineColor
                            )
                        },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFFF1F5F9),
                            unfocusedContainerColor = Color(0xFFF1F5F9),
                            focusedBorderColor = PrimaryNavy,
                            unfocusedBorderColor = OutlineVariant
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("password_input")
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

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
                        text = "Esqueci minha senha",
                        style = MaterialTheme.typography.bodyMedium,
                        color = PrimaryNavy,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 13.sp,
                        modifier = Modifier.clickable { }
                    )
                }

                if (errorMessage.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = errorMessage,
                        style = MaterialTheme.typography.bodyMedium,
                        color = ErrorRed
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Login Button
                Button(
                    onClick = {
                        if (cpf.isBlank()) {
                            errorMessage = "Informe seu CPF para continuar"
                        } else {
                            onLoginSuccess(cpf, senha, rememberAccess)
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SecondaryOrangeContainer),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                        .testTag("login_button")
                ) {
                    Text(
                        text = "ENTRAR",
                        style = MaterialTheme.typography.titleMedium,
                        color = SurfaceContainerLowest,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
