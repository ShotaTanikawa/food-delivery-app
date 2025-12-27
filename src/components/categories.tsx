"use client";

import { useRouter, useSearchParams } from "next/navigation";
import CarouselContainer from "./carousel-container";
import Category from "./category";

/**
 * カテゴリータイプの型定義
 */
export interface CategoryType {
    categoryName: string; // カテゴリーの表示名（例: "ラーメン"）
    type: string; // Google Places APIのタイプ（例: "ramen_restaurant"）
    imageUrl: string; // カテゴリー画像のURL
}

/**
 * カテゴリー一覧コンポーネント
 * レストランのカテゴリーをカルーセル形式で表示
 * カテゴリーをクリックすると、そのカテゴリーのレストラン検索ページに遷移
 * 同じカテゴリーを再度クリックすると、検索条件をクリアしてホームに戻る
 */
export default function Categories() {
    // 表示するカテゴリーのリスト
    const categories: CategoryType[] = [
        {
            categoryName: "ファーストフード",
            type: "fast_food_restaurant",
            imageUrl: "/images/categories/ファーストフード.png",
        },
        {
            categoryName: "日本料理",
            type: "japanese_restaurant",
            imageUrl: "/images/categories/日本料理.png",
        },
        {
            categoryName: "ラーメン",
            type: "ramen_restaurant",
            imageUrl: "/images/categories/ラーメン.png",
        },
        {
            categoryName: "寿司",
            type: "sushi_restaurant",
            imageUrl: "/images/categories/寿司.png",
        },
        {
            categoryName: "中華料理",
            type: "chinese_restaurant",
            imageUrl: "/images/categories/中華料理.png",
        },
        {
            categoryName: "コーヒー",
            type: "cafe",
            imageUrl: "/images/categories/コーヒー.png",
        },
        {
            categoryName: "イタリアン",
            type: "italian_restaurant",
            imageUrl: "/images/categories/イタリアン.png",
        },
        {
            categoryName: "フランス料理",
            type: "french_restaurant",
            imageUrl: "/images/categories/フレンチ.png",
        },
        {
            categoryName: "ピザ",
            type: "pizza_restaurant",
            imageUrl: "/images/categories/ピザ.png",
        },
        {
            categoryName: "韓国料理",
            type: "korean_restaurant",
            imageUrl: "/images/categories/韓国料理.png",
        },
        {
            categoryName: "インド料理",
            type: "indian_restaurant",
            imageUrl: "/images/categories/インド料理.png",
        },
    ];

    // URLパラメータとルーターを取得
    const searchParams = useSearchParams();
    const router = useRouter();
    // 現在選択されているカテゴリーを取得
    const currentCategory = searchParams.get("category");

    /**
     * カテゴリーをクリックしたときの処理
     * 選択されたカテゴリーが現在のカテゴリーと同じ場合はホームに戻る
     * 異なる場合は、そのカテゴリーで検索ページに遷移
     */
    const searchRestaurantsOfCategory = (category: string) => {
        const params = new URLSearchParams(searchParams);
        if (currentCategory === category) {
            // 同じカテゴリーをクリックした場合は検索条件をクリアしてホームに戻る
            router.replace(`/`);
        } else {
            // 異なるカテゴリーをクリックした場合は検索ページに遷移
            params.set("category", category);
            router.replace(`/search?${params.toString()}`);
        }
    };

    return (
        // カルーセルコンテナでカテゴリーを表示（1画面に10個表示）
        <CarouselContainer slideToShow={10}>
            {categories.map((category) => (
                <Category
                    key={category.type}
                    category={category}
                    onClick={searchRestaurantsOfCategory}
                    // 現在選択されているカテゴリーかどうかを判定
                    select={currentCategory === category.type}
                />
            ))}
        </CarouselContainer>
    );
}
