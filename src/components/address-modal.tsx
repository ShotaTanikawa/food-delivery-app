"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { v4 as uuidv4 } from "uuid";
import { Address, AddressResponse, AddressSuggestion } from "@/types";
import { AlertCircle, LoaderCircle, MapPin } from "lucide-react";
import { selectSuggestionAction } from "@/app/(private)/actions/addressActions";
import useSWR, { mutate } from "swr";

/**
 * 住所選択モーダルコンポーネント
 * Google Places APIを使用して住所を検索・選択できるモーダルダイアログ
 * ユーザーが住所を入力すると、リアルタイムでサジェストを表示する
 */
export default function AddressModal() {
    // 検索入力テキスト
    const [inputText, setInputText] = useState("");
    // Google Places API用のセッショントークン（UUIDで生成、同じ検索セッションで使い回す）
    // 住所選択後にリセットされる
    const [sessionToken, setSessionToken] = useState(uuidv4());
    // 取得した住所サジェストリスト
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    // ローディング状態（API呼び出し中かどうか）
    const [isLoading, setIsLoading] = useState(false);
    // エラーメッセージ（APIエラーが発生した場合に表示）
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    /**
     * 住所オートコンプリートAPIからサジェストを取得
     * デバウンス処理（500ms）により、ユーザーの入力を待ってからAPIを呼び出す
     * これにより、連続した入力に対して不要なAPI呼び出しを防ぐ
     */
    const fetchSuggestions = useDebouncedCallback(async (input: string) => {
        // 空入力の場合はサジェストをクリア
        if (!input.trim()) {
            setSuggestions([]);
            return;
        }
        // エラーメッセージをクリア
        setErrorMessage(null);
        try {
            // 住所オートコンプリートAPIを呼び出し
            const response = await fetch(
                `/api/address/autocomplete?input=${input}&sessionToken=${sessionToken}`
            );

            // エラーレスポンスの処理
            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.error);
                return;
            }

            // レスポンスをパースしてサジェストリストを更新
            const data: AddressSuggestion[] = await response.json();
            console.log("suggestions:", JSON.stringify(data, null, 2));
            setSuggestions(data);
        } catch (error) {
            // ネットワークエラーなどの予期しないエラーを処理
            console.error("Error fetching suggestions:", error);
            setErrorMessage("サジェストの取得に失敗しました。");
        } finally {
            // ローディング状態を解除（成功・失敗問わず）
            setIsLoading(false);
        }
    }, 500);

    /**
     * 入力テキストが変更されたときにサジェストを取得
     * inputTextが変更されるたびに実行される
     */
    useEffect(() => {
        // 空入力の場合はサジェストをクリアして処理を終了
        if (!inputText.trim()) {
            setSuggestions([]);
            return;
        }
        // ローディング状態にして、デバウンスされたfetchSuggestionsを呼び出し
        // fetchSuggestions内でsetIsLoading(false)が呼ばれるまでローディング状態が続く
        setIsLoading(true);
        fetchSuggestions(inputText);
    }, [inputText, fetchSuggestions]);

    const fetcher = (url: string) => fetch(url).then((res) => res.json());

    const {
        data,
        error,
        isLoading: loading,
        mutate,
    } = useSWR<AddressResponse>(`/api/address`, fetcher);
    console.log("swr_data", data);
    if (error) return <div>failed to load</div>;
    if (loading) return <div>loading...</div>;

    /**
     * サジェストアイテムが選択されたときの処理
     * Server Actionを呼び出して住所情報を取得し、アプリケーションに登録する
     * 住所選択後はセッショントークンをリセットして、次の検索を新しいセッションとして扱う
     */
    const handleSelectSuggestion = async (suggestion: AddressSuggestion) => {
        console.log("suggestion:", suggestion);

        try {
            // Server Actionを呼び出して住所の詳細情報（緯度・経度）を取得し、登録
            // selectSuggestionAction内でgetPlaceDetailsが呼ばれ、場所の詳細情報が取得される
            await selectSuggestionAction(suggestion, sessionToken);
            // セッショントークンをリセット（次の検索で新しいセッションとして扱う）
            // これにより、Google Places APIの課金が正しく管理される
            setSessionToken(uuidv4());
            setInputText("");
            mutate();
        } catch (error) {
            console.error(error);
            // エラーが発生した場合はユーザーに通知
            alert("予期せぬエラーが発生しました");
        }
    };

    return (
        <Dialog>
            {/* モーダルを開くトリガーボタン */}
            <DialogTrigger>住所を選択</DialogTrigger>
            {/* モーダルのコンテンツ */}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>住所</DialogTitle>
                    {/* スクリーンリーダー用の説明（視覚的には非表示） */}
                    <DialogDescription className="sr-only">
                        住所登録と選択
                    </DialogDescription>
                </DialogHeader>

                {/* コマンドパレット（検索入力とサジェスト表示用） */}
                <Command shouldFilter={false}>
                    {/* 検索入力欄 */}
                    <div className="bg-muted mb-4">
                        <CommandInput
                            value={inputText}
                            onValueChange={setInputText}
                            placeholder="Type a command or search..."
                        />
                    </div>

                    {/* サジェストリスト */}
                    <CommandList>
                        {inputText ? (
                            // 入力がある場合：検索結果を表示
                            <>
                                {/* 空状態・ローディング・エラーの表示 */}
                                <CommandEmpty>
                                    <div className="flex items-center justify-center">
                                        {isLoading ? (
                                            // ローディング中：スピナーを表示
                                            <LoaderCircle className="animate-spin" />
                                        ) : errorMessage ? (
                                            // エラー状態：エラーメッセージを表示
                                            <div className="flex items-center gap-2 text-destructive">
                                                <AlertCircle />
                                                {errorMessage}
                                            </div>
                                        ) : (
                                            // サジェストが見つからない場合
                                            "住所が見つかりません"
                                        )}
                                    </div>
                                </CommandEmpty>
                                {/* サジェストリストを表示 */}
                                {suggestions.map((suggestion) => (
                                    <CommandItem
                                        onSelect={() =>
                                            handleSelectSuggestion(suggestion)
                                        }
                                        key={suggestion.placeId}
                                        className="p-5"
                                    >
                                        {/* 地図ピンアイコン */}
                                        <MapPin />
                                        <div>
                                            {/* 場所名（太字） */}
                                            <p className="font-bold">
                                                {suggestion.placeName}
                                            </p>
                                            {/* 住所テキスト（グレー） */}
                                            <p className="text-muted-foreground">
                                                {suggestion.address_text}
                                            </p>
                                        </div>
                                    </CommandItem>
                                ))}
                            </>
                        ) : (
                            // 入力がない場合：保存済み住所を表示（将来実装予定）
                            <>
                                <h3 className="text-lg font-bold mb-2">
                                    保存済みの住所
                                </h3>

                                {data?.addressList.map((address) => (
                                    <CommandItem
                                        key={address.id}
                                        className="p-5"
                                    >
                                        <div>
                                            <p className="font-bold">
                                                {address.name}
                                            </p>
                                            <p>{address.address_text}</p>
                                        </div>
                                    </CommandItem>
                                ))}
                            </>
                        )}
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
