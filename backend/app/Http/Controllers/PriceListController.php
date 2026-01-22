<?php

namespace App\Http\Controllers;

use App\Models\PriceListItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PriceListController extends Controller
{
    /**
     * Get price list items for a specific prestataire
     */
    public function getForPrestataire($id)
    {
        $user = User::findOrFail($id);
        
        if (!$user->hasRole('prestataire')) {
            return response()->json(['error' => 'User is not a prestataire'], 400);
        }
        
        $priceList = $user->priceListItems()->get();
        
        return response()->json($priceList);
    }
    
    /**
     * Get price list items for the authenticated user
     */
    public function getMyPriceList()
    {
        $user = Auth::user();
        
        if (!$user->hasRole('prestataire')) {
            return response()->json(['error' => 'User is not a prestataire'], 400);
        }
        
        $priceList = $user->priceListItems()->get();
        
        return response()->json($priceList);
    }
    
    /**
     * Create a new price list item
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->hasRole('prestataire')) {
            return response()->json(['error' => 'User is not a prestataire'], 400);
        }
        
        $validator = Validator::make($request->all(), [
            'service_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'price_type' => 'required|in:fixed,hourly,from',
            'category' => 'nullable|string|max:255',
            'subcategory' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $priceListItem = $user->priceListItems()->create($request->all());
        
        return response()->json($priceListItem, 201);
    }
    
    /**
     * Update a price list item
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        
        $priceListItem = PriceListItem::findOrFail($id);
        
        if ($priceListItem->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'service_name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'price_type' => 'in:fixed,hourly,from',
            'category' => 'nullable|string|max:255',
            'subcategory' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $priceListItem->update($request->all());
        
        return response()->json($priceListItem);
    }
    
    /**
     * Delete a price list item
     */
    public function destroy($id)
    {
        $user = Auth::user();
        
        $priceListItem = PriceListItem::findOrFail($id);
        
        if ($priceListItem->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $priceListItem->delete();
        
        return response()->json(null, 204);
    }
    
    /**
     * Update sort order for multiple price list items
     */
    public function updateSortOrder(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:price_list_items,id',
            'items.*.sort_order' => 'required|integer',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        foreach ($request->items as $item) {
            $priceListItem = PriceListItem::find($item['id']);
            
            if ($priceListItem && $priceListItem->user_id === $user->id) {
                $priceListItem->update(['sort_order' => $item['sort_order']]);
            }
        }
        
        return response()->json(['message' => 'Sort order updated successfully']);
    }
}
