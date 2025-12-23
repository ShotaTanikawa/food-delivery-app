"use server";

import { getPlaceDetails } from "@/lib/restaurants/api";
import { AddressSuggestion } from "@/types";

/**
 * 住所サジェストが選択されたときに実行されるServer Action
 * Google Places APIから選択された場所の詳細情報（緯度・経度）を取得する
 * @param suggestion 選択された住所サジェスト
 * @param sessionToken Google Places API用のセッショントークン
 */
export async function selectSuggestionAction(
    suggestion: AddressSuggestion,
    sessionToken: string
) {
    console.log("server_action_suggestion:", suggestion);

    // Google Places APIから場所の詳細情報を取得
    // locationフィールドのみを取得（緯度・経度情報を含む）
    const { data: locationData, error } = await getPlaceDetails(
        suggestion.placeId,
        ["location"], // 取得するフィールド：位置情報のみ
        sessionToken
    );

    console.log("server_action_locationData:", locationData);

    // エラーチェック：場所情報が正しく取得できたか確認
    if (
        error ||
        !locationData ||
        !locationData.location ||
        !locationData.location.latitude ||
        !locationData.location.longitude
    ) {
        // エラーが発生した場合、例外をスローしてクライアント側でエラーハンドリング
        throw new Error("住所情報の取得に失敗しました。");
    }
    // TODO: 取得した住所情報をデータベース（Supabase）に保存する処理を実装
}
