"use client";

import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { RestaurantSuggestion } from "@/types";
import { AlertCircle, LoaderCircle, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { v4 as uuidv4 } from "uuid";

/**
 * レストラン検索バーコンポーネント
 * ユーザーの入力に基づいてGoogle Places APIを使用してレストラン検索のサジェストを表示
 */
export default function PlaceSearchBar() {
    // サジェストリストの表示/非表示を管理
    const [open, setOpen] = useState(false);
    // 検索入力テキスト
    const [inputText, setInputText] = useState("");
    // Google Places API用のセッショントークン（UUIDで生成、同じ検索セッションで使い回す）
    const [sessionToken, setSessionToken] = useState(uuidv4());
    // 取得したサジェストリスト
    const [suggestions, setSuggestions] = useState<RestaurantSuggestion[]>([]);
    // ローディング状態
    const [isLoading, setIsLoading] = useState(false);
    // エラーメッセージ
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // サジェストアイテムがクリックされたかどうかを追跡（blurイベントとの競合を防ぐため）
    const clickOnItem = useRef(false);
    const router = useRouter();

    /**
     * オートコンプリートAPIからサジェストを取得
     * デバウンス処理（500ms）により、ユーザーの入力を待ってからAPIを呼び出す
     */
    const fetchSuggestions = useDebouncedCallback(async (input: string) => {
        // 空入力の場合はサジェストをクリア
        if (!input.trim()) {
            setSuggestions([]);
            return;
        }
        setErrorMessage(null);
        try {
            // オートコンプリートAPIを呼び出し
            const response = await fetch(
                `/api/restaurant/autocomplete?input=${input}&sessionToken=${sessionToken}`
            );

            // エラーレスポンスの処理
            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.error);
                return;
            }

            // レスポンスをパースしてサジェストリストを更新
            const data: RestaurantSuggestion[] = await response.json();
            console.log("suggestions:", JSON.stringify(data, null, 2));
            setSuggestions(data);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setErrorMessage("サジェストの取得に失敗しました。");
        } finally {
            setIsLoading(false);
        }
    }, 500);

    /**
     * 入力フィールドからフォーカスが外れたときの処理
     * サジェストアイテムがクリックされた場合は閉じない（ナビゲーションを実行するため）
     */
    const handleBlur = () => {
        if (clickOnItem.current) {
            clickOnItem.current = false;
            return;
        }
        setOpen(false);
    };

    /**
     * 入力フィールドにフォーカスが当たったときの処理
     * 既に入力がある場合はサジェストリストを表示
     */
    const handleFocus = () => {
        if (inputText.trim()) {
            setOpen(true);
        }
    };

    /**
     * 入力テキストが変更されたときにサジェストを取得
     */
    useEffect(() => {
        // 空入力の場合はサジェストを非表示にしてクリア
        if (!inputText.trim()) {
            setOpen(false);
            setSuggestions([]);
            return;
        }
        // ローディング状態にしてサジェストリストを表示
        setIsLoading(true);
        setOpen(true);
        // デバウンスされたfetchSuggestionsを呼び出し
        fetchSuggestions(inputText);
    }, [inputText, fetchSuggestions]);

    /**
     * サジェストアイテムが選択されたときの処理
     * placePrediction: 特定のレストランページに遷移
     * queryPrediction: 検索結果ページに遷移
     */
    const handleSelectSuggestion = (suggestion: RestaurantSuggestion) => {
        console.log("suggestion:", suggestion);

        if (suggestion.type === "placePrediction") {
            // 特定のレストランページに遷移（placeIdを使用）
            router.push(
                `/restaurant/${suggestion.placeId}?sessionToken=${sessionToken}`
            );
            setSessionToken(uuidv4());
        } else {
            // 検索結果ページに遷移（クエリ文字列を使用）
            router.push(`/search?restaurant=${suggestion.placeName}`);
        }
        setOpen(false);
    };

    /**
     * Enterキーが押されたときの処理
     * 入力テキストで検索結果ページに遷移
     */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!inputText.trim()) {
            return;
        }
        if (event.key === "Enter") {
            router.push(`/search?restaurant=${inputText}`);
            setOpen(false);
        }
    };

    return (
        <Command
            onKeyDown={handleKeyDown}
            className="overflow-visible bg-muted"
            shouldFilter={false} // サーバー側でフィルタリングするため、クライアント側のフィルタリングは無効化
        >
            <CommandInput
                value={inputText}
                placeholder="Type a command or search..."
                onValueChange={setInputText}
                onBlur={handleBlur}
                onFocus={handleFocus}
            />
            {/* サジェストリストを表示 */}
            {open && (
                <div className="relative">
                    <CommandList className="absolute bg-background w-full shadow-md rounded-lg">
                        {/* 空状態またはローディング、エラーの表示 */}
                        <CommandEmpty>
                            <div className="flex items-center justify-center">
                                {isLoading ? (
                                    // ローディング中
                                    <LoaderCircle className="animate-spin" />
                                ) : errorMessage ? (
                                    // エラー状態
                                    <div className="flex items-center gap-2 text-destructive">
                                        <AlertCircle />
                                        {errorMessage}
                                    </div>
                                ) : (
                                    // サジェストが見つからない場合
                                    "レストランが見つかりません。"
                                )}
                            </div>
                        </CommandEmpty>
                        {/* サジェストリストを表示 */}
                        {suggestions.map((suggestion, index) => (
                            <CommandItem
                                className="p-5"
                                key={suggestion.placeId ?? index} // placeIdが存在しない場合はindexを使用
                                value={suggestion.placeName}
                                onSelect={() =>
                                    handleSelectSuggestion(suggestion)
                                }
                                // クリックイベントを検知してblurとの競合を防ぐ
                                onMouseDown={() => (clickOnItem.current = true)}
                            >
                                {/* queryPredictionの場合は検索アイコン、placePredictionの場合は地図ピンアイコン */}
                                {suggestion.type === "queryPrediction" ? (
                                    <Search />
                                ) : (
                                    <MapPin />
                                )}
                                <p>{suggestion.placeName}</p>
                            </CommandItem>
                        ))}
                    </CommandList>
                </div>
            )}
        </Command>
    );
}
