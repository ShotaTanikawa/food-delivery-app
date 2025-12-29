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
import { AlertCircle, LoaderCircle, MapPin, Trash2 } from "lucide-react";
import {
    deleteAddressAction,
    selectAddressAction,
    selectSuggestionAction,
} from "@/app/(private)/actions/addressActions";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

/**
 * 住所選択モーダルコンポーネントのProps
 */
interface AddressModalProps {
    lat: number; // 検索の中心となる緯度（ユーザーが選択した住所の緯度）
    lng: number; // 検索の中心となる経度（ユーザーが選択した住所の経度）
}

/**
 * 住所選択モーダルコンポーネント
 * Google Places APIを使用して住所を検索・選択できるモーダルダイアログ
 * ユーザーが住所を入力すると、リアルタイムでサジェストを表示する
 * 指定された緯度・経度を中心に検索を行う
 */
export default function AddressModal({ lat, lng }: AddressModalProps) {
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
    const [open, setOpen] = useState(false);

    const router = useRouter();

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
            // 緯度・経度を含めてリクエストを送信し、位置情報に基づいた検索を実行
            const response = await fetch(
                `/api/address/autocomplete?input=${input}&sessionToken=${sessionToken}&lat=${lat}&lng=${lng}`
            );

            // エラーレスポンスの処理
            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.error);
                return;
            }

            // レスポンスをパースしてサジェストリストを更新
            const data: AddressSuggestion[] = await response.json();
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

    /**
     * SWR用のデータフェッチャー関数
     * /api/addressエンドポイントから住所情報を取得する
     */
    const fetcher = async (url: string) => {
        // fetchでResponseオブジェクトを取得（まだJSONパースはしない）
        const response = await fetch(url);

        // エラーレスポンスのチェック
        if (!response.ok) {
            // エラーの場合はJSONをパースしてエラーメッセージを取得
            const errorData = await response.json();
            throw new Error(errorData.error);
        }

        // 成功した場合はJSONをパースしてデータを返す
        const data = await response.json();
        return data;
    };

    /**
     * SWRを使用して住所情報を取得
     * 自動的にリフレッシュやキャッシュ管理が行われる
     */
    const {
        data, // 取得したデータ（addressListとselectedAddressを含む）
        error, // エラー情報
        isLoading: loading, // ローディング状態
        mutate, // データを手動で再取得する関数
    } = useSWR<AddressResponse>(`/api/address`, fetcher);

    // エラーが発生した場合の表示
    if (error) {
        console.error("Error fetching address data:", error);
        return <div>{error.message}</div>;
    }
    // データ読み込み中の表示
    if (loading) return <div>loading...</div>;

    /**
     * サジェストアイテムが選択されたときの処理
     * Server Actionを呼び出して住所情報を取得し、アプリケーションに登録する
     * 住所選択後はセッショントークンをリセットして、次の検索を新しいセッションとして扱う
     */
    const handleSelectSuggestion = async (suggestion: AddressSuggestion) => {
        try {
            // Server Actionを呼び出して住所の詳細情報（緯度・経度）を取得し、データベースに登録
            // selectSuggestionAction内でgetPlaceDetailsが呼ばれ、場所の詳細情報が取得される
            await selectSuggestionAction(suggestion, sessionToken);
            // セッショントークンをリセット（次の検索で新しいセッションとして扱う）
            // これにより、Google Places APIの課金が正しく管理される
            setSessionToken(uuidv4());
            // 入力欄をクリア
            setInputText("");
            // SWRのデータを再取得して、新しく登録した住所を反映
            mutate();

            router.refresh();
        } catch (error) {
            console.error(error);
            // エラーが発生した場合はユーザーに通知
            alert("予期せぬエラーが発生しました");
        }
    };

    const handleSelectAddress = async (address: Address) => {
        try {
            await selectAddressAction(address.id);
            mutate();
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("予期せぬエラーが発生しました");
        }
    };

    const handleDeleteAddress = async (addressId: number) => {
        const ok = window.confirm("住所を削除しますか？");
        if (!ok) return;
        try {
            const selectedAddressId = data?.selectedAddress?.id;
            await deleteAddressAction(addressId);
            mutate();
            if (selectedAddressId === addressId) {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert("予期せぬエラーが発生しました");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
            {/* モーダルを開くトリガーボタン */}
            <DialogTrigger>
                {data?.selectedAddress
                    ? data.selectedAddress.name
                    : "住所を選択"}
            </DialogTrigger>
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
                            // 入力がない場合：保存済み住所を表示
                            <>
                                <h3 className="text-lg font-bold mb-2">
                                    保存済みの住所
                                </h3>
                                {/* ユーザーが登録した住所一覧を表示 */}
                                {data?.addressList.map((address) => (
                                    <CommandItem
                                        key={address.id}
                                        className={cn(
                                            "p-5 justify-between items-center",
                                            address.id ===
                                                data.selectedAddress?.id &&
                                                "bg-muted"
                                        )}
                                        onSelect={() =>
                                            handleSelectAddress(address)
                                        }
                                    >
                                        <div>
                                            {/* 住所名（太字） */}
                                            <p className="font-bold">
                                                {address.name}
                                            </p>
                                            {/* 住所テキスト */}
                                            <p>{address.address_text}</p>
                                        </div>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteAddress(address.id);
                                            }}
                                            size={"icon"}
                                            variant={"ghost"}
                                        >
                                            <Trash2 />
                                        </Button>
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
