/**
 * DashboardScreen.kt
 * ProcheProWear
 *
 * Dashboard screen for Wear OS app
 */

package fr.prochepro.wear.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.wear.compose.material.*
import fr.prochepro.wear.api.WearableApiClient
import fr.prochepro.wear.api.WatchDashboard
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel = viewModel(),
    onTaskClick: (Int) -> Unit = {},
    onNotificationsClick: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Scaffold(
        timeText = { TimeText() },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) }
    ) {
        when (val state = uiState) {
            is DashboardUiState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            
            is DashboardUiState.Success -> {
                DashboardContent(
                    dashboard = state.dashboard,
                    onTaskClick = onTaskClick,
                    onNotificationsClick = onNotificationsClick,
                    onRefresh = { viewModel.loadDashboard() }
                )
            }
            
            is DashboardUiState.Error -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "Erreur",
                            style = MaterialTheme.typography.title3,
                            color = MaterialTheme.colors.error
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = state.message,
                            style = MaterialTheme.typography.caption1,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { viewModel.loadDashboard() }) {
                            Text("Réessayer")
                        }
                    }
                }
            }
        }
    }
    
    LaunchedEffect(Unit) {
        viewModel.loadDashboard()
    }
}

@Composable
fun DashboardContent(
    dashboard: WatchDashboard,
    onTaskClick: (Int) -> Unit,
    onNotificationsClick: () -> Unit,
    onRefresh: () -> Unit
) {
    ScalingLazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(
            top = 32.dp,
            start = 10.dp,
            end = 10.dp,
            bottom = 32.dp
        ),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        // User info
        item {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Bonjour,",
                    style = MaterialTheme.typography.caption1
                )
                Text(
                    text = dashboard.user.name,
                    style = MaterialTheme.typography.title2
                )
            }
        }
        
        // Stats
        item {
            Spacer(modifier = Modifier.height(8.dp))
        }
        
        item {
            StatsCard(
                title = "Tâches actives",
                value = dashboard.stats.activeTasks.toString(),
                onClick = { /* Navigate to tasks */ }
            )
        }
        
        item {
            StatsCard(
                title = "Notifications",
                value = dashboard.stats.unreadNotifications.toString(),
                onClick = onNotificationsClick
            )
        }
        
        item {
            StatsCard(
                title = "Aujourd'hui",
                value = dashboard.stats.todayTasks.toString(),
                onClick = { /* Navigate to today's tasks */ }
            )
        }
        
        // Current task
        dashboard.currentTask?.let { task ->
            item {
                Spacer(modifier = Modifier.height(8.dp))
            }
            
            item {
                Text(
                    text = "Tâche en cours",
                    style = MaterialTheme.typography.caption1,
                    modifier = Modifier.padding(start = 4.dp)
                )
            }
            
            item {
                TaskCard(
                    task = task,
                    onClick = { onTaskClick(task.id) }
                )
            }
        }
        
        // Refresh button
        item {
            Spacer(modifier = Modifier.height(8.dp))
        }
        
        item {
            Button(
                onClick = onRefresh,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Actualiser")
            }
        }
    }
}

@Composable
fun StatsCard(
    title: String,
    value: String,
    onClick: () -> Unit = {}
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.caption1
            )
            Text(
                text = value,
                style = MaterialTheme.typography.title1
            )
        }
    }
}

@Composable
fun TaskCard(
    task: fr.prochepro.wear.api.Task,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            Text(
                text = task.title,
                style = MaterialTheme.typography.title3,
                maxLines = 2
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Chip(
                    label = { Text(getStatusText(task.status)) },
                    onClick = {},
                    colors = ChipDefaults.chipColors(
                        backgroundColor = getStatusColor(task.status)
                    ),
                    modifier = Modifier.height(24.dp)
                )
                
                task.etaMinutes?.let { eta ->
                    Text(
                        text = "$eta min",
                        style = MaterialTheme.typography.caption1
                    )
                }
            }
            
            task.city?.let { city ->
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = city,
                    style = MaterialTheme.typography.caption2
                )
            }
        }
    }
}

@Composable
fun getStatusColor(status: String) = when (status) {
    "pending" -> MaterialTheme.colors.secondary
    "accepted" -> MaterialTheme.colors.primary
    "on_the_way" -> MaterialTheme.colors.primaryVariant
    "in_progress" -> MaterialTheme.colors.primary
    "completed" -> MaterialTheme.colors.onSurface
    else -> MaterialTheme.colors.surface
}

fun getStatusText(status: String) = when (status) {
    "pending" -> "⏳ En attente"
    "accepted" -> "✅ Accepté"
    "on_the_way" -> "🚗 En route"
    "in_progress" -> "🔧 En cours"
    "completed" -> "✨ Terminé"
    else -> status
}

// ViewModel
class DashboardViewModel : ViewModel() {
    private val apiClient = WearableApiClient.getInstance()
    
    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState
    
    fun loadDashboard() {
        viewModelScope.launch {
            _uiState.value = DashboardUiState.Loading
            try {
                val dashboard = apiClient.fetchDashboard()
                _uiState.value = DashboardUiState.Success(dashboard)
            } catch (e: Exception) {
                _uiState.value = DashboardUiState.Error(
                    e.message ?: "Erreur inconnue"
                )
            }
        }
    }
}

sealed class DashboardUiState {
    object Loading : DashboardUiState()
    data class Success(val dashboard: WatchDashboard) : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}
