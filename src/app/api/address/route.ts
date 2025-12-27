import { Address } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // 住所テーブルからユーザーの住所情報を取得

        let addressList: Address[] = [];
        let selectedAddress: Address | null = null;

        const supabase = await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません。" },
                { status: 401 }
            );
        }

        const { data: addressData, error: addressError } = await supabase
            .from("addresses")
            .select("id, name, address_text, latitude, longitude")
            .eq("user_id", user.id);

        if (addressError) {
            console.error("住所情報の取得に失敗しました。", addressError);
            return NextResponse.json(
                { error: "住所情報の取得に失敗しました。" },
                { status: 500 }
            );
        }

        addressList = addressData;

        // 選択中の住所情報をテーブルから取得
        const { data: selectedAddressData, error: selectedAddressError } =
            await supabase
                .from("profiles")
                .select(
                    "addresses(id, name, address_text, latitude, longitude)"
                )
                .eq("id", user.id)
                .single();

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

        selectedAddress = selectedAddressData?.addresses;

        console.log("addressList", addressList);
        console.log("selectedAddress", selectedAddress);

        return NextResponse.json({ addressList, selectedAddress });
    } catch (error) {
        console.error("例外的なエラーが発生しました。", error);
        return NextResponse.json({ error: "例外的なエラーが発生しました。" });
    }
}
