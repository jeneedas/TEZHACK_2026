package com.example.ziva.presentation.ui.resources

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Accessible
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.LocalDrink
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.NightShelter
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.ViewList
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.ZivaAccent
import com.example.ui.theme.ZivaBackground
import com.example.ui.theme.ZivaBlueTint
import com.example.ui.theme.ZivaCardBorder
import com.example.ui.theme.ZivaCardBorderSubtle
import com.example.ui.theme.ZivaCyanTint
import com.example.ui.theme.ZivaPrimary
import com.example.ui.theme.ZivaSecondary
import com.example.ui.theme.ZivaSuccess
import com.example.ui.theme.ZivaSurface
import com.example.ui.theme.ZivaSurfaceVariant
import com.example.ui.theme.ZivaText
import com.example.ui.theme.ZivaWarning
import com.example.ziva.data.local.ResourceEntity
import com.example.ziva.data.local.VolunteerEntity
import com.example.ziva.presentation.component.CustomMapCanvas
import com.example.ziva.presentation.component.FreshnessBadge
import com.example.ziva.presentation.viewmodel.ZivaUiState

@Composable
fun ResourceListMapScreen(
    uiState: ZivaUiState,
    resources: List<ResourceEntity>,
    volunteers: List<VolunteerEntity>,
    onSelectCategory: (String) -> Unit,
    onToggleFreshOnly: () -> Unit,
    onToggleMapView: (Boolean) -> Unit,
    onSelectResource: (ResourceEntity) -> Unit,
    onSelectVolunteer: (VolunteerEntity) -> Unit,
    getString: (String) -> String
) {
    var subTab by remember { mutableIntStateOf(0) } // 0: Verified Resources, 1: Nearby Volunteers

    val categories = listOf("ALL", "WATER", "FOOD", "MEDICINE", "SHELTER")

    val filteredResources = resources.filter { res ->
        val matchesCategory = uiState.selectedResourceCategory == "ALL" || res.type == uiState.selectedResourceCategory
        val minutesAgo = (System.currentTimeMillis() - res.lastUpdated) / (60 * 1000)
        val matchesFresh = !uiState.onlyFreshResources || minutesAgo <= 30
        matchesCategory && matchesFresh
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ZivaBackground)
            .padding(top = 12.dp)
    ) {
        // Sub-Tab Switcher: Resources vs Volunteers
        TabRow(
            selectedTabIndex = subTab,
            containerColor = ZivaBackground,
            contentColor = ZivaPrimary,
            indicator = { tabPositions ->
                TabRowDefaults.SecondaryIndicator(
                    modifier = Modifier.tabIndicatorOffset(tabPositions[subTab]),
                    color = ZivaPrimary
                )
            },
            modifier = Modifier.padding(horizontal = 16.dp)
        ) {
            Tab(
                selected = subTab == 0,
                onClick = { subTab = 0 },
                text = {
                    Text(
                        text = "Verified Resources (${resources.size})",
                        fontWeight = if (subTab == 0) FontWeight.Bold else FontWeight.Normal,
                        color = if (subTab == 0) ZivaText else ZivaSecondary,
                        fontSize = 13.sp
                    )
                }
            )
            Tab(
                selected = subTab == 1,
                onClick = { subTab = 1 },
                text = {
                    Text(
                        text = "Volunteers (${volunteers.size})",
                        fontWeight = if (subTab == 1) FontWeight.Bold else FontWeight.Normal,
                        color = if (subTab == 1) ZivaText else ZivaSecondary,
                        fontSize = 13.sp
                    )
                }
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        if (subTab == 0) {
            // RESOURCE DISCOVERY VIEW
            // Filter Bar & Map Toggle
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Fresh filter toggle chip
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (uiState.onlyFreshResources) ZivaSuccess.copy(alpha = 0.2f) else ZivaSurface)
                        .border(
                            1.dp,
                            if (uiState.onlyFreshResources) ZivaSuccess else ZivaCardBorder,
                            RoundedCornerShape(8.dp)
                        )
                        .clickable { onToggleFreshOnly() }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                        .testTag("fresh_only_filter_chip")
                ) {
                    if (uiState.onlyFreshResources) {
                        Icon(Icons.Default.Check, contentDescription = null, tint = ZivaSuccess, modifier = Modifier.size(12.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                    }
                    Text(
                        text = "Fresh Only (<=30m)",
                        color = if (uiState.onlyFreshResources) ZivaSuccess else ZivaSecondary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                // View Toggle: List vs Map
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(ZivaSurface)
                        .padding(2.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(if (!uiState.isResourceMapView) ZivaPrimary else Color.Transparent)
                            .clickable { onToggleMapView(false) }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                            .testTag("list_view_toggle")
                    ) {
                        Icon(Icons.Default.ViewList, contentDescription = "List View", tint = Color.White, modifier = Modifier.size(16.dp))
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(if (uiState.isResourceMapView) ZivaPrimary else Color.Transparent)
                            .clickable { onToggleMapView(true) }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                            .testTag("map_view_toggle")
                    ) {
                        Icon(Icons.Default.Map, contentDescription = "Map View", tint = Color.White, modifier = Modifier.size(16.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Category Chips (ALL, WATER, FOOD, MEDICINE, SHELTER)
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(categories) { cat ->
                    val isSelected = uiState.selectedResourceCategory == cat
                    val chipBg = if (isSelected) ZivaBlueTint else ZivaSurface
                    val chipBorder = if (isSelected) ZivaPrimary else ZivaCardBorderSubtle
                    val chipTextColor = if (isSelected) ZivaPrimary else ZivaSecondary

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(14.dp))
                            .background(chipBg)
                            .border(1.dp, chipBorder, RoundedCornerShape(14.dp))
                            .clickable { onSelectCategory(cat) }
                            .padding(horizontal = 14.dp, vertical = 7.dp)
                            .testTag("category_chip_${cat.lowercase()}")
                    ) {
                        Text(
                            text = cat,
                            color = chipTextColor,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (uiState.isResourceMapView) {
                // Interactive Offline Vector Map View
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp)
                ) {
                    Text(
                        text = "Interactive Disaster Grid Map",
                        color = ZivaSecondary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    CustomMapCanvas(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(280.dp),
                        userPos = Pair(0.5f, 0.65f),
                        resources = filteredResources,
                        onMarkerClick = {
                            if (filteredResources.isNotEmpty()) {
                                onSelectResource(filteredResources.first())
                            }
                        }
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Showing ${filteredResources.size} verified relief points",
                        color = ZivaText,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(filteredResources) { res ->
                            ResourceCardItem(
                                resource = res,
                                onClick = { onSelectResource(res) }
                            )
                        }
                    }
                }
            } else {
                // List View
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(filteredResources) { res ->
                        ResourceCardItem(
                            resource = res,
                            onClick = { onSelectResource(res) }
                        )
                    }
                    item {
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            }
        } else {
            // VOLUNTEERS DISCOVERY VIEW
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item {
                    Text(
                        text = "Verified Nearby Volunteers & First Responders",
                        color = ZivaSecondary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                }

                items(volunteers) { vol ->
                    VolunteerCardItem(
                        volunteer = vol,
                        onClick = { onSelectVolunteer(vol) }
                    )
                }
                item {
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}

@Composable
fun ResourceCardItem(
    resource: ResourceEntity,
    onClick: () -> Unit
) {
    val minutesAgo = ((System.currentTimeMillis() - resource.lastUpdated) / (60 * 1000)).coerceAtLeast(0)

    val icon = when (resource.type) {
        "WATER" -> Icons.Default.LocalDrink
        "FOOD" -> Icons.Default.Restaurant
        "MEDICINE" -> Icons.Default.LocalHospital
        else -> Icons.Default.NightShelter
    }

    val typeColor = when (resource.type) {
        "WATER" -> Color(0xFF38BDF8)
        "FOOD" -> Color(0xFFFBBF24)
        "MEDICINE" -> Color(0xFFF43F5E)
        else -> Color(0xFFA855F7)
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = ZivaSurface),
        shape = RoundedCornerShape(20.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, ZivaCardBorderSubtle),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .testTag("resource_item_${resource.resourceId}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(typeColor.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = icon, contentDescription = resource.type, tint = typeColor, modifier = Modifier.size(22.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = resource.type,
                            color = typeColor,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = resource.name,
                            color = ZivaText,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1
                        )
                    }
                }

                // Mandatory: Availability chip using Primary #3B82F6
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(ZivaPrimary)
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(
                        text = "${resource.availability} ${resource.unit.take(5)}",
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Accessibility & Freshness
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Accessible,
                        contentDescription = "Accessibility",
                        tint = ZivaAccent,
                        modifier = Modifier.size(13.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = resource.accessibility,
                        color = ZivaText,
                        fontSize = 11.sp
                    )
                }

                FreshnessBadge(minutesAgo = minutesAgo)
            }
        }
    }
}

@Composable
fun VolunteerCardItem(
    volunteer: VolunteerEntity,
    onClick: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = ZivaSurface),
        shape = RoundedCornerShape(20.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, ZivaCardBorderSubtle),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .testTag("volunteer_item_${volunteer.volunteerId}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(ZivaCyanTint),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = Icons.Default.Person, contentDescription = "Volunteer", tint = ZivaAccent, modifier = Modifier.size(22.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = volunteer.name,
                            color = ZivaText,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${volunteer.distanceKm} km away • ${volunteer.badge}",
                            color = ZivaSecondary,
                            fontSize = 11.sp
                        )
                    }
                }

                // Availability tag
                val isAvail = volunteer.availability == "AVAILABLE"
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (isAvail) ZivaPrimary.copy(alpha = 0.2f) else ZivaWarning.copy(alpha = 0.2f))
                        .padding(horizontal = 9.dp, vertical = 5.dp)
                ) {
                    Text(
                        text = volunteer.availability,
                        color = if (isAvail) ZivaPrimary else ZivaWarning,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Skills: ${volunteer.skills}",
                color = ZivaText,
                fontSize = 12.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                Button(
                    onClick = onClick,
                    colors = ButtonDefaults.buttonColors(containerColor = ZivaPrimary),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.height(34.dp)
                ) {
                    Icon(Icons.Default.Phone, contentDescription = "Call", tint = Color.White, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Contact Volunteer", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
