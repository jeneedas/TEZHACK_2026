package com.example.ziva.presentation.ui.roles

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.VolunteerActivism
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import com.example.ui.theme.ZivaAccent
import com.example.ui.theme.ZivaBackground
import com.example.ui.theme.ZivaPrimary
import com.example.ui.theme.ZivaSecondary
import com.example.ui.theme.ZivaSurface
import com.example.ui.theme.ZivaSurfaceVariant
import com.example.ui.theme.ZivaText
import com.example.ziva.data.local.SosRequestEntity

@Composable
fun RoleHubScreen(
    sosRequests: List<SosRequestEntity>,
    onExit: () -> Unit
) {

    var selectedRole by remember { mutableStateOf("SELECT") }

    when (selectedRole) {

        "SELECT" -> {
            RoleSelectionScreen(
                onVolunteer = {
                    selectedRole = "VOLUNTEER"
                },
                onProvider = {
                    selectedRole = "PROVIDER"
                },
                onCitizen = onExit
            )
        }

        "VOLUNTEER" -> {
            VolunteerDashboardScreen(
                sosRequests = sosRequests,
                onBack = {
                    selectedRole = "SELECT"
                }
            )
        }

        "PROVIDER" -> {
            ProviderDashboardScreen(
                sosRequests = sosRequests,
                onBack = {
                    selectedRole = "SELECT"
                }
            )
        }
    }
}


// ================================================================
// ROLE SELECTION
// ================================================================

@Composable
private fun RoleSelectionScreen(
    onVolunteer: () -> Unit,
    onProvider: () -> Unit,
    onCitizen: () -> Unit
) {

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ZivaBackground)
            .padding(20.dp)
    ) {

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "ZIVA",
            color = ZivaPrimary,
            fontSize = 30.sp,
            fontWeight = FontWeight.Black
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = "Choose your role",
            color = ZivaText,
            fontSize = 23.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "One platform. Every responder.",
            color = ZivaSecondary,
            fontSize = 13.sp
        )

        Spacer(modifier = Modifier.height(20.dp))

        ZivaBotCard()

        Spacer(modifier = Modifier.height(20.dp))

        RoleCard(
            title = "VOLUNTEER",
            description = "I want to help people nearby",
            icon = Icons.Default.VolunteerActivism,
            buttonText = "ENTER VOLUNTEER MODE",
            onClick = onVolunteer
        )

        Spacer(modifier = Modifier.height(16.dp))

        RoleCard(
            title = "SERVICE PROVIDER",
            description = "SDRF • NDRF • Boats • Ambulances • Helicopters",
            icon = Icons.Default.LocalShipping,
            buttonText = "ENTER RESPONSE MODE",
            onClick = onProvider
        )

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = onCitizen,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = ZivaSurfaceVariant
            )
        ) {
            Text(
                text = "BACK TO CITIZEN APP",
                color = ZivaText,
                fontWeight = FontWeight.Bold
            )
        }
    }
}


// ================================================================
// ZIVABOT
// ================================================================

@Composable
private fun ZivaBotCard() {

    val context = LocalContext.current

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = ZivaSurface
        )
    ) {

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {

            Box(
                modifier = Modifier
                    .size(50.dp)
                    .clip(RoundedCornerShape(15.dp))
                    .background(
                        ZivaPrimary.copy(alpha = 0.14f)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.SmartToy,
                    contentDescription = "ZivaBot",
                    tint = ZivaPrimary,
                    modifier = Modifier.size(28.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(
                modifier = Modifier.weight(1f)
            ) {

                Text(
                    text = "ZivaBot",
                    color = ZivaText,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black
                )

                Spacer(modifier = Modifier.height(3.dp))

                Text(
                    text = "AI disaster assistant on Telegram",
                    color = ZivaSecondary,
                    fontSize = 10.sp
                )
            }

            Button(
                onClick = {
                    openZivaBot(context)
                },
                shape = RoundedCornerShape(11.dp),
                contentPadding = PaddingValues(
                    horizontal = 12.dp,
                    vertical = 8.dp
                )
            ) {
                Icon(
                    imageVector = Icons.Default.SmartToy,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )

                Spacer(modifier = Modifier.width(5.dp))

                Text(
                    text = "CHAT",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

private fun openZivaBot(context: Context) {

    val botUri = Uri.parse(
        "https://t.me/Ziva_DisasterBot"
    )

    try {
        val telegramIntent = Intent(
            Intent.ACTION_VIEW,
            botUri
        ).apply {
            setPackage("org.telegram.messenger")
        }

        context.startActivity(telegramIntent)

    } catch (_: ActivityNotFoundException) {

        val browserIntent = Intent(
            Intent.ACTION_VIEW,
            botUri
        )

        context.startActivity(browserIntent)
    }
}


// ================================================================
// ROLE CARD
// ================================================================

@Composable
private fun RoleCard(
    title: String,
    description: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    buttonText: String,
    onClick: () -> Unit
) {

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(
            containerColor = ZivaSurface
        )
    ) {

        Column(
            modifier = Modifier.padding(20.dp)
        ) {

            Box(
                modifier = Modifier
                    .size(58.dp)
                    .clip(CircleShape)
                    .background(
                        ZivaPrimary.copy(alpha = 0.14f)
                    ),
                contentAlignment = Alignment.Center
            ) {

                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = ZivaPrimary,
                    modifier = Modifier.size(30.dp)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = title,
                color = ZivaText,
                fontSize = 18.sp,
                fontWeight = FontWeight.Black
            )

            Spacer(modifier = Modifier.height(5.dp))

            Text(
                text = description,
                color = ZivaSecondary,
                fontSize = 12.sp
            )

            Spacer(modifier = Modifier.height(15.dp))

            Button(
                onClick = onClick,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            ) {

                Text(
                    text = buttonText,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}


// ================================================================
// VOLUNTEER DASHBOARD
// ================================================================

@Composable
private fun VolunteerDashboardScreen(
    sosRequests: List<SosRequestEntity>,
    onBack: () -> Unit
) {

    var isAvailable by remember { mutableStateOf(true) }
    var acceptedRequestId by remember { mutableStateOf<String?>(null) }

    val activeRequests = sosRequests.filter {
        it.status != "RESOLVED"
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ZivaBackground)
    ) {

        // HEADER

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(
                    horizontal = 16.dp,
                    vertical = 14.dp
                ),
            verticalAlignment = Alignment.CenterVertically
        ) {

            IconButton(
                onClick = onBack
            ) {

                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = ZivaText
                )
            }

            Column(
                modifier = Modifier.weight(1f)
            ) {

                Text(
                    text = "VOLUNTEER MODE",
                    color = ZivaText,
                    fontSize = 19.sp,
                    fontWeight = FontWeight.Black
                )

                Text(
                    text = "Nearby disaster assistance",
                    color = ZivaSecondary,
                    fontSize = 11.sp
                )
            }

            Text(
                text = if (isAvailable)
                    "● AVAILABLE"
                else
                    "○ OFFLINE",
                color = if (isAvailable)
                    ZivaAccent
                else
                    ZivaSecondary,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
            )
        }

        // AVAILABILITY

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            colors = CardDefaults.cardColors(
                containerColor = ZivaSurface
            ),
            shape = RoundedCornerShape(18.dp)
        ) {

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(15.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {

                Icon(
                    imageVector = Icons.Default.VolunteerActivism,
                    contentDescription = null,
                    tint = ZivaPrimary,
                    modifier = Modifier.size(32.dp)
                )

                Spacer(modifier = Modifier.width(12.dp))

                Column(
                    modifier = Modifier.weight(1f)
                ) {

                    Text(
                        text = "I CAN HELP",
                        color = ZivaText,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Text(
                        text = "Receive nearby emergency requests",
                        color = ZivaSecondary,
                        fontSize = 11.sp
                    )
                }

                Button(
                    onClick = {
                        isAvailable = !isAvailable
                    },
                    shape = RoundedCornerShape(10.dp)
                ) {

                    Text(
                        text = if (isAvailable) "ON" else "OFF",
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        Text(
            text = "NEARBY SOS REQUESTS • ${activeRequests.size}",
            color = ZivaSecondary,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(8.dp))

        if (activeRequests.isEmpty()) {

            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {

                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = ZivaAccent,
                        modifier = Modifier.size(52.dp)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "No active requests nearby",
                        color = ZivaText,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

        } else {

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {

                items(activeRequests) { request ->

                    VolunteerRequestCard(
                        request = request,
                        accepted =
                            acceptedRequestId == request.requestId,
                        enabled = isAvailable,
                        onAccept = {
                            acceptedRequestId = request.requestId
                        }
                    )
                }
            }
        }
    }
}


// ================================================================
// VOLUNTEER REQUEST CARD
// ================================================================

@Composable
private fun VolunteerRequestCard(
    request: SosRequestEntity,
    accepted: Boolean,
    enabled: Boolean,
    onAccept: () -> Unit
) {

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = ZivaSurface
        ),
        shape = RoundedCornerShape(20.dp)
    ) {

        Column(
            modifier = Modifier.padding(16.dp)
        ) {

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {

                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFFF5252))
                )

                Spacer(modifier = Modifier.width(8.dp))

                Text(
                    text = "EMERGENCY REQUEST",
                    color = Color(0xFFFF5252),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black
                )

                Spacer(modifier = Modifier.weight(1f))

                Text(
                    text = "2.4 km",
                    color = ZivaAccent,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = request.emergencyType
                    .replace("_", " "),
                color = ZivaText,
                fontSize = 18.sp,
                fontWeight = FontWeight.Black
            )

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {

                Icon(
                    imageVector = Icons.Default.LocationOn,
                    contentDescription = null,
                    tint = ZivaSecondary,
                    modifier = Modifier.size(16.dp)
                )

                Spacer(modifier = Modifier.width(4.dp))

                Text(
                    text = "Emergency location",
                    color = ZivaSecondary,
                    fontSize = 11.sp
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Status: ${request.status}",
                color = ZivaSecondary,
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            if (accepted) {

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            ZivaAccent.copy(alpha = 0.12f)
                        )
                        .padding(14.dp)
                ) {

                    Column {

                        Text(
                            text = "✓ YOU ACCEPTED THIS REQUEST",
                            color = ZivaAccent,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(5.dp))

                        Text(
                            text = "Recommended route • 2.4 km • ETA 8 min",
                            color = ZivaText,
                            fontSize = 11.sp
                        )
                    }
                }

            } else {

                Button(
                    onClick = onAccept,
                    enabled = enabled,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {

                    Icon(
                        imageVector = Icons.Default.DirectionsCar,
                        contentDescription = null
                    )

                    Spacer(modifier = Modifier.width(7.dp))

                    Text(
                        text = if (enabled)
                            "YES, I'LL HELP"
                        else
                            "SET YOURSELF AVAILABLE",
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}


// ================================================================
// SERVICE PROVIDER DASHBOARD
// ================================================================

@Composable
private fun ProviderDashboardScreen(
    sosRequests: List<SosRequestEntity>,
    onBack: () -> Unit
) {

    var dispatchedRequestId by remember {
        mutableStateOf<String?>(null)
    }

    val incidents = sosRequests.filter {
        it.status != "RESOLVED"
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ZivaBackground)
    ) {

        // HEADER

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(
                    horizontal = 16.dp,
                    vertical = 14.dp
                ),
            verticalAlignment = Alignment.CenterVertically
        ) {

            IconButton(
                onClick = onBack
            ) {

                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = ZivaText
                )
            }

            Column(
                modifier = Modifier.weight(1f)
            ) {

                Text(
                    text = "RESPONSE COMMAND",
                    color = ZivaText,
                    fontSize = 19.sp,
                    fontWeight = FontWeight.Black
                )

                Text(
                    text = "SDRF • NDRF • Emergency Services",
                    color = ZivaSecondary,
                    fontSize = 11.sp
                )
            }

            Text(
                text = "● OPERATIONAL",
                color = ZivaAccent,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
            )
        }

        // STATS

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {

            ProviderStat(
                value = incidents.size.toString(),
                label = "INCIDENTS",
                modifier = Modifier.weight(1f)
            )

            ProviderStat(
                value = "12",
                label = "UNITS",
                modifier = Modifier.weight(1f)
            )

            ProviderStat(
                value = "31",
                label = "PEOPLE",
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(18.dp))

        Text(
            text = "ACTIVE INCIDENTS",
            color = ZivaSecondary,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(8.dp))

        if (incidents.isEmpty()) {

            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {

                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = ZivaAccent,
                        modifier = Modifier.size(50.dp)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "No active incidents",
                        color = ZivaText,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

        } else {

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {

                items(incidents) { request ->

                    ProviderIncidentCard(
                        request = request,
                        dispatched =
                            dispatchedRequestId == request.requestId,
                        onDispatch = {
                            dispatchedRequestId =
                                request.requestId
                        }
                    )
                }
            }
        }
    }
}


// ================================================================
// PROVIDER STAT
// ================================================================

@Composable
private fun ProviderStat(
    value: String,
    label: String,
    modifier: Modifier
) {

    Column(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(ZivaSurface)
            .padding(12.dp)
    ) {

        Text(
            text = value,
            color = ZivaPrimary,
            fontSize = 22.sp,
            fontWeight = FontWeight.Black
        )

        Text(
            text = label,
            color = ZivaSecondary,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold
        )
    }
}


// ================================================================
// PROVIDER INCIDENT
// ================================================================

@Composable
private fun ProviderIncidentCard(
    request: SosRequestEntity,
    dispatched: Boolean,
    onDispatch: () -> Unit
) {

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = ZivaSurface
        ),
        shape = RoundedCornerShape(20.dp)
    ) {

        Column(
            modifier = Modifier.padding(16.dp)
        ) {

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {

                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFFF5252))
                )

                Spacer(modifier = Modifier.width(8.dp))

                Text(
                    text = "CRITICAL INCIDENT",
                    color = Color(0xFFFF5252),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = request.emergencyType
                    .replace("_", " "),
                color = ZivaText,
                fontSize = 18.sp,
                fontWeight = FontWeight.Black
            )

            Spacer(modifier = Modifier.height(5.dp))

            Text(
                text = "Incident #${request.requestId.take(8)}",
                color = ZivaSecondary,
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            ProviderRequirement(
                icon = Icons.Default.DirectionsCar,
                title = "Nearest response unit",
                value = "Unit B-07 • 3.1 km • ETA 11 min"
            )

            ProviderRequirement(
                icon = Icons.Default.HealthAndSafety,
                title = "Required",
                value = "Rescue team + emergency equipment"
            )

            Spacer(modifier = Modifier.height(12.dp))

            if (dispatched) {

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            ZivaAccent.copy(alpha = 0.12f)
                        )
                        .padding(14.dp)
                ) {

                    Column {

                        Text(
                            text = "✓ UNIT B-07 DISPATCHED",
                            color = ZivaAccent,
                            fontWeight = FontWeight.Black,
                            fontSize = 12.sp
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "STATUS: EN ROUTE • ETA 11 MIN",
                            color = ZivaText,
                            fontSize = 11.sp
                        )
                    }
                }

            } else {

                Button(
                    onClick = onDispatch,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {

                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = null
                    )

                    Spacer(modifier = Modifier.width(7.dp))

                    Text(
                        text = "DISPATCH UNIT B-07",
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}


// ================================================================
// PROVIDER REQUIREMENT
// ================================================================

@Composable
private fun ProviderRequirement(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    value: String
) {

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 5.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {

        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = ZivaPrimary,
            modifier = Modifier.size(19.dp)
        )

        Spacer(modifier = Modifier.width(10.dp))

        Column {

            Text(
                text = title,
                color = ZivaSecondary,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = value,
                color = ZivaText,
                fontSize = 11.sp
            )
        }
    }
}
