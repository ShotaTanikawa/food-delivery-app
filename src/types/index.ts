/**
 * Google Places API (Nearby Search) のレスポンス型
 */
export interface GoogleplacesSearchApiResponse {
    places?: PlaceSearchResult[];
}

/**
 * レストラン情報の型
 */
export interface Restaurant {
    id: string;
    restaurantName?: string; // レストラン名
    primaryType?: string; // 主要なカテゴリ
    photoUrl: string; // 写真URL
}

/**
 * Google Places APIから取得した場所情報の型
 */
export interface PlaceSearchResult {
    id: string;
    displayName?: {
        languageCode?: string; // 言語コード
        text?: string; // 表示名
    };
    primaryType?: string; // 主要なタイプ（例: "restaurant"）
    photos?: PlacePhoto[]; // 写真の配列
}

/**
 * Google Places APIの写真情報の型
 */
export interface PlacePhoto {
    name?: string; // 写真リソース名
}

/**
 * Google Places API (Autocomplete) のレスポンス型
 */
export interface GoogleplacesAutocompleteApiResponse {
    suggestions?: PlaceAutocompleteResult[];
}

/**
 * Google Places APIのオートコンプリート結果の型
 * placePrediction と queryPrediction のいずれかを含む
 */
export interface PlaceAutocompleteResult {
    // 特定の場所の予測（placeIdを持つ）
    placePrediction?: {
        place?: string;
        placeId?: string; // 場所の一意ID
        structuredFormat?: {
            mainText?: {
                text?: string; // 表示名（例: "ラーメン荘 歴史を刻め 世田谷"）
            };
            secondaryText?: {
                text?: string; // 表示名（例: "ラーメン荘 歴史を刻め 世田谷"）
            };
        };
    };
    // 検索クエリの予測（特定の場所ではない）
    queryPrediction?: {
        text?: {
            text?: string; // クエリテキスト（例: "ラーメン屋"）
        };
    };
}

/**
 * レストラン検索のサジェスト結果の統一型
 * API Route Handlerで変換後の形式
 */
export interface RestaurantSuggestion {
    type: string; // "placePrediction" または "queryPrediction"
    placeId?: string; // 場所ID（placePredictionの場合のみ存在）
    placeName: string; // 表示名またはクエリテキスト
}

/**
 * 住所検索のサジェスト結果の型
 * API Route Handlerで変換後の形式
 */
export interface AddressSuggestion {
    placeId: string; // 場所の一意ID
    placeName: string; // 場所名（例: "ラーメン荘 歴史を刻め 世田谷"）
    address_text: string; // 住所テキスト（例: "東京都世田谷区..."）
}

/**
 * Google Places API (Place Details) のレスポンス型
 * 場所の詳細情報（緯度・経度など）を含む
 */
export interface GooglePlaceDetailsApiResponse {
    location?: {
        latitude?: number; // 緯度
        longitude?: number; // 経度
    };
    displayName?: {
        languageCode?: string;
        text?: string;
    };
    primaryType?: string;
    photos?: PlacePhoto[];
}

/**
 * 場所の詳細情報の型（すべてのフィールドを含む場合用）
 */
export interface PlaceDetaisAll {
    location?: {
        latitude?: number; // 緯度
        longitude?: number; // 経度
    };
    displayName?: string;
    primaryType?: string;
    photoUrl?: string;
}

/**
 * データベースに保存された住所情報の型
 */
export interface Address {
    id: number; // 住所の一意ID
    name: string; // 住所名（場所名）
    address_text: string; // 住所テキスト
    latitude: number; // 緯度
    longitude: number; // 経度
}

/**
 * 住所情報APIのレスポンス型
 */
export interface AddressResponse {
    addressList: Address[]; // ユーザーが登録したすべての住所一覧
    selectedAddress: Address; // 現在選択中の住所
}

/**
 * カテゴリー別に分類されたメニューの型
 * レストランのメニューをカテゴリーごとにグループ化して管理するために使用
 */
export interface CategoryMenu {
    categoryName: string; // カテゴリーの表示名（例: "注目商品", "ラーメン", "サイドメニュー"）
    id: string; // カテゴリーの一意ID（例: "featured", "ramen", "side"）
    items: Menu[]; // このカテゴリーに属するメニューのリスト
}

/**
 * メニューアイテムの型
 * レストランの個々のメニュー項目の情報を表す
 */
export interface Menu {
    id: number; // メニューの一意ID（データベースの主キー）
    name: string; // メニュー名（例: "醤油ラーメン", "チャーシュー丼"）
    photoUrl: string; // メニュー画像のURL（Supabase Storageの公開URL）
    price: number; // メニューの価格（単位: 円）
}
