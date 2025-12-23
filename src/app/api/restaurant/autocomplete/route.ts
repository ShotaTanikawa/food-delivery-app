import {
    GoogleplacesAutocompleteApiResponse,
    RestaurantSuggestion,
} from "@/types";
import { NextRequest, NextResponse } from "next/server";

/**
 * レストラン検索のオートコンプリートAPI Route Handler
 * Google Places APIを使用して、ユーザーの入力に基づいてレストラン検索のサジェストを返す
 */
export async function GET(request: NextRequest) {
    // クエリパラメータから検索入力とセッショントークンを取得
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get("input");
    const sessionToken = searchParams.get("sessionToken");

    console.log("input:", input);
    console.log("sessionToken:", sessionToken);

    // 入力値のバリデーション
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
        // Google Places API のオートコンプリートエンドポイント
        const url = "https://places.googleapis.com/v1/places:autocomplete";

        const apiKey = process.env.GOOGLE_API_KEY;

        // APIリクエストヘッダー
        const header = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey!,
        };

        // Google Places APIへのリクエストボディ
        const requestBody = {
            includeQueryPredictions: true, // クエリ予測も含める
            sessionToken: sessionToken, // セッショントークン（Google Places APIの課金管理用）
            input: input, // ユーザーの検索入力
            includedPrimaryTypes: ["restaurant"], // レストランのみに限定
            locationBias: {
                // 位置バイアス：渋谷周辺500m以内を優先
                circle: {
                    center: {
                        latitude: 35.6669248, // 渋谷の緯度
                        longitude: 139.6514163, // 渋谷の経度
                    },
                    radius: 500.0, // 半径500m
                },
            },
            languageCode: "ja", // 日本語
            regionCode: "JP", // 日本
        };

        // Google Places APIにリクエスト送信
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: header,
            next: { revalidate: 86400 }, // 24時間ごとに再検証（キャッシュ戦略）
        });

        // APIエラーハンドリング
        if (!response.ok) {
            const errorData = await response.json();
            console.error(errorData);

            return NextResponse.json(
                {
                    error: `Autocompleteリクエストに失敗しました。ステータスコード: ${response.status}`,
                },
                { status: 500 }
            );
        }

        // レスポンスをパース
        const data: GoogleplacesAutocompleteApiResponse = await response.json();
        console.log("data:", JSON.stringify(data, null, 2));

        const suggesions = data.suggestions ?? [];

        // Google Places APIのレスポンスを統一された形式に変換
        const results = suggesions
            .map((suggesion) => {
                // placePrediction: 特定の場所（レストラン）の予測
                // placeId と placeName（表示名）の両方を持つ
                if (
                    suggesion.placePrediction &&
                    suggesion.placePrediction.placeId &&
                    suggesion.placePrediction.structuredFormat?.mainText?.text
                ) {
                    return {
                        type: "placePrediction",
                        placeId: suggesion.placePrediction.placeId, // 一意の場所ID
                        placeName:
                            suggesion.placePrediction.structuredFormat?.mainText
                                ?.text, // 表示名（例: "ラーメン荘 歴史を刻め 世田谷"）
                    };
                }
                // queryPrediction: 検索クエリの予測（特定の場所ではない）
                // placeName のみを持つ（placeIdは存在しない）
                else if (
                    suggesion.queryPrediction &&
                    suggesion.queryPrediction.text?.text
                ) {
                    return {
                        type: "queryPrediction",
                        placeName: suggesion.queryPrediction.text.text, // 検索クエリ（例: "ラーメン屋"）
                    };
                }
                return undefined;
            })
            // undefined（変換できなかったもの）を除外
            .filter(
                (suggestion): suggestion is RestaurantSuggestion =>
                    suggestion !== undefined
            );

        // 変換されたサジェスト結果を返す
        return NextResponse.json(results);
    } catch (error) {
        // 予期しないエラーのハンドリング
        console.error("Error fetching suggestions:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
