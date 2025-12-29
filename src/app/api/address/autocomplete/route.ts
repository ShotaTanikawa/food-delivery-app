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
    // クエリパラメータから検索入力、セッショントークン、緯度・経度を取得
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get("input");
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
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

        // 緯度・経度を数値に変換（指定されていない場合はデフォルト値（渋谷）を使用）
        const lat = latParam ? parseFloat(latParam) : 35.6669248; // デフォルト: 渋谷の緯度
        const lng = lngParam ? parseFloat(lngParam) : 139.6514163; // デフォルト: 渋谷の経度

        // Google Places APIへのリクエストボディ
        // 住所検索なので、クエリ予測（queryPrediction）は含めず、特定の場所（placePrediction）のみを取得
        const requestBody = {
            // includeQueryPredictions: true, // クエリ予測も含める（住所検索では不要なためコメントアウト）
            sessionToken: sessionToken, // セッショントークン（Google Places APIの課金管理用）
            input: input, // ユーザーの検索入力
            // includedPrimaryTypes: ["restaurant"], // レストランのみに限定（住所検索では不要なためコメントアウト）
            locationBias: {
                // 位置バイアス：指定された緯度経度（またはデフォルト位置）を中心とした半径1000m以内を優先
                // 検索結果の精度向上のため、ユーザーが選択した住所周辺の結果を優先的に表示
                circle: {
                    center: {
                        latitude: lat, // 検索の中心となる緯度（ユーザーが選択した住所の緯度、またはデフォルト値）
                        longitude: lng, // 検索の中心となる経度（ユーザーが選択した住所の経度、またはデフォルト値）
                    },
                    radius: 1000.0, // 半径1000m
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
