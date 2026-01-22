//
//  WearableAPI.swift
//  ProcheProWatch
//
//  API client for ProchePro Wearable endpoints
//

import Foundation

class WearableAPI {
    static let shared = WearableAPI()
    
    private let baseURL = "https://api.prochepro.fr/api/wearable"
    private var authToken: String?
    
    // MARK: - Authentication
    
    func setAuthToken(_ token: String) {
        self.authToken = token
    }
    
    // MARK: - Dashboard
    
    func fetchDashboard() async throws -> WatchDashboard {
        return try await request(endpoint: "/dashboard", method: "GET")
    }
    
    // MARK: - Tasks
    
    func fetchActiveTasks() async throws -> TasksResponse {
        return try await request(endpoint: "/tasks", method: "GET")
    }
    
    func fetchTaskDetails(taskId: Int) async throws -> TaskDetail {
        return try await request(endpoint: "/tasks/\(taskId)", method: "GET")
    }
    
    // MARK: - Notifications
    
    func fetchNotifications() async throws -> NotificationsResponse {
        return try await request(endpoint: "/notifications", method: "GET")
    }
    
    func markNotificationRead(notificationId: Int) async throws -> MessageResponse {
        return try await request(endpoint: "/notifications/\(notificationId)/read", method: "POST")
    }
    
    // MARK: - Location
    
    func updateLocation(latitude: Double, longitude: Double, accuracy: Double?) async throws -> LocationResponse {
        let body: [String: Any] = [
            "latitude": latitude,
            "longitude": longitude,
            "accuracy": accuracy ?? 0
        ]
        return try await request(endpoint: "/location", method: "POST", body: body)
    }
    
    // MARK: - Quick Actions
    
    func markOnTheWay(taskId: Int, etaMinutes: Int?) async throws -> TaskActionResponse {
        var body: [String: Any] = [:]
        if let eta = etaMinutes {
            body["eta_minutes"] = eta
        }
        return try await request(endpoint: "/tasks/\(taskId)/on-the-way", method: "POST", body: body)
    }
    
    func markArrived(taskId: Int) async throws -> TaskActionResponse {
        return try await request(endpoint: "/tasks/\(taskId)/arrived", method: "POST")
    }
    
    func markCompleted(taskId: Int) async throws -> TaskActionResponse {
        return try await request(endpoint: "/tasks/\(taskId)/completed", method: "POST")
    }
    
    // MARK: - Generic Request
    
    private func request<T: Decodable>(
        endpoint: String,
        method: String,
        body: [String: Any]? = nil
    ) async throws -> T {
        guard let token = authToken else {
            throw APIError.notAuthenticated
        }
        
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let body = body {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        
        return try decoder.decode(T.self, from: data)
    }
}

// MARK: - Models

struct WatchDashboard: Codable {
    let user: User
    let stats: Stats
    let currentTask: Task?
}

struct User: Codable {
    let name: String
    let avatar: String?
    let role: String
}

struct Stats: Codable {
    let activeTasks: Int
    let unreadNotifications: Int
    let todayTasks: Int
}

struct Task: Codable, Identifiable {
    let id: Int
    let title: String
    let status: String
    let category: String
    let city: String?
    let budget: Double?
    let createdAt: String?
    let etaMinutes: Int?
}

struct TasksResponse: Codable {
    let tasks: [Task]
    let count: Int
}

struct TaskDetail: Codable {
    let id: Int
    let title: String
    let status: String
    let category: String
    let city: String?
    let address: String?
    let budget: Double?
    let etaMinutes: Int?
    let latitude: Double?
    let longitude: Double?
    let prestataire: Prestataire?
}

struct Prestataire: Codable {
    let id: Int
    let name: String
    let phone: String?
    let avatar: String?
    let currentLatitude: Double?
    let currentLongitude: Double?
}

struct WearableNotification: Codable, Identifiable {
    let id: Int
    let type: String
    let title: String
    let message: String
    let read: Bool
    let time: String
    let taskId: Int?
}

struct NotificationsResponse: Codable {
    let notifications: [WearableNotification]
    let unreadCount: Int
}

struct MessageResponse: Codable {
    let message: String
}

struct LocationResponse: Codable {
    let message: String
    let latitude: Double
    let longitude: Double
}

struct TaskActionResponse: Codable {
    let message: String
    let task: TaskStatus
}

struct TaskStatus: Codable {
    let id: Int
    let status: String
    let etaMinutes: Int?
}

// MARK: - Errors

enum APIError: Error, LocalizedError {
    case notAuthenticated
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int)
    case decodingError
    
    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "Non authentifié. Veuillez vous connecter."
        case .invalidURL:
            return "URL invalide."
        case .invalidResponse:
            return "Réponse invalide du serveur."
        case .httpError(let statusCode):
            return "Erreur HTTP: \(statusCode)"
        case .decodingError:
            return "Erreur de décodage des données."
        }
    }
}
