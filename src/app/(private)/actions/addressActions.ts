"use server";

import { getPlaceDetails } from "@/lib/restaurants/api";
import { AddressSuggestion } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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
    const supabase = await createClient();
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

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect("/login");
    }

    // データベース（Supabase）に住所情報を保存
    const { data: newAddress, error: insertError } = await supabase
        .from("addresses")
        .insert({
            name: suggestion.placeName,
            address_text: suggestion.address_text,
            latitude: locationData.location.latitude,
            longitude: locationData.location.longitude,
            user_id: user.id,
        })
        .select("id")
        .single();

    if (insertError) {
        console.error("住所情報の保存に失敗しました。", insertError);
        throw new Error("住所情報の保存に失敗しました。");
    }

    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            selected_address_id: newAddress.id,
        })
        .eq("id", user.id);

    if (updateError) {
        console.error("プロフィール情報の更新に失敗しました。", updateError);
        throw new Error("プロフィール情報の更新に失敗しました。");
    }
}
