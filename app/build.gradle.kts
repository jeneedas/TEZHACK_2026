import com.google.gms.googleservices.GoogleServicesPlugin.MissingGoogleServicesStrategy

plugins {
  alias(libs.plugins.android.application)
  alias(libs.plugins.kotlin.compose)
  alias(libs.plugins.google.devtools.ksp)
  alias(libs.plugins.roborazzi)
  alias(libs.plugins.secrets)
  alias(libs.plugins.google.services)
}

android {
  namespace = "com.example"

  compileSdk {
    version = release(36) {
      minorApiLevel = 1
    }
  }

  defaultConfig {
    applicationId = "com.aistudio.ziva.disaster"
    minSdk = 24
    targetSdk = 36
    versionCode = 1
    versionName = "1.0"

    testInstrumentationRunner =
      "androidx.test.runner.AndroidJUnitRunner"
  }

  signingConfigs {
    create("release") {
      val keystorePath =
        System.getenv("KEYSTORE_PATH")
          ?: "${rootDir}/my-upload-key.jks"

      storeFile = file(keystorePath)
      storePassword = System.getenv("STORE_PASSWORD")
      keyAlias = "upload"
      keyPassword = System.getenv("KEY_PASSWORD")
    }
  }

  buildTypes {
    release {
      isCrunchPngs = false
      isMinifyEnabled = false

      proguardFiles(
        getDefaultProguardFile(
          "proguard-android-optimize.txt"
        ),
        "proguard-rules.pro"
      )

      signingConfig =
        signingConfigs.getByName("release")
    }

    debug {
    }
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
  }

  buildFeatures {
    compose = true
    buildConfig = true
  }

  testOptions {
    unitTests {
      isIncludeAndroidResources = true
    }
  }

  dependenciesInfo {
    includeInApk = false
    includeInBundle = true
  }
}

secrets {
  propertiesFileName = ".env"
  defaultPropertiesFileName = ".env.example"
  ignoreList.add("FIREBASE_APPCHECK_DEBUG_TOKEN")
}

googleServices {
  missingGoogleServicesStrategy =
    MissingGoogleServicesStrategy.WARN
}

dependencies {

  // =========================================================
  // COMPOSE
  // =========================================================

  implementation(platform(libs.androidx.compose.bom))

  implementation(libs.androidx.activity.compose)
  implementation(libs.androidx.compose.material.icons.core)
  implementation(libs.androidx.compose.material.icons.extended)
  implementation(libs.androidx.compose.material3)
  implementation(libs.androidx.compose.ui)
  implementation(libs.androidx.compose.ui.graphics)
  implementation(libs.androidx.compose.ui.tooling.preview)

  // =========================================================
  // FIREBASE
  // =========================================================

  implementation(platform(libs.firebase.bom))
  implementation(libs.firebase.ai)
  implementation(libs.firebase.firestore)

  // =========================================================
  // ANDROIDX
  // =========================================================

  implementation(libs.androidx.core.ktx)
  implementation(libs.androidx.datastore.preferences)

  implementation(libs.androidx.lifecycle.runtime.compose)
  implementation(libs.androidx.lifecycle.runtime.ktx)
  implementation(libs.androidx.lifecycle.viewmodel.compose)

  implementation(libs.androidx.navigation.compose)

  // =========================================================
  // ROOM
  // =========================================================

  implementation(libs.androidx.room.ktx)
  implementation(libs.androidx.room.runtime)

  // =========================================================
  // NETWORKING
  // =========================================================

  implementation(libs.converter.moshi)
  implementation(libs.moshi.kotlin)
  implementation(libs.okhttp)
  implementation(libs.retrofit)

  // =========================================================
  // FIREBASE APP CHECK
  // =========================================================

  implementation(libs.firebase.appcheck.recaptcha)
  implementation(libs.firebase.appcheck.debug)

  // =========================================================
  // COROUTINES
  // =========================================================

  implementation(libs.kotlinx.coroutines.android)
  implementation(libs.kotlinx.coroutines.core)

  // =========================================================
  // LOCATION
  // =========================================================

  implementation(libs.play.services.location)

  // =========================================================
  // GOOGLE MAPS
  // =========================================================
  // Kept because these were already part of the project.
  // No Ramani / MapLibre dependency.
  // =========================================================

  implementation(libs.play.services.maps)
  implementation(libs.maps.compose)

  // =========================================================
  // LOGGING
  // =========================================================

  implementation(libs.logging.interceptor)

  // =========================================================
  // UNIT TESTS
  // =========================================================

  testImplementation(libs.androidx.compose.ui.test.junit4)
  testImplementation(libs.androidx.core)
  testImplementation(libs.androidx.junit)
  testImplementation(libs.junit)
  testImplementation(libs.kotlinx.coroutines.test)
  testImplementation(libs.robolectric)
  testImplementation(libs.roborazzi)
  testImplementation(libs.roborazzi.compose)
  testImplementation(libs.roborazzi.junit.rule)

  // =========================================================
  // ANDROID TESTS
  // =========================================================

  androidTestImplementation(
    platform(libs.androidx.compose.bom)
  )

  androidTestImplementation(
    libs.androidx.compose.ui.test.junit4
  )

  androidTestImplementation(
    libs.androidx.espresso.core
  )

  androidTestImplementation(
    libs.androidx.junit
  )

  androidTestImplementation(
    libs.androidx.runner
  )

  // =========================================================
  // DEBUG
  // =========================================================

  debugImplementation(
    libs.androidx.compose.ui.test.manifest
  )

  debugImplementation(
    libs.androidx.compose.ui.tooling
  )

  // =========================================================
  // KSP
  // =========================================================

  "ksp"(libs.androidx.room.compiler)
  "ksp"(libs.moshi.kotlin.codegen)
}