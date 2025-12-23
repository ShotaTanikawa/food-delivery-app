import {
    AddressSuggestion,
    GoogleplacesAutocompleteApiResponse,
    RestaurantSuggestion,
} from "@/types";
import { NextRequest, NextResponse } from "next/server";

/**
 * 住所検索のオートコンプリートAPI Route Handler
 * Google Places APIを使用して、ユーザーの入力に基づいて住所検索のサジェストを返す
 * レストラン検索とは異なり、特定の場所（placePrediction）のみを返す
 */
export async function GET(request: NextRequest) {
    // クエリパラメータから検索入力とセッショントークンを取得
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get("input");
    const sessionToken = searchParams.get("sessionToken");

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
        // 住所検索なので、クエリ予測（queryPrediction）は含めず、特定の場所（placePrediction）のみを取得
        const requestBody = {
            // includeQueryPredictions: true, // クエリ予測も含める（住所検索では不要なためコメントアウト）
            sessionToken: sessionToken, // セッショントークン（Google Places APIの課金管理用）
            input: input, // ユーザーの検索入力
            // includedPrimaryTypes: ["restaurant"], // レストランのみに限定（住所検索では不要なためコメントアウト）
            locationBias: {
                // 位置バイアス：渋谷周辺500m以内を優先（検索結果の精度向上のため）
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

        // Google Places APIのレスポンスをAddressSuggestion形式に変換
        // placePredictionのみを処理（住所検索ではqueryPredictionは不要）
        const results = suggesions
            .map((suggesion) => {
                return {
                    placeId: suggesion.placePrediction?.placeId, // 場所の一意ID
                    placeName:
                        suggesion.placePrediction?.structuredFormat?.mainText
                            ?.text, // 場所名（例: "ラーメン荘 歴史を刻め 世田谷"）
                    address_text:
                        suggesion.placePrediction?.structuredFormat
                            ?.secondaryText?.text, // 住所テキスト（例: "東京都世田谷区..."）
                };
            })
            // placeId、placeName、address_textがすべて存在するもののみをフィルタリング
            .filter(
                (suggestion): suggestion is AddressSuggestion =>
                    !!suggestion.placeId &&
                    !!suggestion.placeName &&
                    !!suggestion.address_text
            );

        console.log("results:", JSON.stringify(results, null, 2));

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
