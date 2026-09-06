package com.example.ziva.presentation.component

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.draw.clip

import com.example.ziva.data.local.ResourceEntity
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng

import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.MapType
import com.google.maps.android.compose.MapUiSettings
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState

@Composable
fun CustomMapCanvas(
    modifier: Modifier = Modifier,
    userPos: Pair<Float, Float> = Pair(0.5f, 0.65f),
    helperPos: Pair<Float, Float>? = null,
    resources: List<ResourceEntity> = emptyList(),
    onMarkerClick: ((String) -> Unit)? = null
) {

    /*
     * Default center: Tezpur, Assam
     *
     * Later we will replace this with the user's
     * real GPS coordinates from TelemetryManager.
     */
    val defaultLocation = LatLng(
        26.6520,
        92.7926
    )

    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(
            defaultLocation,
            13f
        )
    }

    val mapUiSettings = remember {
        MapUiSettings(
            zoomControlsEnabled = true,
            compassEnabled = true,
            myLocationButtonEnabled = false,
            mapToolbarEnabled = false
        )
    }

    val mapProperties = remember {
        MapProperties(
            mapType = MapType.NORMAL
        )
    }

    GoogleMap(
        modifier = modifier
            .fillMaxSize()
            .clip(RoundedCornerShape(16.dp)),
        cameraPositionState = cameraPositionState,
        uiSettings = mapUiSettings,
        properties = mapProperties
    ) {

        /*
         * USER LOCATION
         *
         * Temporary fixed Tezpur location.
         * We will connect this to the phone's
         * actual GPS next.
         */
        Marker(
            state = MarkerState(position = defaultLocation),
            title = "Your Location",
            snippet = "ZIVA user",
            icon = BitmapDescriptorFactory.defaultMarker(
                BitmapDescriptorFactory.HUE_CYAN
            )
        )

        /*
         * RESOURCE MARKERS
         *
         * IMPORTANT:
         * Your current ResourceEntity needs actual
         * latitude/longitude fields for these to
         * represent real locations.
         *
         * Until we inspect ResourceEntity, these
         * markers are not generated from resource
         * coordinates yet.
         */
        resources.take(20).forEachIndexed { index, resource ->

            /*
             * Temporary demonstration positions
             * around Tezpur.
             *
             * We will replace these with:
             *
             * LatLng(
             *     resource.latitude,
             *     resource.longitude
             * )
             */
            val position = LatLng(
                defaultLocation.latitude +
                        ((index % 5) - 2) * 0.004,
                defaultLocation.longitude +
                        ((index / 5) - 2) * 0.004
            )

            val markerColor = when (resource.type) {
                "WATER" -> BitmapDescriptorFactory.HUE_AZURE
                "FOOD" -> BitmapDescriptorFactory.HUE_ORANGE
                "MEDICINE" -> BitmapDescriptorFactory.HUE_RED
                "SHELTER" -> BitmapDescriptorFactory.HUE_VIOLET
                else -> BitmapDescriptorFactory.HUE_GREEN
            }

            Marker(
                state = MarkerState(position = position),
                title = resource.name,
                snippet = "${resource.type} • ${resource.availability} ${resource.unit}",
                icon = BitmapDescriptorFactory.defaultMarker(markerColor),
                onClick = {
                    onMarkerClick?.invoke(resource.resourceId)
                    true
                }
            )
        }
    }
}