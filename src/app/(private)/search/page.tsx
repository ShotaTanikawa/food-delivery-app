import Categories from "@/components/categories";
import RestaurantList from "@/components/restaurant-list";
import {
    fetchCategoryRestaurants,
    fetchLocation,
    fetchRestaurantsByKeyword,
} from "@/lib/restaurants/api";
import { redirect } from "next/navigation";

/**
 * 検索ページ（Server Component）
 * カテゴリー検索またはキーワード検索の結果を表示
 * ユーザーが選択した住所を中心とした周辺のレストランを検索する
 */
export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ category: string; restaurant: string }>;
}) {
    // URLパラメータから検索条件を取得
    const { category, restaurant } = await searchParams;

    // 現在選択されている住所の緯度・経度を取得
    // これが検索の中心位置として使用される
    const { lat, lng } = await fetchLocation();

    // カテゴリー検索の場合
    if (category) {
        // 指定されたカテゴリーのレストランを位置情報に基づいて検索
        const { data: categoryRestaurants, error: fetchError } =
            await fetchCategoryRestaurants(category, lat, lng);

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
    // キーワード検索の場合
    else if (restaurant) {
        // 指定されたキーワードでレストランを位置情報に基づいて検索
        const { data: restaurants, error: fetchError } =
            await fetchRestaurantsByKeyword(restaurant, lat, lng);

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
    }
    // 検索条件が指定されていない場合はホームページにリダイレクト
    else {
        redirect("/");
    }
}
