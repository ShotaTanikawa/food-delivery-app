"use client";
import React from "react";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * メニュー検索バーコンポーネント（Client Component）
 * レストラン詳細ページでメニューを検索するための入力フィールド
 * ユーザーが入力したキーワードをURLのクエリパラメータとして設定し、ページをリフレッシュする
 */
export default function SeachBar() {
    // 現在のURLのクエリパラメータを取得
    const searchParams = useSearchParams();
    // 現在のページのパスを取得（例: "/restaurant/xxx"）
    const pathname = usePathname();

    // ルーターのreplace関数を取得（ページ遷移なしでURLを更新する）
    const { replace } = useRouter();

    /**
     * メニュー検索の入力ハンドラー
     * デバウンス処理（500ms）により、ユーザーの入力を待ってからURLを更新する
     * これにより、連続した入力に対して不要なURL更新を防ぐ
     * @param inputText ユーザーが入力した検索キーワード
     */
    const handleSearchMenu = useDebouncedCallback((inputText: string) => {
        // 現在のクエリパラメータをコピーして新しいオブジェクトを作成
        const params = new URLSearchParams(searchParams);

        // 入力がある場合：クエリパラメータにsearchMenuを設定
        if (inputText.trim()) {
            params.set("searchMenu", inputText);
        } else {
            // 入力がない場合：searchMenuパラメータを削除
            params.delete("searchMenu");
        }

        // クエリパラメータを文字列に変換
        const query = params.toString();
        // URLを更新（クエリパラメータがある場合は追加、ない場合はパスのみ）
        // ページ遷移は発生せず、URLのみが更新される（Server Componentが再実行される）
        replace(query ? `${pathname}?${params.toString()}` : pathname);
    }, 500);

    return (
        <div className="flex items-center bg-muted rounded-full">
            {/* 検索アイコン */}
            <Search size={20} color="gray" className="ml-2" />
            {/* 検索入力フィールド */}
            <input
                type="text"
                placeholder="メニューを検索"
                className="flex-1 px-4 py-2 outline-none"
                // 入力が変更されたときにデバウンスされた検索ハンドラーを実行
                onChange={(e) => handleSearchMenu(e.target.value)}
            />
        </div>
    );
}
