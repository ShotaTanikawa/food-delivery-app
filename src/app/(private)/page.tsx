import CarouselContainer from "@/components/carousel-container";
import Categories from "@/components/categories";
import RestaurantCard from "@/components/restaurant-card";
import RestaurantList from "@/components/restaurant-list";
import Section from "@/components/section";
import {
    fetchLocation,
    fetchRamenRestaurants,
    fetchRestaurants,
} from "@/lib/restaurants/api";

/**
 * ホームページ（Server Component）
 * ユーザーが選択した住所を中心とした周辺のレストランとラーメン店を表示
 * 住所が選択されていない場合は、デフォルト位置（渋谷）を中心に検索する
 */
export default async function Home() {
    // 現在選択されている住所の緯度・経度を取得
    // これがレストラン検索の中心位置として使用される
    const { lat, lng } = await fetchLocation();

    // 指定された位置周辺の近くのラーメン店を取得
    // fetchRamenRestaurants関数に緯度・経度を渡して、位置に基づいた検索を実行
    const { data: nearbyRamenRestaurants, error: nearbyRamenRestaurantsError } =
        await fetchRamenRestaurants(lat, lng);

    // 指定された位置周辺の近くのレストランを取得
    // fetchRestaurants関数に緯度・経度を渡して、位置に基づいた検索を実行
    const { data: nearByRestaurants, error: nearByRestaurantsError } =
        await fetchRestaurants(lat, lng);

    return (
        <>
            {/* カテゴリー一覧 */}
            <Categories />

            {/* レストラン一覧セクション */}
            {!nearByRestaurants ? (
                // エラーが発生した場合
                <p>{nearByRestaurantsError}</p>
            ) : nearByRestaurants.length > 0 ? (
                // レストランが見つかった場合
                <Section
                    title="近くのお店"
                    expandedContent={
                        <RestaurantList restaurants={nearByRestaurants} />
                    }
                >
                    {/* カルーセルでレストランを表示（1画面に4件表示） */}
                    <CarouselContainer slideToShow={4}>
                        {nearByRestaurants.map((restaurant, index) => (
                            <RestaurantCard
                                key={index}
                                restaurant={restaurant}
                            />
                        ))}
                    </CarouselContainer>
                </Section>
            ) : (
                // レストランが見つからなかった場合
                <p>近くにレストランがありません</p>
            )}

            {/* ラーメン店一覧セクション */}
            {!nearbyRamenRestaurants ? (
                // エラーが発生した場合
                <p>{nearbyRamenRestaurantsError}</p>
            ) : nearbyRamenRestaurants.length > 0 ? (
                // ラーメン店が見つかった場合
                <Section
                    title="近くのラーメン店"
                    expandedContent={
                        <RestaurantList restaurants={nearbyRamenRestaurants} />
                    }
                >
                    {/* カルーセルでラーメン店を表示（1画面に4件表示） */}
                    <CarouselContainer slideToShow={4}>
                        {nearbyRamenRestaurants.map((restaurant, index) => (
                            <RestaurantCard
                                key={index}
                                restaurant={restaurant}
                            />
                        ))}
                    </CarouselContainer>
                </Section>
            ) : (
                // ラーメン店が見つからなかった場合
                <p>近くにラーメン店がありません</p>
            )}
        </>
    );
}
