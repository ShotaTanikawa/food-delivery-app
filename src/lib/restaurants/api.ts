import { GoogleplacesSearchApiResponse } from "@/types";
import { transformPlaceResults } from "./utils";

//近くのレストランを取得
export async function fetchRestaurants() {
    const url = "https://places.googleapis.com/v1/places:searchNearby";

    const apiKey = process.env.GOOGLE_API_KEY;

    const header = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey!,
        "X-Goog-FieldMask":
            "places.id,places.displayName,places.primaryType,places.photos",
    };

    const desiredTypes = [
        "japanese_restaurant",
        "cafe",
        "cafeteria",
        "coffee_shop",
        "chinese_restaurant",
        "fast_food_restaurant",
        "hamburger_restaurant",
        "french_restaurant",
        "italian_restaurant",
        "pizza_restaurant",
        "ramen_restaurant",
        "sushi_restaurant",
        "korean_restaurant",
        "indian_restaurant",
    ];

    const requestBody = {
        includedTypes: desiredTypes,
        maxResultCount: 10,
        locationRestriction: {
            circle: {
                center: {
                    latitude: 35.6669248, //渋谷
                    longitude: 139.6514163, //渋谷
                },
                radius: 500.0,
            },
        },
        languageCode: "ja",
    };

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: header,
        next: { revalidate: 86400 }, //24時間ごとに再検証
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);

        return {
            error: `Nearby searchリクエストに失敗しました。ステータスコード: ${response.status}`,
        };
    }

    const data: GoogleplacesSearchApiResponse = await response.json();

    console.log(data);

    if (!data.places) {
        return { data: [] };
    }
    const nearbyplaces = data.places;

    const matchingPlaces = nearbyplaces.filter(
        (place) => place.primaryType && desiredTypes.includes(place.primaryType)
    );
    console.log("matchingPlaces:", matchingPlaces);

    const Restaurants = await transformPlaceResults(matchingPlaces);
    console.log("Restaurants:", Restaurants);
    return { data: Restaurants };
}

//近くのラーメン店を取得
export async function fetchRamenRestaurants() {
    const url = "https://places.googleapis.com/v1/places:searchNearby";

    const apiKey = process.env.GOOGLE_API_KEY;

    const header = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey!,
        "X-Goog-FieldMask":
            "places.id,places.displayName,places.primaryType,places.photos",
    };

    const requestBody = {
        includedPrimaryTypes: ["ramen_restaurant"],
        maxResultCount: 10,
        locationRestriction: {
            circle: {
                center: {
                    latitude: 35.6669248, //渋谷
                    longitude: 139.6514163, //渋谷
                },
                radius: 500.0,
            },
        },
        languageCode: "ja",
    };

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: header,
        next: { revalidate: 86400 }, //24時間ごとに再検証
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);

        return {
            error: `Nearby searchリクエストに失敗しました。ステータスコード: ${response.status}`,
        };
    }

    const data: GoogleplacesSearchApiResponse = await response.json();

    console.log(data);

    if (!data.places) {
        return { data: [] };
    }
    const nearbyRamenplaces = data.places;
    const RamenRestaurants = await transformPlaceResults(nearbyRamenplaces);
    console.log(RamenRestaurants);
    return { data: RamenRestaurants };
}

//カテゴリー検索機能
export async function fetchCategoryRestaurants(category: string) {
    const url = "https://places.googleapis.com/v1/places:searchNearby";

    const apiKey = process.env.GOOGLE_API_KEY;

    const header = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey!,
        "X-Goog-FieldMask":
            "places.id,places.displayName,places.primaryType,places.photos",
    };

    const requestBody = {
        includedPrimaryTypes: [category],
        maxResultCount: 10,
        locationRestriction: {
            circle: {
                center: {
                    latitude: 35.6669248, //渋谷
                    longitude: 139.6514163, //渋谷
                },
                radius: 500.0,
            },
        },
        languageCode: "ja",
    };

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: header,
        next: { revalidate: 86400 }, //24時間ごとに再検証
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);

        return {
            error: `Nearby searchリクエストに失敗しました。ステータスコード: ${response.status}`,
        };
    }

    const data: GoogleplacesSearchApiResponse = await response.json();

    console.log(data);

    if (!data.places) {
        return { data: [] };
    }
    const categoryPlaces = data.places;
    const categoryRestaurants = await transformPlaceResults(categoryPlaces);
    console.log(categoryRestaurants);
    return { data: categoryRestaurants };
}

export async function getPhotoUrl(name: string, maxWidthPx = 400) {
    "use cache";
    console.log("getPhotoUrl");
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://places.googleapis.com/v1/${name}/media?key=${apiKey}&maxWidthPx=${maxWidthPx}`;
    return url;
}
