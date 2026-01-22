<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReviewPhotoController extends Controller
{
    /**
     * Upload a photo for a review
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        if (!$request->hasFile('image')) {
            return response()->json([
                'message' => 'Aucune image fournie',
            ], 422);
        }

        $file = $request->file('image');
        
        // Generate a unique filename
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        
        // Store the file in the reviews folder
        $path = $file->storeAs('public/reviews', $filename);
        
        // Return the path to the file (without 'public/')
        return response()->json([
            'path' => '/storage/reviews/' . $filename,
            'filename' => $filename,
        ]);
    }

    /**
     * Delete a photo
     */
    public function delete(Request $request): JsonResponse
    {
        $request->validate([
            'filename' => 'required|string',
        ]);

        $filename = $request->input('filename');
        
        // Ensure the filename is safe
        if (!preg_match('/^[a-zA-Z0-9\-]+\.(jpg|jpeg|png|gif)$/', $filename)) {
            return response()->json([
                'message' => 'Nom de fichier invalide',
            ], 422);
        }
        
        // Delete the file
        $path = 'public/reviews/' . $filename;
        if (Storage::exists($path)) {
            Storage::delete($path);
            return response()->json([
                'message' => 'Photo supprimée avec succès',
            ]);
        }
        
        return response()->json([
            'message' => 'Photo non trouvée',
        ], 404);
    }
}
