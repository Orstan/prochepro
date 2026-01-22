import { MetadataRoute } from "next";
import { SERVICE_CATEGORIES, MAIN_CITIES } from "@/lib/seo";
import { SERVICES_SEO } from "@/lib/services-seo";
import { ALL_CITIES } from "@/lib/cities";
import { BLOG_ARTICLES, BLOG_CATEGORIES } from "@/lib/blog-articles";

const SITE_URL = "https://prochepro.fr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr";
  
  // Статичні сторінки
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tasks/browse`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/tasks/new`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/prestataires`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/community`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/testimonials`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Сторінки категорій з API (з унікальними metadata для кожної)
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/api/service-categories`);
    if (res.ok) {
      const categories = await res.json();
      
      // Головні категорії
      for (const cat of categories) {
        categoryPages.push({
          url: `${SITE_URL}/tasks/browse?category=${cat.key}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.85,
        });
        
        // Підкатегорії (тільки топ 5 на категорію для оптимізації)
        if (cat.subcategories && Array.isArray(cat.subcategories)) {
          for (const sub of cat.subcategories.slice(0, 5)) {
            categoryPages.push({
              url: `${SITE_URL}/tasks/browse?category=${cat.key}&subcategory=${sub.key}`,
              lastModified: new Date(),
              changeFrequency: "daily" as const,
              priority: 0.8,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
  }

  // Сторінки міст
  const cityPages: MetadataRoute.Sitemap = MAIN_CITIES.map((city) => ({
    url: `${SITE_URL}/tasks?city=${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Сторінки послуг (головна)
  const servicesMainPage: MetadataRoute.Sitemap = [{
    url: `${SITE_URL}/services`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }];

  // Сторінки окремих послуг
  const servicePages: MetadataRoute.Sitemap = SERVICES_SEO.map((service) => ({
    url: `${SITE_URL}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // SEO сторінки: послуга + місто (для локального SEO)
  // Це генерує сотні сторінок типу /services/plombier/paris, /services/electricien/versailles
  const localSeoPages: MetadataRoute.Sitemap = [];
  for (const service of SERVICES_SEO) {
    for (const city of ALL_CITIES) {
      const citySlug = city.toLowerCase().replace(/ /g, "-");
      localSeoPages.push({
        url: `${SITE_URL}/services/${service.slug}/${encodeURIComponent(citySlug)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      });
    }
  }

  // Старі комбінації категорія + місто (для сумісності)
  const localPages: MetadataRoute.Sitemap = [];
  for (const category of SERVICE_CATEGORIES.slice(0, 6)) {
    for (const city of MAIN_CITIES.slice(0, 5)) {
      localPages.push({
        url: `${SITE_URL}/categories/${category.slug}?city=${city.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.6,
      });
    }
  }

  // Динамічні завдання (можна додати API виклик)
  let taskPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr"}/api/tasks?per_page=100`, {
      next: { revalidate: 3600 }, // Кешувати на 1 годину
    });
    if (res.ok) {
      const data = await res.json();
      const tasks = data?.data ?? data ?? [];
      taskPages = tasks.map((task: { id: number; updated_at?: string }) => ({
        url: `${SITE_URL}/tasks/${task.id}`,
        lastModified: task.updated_at ? new Date(task.updated_at) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error("Error fetching tasks for sitemap:", error);
  }

  // Blog pages
  const blogMainPage: MetadataRoute.Sitemap = [{
    url: `${SITE_URL}/blog`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }];

  // Blog category pages
  const blogCategoryPages: MetadataRoute.Sitemap = BLOG_CATEGORIES.map((cat) => ({
    url: `${SITE_URL}/blog/categorie/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Blog article pages
  const blogArticlePages: MetadataRoute.Sitemap = BLOG_ARTICLES.map((article) => ({
    url: `${SITE_URL}/blog/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Forum pages
  let forumPages: MetadataRoute.Sitemap = [{
    url: `${SITE_URL}/community`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }];
  
  try {
    const forumRes = await fetch(`${API_URL}/api/forum/categories`);
    if (forumRes.ok) {
      const forumCategories = await forumRes.json();
      for (const cat of forumCategories) {
        forumPages.push({
          url: `${SITE_URL}/community/category/${cat.slug}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.75,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching forum categories for sitemap:", error);
  }

  // Prestataires (top 100)
  let prestatairesPages: MetadataRoute.Sitemap = [];
  try {
    const prestRes = await fetch(`${API_URL}/api/prestataires?per_page=100`);
    if (prestRes.ok) {
      const prestataires = await prestRes.json();
      const prestList = prestataires?.data ?? prestataires ?? [];
      prestatairesPages = prestList.map((prest: { id: number }) => ({
        url: `${SITE_URL}/prestataires/${prest.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Error fetching prestataires for sitemap:", error);
  }

  return [
    ...staticPages,
    ...categoryPages,
    ...cityPages,
    ...servicesMainPage,
    ...servicePages,
    ...localSeoPages,
    ...localPages,
    ...taskPages,
    ...blogMainPage,
    ...blogCategoryPages,
    ...blogArticlePages,
    ...forumPages,
    ...prestatairesPages,
  ];
}
