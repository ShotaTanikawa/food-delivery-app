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

    // Google Places APIから場所の詳細情報を取得
    // locationフィールドのみを取得（緯度・経度情報を含む）
    const { data: locationData, error } = await getPlaceDetails(
        suggestion.placeId,
        ["location"], // 取得するフィールド：位置情報のみ
        sessionToken
    );

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

    // 現在ログインしているユーザー情報を取得
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    // ユーザーが存在しない場合はログインページにリダイレクト
    if (userError || !user) {
        redirect("/login");
    }

    // データベース（Supabase）に住所情報を保存
    // addressesテーブルに新しい住所レコードを挿入
    const { data: newAddress, error: insertError } = await supabase
        .from("addresses")
        .insert({
            name: suggestion.placeName, // 場所名（例: "ラーメン荘 歴史を刻め 世田谷"）
            address_text: suggestion.address_text, // 住所テキスト（例: "東京都世田谷区..."）
            latitude: locationData.location.latitude, // 緯度
            longitude: locationData.location.longitude, // 経度
            user_id: user.id, // ユーザーID
        })
        .select("id") // 挿入されたレコードのIDを取得
        .single(); // 単一レコードのみを期待

    // 住所保存エラーのハンドリング
    if (insertError) {
        console.error("住所情報の保存に失敗しました。", insertError);
        throw new Error("住所情報の保存に失敗しました。");
    }

    // プロフィールテーブルを更新して、選択中の住所を設定
    // profilesテーブルのselected_address_idを新しく作成した住所のIDに更新
    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            selected_address_id: newAddress.id, // 新しく作成した住所のIDを設定
        })
        .eq("id", user.id); // 現在のユーザーのプロフィールを更新

    // プロフィール更新エラーのハンドリング
    if (updateError) {
        console.error("プロフィール情報の更新に失敗しました。", updateError);
        throw new Error("プロフィール情報の更新に失敗しました。");
    }
}

export async function selectAddressAction(addressId: number) {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
        redirect("/login");
    }

    const { error: updateError } = await supabase
        .from("profiles")
        .update({ selected_address_id: addressId })
        .eq("id", user.id);

    if (updateError) {
        console.error("選択中の住所情報の更新に失敗しました。", updateError);
        throw new Error("選択中の住所情報の更新に失敗しました。");
    }
}

export async function deleteAddressAction(addressId: number) {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect("/login");
    }

    // 住所情報を削除
    const { error: deleteError } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId)
        .eq("user_id", user.id);

    if (deleteError) {
        console.error("住所情報の削除に失敗しました。", deleteError);
        throw new Error("住所情報の削除に失敗しました。");
    }
}
