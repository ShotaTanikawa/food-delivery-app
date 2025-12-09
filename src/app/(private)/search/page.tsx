import Categories from "@/components/categories";
import RestaurantList from "@/components/restaurant-list";
import { fetchCategoryRestaurants } from "@/lib/restaurants/api";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ category: string }>;
}) {
    const { category } = await searchParams;
    console.log("category", category);

    if (category) {
        const { data: categoryRestaurants, error: fetchError } =
            await fetchCategoryRestaurants(category);
        console.log("categoryRestaurants", categoryRestaurants);

        return (
            <>
                <div className="mb-4">
                    <Categories />
                </div>

                {!categoryRestaurants ? (
                    <p className="text-destructive">{fetchError}</p>
                ) : categoryRestaurants.length > 0 ? (
                    <RestaurantList restaurants={categoryRestaurants} />
                ) : (
                    <p>
                        カテゴリー<strong>{category}</strong>
                        に一致するレストランがありません
                    </p>
                )}
            </>
        );
    }

    //return <div>SearchPage</div>;
}
