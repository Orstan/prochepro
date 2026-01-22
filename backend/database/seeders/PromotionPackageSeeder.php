<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PromotionPackage;

class PromotionPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $packages = [
            [
                'name' => 'TOP 1 jour',
                'description' => 'Mettez votre annonce en avant pendant 1 jour',
                'days' => 1,
                'price' => 5.00,
                'original_price' => 5.00,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'TOP 7 jours',
                'description' => 'Mettez votre annonce en avant pendant 7 jours - Économisez 15%',
                'days' => 7,
                'price' => 30.00,
                'original_price' => 35.00,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'TOP 30 jours',
                'description' => 'Mettez votre annonce en avant pendant 30 jours - Économisez 33%',
                'days' => 30,
                'price' => 100.00,
                'original_price' => 150.00,
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($packages as $packageData) {
            $package = new PromotionPackage($packageData);
            $package->calculateDiscount();
            $package->save();
        }
    }
}
