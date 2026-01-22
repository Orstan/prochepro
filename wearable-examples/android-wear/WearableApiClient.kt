/**
 * WearableApiClient.kt
 * ProcheProWear
 *
 * API client for ProchePro Wearable endpoints
 */

package fr.prochepro.wear.api

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.android.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

class WearableApiClient {
    private val baseUrl = "https://api.prochepro.fr/api/wearable"
    private var authToken: String? = null
    
    private val client = HttpClient(Android) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
        
        install(Logging) {
            logger = Logger.DEFAULT
            level = LogLevel.INFO
        }
        
        install(HttpTimeout) {
            requestTimeoutMillis = 15000
            connectTimeoutMillis = 15000
            socketTimeoutMillis = 15000
        }
        
        defaultRequest {
            contentType(ContentType.Application.Json)
        }
    }
    
    // MARK: - Authentication
    
    fun setAuthToken(token: String) {
        authToken = token
    }
    
    // MARK: - Dashboard
    
    suspend fun fetchDashboard(): WatchDashboard {
        return client.get("$baseUrl/dashboard") {
            bearerAuth(authToken ?: throw NotAuthenticatedException())
        }.body()
    }
    
    // MARK: - Tasks
    
    suspend fun fetchActiveTasks(): TasksResponse {
        return client.get("$baseUrl/tasks") {
            bearerAuth(authToken ?: throw NotAuthenticatedException())
        }.body()
    }
    
    suspend fun fetchTaskDetails(taskId: Int): TaskDetail {
        return client.get("$baseUrl/tasks/$taskId") {
            bearerAuth(authToken ?: throw NotAuthenticatedException())
        }.body()
    }
    
    // MARK: - Notifications
    
    suspend fun fetchNotifications(): NotificationsResponse {
        return client.get("$baseUrl/notifications") {
            bearerAuth(authToken ?: throw NotAuthenticatedException())
        }.body()
    }
    
    suspend fun markNotificationRead(notificationId: Int): MessageResponse {
        return client.post("$baseUrl/notifications/$notificationId/read") {
            bearerAuth(authToken ?: throw NotAuthenticatedException())
        }.body()
    }
    
    // MARK: - Location
    
    suspend fun updateLocation(
        latitude: Double,
        longitude: Double,
        accuracy: Double? = null
    ): LocationResponse {
        return client.post("$baseUrl/location") {
            bearerAuth(authToken ?: throw NotAuthenticatedException())
            setBody(LocationUpdate(latitude, longitude, accuracy))
        }.body()
    }
    
    // MARK: - Quick Actions
    
    suspend fun markOnTheWay(taskId: Int, etaMinutes: Int? = null): TaskActionResponse {
        return client.post("$baseUrl/tasks/$taskId/on-the-way") {
            bearerAuth(authToken ?: throw NotAuthenticatedException())
            etaMinutes?.let { setBody(mapOf("eta_minutes" to it)) }
        }.body()
    }
    
    suspend fun markArrived(taskId: Int): TaskActionResponse {
        return client.post("$baseUrl/tasks/$taskId/arrived") {
            bearerAuth(authToken ?: throw NotAuthenticatedException())
        }.body()
    }
    
    suspend fun markCompleted(taskId: Int): TaskActionResponse {
        return client.post("$baseUrl/tasks/$taskId/completed") {
            bearerAuth(authToken ?: throw NotAuthenticatedException())
        }.body()
    }
    
    companion object {
        @Volatile
        private var instance: WearableApiClient? = null
        
        fun getInstance(): WearableApiClient {
            return instance ?: synchronized(this) {
                instance ?: WearableApiClient().also { instance = it }
            }
        }
    }
}

// MARK: - Models

@Serializable
data class WatchDashboard(
    val user: User,
    val stats: Stats,
    val currentTask: Task? = null
)

@Serializable
data class User(
    val name: String,
    val avatar: String? = null,
    val role: String
)

@Serializable
data class Stats(
    val activeTasks: Int,
    val unreadNotifications: Int,
    val todayTasks: Int
)

@Serializable
data class Task(
    val id: Int,
    val title: String,
    val status: String,
    val category: String,
    val city: String? = null,
    val budget: Double? = null,
    val createdAt: String? = null,
    val etaMinutes: Int? = null
)

@Serializable
data class TasksResponse(
    val tasks: List<Task>,
    val count: Int
)

@Serializable
data class TaskDetail(
    val id: Int,
    val title: String,
    val status: String,
    val category: String,
    val city: String? = null,
    val address: String? = null,
    val budget: Double? = null,
    val etaMinutes: Int? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val prestataire: Prestataire? = null
)

@Serializable
data class Prestataire(
    val id: Int,
    val name: String,
    val phone: String? = null,
    val avatar: String? = null,
    val currentLatitude: Double? = null,
    val currentLongitude: Double? = null
)

@Serializable
data class WearableNotification(
    val id: Int,
    val type: String,
    val title: String,
    val message: String,
    val read: Boolean,
    val time: String,
    val taskId: Int? = null
)

@Serializable
data class NotificationsResponse(
    val notifications: List<WearableNotification>,
    val unreadCount: Int
)

@Serializable
data class MessageResponse(
    val message: String
)

@Serializable
data class LocationUpdate(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Double? = null
)

@Serializable
data class LocationResponse(
    val message: String,
    val latitude: Double,
    val longitude: Double
)

@Serializable
data class TaskActionResponse(
    val message: String,
    val task: TaskStatus
)

@Serializable
data class TaskStatus(
    val id: Int,
    val status: String,
    val etaMinutes: Int? = null
)

// MARK: - Exceptions

class NotAuthenticatedException : Exception("Not authenticated. Please login.")
