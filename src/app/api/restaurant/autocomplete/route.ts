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
                    error: `Nearby searchリクエストに失敗しました。ステータスコード: ${response.status}`,
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("data:", JSON.stringify(data, null, 2));

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
