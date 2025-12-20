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

export interface GoogleplacesAutocompleteApiResponse {
    suggestions?: PlaceAutocompleteResult[];
}

export interface PlaceAutocompleteResult {
    placePrediction?: {
        place?: string;
        placeId?: string;
        structuredFormat?: {
            mainText?: {
                text?: string;
            };
        };
    };
    queryPrediction?: {
        text?: {
            text?: string;
        };
    };
}

export type RestaurantSuggestion =
    | {
          type: "placePrediction";
          placeId: string;
      }
    | {
          type: "queryPrediction";
          placeName: string;
      };
