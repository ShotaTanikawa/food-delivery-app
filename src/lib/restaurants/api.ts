import { GoogleplacesSearchApiResponse } from "@/types";
import { transformPlaceResults } from "./utils";

/**
 * 渋谷周辺の近くのレストランを取得
 * Google Places API (Nearby Search) を使用して、複数のレストランタイプから結果を取得
 * @returns レストランリストまたはエラーメッセージ
 */
export async function fetchRestaurants() {
    // Google Places API の Nearby Search エンドポイント
    const url = "https://places.googleapis.com/v1/places:searchNearby";

    const apiKey = process.env.GOOGLE_API_KEY;

    // APIリクエストヘッダー
    const header = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey!,
        // 取得するフィールドを指定（レスポンスサイズを最適化）
        "X-Goog-FieldMask":
            "places.id,places.displayName,places.primaryType,places.photos",
    };

    // 検索対象となるレストランのタイプ
    const desiredTypes = [
        "japanese_restaurant", // 日本料理
        "cafe", // カフェ
        "cafeteria", // カフェテリア
        "coffee_shop", // コーヒーショップ
        "chinese_restaurant", // 中華料理
        "fast_food_restaurant", // ファーストフード
        "hamburger_restaurant", // ハンバーガー店
        "french_restaurant", // フレンチ
        "italian_restaurant", // イタリアン
        "pizza_restaurant", // ピザ店
        "ramen_restaurant", // ラーメン店
        "sushi_restaurant", // 寿司店
        "korean_restaurant", // 韓国料理
        "indian_restaurant", // インド料理
    ];

    // APIリクエストボディ
    const requestBody = {
        includedTypes: desiredTypes, // 検索対象のレストランタイプ
        maxResultCount: 10, // 最大取得件数
        locationRestriction: {
            // 位置制限：渋谷周辺500m以内
            circle: {
                center: {
                    latitude: 35.6669248, // 渋谷の緯度
                    longitude: 139.6514163, // 渋谷の経度
                },
                radius: 500.0, // 半径500m
            },
        },
        languageCode: "ja", // 日本語
    };

    // Google Places APIにリクエスト送信
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: header,
        next: { revalidate: 86400 }, // 24時間ごとに再検証（キャッシュ戦略）
    });

    // エラーハンドリング
    if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);

        return {
            error: `Nearby searchリクエストに失敗しました。ステータスコード: ${response.status}`,
        };
    }

    // レスポンスをパース
    const data: GoogleplacesSearchApiResponse = await response.json();

    console.log(data);

    // 結果がない場合
    if (!data.places) {
        return { data: [] };
    }
    const nearbyplaces = data.places;

    // 指定したタイプに一致する場所のみをフィルタリング
    const matchingPlaces = nearbyplaces.filter(
        (place) => place.primaryType && desiredTypes.includes(place.primaryType)
    );
    console.log("matchingPlaces:", matchingPlaces);

    // 場所データをレストランデータに変換
    const Restaurants = await transformPlaceResults(matchingPlaces);
    console.log("Restaurants:", Restaurants);
    return { data: Restaurants };
}

/**
 * 渋谷周辺の近くのラーメン店を取得
 * Google Places API (Nearby Search) を使用して、ラーメン店のみを取得
 * @returns ラーメン店リストまたはエラーメッセージ
 */
export async function fetchRamenRestaurants() {
    // Google Places API の Nearby Search エンドポイント
    const url = "https://places.googleapis.com/v1/places:searchNearby";

    const apiKey = process.env.GOOGLE_API_KEY;

    // APIリクエストヘッダー
    const header = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey!,
        // 取得するフィールドを指定
        "X-Goog-FieldMask":
            "places.id,places.displayName,places.primaryType,places.photos",
    };

    // APIリクエストボディ（ラーメン店のみ）
    const requestBody = {
        includedPrimaryTypes: ["ramen_restaurant"], // ラーメン店のみ
        maxResultCount: 10, // 最大取得件数
        locationRestriction: {
            // 位置制限：渋谷周辺1000m以内
            circle: {
                center: {
                    latitude: 35.6669248, // 渋谷の緯度
                    longitude: 139.6514163, // 渋谷の経度
                },
                radius: 1000.0, // 半径1000m
            },
        },
        languageCode: "ja", // 日本語
        rankPreference: "DISTANCE", // 距離順位付け
    };

    // Google Places APIにリクエスト送信
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: header,
        next: { revalidate: 86400 }, // 24時間ごとに再検証（キャッシュ戦略）
    });

    // エラーハンドリング
    if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);

        return {
            error: `Nearby searchリクエストに失敗しました。ステータスコード: ${response.status}`,
        };
    }

    // レスポンスをパース
    const data: GoogleplacesSearchApiResponse = await response.json();

    console.log(data);

    // 結果がない場合
    if (!data.places) {
        return { data: [] };
    }
    const nearbyRamenplaces = data.places;
    // 場所データをレストランデータに変換
    const RamenRestaurants = await transformPlaceResults(nearbyRamenplaces);
    console.log(RamenRestaurants);
    return { data: RamenRestaurants };
}

/**
 * キーワード検索機能
 * 指定したカテゴリーのレストランを取得
 * @param query レストランのキーワード（例: "ラーメン", "寿司"）
 * @returns カテゴリーに一致するレストランリストまたはエラーメッセージ
 */
export async function fetchRestaurantsByKeyword(query: string) {
    // Google Places API の Nearby Search エンドポイント
    const url = "https://places.googleapis.com/v1/places:searchText";

    const apiKey = process.env.GOOGLE_API_KEY;

    // APIリクエストヘッダー
    const header = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey!,
        // 取得するフィールドを指定
        "X-Goog-FieldMask":
            "places.id,places.displayName,places.primaryType,places.photos",
    };

    // APIリクエストボディ（指定されたカテゴリーのみ）
    const requestBody = {
        textQuery: query, // 指定されたキーワード
        pageSize: 10, // 最大取得件数
        locationBias: {
            // 位置制限：渋谷周辺1000m以内
            circle: {
                center: {
                    latitude: 35.6669248, // 渋谷の緯度
                    longitude: 139.6514163, // 渋谷の経度
                },
                radius: 1000.0, // 半径1000m
            },
        },
        languageCode: "ja", // 日本語
        rankPreference: "DISTANCE", // 距離順位付け
    };

    // Google Places APIにリクエスト送信
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: header,
        next: { revalidate: 86400 }, // 24時間ごとに再検証（キャッシュ戦略）
    });

    // エラーハンドリング
    if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);

        return {
            error: `Text searchリクエストに失敗しました。ステータスコード: ${response.status}`,
        };
    }

    // レスポンスをパース
    const data: GoogleplacesSearchApiResponse = await response.json();

    console.log(data);

    // 結果がない場合
    if (!data.places) {
        return { data: [] };
    }
    const textSearchPlaces = data.places;
    // 場所データをレストランデータに変換
    const restaurants = await transformPlaceResults(textSearchPlaces);
    console.log(restaurants);
    return { data: restaurants };
}

export async function fetchCategoryRestaurants(category: string) {
    // Google Places API の Nearby Search エンドポイント
    const url = "https://places.googleapis.com/v1/places:searchNearby";

    const apiKey = process.env.GOOGLE_API_KEY;

    // APIリクエストヘッダー
    const header = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey!,
        // 取得するフィールドを指定
        "X-Goog-FieldMask":
            "places.id,places.displayName,places.primaryType,places.photos",
    };

    // APIリクエストボディ（指定されたカテゴリーのみ）
    const requestBody = {
        includedPrimaryTypes: [category], // 指定されたカテゴリー
        maxResultCount: 10, // 最大取得件数
        locationRestriction: {
            // 位置制限：渋谷周辺500m以内
            circle: {
                center: {
                    latitude: 35.6669248, // 渋谷の緯度
                    longitude: 139.6514163, // 渋谷の経度
                },
                radius: 500.0, // 半径500m
            },
        },
        languageCode: "ja", // 日本語
    };

    // Google Places APIにリクエスト送信
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: header,
        next: { revalidate: 86400 }, // 24時間ごとに再検証（キャッシュ戦略）
    });

    // エラーハンドリング
    if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);

        return {
            error: `Nearby searchリクエストに失敗しました。ステータスコード: ${response.status}`,
        };
    }

    // レスポンスをパース
    const data: GoogleplacesSearchApiResponse = await response.json();

    console.log(data);

    // 結果がない場合
    if (!data.places) {
        return { data: [] };
    }
    const categoryPlaces = data.places;
    // 場所データをレストランデータに変換
    const categoryRestaurants = await transformPlaceResults(categoryPlaces);
    console.log(categoryRestaurants);
    return { data: categoryRestaurants };
}

/**
 * Google Places APIの写真URLを取得
 * @param name 写真リソース名（places.photos[].name）
 * @param maxWidthPx 最大幅（ピクセル、デフォルト: 400）
 * @returns 写真のURL
 */
export async function getPhotoUrl(name: string, maxWidthPx = 400) {
    "use cache"; // Next.jsのキャッシュ機能を使用
    console.log("getPhotoUrl");
    const apiKey = process.env.GOOGLE_API_KEY;
    // Google Places APIの写真メディアエンドポイント
    const url = `https://places.googleapis.com/v1/${name}/media?key=${apiKey}&maxWidthPx=${maxWidthPx}`;
    return url;
}
