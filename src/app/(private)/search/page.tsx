import Categories from "@/components/categories";
import RestaurantList from "@/components/restaurant-list";
import {
    fetchCategoryRestaurants,
    fetchRestaurantsByKeyword,
} from "@/lib/restaurants/api";
import { redirect } from "next/navigation";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ category: string; restaurant: string }>;
}) {
    const { category, restaurant } = await searchParams;
    console.log("category", category);
    console.log("restaurant", restaurant);

    if (category) {
        const { data: categoryRestaurants, error: fetchError } =
            await fetchCategoryRestaurants(category);

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
    } else if (restaurant) {
        const { data: restaurants, error: fetchError } =
            await fetchRestaurantsByKeyword(restaurant);

        return (
            <>
                <div className="mb-4">
                    <Categories />
                </div>

                {!restaurants ? (
                    <p className="text-destructive">{fetchError}</p>
                ) : restaurants.length > 0 ? (
                    <>
                        <div className="mb-4">
                            {restaurant}の検索結果 {restaurants.length} 件の結果
                        </div>
                        <RestaurantList restaurants={restaurants} />
                    </>
                ) : (
                    <p>
                        キーワード<strong>{restaurant}</strong>
                        に一致するレストランがありません
                    </p>
                )}
            </>
        );
    } else {
        redirect("/");
    }

    //return <div>SearchPage</div>;
}
