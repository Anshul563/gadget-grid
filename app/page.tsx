import { getActiveBanners } from "@/lib/get-banners";
import { getNewArrivals } from "@/lib/get-products"; 
import { BannerCarousel } from "@/components/home/banner-carousel";
import { FeatureHighlights } from "@/components/home/feature-highlights";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Categories } from "@/components/home/categories";

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function HomePage() {
  // Fetch data in parallel
  const [banners, newArrivals] = await Promise.all([
    getActiveBanners(),
    getNewArrivals(),
  ]);

  return (
    <main>
      {/* Hero Section */}
      <section className="w-full">
        <BannerCarousel data={banners} />
      </section>
      
      <FeatureHighlights />
      <Categories />

      <div className="container py-8 px-4 space-y-12">
        {/* New Arrivals Block */}
        {/* Only render if we have products */}
        {newArrivals.length > 0 && (
          <FeaturedProducts
            title="New Arrivals"
            link="/collections/new-arrivals"
            products={newArrivals}
          />
        )}
      </div>
    </main>
  );
}