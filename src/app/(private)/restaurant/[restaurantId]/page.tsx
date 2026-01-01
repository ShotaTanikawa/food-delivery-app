import MenuContent from "@/components/menu-content";
import MenuSearchBar from "@/components/menu-search-bar";
import { Button } from "@/components/ui/button";
import { fetchCategoryMenus } from "@/lib/menus/api";
import { getPlaceDetails } from "@/lib/restaurants/api";
import { Heart } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

/**
 * レストラン詳細ページ（Server Component）
 * 指定されたレストランの詳細情報とメニュー一覧を表示するページ
 *
 * このページの主な機能：
 * 1. URLパラメータ（restaurantId）からレストランIDを取得
 * 2. Google Places APIからレストランの詳細情報（名前、写真、タイプ）を取得
 * 3. レストランのタイプ（primaryType）に基づいてメニューをデータベースから取得
 * 4. レストラン情報とメニュー一覧を表示
 *
 * @param params 動的ルートパラメータ（[restaurantId]部分）
 * @param searchParams URLのクエリパラメータ（?sessionToken=xxx&searchMenu=xxx の部分）
 */
export default async function RestaurantPage({
    params,
    searchParams,
}: {
    params: Promise<{ restaurantId: string }>;
    searchParams: Promise<{ sessionToken: string; searchMenu: string }>;
}) {
    // URLパラメータからレストランIDを取得
    // 例: /restaurant/ChIJN1t_tDeuEmsRUsoyG83frY4 → restaurantId = "ChIJN1t_tDeuEmsRUsoyG83frY4"
    const { restaurantId } = await params;

    // URLのクエリパラメータから値を取得
    // 例: /restaurant/xxx?sessionToken=abc123&searchMenu=ラーメン
    const { sessionToken, searchMenu } = await searchParams;
    // sessionToken: Google Places API用のセッショントークン（課金管理用）
    //              レストラン検索（オートコンプリート）から遷移してきた場合に渡される
    //              同じセッション内の複数のAPI呼び出しを関連付けるために使用
    // searchMenu: メニュー検索のキーワード（将来メニュー検索機能で使用予定）
    //             現在は取得しているが、まだ使用されていない

    console.log("restaurantId:", restaurantId);
    console.log("sessionToken:", sessionToken);
    console.log("searchMenu:", searchMenu);

    // Google Places APIからレストランの詳細情報を取得
    // restaurantIdに基づいて、レストラン名、写真、主要タイプ（ジャンル）を取得
    const { data: restaurant, error } = await getPlaceDetails(
        restaurantId,
        ["displayName", "photos", "primaryType"], // 取得するフィールド：レストラン名、写真、主要タイプ
        sessionToken // セッショントークンを渡すことで、オートコンプリートと同一セッションとして扱われる（料金最適化）
    );

    console.log("レストラン情報:", restaurant);

    // レストランの主要タイプ（ジャンル）を取得
    // 例: "ramen_restaurant", "sushi_restaurant" など
    // このタイプに基づいて、データベースから該当するジャンルのメニューを取得する
    const primaryType = restaurant?.primaryType;
    console.log("primaryType:", primaryType);

    // レストランのタイプが取得できた場合、そのタイプに一致するメニューをデータベースから取得
    // メニューはカテゴリー別（注目商品、ラーメン、サイドメニューなど）に分類されて返される
    const { data: categoryMenus, error: menusError } = primaryType
        ? await fetchCategoryMenus(primaryType, searchMenu) // タイプが存在する場合：メニューを取得
        : { data: [] }; // タイプが存在しない場合：空の配列を返す

    console.log("カテゴリーメニュー情報:", categoryMenus);

    // レストラン情報が取得できなかった場合、404ページを表示
    if (!restaurant) {
        notFound();
    }

    return (
        <>
            {/* レストラン情報表示エリア */}
            <div>
                {/* レストランのヘッダー画像エリア */}
                <div className="h-64 rounded-xl shadow-md relative overflow-hidden">
                    {/* レストランのメイン画像（Google Places APIから取得した写真） */}
                    <Image
                        src={restaurant.photoUrl!}
                        fill
                        alt={restaurant.displayName ?? "レストラン画像"}
                        className="object-cover"
                        priority // ページの最初に表示する画像なので優先的に読み込む
                        sizes="(max-width: 1280px) 100vw, 1200px" // レスポンシブ画像サイズの指定
                    />
                    {/* お気に入りボタン（右上に配置） */}
                    <Button
                        size="icon"
                        variant="outline"
                        className="absolute top-4 right-4 shadow rounded-full"
                    >
                        <Heart color="gray" strokeWidth={3} size={15} />
                    </Button>
                </div>

                {/* レストラン名とメニュー検索バーエリア */}
                <div className="mt-4 flex items-center justify-between">
                    {/* レストラン名 */}
                    <div>
                        <h1 className="text-3xl font-bold">
                            {restaurant.displayName}
                        </h1>
                    </div>

                    {/* メニュー検索バー（右側に配置） */}
                    <div className="flex-1">
                        <div className="ml-auto w-80">
                            {/* メニュー内検索バーコンポーネント（将来メニュー検索機能で使用予定） */}
                            <MenuSearchBar />
                        </div>
                    </div>
                </div>
            </div>

            {/* メニュー一覧表示エリア */}
            {!categoryMenus ? (
                // エラーが発生した場合：エラーメッセージを表示
                <p>{menusError}</p>
            ) : categoryMenus.length > 0 ? (
                // メニューが存在する場合：カテゴリー別メニューコンテンツを表示
                <MenuContent categoryMenus={categoryMenus} />
            ) : (
                // メニューが存在しない場合：メッセージを表示
                <p>メニューがありません</p>
            )}
        </>
    );
}
