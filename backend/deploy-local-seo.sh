#!/bin/bash

# ProchePro - Local SEO Deployment Script
# This script sets up and generates all local SEO pages

echo "🚀 ProchePro Local SEO Deployment"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Run migrations
echo -e "${BLUE}Step 1/5: Running database migrations...${NC}"
php artisan migrate --force
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo "❌ Migration failed"
    exit 1
fi
echo ""

# Step 2: Seed popular services
echo -e "${BLUE}Step 2/5: Seeding popular services (TOP-50)...${NC}"
php artisan db:seed --class=PopularServicesSeeder
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Popular services seeded${NC}"
else
    echo -e "${YELLOW}⚠ Seeding may have failed or data already exists${NC}"
fi
echo ""

# Step 3: Seed city districts
echo -e "${BLUE}Step 3/5: Seeding city districts (Paris, Lyon, Marseille, Toulouse)...${NC}"
php artisan db:seed --class=CityDistrictsSeeder
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ City districts seeded${NC}"
else
    echo -e "${YELLOW}⚠ Seeding may have failed or data already exists${NC}"
fi
echo ""

# Step 4: Generate local pages
echo -e "${BLUE}Step 4/5: Generating local SEO pages...${NC}"
read -p "Generate with AI content? (requires OpenAI API key) [y/N]: " use_ai
read -p "Number of top services to use (default: 20): " limit
limit=${limit:-20}

if [[ "$use_ai" =~ ^[Yy]$ ]]; then
    echo "Generating with AI content..."
    php artisan seo:generate-multi-city --limit=$limit --ai
else
    echo "Generating with template content..."
    php artisan seo:generate-multi-city --limit=$limit
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Local pages generated${NC}"
else
    echo "❌ Generation failed"
    exit 1
fi
echo ""

# Step 5: Generate sitemap
echo -e "${BLUE}Step 5/5: Generating XML sitemap...${NC}"
php artisan seo:generate-sitemap
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Sitemap generated${NC}"
else
    echo "❌ Sitemap generation failed"
    exit 1
fi
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "📊 Summary:"
php artisan tinker --execute="
    \$services = App\Models\PopularService::count();
    \$districts = App\Models\CityDistrict::count();
    \$pages = App\Models\LocalSeoPage::count();
    echo \"Services: \$services\n\";
    echo \"Districts: \$districts\n\";
    echo \"Pages generated: \$pages\n\";
"
echo ""
echo "🌐 Next steps:"
echo "1. Check generated pages in /services/*"
echo "2. Submit sitemap to Google Search Console"
echo "3. Monitor analytics"
echo ""
echo "📖 Full documentation: LOCAL_SEO_README.md"
