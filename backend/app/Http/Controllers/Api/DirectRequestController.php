<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DirectRequest;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class DirectRequestController extends Controller
{
    /**
     * Create a new direct request to a prestataire
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'prestataire_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'nullable|string|max:100',
            'subcategory' => 'nullable|string|max:100',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'city' => 'nullable|string|max:100',
            'district_code' => 'nullable|string|max:10',
            'district_name' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'preferred_date' => 'nullable|date',
            'preferred_time' => 'nullable|string|max:50',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string',
            'client_phone' => 'nullable|string|max:20',
            'client_email' => 'nullable|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if prestataire exists and is verified
        $prestataire = User::findOrFail($request->prestataire_id);
        if (!$prestataire->hasRole('prestataire') || !$prestataire->is_verified) {
            return response()->json(['error' => 'Le prestataire sélectionné n\'est pas disponible.'], 400);
        }

        // Get authenticated user or create guest request
        $clientId = Auth::id();
        if (!$clientId) {
            // Handle guest requests - require email and phone
            if (!$request->client_email || !$request->client_phone) {
                return response()->json(['error' => 'Email et téléphone requis pour les demandes sans compte.'], 422);
            }
        }

        // Create the direct request
        $directRequest = DirectRequest::create([
            'client_id' => $clientId,
            'prestataire_id' => $request->prestataire_id,
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'subcategory' => $request->subcategory,
            'budget_min' => $request->budget_min,
            'budget_max' => $request->budget_max,
            'city' => $request->city,
            'district_code' => $request->district_code,
            'district_name' => $request->district_name,
            'address' => $request->address,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'preferred_date' => $request->preferred_date,
            'preferred_time' => $request->preferred_time,
            'images' => $request->images,
            'status' => 'pending',
            'client_phone' => $request->client_phone,
            'client_email' => $request->client_email,
        ]);

        // Create notification for prestataire
        Notification::create([
            'user_id' => $prestataire->id,
            'title' => 'Nouvelle demande directe',
            'content' => "Vous avez reçu une nouvelle demande directe : {$request->title}",
            'type' => 'direct_request',
            'data' => json_encode(['direct_request_id' => $directRequest->id]),
            'is_read' => false,
        ]);

        return response()->json($directRequest, 201);
    }

    /**
     * Get direct requests for the authenticated prestataire
     */
    public function getForPrestataire()
    {
        $user = Auth::user();
        
        if (!$user->hasRole('prestataire')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $requests = DirectRequest::where('prestataire_id', $user->id)
            ->with('client:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($requests);
    }

    /**
     * Get direct requests for the authenticated client
     */
    public function getForClient()
    {
        $user = Auth::user();
        
        $requests = DirectRequest::where('client_id', $user->id)
            ->with('prestataire:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($requests);
    }

    /**
     * Get a specific direct request
     */
    public function show($id)
    {
        $user = Auth::user();
        
        $directRequest = DirectRequest::findOrFail($id);
        
        // Check if user is authorized to view this request
        if ($directRequest->client_id !== $user->id && $directRequest->prestataire_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Mark as viewed if prestataire is viewing
        if ($user->id === $directRequest->prestataire_id && !$directRequest->viewed_at) {
            $directRequest->update([
                'viewed_at' => now(),
                'status' => 'viewed'
            ]);
        }
        
        // Load relationships
        $directRequest->load(['client:id,name,avatar,email,phone', 'prestataire:id,name,avatar,email,phone']);
        
        return response()->json($directRequest);
    }

    /**
     * Respond to a direct request (accept or decline)
     */
    public function respond(Request $request, $id)
    {
        $user = Auth::user();
        
        $directRequest = DirectRequest::findOrFail($id);
        
        // Check if user is the prestataire for this request
        if ($directRequest->prestataire_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Validate the response
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:accepted,declined',
            'response_message' => 'nullable|string',
            'response_price' => 'required_if:status,accepted|nullable|numeric|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Update the direct request
        $directRequest->update([
            'status' => $request->status,
            'responded_at' => now(),
            'response_message' => $request->response_message,
            'response_price' => $request->response_price,
        ]);
        
        // Create notification for client
        Notification::create([
            'user_id' => $directRequest->client_id,
            'title' => $request->status === 'accepted' ? 'Demande acceptée' : 'Demande refusée',
            'content' => $request->status === 'accepted' 
                ? "Votre demande \"{$directRequest->title}\" a été acceptée par le prestataire."
                : "Votre demande \"{$directRequest->title}\" a été refusée par le prestataire.",
            'type' => 'direct_request_response',
            'data' => json_encode(['direct_request_id' => $directRequest->id, 'status' => $request->status]),
            'is_read' => false,
        ]);
        
        // If accepted, convert to task
        $result = null;
        if ($request->status === 'accepted') {
            $result = $directRequest->convertToTask();
            
            if ($result) {
                $directRequest->update(['status' => 'converted']);
            }
        }
        
        return response()->json([
            'direct_request' => $directRequest,
            'conversion_result' => $result
        ]);
    }

    /**
     * Delete a direct request
     */
    public function destroy($id)
    {
        $user = Auth::user();
        
        $directRequest = DirectRequest::findOrFail($id);
        
        // Only client can delete their request
        if ($directRequest->client_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Can only delete if not yet responded
        if ($directRequest->responded_at) {
            return response()->json(['error' => 'Cannot delete a request that has been responded to'], 400);
        }
        
        $directRequest->delete();
        
        return response()->json(null, 204);
    }
}
