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

export interface AddressSuggestion {
    placeId: string;
    placeName: string;
    address_text: string;
}

export interface GooglePlaceDetailsApiResponse {
    location?: { latitude?: number; longitude?: number };
}

export interface PlaceDetaisAll {
    location?: { latitude?: number; longitude?: number };
}

export interface Address {
    id: number;
    name: string;
    address_text: string;
    latitude: number;
    longitude: number;
}

export interface AddressResponse {
    addressList: Address[];
    selectedAddress: Address;
}
