export interface GoogleplacesSearchApiResponse {
    places?: PlaceSearchResult[];
}

export interface Restaurant {
    id: string;
    restaurantName?: string;
    primaryType?: string;
    photoUrl: string;
}

export interface PlaceSearchResult {
    id: string;
    displayName?: {
        languageCode?: string;
        text?: string;
    };
    primaryType?: string;
    photos?: PlacePhoto[];
}

export interface PlacePhoto {
    name?: string;
}
