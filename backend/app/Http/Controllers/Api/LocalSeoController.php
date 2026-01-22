<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LocalSeoPage;
use App\Models\ParisDistrict;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LocalSeoController extends Controller
{
    /**
     * Get all districts
     */
    public function getAllDistricts()
    {
        $districts = ParisDistrict::orderBy('code')->get();
        return response()->json($districts);
    }

    /**
     * Get a specific district
     */
    public function getDistrict($slug)
    {
        $district = ParisDistrict::where('slug', $slug)->firstOrFail();
        return response()->json($district);
    }

    /**
     * Get all SEO pages
     */
    public function getAllPages(Request $request)
    {
        $query = LocalSeoPage::with('district');
        
        if ($request->has('district_id')) {
            $query->where('district_id', $request->district_id);
        }
        
        if ($request->has('service_category')) {
            $query->where('service_category', $request->service_category);
        }
        
        if ($request->has('service_subcategory')) {
            $query->where('service_subcategory', $request->service_subcategory);
        }
        
        if ($request->has('published')) {
            $query->where('is_published', $request->boolean('published'));
        }
        
        $pages = $query->orderBy('created_at', 'desc')->paginate(20);
        
        return response()->json($pages);
    }

    /**
     * Get a specific SEO page
     */
    public function getPage($slug)
    {
        $page = LocalSeoPage::where('slug', $slug)
            ->with('district')
            ->firstOrFail();
        
        // Increment view count
        $page->incrementViewCount();
        
        return response()->json($page);
    }

    /**
     * Get SEO page by district and service
     */
    public function getPageByDistrictAndService($districtSlug, $serviceCategory, $serviceSubcategory = null)
    {
        // Try CityDistrict first (new multi-city system)
        $district = \App\Models\CityDistrict::where('slug', $districtSlug)->first();
        
        // Fallback to ParisDistrict for old pages
        if (!$district) {
            $district = ParisDistrict::where('slug', $districtSlug)->firstOrFail();
        }
        
        $query = LocalSeoPage::where('district_id', $district->id)
            ->where('service_category', $serviceCategory);
        
        if ($serviceSubcategory) {
            $query->where('service_subcategory', $serviceSubcategory);
        }
        // Don't filter by NULL subcategory - just get the first match
        
        $page = $query->firstOrFail();
        
        // Increment view count
        $page->incrementViewCount();
        
        // Get related data
        $relatedTasks = $page->getRelatedTasksAttribute();
        $relatedPrestataires = $page->getRelatedPrestataireAttribute();
        
        return response()->json([
            'page' => $page,
            'district' => $district,
            'related_tasks' => $relatedTasks,
            'related_prestataires' => $relatedPrestataires
        ]);
    }

    /**
     * Create a new SEO page (admin only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'district_id' => 'required|exists:paris_districts,id',
            'service_category' => 'nullable|string',
            'service_subcategory' => 'nullable|string',
            'title' => 'required|string|max:255',
            'title_fr' => 'required|string|max:255',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
            'content' => 'required|string',
            'content_fr' => 'required|string',
            'is_published' => 'boolean',
            'faq_content' => 'nullable|array',
            'image_path' => 'nullable|string',
        ]);
        
        // Generate slug
        $district = ParisDistrict::findOrFail($validated['district_id']);
        $slug = $this->generateSlug($district, $validated['service_category'], $validated['service_subcategory'] ?? null);
        $validated['slug'] = $slug;
        
        $page = LocalSeoPage::create($validated);
        
        return response()->json($page, 201);
    }

    /**
     * Update an existing SEO page (admin only)
     */
    public function update(Request $request, $id)
    {
        $page = LocalSeoPage::findOrFail($id);
        
        $validated = $request->validate([
            'district_id' => 'exists:paris_districts,id',
            'service_category' => 'nullable|string',
            'service_subcategory' => 'nullable|string',
            'title' => 'string|max:255',
            'title_fr' => 'string|max:255',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
            'content' => 'string',
            'content_fr' => 'string',
            'is_published' => 'boolean',
            'faq_content' => 'nullable|array',
            'image_path' => 'nullable|string',
        ]);
        
        // If district, service_category, or service_subcategory changed, update slug
        if (isset($validated['district_id']) || isset($validated['service_category']) || isset($validated['service_subcategory'])) {
            $districtId = $validated['district_id'] ?? $page->district_id;
            $serviceCategory = $validated['service_category'] ?? $page->service_category;
            $serviceSubcategory = $validated['service_subcategory'] ?? $page->service_subcategory;
            
            $district = ParisDistrict::findOrFail($districtId);
            $slug = $this->generateSlug($district, $serviceCategory, $serviceSubcategory);
            $validated['slug'] = $slug;
        }
        
        $page->update($validated);
        
        return response()->json($page);
    }

    /**
     * Delete an SEO page (admin only)
     */
    public function destroy($id)
    {
        $page = LocalSeoPage::findOrFail($id);
        $page->delete();
        
        return response()->json(null, 204);
    }

    /**
     * Track conversion for a page
     */
    public function trackConversion($slug)
    {
        $page = LocalSeoPage::where('slug', $slug)->firstOrFail();
        $page->incrementConversionCount();
        
        return response()->json(['success' => true]);
    }

    /**
     * Generate statistics for SEO pages
     */
    public function getStatistics()
    {
        $stats = [
            'total_pages' => LocalSeoPage::count(),
            'published_pages' => LocalSeoPage::where('is_published', true)->count(),
            'total_views' => LocalSeoPage::sum('view_count'),
            'total_conversions' => LocalSeoPage::sum('conversion_count'),
            'top_performing_pages' => LocalSeoPage::orderBy('conversion_count', 'desc')
                ->take(10)
                ->with('district')
                ->get(),
            'pages_by_district' => DB::table('local_seo_pages')
                ->select('district_id', DB::raw('count(*) as page_count'))
                ->groupBy('district_id')
                ->get(),
            'pages_by_category' => DB::table('local_seo_pages')
                ->select('service_category', DB::raw('count(*) as page_count'))
                ->whereNotNull('service_category')
                ->groupBy('service_category')
                ->get(),
        ];
        
        return response()->json($stats);
    }

    /**
     * Generate a unique slug for a page
     */
    private function generateSlug(ParisDistrict $district, ?string $serviceCategory, ?string $serviceSubcategory): string
    {
        $slugParts = [$district->slug];
        
        if ($serviceCategory) {
            $slugParts[] = Str::slug($serviceCategory);
            
            if ($serviceSubcategory) {
                $slugParts[] = Str::slug($serviceSubcategory);
            }
        }
        
        $baseSlug = implode('-', $slugParts);
        $slug = $baseSlug;
        $counter = 1;
        
        // Ensure slug is unique
        while (LocalSeoPage::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }
        
        return $slug;
    }
}
