import MenuContent from "@/components/menu-content";
import { Button } from "@/components/ui/button";
import { fetchCategoryMenus } from "@/lib/menus/api";
import { getPlaceDetails } from "@/lib/restaurants/api";
import { Heart } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function RestaurantPage({
    params,
    searchParams,
}: {
    params: Promise<{ restaurantId: string }>;
    searchParams: Promise<{ sessionToken: string }>;
}) {
    const { restaurantId } = await params;
    const { sessionToken } = await searchParams;
    console.log("restaurantId:", restaurantId);
    console.log("sessionToken:", sessionToken);

    const { data: restaurant, error } = await getPlaceDetails(
        restaurantId,
        ["displayName", "photos", "primaryType"],
        sessionToken
    );

    console.log("レストラン情報:", restaurant);
    const primaryType = restaurant?.primaryType;
    console.log("primaryType:", primaryType);

    const { data: categoryMenus, error: menusError } = primaryType
        ? await fetchCategoryMenus(primaryType)
        : { data: [] };
    console.log("カテゴリーメニュー情報:", categoryMenus);

    if (!restaurant) {
        notFound();
    }

    return (
        <>
            <div>
                <div className="h-64 rounded-xl shadow-md relative overflow-hidden">
                    <Image
                        src={restaurant.photoUrl!}
                        fill
                        alt={restaurant.displayName ?? "レストラン画像"}
                        className="object-cover"
                        priority
                        sizes="(max-width: 1280px) 100vw, 1200px"
                    />
                    <Button
                        size="icon"
                        variant="outline"
                        className="absolute top-4 right-4 shadow rounded-full"
                    >
                        <Heart color="gray" strokeWidth={3} size={15} />
                    </Button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {restaurant.displayName}
                        </h1>
                    </div>

                    <div className="flex-1">
                        <div className="ml-auto w-80 bg-yellow-300">
                            検索バー
                        </div>
                    </div>
                </div>
            </div>

            {!categoryMenus ? (
                <p>{menusError}</p>
            ) : categoryMenus.length > 0 ? (
                <MenuContent categoryMenus={categoryMenus} />
            ) : (
                <p>メニューがありません</p>
            )}
        </>
    );
}
