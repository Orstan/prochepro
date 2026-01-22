<?php

use App\Http\Controllers\PriceListController;
use Illuminate\Support\Facades\Route;

// Public routes - get price list for a specific prestataire
Route::get('/prestataires/{id}/price-list', [PriceListController::class, 'getForPrestataire']);

// Protected routes - require authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/price-list', [PriceListController::class, 'getMyPriceList']);
    Route::post('/price-list', [PriceListController::class, 'store']);
    Route::put('/price-list/{id}', [PriceListController::class, 'update']);
    Route::delete('/price-list/{id}', [PriceListController::class, 'destroy']);
    Route::post('/price-list/sort', [PriceListController::class, 'updateSortOrder']);
});
