import CarouselContainer from "@/components/carousel-container";
import Categories from "@/components/categories";
import RestaurantCard from "@/components/restaurant-card";
import RestaurantList from "@/components/restaurant-list";
import Section from "@/components/section";
import { fetchRamenRestaurants, fetchRestaurants } from "@/lib/restaurants/api";

export default async function Home() {
    const { data: nearbyRamenRestaurants, error: nearbyRamenRestaurantsError } =
        await fetchRamenRestaurants();

    const { data: nearByRestaurants, error: nearByRestaurantsError } =
        await fetchRestaurants();

    return (
        <>
            <Categories />

            {/* レストラン */}
            {!nearByRestaurants ? (
                <p>{nearByRestaurantsError}</p>
            ) : nearByRestaurants.length > 0 ? (
                <Section
                    title="近くのお店"
                    expandedContent={
                        <RestaurantList restaurants={nearByRestaurants} />
                    }
                >
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
                <p>近くにレストランがありません</p>
            )}
            {/* ラーメン店 */}
            {!nearbyRamenRestaurants ? (
                <p>{nearbyRamenRestaurantsError}</p>
            ) : nearbyRamenRestaurants.length > 0 ? (
                <Section
                    title="近くのラーメン店"
                    expandedContent={
                        <RestaurantList restaurants={nearbyRamenRestaurants} />
                    }
                >
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
                <p>近くにラーメン店がありません</p>
            )}
        </>
    );
}
