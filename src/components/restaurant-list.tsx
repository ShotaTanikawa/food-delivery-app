import { Restaurant } from "@/types";
import RestaurantCard from "./restaurant-card";

/**
 * RestaurantListコンポーネントのProps
 */
interface RestaurantListProps {
    restaurants: Restaurant[]; // 表示するレストランの配列
}

/**
 * レストランリストコンポーネント
 * レストランの配列を受け取り、4列のグリッドレイアウトで表示する
 * 各レストランはRestaurantCardコンポーネントとして表示される
 */
export default function RestaurantList({ restaurants }: RestaurantListProps) {
    return (
        <ul className="grid grid-cols-4 gap-4">
            {restaurants.map((restaurant) => (
                <RestaurantCard restaurant={restaurant} key={restaurant.id} />
            ))}
        </ul>
    );
}
