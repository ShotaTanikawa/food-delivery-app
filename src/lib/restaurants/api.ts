import {
    GooglePlaceDetailsApiResponse,
    GoogleplacesSearchApiResponse,
    PlaceDetaisAll,
} from "@/types";
import { transformPlaceResults } from "./utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

/**
 * 指定された位置周辺の近くのレストランを取得
 * Google Places API (Nearby Search) を使用して、複数のレストランタイプから結果を取得
 * 位置情報はユーザーが選択した住所に基づいて動的に指定される
 * @param lat 検索の中心となる緯度（ユーザーが選択した住所の緯度）
 * @param lng 検索の中心となる経度（ユーザーが選択した住所の経度）
 * @returns レストランリストまたはエラーメッセージ
 */
export async function fetchRestaurants(lat: number, lng: number) {
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
            // 位置制限：指定された緯度経度を中心とした半径500m以内で検索
            circle: {
                center: {
                    latitude: lat, // 検索の中心となる緯度（ユーザーが選択した住所の緯度）
                    longitude: lng, // 検索の中心となる経度（ユーザーが選択した住所の経度）
                },
                radius: 500.0, // 検索半径500m
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

    // 結果がない場合
    if (!data.places) {
        return { data: [] };
    }
    const nearbyplaces = data.places;

    // 指定したタイプに一致する場所のみをフィルタリング
    const matchingPlaces = nearbyplaces.filter(
        (place) => place.primaryType && desiredTypes.includes(place.primaryType)
    );

    // 場所データをレストランデータに変換
    const Restaurants = await transformPlaceResults(matchingPlaces);
    return { data: Restaurants };
}

/**
 * 指定された位置周辺の近くのラーメン店を取得
 * Google Places API (Nearby Search) を使用して、ラーメン店のみを取得
 * 位置情報はユーザーが選択した住所に基づいて動的に指定される
 * @param lat 検索の中心となる緯度（ユーザーが選択した住所の緯度）
 * @param lng 検索の中心となる経度（ユーザーが選択した住所の経度）
 * @returns ラーメン店リストまたはエラーメッセージ
 */
export async function fetchRamenRestaurants(lat: number, lng: number) {
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
            // 位置制限：指定された緯度経度を中心とした半径1000m以内で検索
            circle: {
                center: {
                    latitude: lat, // 検索の中心となる緯度（ユーザーが選択した住所の緯度）
                    longitude: lng, // 検索の中心となる経度（ユーザーが選択した住所の経度）
                },
                radius: 1000.0, // 検索半径1000m（ラーメン店は広範囲で検索）
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

    // 結果がない場合
    if (!data.places) {
        return { data: [] };
    }
    const nearbyRamenplaces = data.places;
    // 場所データをレストランデータに変換
    const RamenRestaurants = await transformPlaceResults(nearbyRamenplaces);
    return { data: RamenRestaurants };
}

/**
 * キーワード検索機能
 * 指定したキーワードに基づいてレストランを検索し、位置情報を考慮して結果を取得
 * Google Places API (Text Search) を使用して、テキストクエリでレストランを検索
 * @param query 検索キーワード（例: "ラーメン", "寿司"）
 * @param lat 検索の中心となる緯度（ユーザーが選択した住所の緯度）
 * @param lng 検索の中心となる経度（ユーザーが選択した住所の経度）
 * @returns キーワードに一致するレストランリストまたはエラーメッセージ
 */
export async function fetchRestaurantsByKeyword(
    query: string,
    lat: number,
    lng: number
) {
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
            // 位置バイアス：指定された緯度経度を中心とした半径1000m以内を優先的に検索
            // テキスト検索では locationBias を使用して位置情報を考慮する
            circle: {
                center: {
                    latitude: lat, // 検索の中心となる緯度（ユーザーが選択した住所の緯度）
                    longitude: lng, // 検索の中心となる経度（ユーザーが選択した住所の経度）
                },
                radius: 1000.0, // 検索半径1000m
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

    // 結果がない場合
    if (!data.places) {
        return { data: [] };
    }
    const textSearchPlaces = data.places;
    // 場所データをレストランデータに変換
    const restaurants = await transformPlaceResults(textSearchPlaces);
    return { data: restaurants };
}

/**
 * カテゴリー検索機能
 * 指定したカテゴリーのレストランを位置情報に基づいて取得
 * Google Places API (Nearby Search) を使用して、特定のカテゴリーのレストランのみを取得
 * @param category レストランのカテゴリー（例: "ramen_restaurant", "sushi_restaurant"）
 * @param lat 検索の中心となる緯度（ユーザーが選択した住所の緯度）
 * @param lng 検索の中心となる経度（ユーザーが選択した住所の経度）
 * @returns カテゴリーに一致するレストランリストまたはエラーメッセージ
 */
export async function fetchCategoryRestaurants(
    category: string,
    lat: number,
    lng: number
) {
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
            // 位置制限：指定された緯度経度を中心とした半径500m以内で検索
            circle: {
                center: {
                    latitude: lat, // 検索の中心となる緯度（ユーザーが選択した住所の緯度）
                    longitude: lng, // 検索の中心となる経度（ユーザーが選択した住所の経度）
                },
                radius: 500.0, // 検索半径500m
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

    // 結果がない場合
    if (!data.places) {
        return { data: [] };
    }
    const categoryPlaces = data.places;
    // 場所データをレストランデータに変換
    const categoryRestaurants = await transformPlaceResults(categoryPlaces);
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
    const apiKey = process.env.GOOGLE_API_KEY;
    // Google Places APIの写真メディアエンドポイント
    const url = `https://places.googleapis.com/v1/${name}/media?key=${apiKey}&maxWidthPx=${maxWidthPx}`;
    return url;
}

/**
 * Google Places APIから場所の詳細情報を取得
 * 指定されたplaceIdの場所の詳細情報（緯度・経度、写真、営業時間など）を取得する
 * @param placeId 場所の一意ID（Google Places APIのplaceId）
 * @param fields 取得するフィールドの配列（例: ["location", "photos"]）
 * @param sessionToken オプション：Google Places API用のセッショントークン（課金管理用）
 * @returns 場所の詳細情報またはエラー
 */
export async function getPlaceDetails(
    placeId: string,
    fields: string[],
    sessionToken?: string
) {
    // フィールド配列をカンマ区切りの文字列に変換（APIリクエストで使用）
    const fieldParam = fields.join(",");

    let url: string;

    // セッショントークンが指定されている場合は、URLに含める
    // セッショントークンは、同じ検索セッション内での複数のAPI呼び出しを関連付けるために使用
    if (sessionToken) {
        url = `https://places.googleapis.com/v1/places/${placeId}?sessionToken=${sessionToken}&languageCode=ja`;
    } else {
        url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=ja`;
    }

    const apiKey = process.env.GOOGLE_API_KEY;

    // APIリクエストヘッダー
    const header = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey!,
        "X-Goog-FieldMask": fieldParam,
    };

    // Google Places APIにリクエスト送信
    const response = await fetch(url, {
        method: "GET",
        headers: header,
        next: { revalidate: 86400 }, // 24時間ごとに再検証（キャッシュ戦略）
    });

    // エラーハンドリング
    if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);

        return {
            error: `Place detailsリクエストに失敗しました。ステータスコード: ${response.status}`,
        };
    }

    // レスポンスをパース
    const data: GooglePlaceDetailsApiResponse = await response.json();

    // 返却用の結果オブジェクトを初期化
    const results: PlaceDetaisAll = {};

    // リクエストされたフィールドの中にlocationが含まれ、データにもlocationがある場合
    // 結果オブジェクトにlocation情報を設定
    if (fields.includes("location") && data.location) {
        results.location = data.location;
    }

    // 取得した詳細情報を返す
    return { data: results };
}

/**
 * 現在選択されている住所の緯度・経度を取得
 * ユーザーが選択した住所の位置情報を取得し、レストラン検索の中心位置として使用する
 * 住所が選択されていない場合は、デフォルトの位置（渋谷）を返す
 * @returns 緯度と経度を含むオブジェクト { lat: number, lng: number }
 */
export async function fetchLocation() {
    // デフォルトの位置（渋谷）を設定
    // ユーザーが住所を選択していない場合に使用される
    const DEFAULT_LOCATION = { lat: 35.6669248, lng: 139.6990609 };

    const supabase = await createClient();
    // 現在ログインしているユーザー情報を取得
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    // ユーザーがログインしていない場合はログインページにリダイレクト
    if (userError || !user) {
        redirect("/login");
    }

    // 現在選択中の住所の緯度・経度を取得
    // profilesテーブルからaddressesテーブルをJOINして、選択中の住所の位置情報を取得
    const { data: selectedAddress, error: selectedAddressError } =
        await supabase
            .from("profiles")
            .select("addresses(latitude, longitude)") // 住所テーブルから緯度・経度のみを取得
            .eq("id", user.id) // 現在のユーザーのプロフィールを取得
            .single(); // 単一レコードのみを期待

    // エラーハンドリング
    if (selectedAddressError) {
        console.error("緯度と経度の取得に失敗しました。", selectedAddressError);
        throw new Error("緯度と経度の取得に失敗しました。");
    }

    // 選択中の住所から緯度・経度を取得
    // 住所が選択されていない場合はデフォルト位置を使用
    const lat = selectedAddress.addresses?.latitude ?? DEFAULT_LOCATION.lat;
    const lng = selectedAddress.addresses?.longitude ?? DEFAULT_LOCATION.lng;

    return { lat, lng };
}
