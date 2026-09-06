package com.example.ziva.presentation.ui.resources

import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
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
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

import com.example.ui.theme.ZivaBackground
import com.example.ui.theme.ZivaBlueTint
import com.example.ui.theme.ZivaCardBorderSubtle
import com.example.ui.theme.ZivaPrimary
import com.example.ui.theme.ZivaSecondary
import com.example.ui.theme.ZivaSurface
import com.example.ui.theme.ZivaText

import com.example.ziva.data.local.ResourceEntity
import com.example.ziva.data.local.VolunteerEntity
import com.example.ziva.presentation.viewmodel.ZivaUiState


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResourceListMapScreen(
    uiState: ZivaUiState,
    resources: List<ResourceEntity>,
    volunteers: List<VolunteerEntity>,
    savedResourceIds: Set<String>,
    onToggleSaved: (String) -> Unit,
    onSelectCategory: (String) -> Unit,
    onToggleFreshOnly: () -> Unit,
    onToggleMapView: (Boolean) -> Unit,
    onSelectResource: (ResourceEntity) -> Unit,
    onSelectVolunteer: (VolunteerEntity) -> Unit,
    getString: (String) -> String
) {

    var selectedTab by remember { mutableIntStateOf(0) }

    // IMPORTANT:
    // Local state controls the map immediately.
    // This avoids depending on ViewModel recomposition for the map toggle.
    var showMap by remember {
        mutableStateOf(uiState.isResourceMapView)
    }

    val categories = listOf(
        "ALL",
        "WATER",
        "FOOD",
        "MEDICINE",
        "SHELTER"
    )

    val filteredResources = resources.filter { resource ->

        val categoryMatches =
            uiState.selectedResourceCategory == "ALL" ||
                    resource.type.equals(
                        uiState.selectedResourceCategory,
                        ignoreCase = true
                    )

        val minutesAgo =
            ((System.currentTimeMillis() - resource.lastUpdated)
                    / 60000L)
                .coerceAtLeast(0L)

        val freshnessMatches =
            !uiState.onlyFreshResources || minutesAgo <= 30

        categoryMatches && freshnessMatches
    }

    val savedResources =
        resources.filter {
            it.resourceId in savedResourceIds
        }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ZivaBackground)
            .padding(top = 8.dp)
    ) {

        // =========================================================
        // TABS
        // =========================================================

        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = ZivaBackground,
            contentColor = ZivaPrimary
        ) {

            Tab(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                text = {
                    Text(
                        text = "Resources (${resources.size})",
                        fontSize = 12.sp,
                        fontWeight =
                            if (selectedTab == 0)
                                FontWeight.Bold
                            else
                                FontWeight.Normal
                    )
                }
            )

            Tab(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                text = {
                    Text(
                        text = "Saved (${savedResources.size})",
                        fontSize = 12.sp,
                        fontWeight =
                            if (selectedTab == 1)
                                FontWeight.Bold
                            else
                                FontWeight.Normal
                    )
                }
            )

            Tab(
                selected = selectedTab == 2,
                onClick = { selectedTab = 2 },
                text = {
                    Text(
                        text = "Volunteers (${volunteers.size})",
                        fontSize = 12.sp,
                        fontWeight =
                            if (selectedTab == 2)
                                FontWeight.Bold
                            else
                                FontWeight.Normal
                    )
                }
            )
        }

        Spacer(modifier = Modifier.height(10.dp))


        // =========================================================
        // RESOURCES TAB
        // =========================================================

        if (selectedTab == 0) {

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {

                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {

                    Icon(
                        imageVector = Icons.Default.FilterList,
                        contentDescription = "Filter",
                        tint = ZivaSecondary,
                        modifier = Modifier.size(18.dp)
                    )

                    Spacer(modifier = Modifier.width(6.dp))

                    Text(
                        text = "Relief Resources",
                        color = ZivaText,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                FilterChip(
                    selected = uiState.onlyFreshResources,
                    onClick = onToggleFreshOnly,
                    label = {
                        Text(
                            text = "Fresh only",
                            fontSize = 11.sp
                        )
                    }
                )
            }

            Spacer(modifier = Modifier.height(8.dp))


            // =====================================================
            // LIST / MAP TOGGLE
            // =====================================================

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.End
            ) {

                // LIST BUTTON
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(
                            if (!showMap)
                                ZivaPrimary
                            else
                                ZivaSurface
                        )
                        .clickable {

                            showMap = false

                            // Keep ViewModel state in sync too.
                            onToggleMapView(false)
                        }
                        .padding(
                            horizontal = 10.dp,
                            vertical = 7.dp
                        )
                ) {

                    Icon(
                        imageVector = Icons.Default.ViewList,
                        contentDescription = "List View",
                        tint =
                            if (!showMap)
                                Color.White
                            else
                                ZivaSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }

                Spacer(modifier = Modifier.width(6.dp))

                // MAP BUTTON
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(
                            if (showMap)
                                ZivaPrimary
                            else
                                ZivaSurface
                        )
                        .clickable {

                            // THIS DIRECTLY OPENS THE MAP.
                            showMap = true

                            // Keep ViewModel state in sync too.
                            onToggleMapView(true)
                        }
                        .padding(
                            horizontal = 10.dp,
                            vertical = 7.dp
                        )
                ) {

                    Icon(
                        imageVector = Icons.Default.Map,
                        contentDescription = "Map View",
                        tint =
                            if (showMap)
                                Color.White
                            else
                                ZivaSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))


            // =====================================================
            // CATEGORY FILTERS
            // =====================================================

            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                contentPadding =
                    PaddingValues(horizontal = 16.dp),
                horizontalArrangement =
                    Arrangement.spacedBy(8.dp)
            ) {

                items(categories) { category ->

                    val selected =
                        uiState.selectedResourceCategory
                            .equals(
                                category,
                                ignoreCase = true
                            )

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                if (selected)
                                    ZivaBlueTint
                                else
                                    ZivaSurface
                            )
                            .border(
                                width = 1.dp,
                                color =
                                    if (selected)
                                        ZivaPrimary
                                    else
                                        ZivaCardBorderSubtle,
                                shape =
                                    RoundedCornerShape(16.dp)
                            )
                            .clickable {
                                onSelectCategory(category)
                            }
                            .padding(
                                horizontal = 14.dp,
                                vertical = 7.dp
                            )
                    ) {

                        Text(
                            text = category,
                            color =
                                if (selected)
                                    ZivaPrimary
                                else
                                    ZivaSecondary,
                            fontSize = 11.sp,
                            fontWeight =
                                if (selected)
                                    FontWeight.Bold
                                else
                                    FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))


            // =====================================================
            // MAP VIEW
            // =====================================================

            if (showMap) {

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp)
                ) {

                    // ACTUAL OFFLINE MAP
                    ZivaDisasterMap(
                        resources = filteredResources,
                        onMarkerClick = {

                            if (filteredResources.isNotEmpty()) {

                                onSelectResource(
                                    filteredResources.first()
                                )
                            }
                        }
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text =
                            "${filteredResources.size} verified relief points",
                        color = ZivaText,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Resource list below map
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement =
                            Arrangement.spacedBy(10.dp)
                    ) {

                        items(
                            filteredResources,
                            key = { it.resourceId }
                        ) { resource ->

                            ResourceCardItem(
                                resource = resource,
                                isSaved =
                                    resource.resourceId
                                            in savedResourceIds,
                                onToggleSaved = {
                                    onToggleSaved(
                                        resource.resourceId
                                    )
                                },
                                onClick = {
                                    onSelectResource(resource)
                                }
                            )
                        }

                        item {
                            Spacer(
                                modifier =
                                    Modifier.height(20.dp)
                            )
                        }
                    }
                }

            } else {

                // =================================================
                // LIST VIEW
                // =================================================

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement =
                        Arrangement.spacedBy(10.dp)
                ) {

                    items(
                        filteredResources,
                        key = { it.resourceId }
                    ) { resource ->

                        ResourceCardItem(
                            resource = resource,
                            isSaved =
                                resource.resourceId
                                        in savedResourceIds,
                            onToggleSaved = {
                                onToggleSaved(
                                    resource.resourceId
                                )
                            },
                            onClick = {
                                onSelectResource(resource)
                            }
                        )
                    }

                    item {
                        Spacer(
                            modifier =
                                Modifier.height(20.dp)
                        )
                    }
                }
            }


            // =========================================================
            // SAVED TAB
            // =========================================================

        } else if (selectedTab == 1) {

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp)
            ) {

                Text(
                    text = "Saved for Later",
                    color = ZivaText,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text =
                        "Important relief records you've bookmarked",
                    color = ZivaSecondary,
                    fontSize = 11.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                if (savedResources.isEmpty()) {

                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {

                        Column(
                            horizontalAlignment =
                                Alignment.CenterHorizontally
                        ) {

                            Icon(
                                imageVector =
                                    Icons.Default.BookmarkBorder,
                                contentDescription = null,
                                tint = ZivaSecondary,
                                modifier = Modifier.size(50.dp)
                            )

                            Spacer(
                                modifier =
                                    Modifier.height(10.dp)
                            )

                            Text(
                                text =
                                    "No saved resources yet",
                                color = ZivaText,
                                fontWeight =
                                    FontWeight.Bold,
                                fontSize = 16.sp
                            )

                            Spacer(
                                modifier =
                                    Modifier.height(5.dp)
                            )

                            Text(
                                text =
                                    "Bookmark important relief records\nso you can find them quickly.",
                                color = ZivaSecondary,
                                fontSize = 12.sp
                            )
                        }
                    }

                } else {

                    LazyColumn(
                        verticalArrangement =
                            Arrangement.spacedBy(10.dp)
                    ) {

                        items(
                            savedResources,
                            key = { it.resourceId }
                        ) { resource ->

                            ResourceCardItem(
                                resource = resource,
                                isSaved = true,
                                onToggleSaved = {
                                    onToggleSaved(
                                        resource.resourceId
                                    )
                                },
                                onClick = {
                                    onSelectResource(resource)
                                }
                            )
                        }

                        item {
                            Spacer(
                                modifier =
                                    Modifier.height(20.dp)
                            )
                        }
                    }
                }
            }


            // =========================================================
            // VOLUNTEERS TAB
            // =========================================================

        } else {

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement =
                    Arrangement.spacedBy(10.dp)
            ) {

                item {

                    Text(
                        text =
                            "Verified Nearby Volunteers & First Responders",
                        color = ZivaText,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(
                        modifier =
                            Modifier.height(4.dp)
                    )

                    Text(
                        text =
                            "People available to assist during emergencies",
                        color = ZivaSecondary,
                        fontSize = 11.sp
                    )

                    Spacer(
                        modifier =
                            Modifier.height(8.dp)
                    )
                }

                items(
                    volunteers,
                    key = { it.volunteerId }
                ) { volunteer ->

                    VolunteerCardItem(
                        volunteer = volunteer,
                        onClick = {
                            onSelectVolunteer(volunteer)
                        }
                    )
                }

                item {
                    Spacer(
                        modifier =
                            Modifier.height(20.dp)
                    )
                }
            }
        }
    }
}


// =================================================================
// OFFLINE DISASTER MAP
// =================================================================

@Composable
private fun ZivaDisasterMap(
    resources: List<ResourceEntity>,
    onMarkerClick: () -> Unit
) {

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(250.dp),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFFE8F0E8)
        ),
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            ZivaCardBorderSubtle
        )
    ) {

        Box(
            modifier = Modifier
                .fillMaxSize()
                .clickable {

                    if (resources.isNotEmpty()) {
                        onMarkerClick()
                    }
                }
        ) {

            Canvas(
                modifier = Modifier.fillMaxSize()
            ) {

                val gridColor =
                    Color(0xFFD0DDD0)

                val roadColor =
                    Color.White

                // =================================================
                // MAP GRID
                // =================================================

                for (i in 1..9) {

                    val x =
                        size.width * i / 10f

                    drawLine(
                        color = gridColor,
                        start = Offset(x, 0f),
                        end = Offset(
                            x,
                            size.height
                        ),
                        strokeWidth = 2f
                    )

                    val y =
                        size.height * i / 10f

                    drawLine(
                        color = gridColor,
                        start = Offset(0f, y),
                        end = Offset(
                            size.width,
                            y
                        ),
                        strokeWidth = 2f
                    )
                }


                // =================================================
                // ROADS
                // =================================================

                drawLine(
                    color = roadColor,
                    start = Offset(
                        0f,
                        size.height * 0.35f
                    ),
                    end = Offset(
                        size.width,
                        size.height * 0.55f
                    ),
                    strokeWidth = 22f
                )

                drawLine(
                    color = roadColor,
                    start = Offset(
                        size.width * 0.25f,
                        0f
                    ),
                    end = Offset(
                        size.width * 0.65f,
                        size.height
                    ),
                    strokeWidth = 18f
                )

                // =================================================
                // SECONDARY ROADS
                // =================================================

                drawLine(
                    color = roadColor,
                    start = Offset(
                        0f,
                        size.height * 0.78f
                    ),
                    end = Offset(
                        size.width * 0.85f,
                        size.height * 0.15f
                    ),
                    strokeWidth = 10f
                )

                drawLine(
                    color = roadColor,
                    start = Offset(
                        size.width * 0.72f,
                        0f
                    ),
                    end = Offset(
                        size.width * 0.45f,
                        size.height
                    ),
                    strokeWidth = 9f
                )


                // =================================================
                // RESOURCE MARKERS
                // =================================================

                resources.forEachIndexed { index, _ ->

                    val x =
                        size.width *
                                (
                                        0.12f +
                                                (index % 4) * 0.25f
                                        )

                    val y =
                        size.height *
                                (
                                        0.25f +
                                                ((index / 4) % 3) * 0.25f
                                        )

                    // Outer marker
                    drawCircle(
                        color =
                            Color(0xFFE85D75),
                        radius = 17f,
                        center =
                            Offset(x, y)
                    )

                    // Inner marker
                    drawCircle(
                        color = Color.White,
                        radius = 7f,
                        center =
                            Offset(x, y)
                    )
                }


                // =================================================
                // USER LOCATION
                // =================================================

                val userX =
                    size.width * 0.5f

                val userY =
                    size.height * 0.65f

                drawCircle(
                    color =
                        Color(0xFF2878D8),
                    radius = 20f,
                    center =
                        Offset(
                            userX,
                            userY
                        )
                )

                drawCircle(
                    color = Color.White,
                    radius = 8f,
                    center =
                        Offset(
                            userX,
                            userY
                        )
                )
            }


            // =====================================================
            // MAP TITLE
            // =====================================================

            Text(
                text = "LIVE DISASTER MAP",
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(12.dp),
                color = Color(0xFF26352B),
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
            )


            // =====================================================
            // USER LABEL
            // =====================================================

            Text(
                text = "● YOU",
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(12.dp),
                color = Color(0xFF2878D8),
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
            )


            // =====================================================
            // RESOURCE COUNT
            // =====================================================

            Text(
                text =
                    "${resources.size} relief points",
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(12.dp),
                color =
                    Color(0xFFE85D75),
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}


// =================================================================
// RESOURCE CARD
// =================================================================

@Composable
private fun ResourceCardItem(
    resource: ResourceEntity,
    isSaved: Boolean,
    onToggleSaved: () -> Unit,
    onClick: () -> Unit
) {

    val icon =
        when (resource.type.uppercase()) {

            "WATER" ->
                Icons.Default.LocalDrink

            "FOOD" ->
                Icons.Default.Restaurant

            "MEDICINE" ->
                Icons.Default.LocalHospital

            "SHELTER" ->
                Icons.Default.NightShelter

            else ->
                Icons.Default.LocalDrink
        }


    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable {
                onClick()
            },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = ZivaSurface
        ),
        border =
            androidx.compose.foundation.BorderStroke(
                1.dp,
                ZivaCardBorderSubtle
            )
    ) {

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment =
                Alignment.CenterVertically
        ) {

            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(
                        RoundedCornerShape(12.dp)
                    )
                    .background(
                        ZivaBlueTint
                    ),
                contentAlignment =
                    Alignment.Center
            ) {

                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = ZivaPrimary,
                    modifier =
                        Modifier.size(24.dp)
                )
            }


            Spacer(
                modifier =
                    Modifier.width(12.dp)
            )


            Column(
                modifier =
                    Modifier.weight(1f)
            ) {

                Text(
                    text = resource.name,
                    color = ZivaText,
                    fontSize = 14.sp,
                    fontWeight =
                        FontWeight.Bold
                )

                Spacer(
                    modifier =
                        Modifier.height(3.dp)
                )

                Text(
                    text = resource.type,
                    color = ZivaPrimary,
                    fontSize = 10.sp,
                    fontWeight =
                        FontWeight.Bold
                )

                Spacer(
                    modifier =
                        Modifier.height(3.dp)
                )

                Text(
                    text =
                        "${resource.availability} • ${resource.unit}",
                    color = ZivaSecondary,
                    fontSize = 11.sp
                )

                if (
                    resource.accessibility.isNotBlank()
                ) {

                    Spacer(
                        modifier =
                            Modifier.height(2.dp)
                    )

                    Text(
                        text =
                            resource.accessibility,
                        color =
                            ZivaSecondary,
                        fontSize = 10.sp
                    )
                }
            }


            // SAVE BUTTON

            IconButton(
                onClick = onToggleSaved
            ) {

                Icon(
                    imageVector =
                        if (isSaved)
                            Icons.Default.Bookmark
                        else
                            Icons.Default.BookmarkBorder,

                    contentDescription =
                        if (isSaved)
                            "Remove from saved"
                        else
                            "Save for later",

                    tint =
                        if (isSaved)
                            ZivaPrimary
                        else
                            ZivaSecondary
                )
            }
        }
    }
}


// =================================================================
// VOLUNTEER CARD
// =================================================================

@Composable
private fun VolunteerCardItem(
    volunteer: VolunteerEntity,
    onClick: () -> Unit
) {

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable {
                onClick()
            },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = ZivaSurface
        ),
        border =
            androidx.compose.foundation.BorderStroke(
                1.dp,
                ZivaCardBorderSubtle
            )
    ) {

        Column(
            modifier =
                Modifier.padding(14.dp)
        ) {

            Row(
                verticalAlignment =
                    Alignment.CenterVertically
            ) {

                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(
                            RoundedCornerShape(12.dp)
                        )
                        .background(
                            ZivaBlueTint
                        ),
                    contentAlignment =
                        Alignment.Center
                ) {

                    Icon(
                        imageVector =
                            Icons.Default.Person,
                        contentDescription = null,
                        tint = ZivaPrimary,
                        modifier =
                            Modifier.size(23.dp)
                    )
                }


                Spacer(
                    modifier =
                        Modifier.width(10.dp)
                )


                Column(
                    modifier =
                        Modifier.weight(1f)
                ) {

                    Text(
                        text = volunteer.name,
                        color = ZivaText,
                        fontSize = 14.sp,
                        fontWeight =
                            FontWeight.Bold
                    )

                    Spacer(
                        modifier =
                            Modifier.height(2.dp)
                    )

                    Text(
                        text = volunteer.badge,
                        color = ZivaPrimary,
                        fontSize = 10.sp,
                        fontWeight =
                            FontWeight.Bold
                    )
                }


                Text(
                    text =
                        "${volunteer.distanceKm} km",
                    color = ZivaSecondary,
                    fontSize = 10.sp
                )
            }


            Spacer(
                modifier =
                    Modifier.height(10.dp)
            )


            Text(
                text =
                    "Availability: ${volunteer.availability}",
                color = ZivaText,
                fontSize = 11.sp
            )


            Spacer(
                modifier =
                    Modifier.height(4.dp)
            )


            Text(
                text =
                    "Skills: ${volunteer.skills}",
                color = ZivaSecondary,
                fontSize = 10.sp
            )


            Spacer(
                modifier =
                    Modifier.height(10.dp)
            )


            Button(
                onClick = onClick,
                modifier =
                    Modifier.fillMaxWidth(),
                colors =
                    ButtonDefaults.buttonColors(
                        containerColor =
                            ZivaPrimary
                    )
            ) {

                Icon(
                    imageVector =
                        Icons.Default.Phone,
                    contentDescription = null,
                    modifier =
                        Modifier.size(16.dp)
                )

                Spacer(
                    modifier =
                        Modifier.width(6.dp)
                )

                Text(
                    text =
                        "Contact Volunteer",
                    fontSize = 12.sp
                )
            }
        }
    }
}