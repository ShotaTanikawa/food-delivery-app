import Link from "next/link";
import MenuSheet from "./menu-sheet";
import PlaceSearchBar from "./place-search-bar";
import AddressModal from "./address-modal";
import { fetchLocation } from "@/lib/restaurants/api";

/**
 * ヘッダーコンポーネント
 * アプリケーションの上部に固定表示されるヘッダー
 * メニュー、ロゴ、住所選択、検索バー、カートを含む
 */
/**
 * ヘッダーコンポーネント
 * アプリケーションの上部に固定表示されるヘッダー
 * メニュー、ロゴ、住所選択、検索バー、カートを含む
 */
export default async function Header() {
    // 現在選択されている住所の緯度・経度を取得
    // これがレストラン検索と住所検索の中心位置として使用される
    const { lat, lng } = await fetchLocation();

    return (
        // 固定ヘッダー（最前面に表示されるようz-indexを設定）
        <header className="bg-background h-16 fixed top-0 left-0 right-0 w-full z-50">
            <div className="flex items-center  h-full space-x-4 px-4 max-w-[1920px] mx-auto">
                {/* メニューシート（サイドメニューを開くボタン） */}
                <MenuSheet />
                {/* アプリケーションのロゴ（ホームへのリンク） */}
                <div className="font-bold">
                    <Link href={"/"}>Delivery APP</Link>
                </div>
                {/* 住所選択モーダル（緯度・経度を渡して位置情報に基づいた検索を可能にする） */}
                <AddressModal lat={lat} lng={lng} />
                {/* レストラン検索バー（残りのスペースを埋める、緯度・経度を渡して位置情報に基づいた検索を可能にする） */}
                <div className="flex-1">
                    <PlaceSearchBar lat={lat} lng={lng} />
                </div>
                {/* カート（将来実装予定） */}
                <div>カート</div>
            </div>
        </header>
    );
}
