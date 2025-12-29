import { Address } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * 住所情報を取得するAPI Route Handler
 * ユーザーが登録した住所一覧と、現在選択中の住所を取得する
 * SWRなどでクライアント側から呼び出される
 */
export async function GET(request: NextRequest) {
    try {
        // 返却用の変数を初期化
        let addressList: Address[] = [];
        let selectedAddress: Address | null = null;

        // Supabaseクライアントを作成
        const supabase = await createClient();

        // 現在ログインしているユーザー情報を取得
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        // ユーザーが存在しない場合、認証エラーを返す
        if (userError || !user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません。" },
                { status: 401 }
            );
        }

        // ユーザーが登録したすべての住所を取得
        const { data: addressData, error: addressError } = await supabase
            .from("addresses")
            .select("id, name, address_text, latitude, longitude")
            .eq("user_id", user.id); // 現在のユーザーのIDでフィルタリング

        // 住所取得エラーのハンドリング
        if (addressError) {
            console.error("住所情報の取得に失敗しました。", addressError);
            return NextResponse.json(
                { error: "住所情報の取得に失敗しました。" },
                { status: 500 }
            );
        }

        addressList = addressData;

        // 現在選択中の住所情報をprofilesテーブルから取得
        // profilesテーブルのselected_address_idからaddressesテーブルをJOINして取得
        const { data: selectedAddressData, error: selectedAddressError } =
            await supabase
                .from("profiles")
                .select(
                    "addresses(id, name, address_text, latitude, longitude)"
                )
                .eq("id", user.id)
                .single(); // 単一レコードのみを期待

        // 選択中の住所取得エラーのハンドリング
        if (selectedAddressError) {
            console.error(
                "プロフィール情報の取得に失敗しました。",
                selectedAddressError
            );
            return NextResponse.json(
                { error: "プロフィール情報の取得に失敗しました。" },
                { status: 500 }
            );
        }

        selectedAddress = selectedAddressData.addresses;

        // 住所一覧と選択中の住所を返す
        return NextResponse.json({ addressList, selectedAddress });
    } catch (error) {
        // 予期しないエラーのハンドリング
        console.error("例外的なエラーが発生しました。", error);
        return NextResponse.json(
            { error: "例外的なエラーが発生しました。" },
            { status: 500 }
        );
    }
}
