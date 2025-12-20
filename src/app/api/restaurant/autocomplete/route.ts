import {
    GoogleplacesAutocompleteApiResponse,
    RestaurantSuggestion,
} from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get("input");
    const sessionToken = searchParams.get("sessionToken");

    console.log("input:", input);
    console.log("sessionToken:", sessionToken);

    if (!input) {
        return NextResponse.json(
            { error: "Input is required" },
            { status: 400 }
        );
    }

    if (!sessionToken) {
        return NextResponse.json(
            { error: "Session token is required" },
            { status: 400 }
        );
    }

    try {
        const url = "https://places.googleapis.com/v1/places:autocomplete";

        const apiKey = process.env.GOOGLE_API_KEY;

        const header = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey!,
        };

        const requestBody = {
            includeQueryPredictions: true,
            sessionToken: sessionToken,
            input: input,
            includedPrimaryTypes: ["restaurant"],
            locationBias: {
                circle: {
                    center: {
                        latitude: 35.6669248, //渋谷
                        longitude: 139.6514163, //渋谷
                    },
                    radius: 500.0,
                },
            },
            languageCode: "ja",
            regionCode: "JP",
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

            return NextResponse.json(
                {
                    error: `Autocompleteリクエストに失敗しました。ステータスコード: ${response.status}`,
                },
                { status: response.status }
            );
        }

        const data: GoogleplacesAutocompleteApiResponse = await response.json();
        console.log("data:", JSON.stringify(data, null, 2));

        const suggesions = data.suggestions ?? [];

        const results = suggesions
            .map((suggesion) => {
                // placePrediction の場合
                if (
                    suggesion.placePrediction &&
                    suggesion.placePrediction.placeId &&
                    suggesion.placePrediction.structuredFormat?.mainText?.text
                ) {
                    return {
                        type: "placePrediction" as const,
                        placeId:
                            suggesion.placePrediction.structuredFormat?.mainText
                                ?.text,
                    };
                } else if (
                    suggesion.queryPrediction &&
                    suggesion.queryPrediction.text?.text
                ) {
                    return {
                        type: "queryPrediction" as const,
                        placeName: suggesion.queryPrediction.text.text,
                    };
                }
                return undefined;
            })
            .filter(
                (suggestion): suggestion is RestaurantSuggestion =>
                    suggestion !== undefined
            );

        return NextResponse.json(results);
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
