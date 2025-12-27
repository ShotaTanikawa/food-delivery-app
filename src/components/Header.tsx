import Link from "next/link";
import MenuSheet from "./menu-sheet";
import PlaceSearchBar from "./place-search-bar";
import AddressModal from "./address-modal";

/**
 * ヘッダーコンポーネント
 * アプリケーションの上部に固定表示されるヘッダー
 * メニュー、ロゴ、住所選択、検索バー、カートを含む
 */
export default function Header() {
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
                {/* 住所選択モーダル */}
                <AddressModal />
                {/* レストラン検索バー（残りのスペースを埋める） */}
                <div className="flex-1">
                    <PlaceSearchBar />
                </div>
                {/* カート（将来実装予定） */}
                <div>カート</div>
            </div>
        </header>
    );
}
