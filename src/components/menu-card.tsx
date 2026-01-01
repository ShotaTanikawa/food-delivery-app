import { Menu } from "@/types";
import Image from "next/image";

/**
 * メニューカードコンポーネントのProps
 * @param menu 表示するメニュー情報
 */
interface MenuCardProps {
    menu: Menu;
}

/**
 * メニューカードコンポーネント
 * カルーセル形式で表示されるメニューカード
 * 正方形の画像と、その下にメニュー名と価格を表示する
 * 注目商品カテゴリーのメニューを表示する際に使用される
 */
export default function MenuCard({ menu }: MenuCardProps) {
    return (
        <div className="cursor-pointer">
            {/* メニュー画像エリア（正方形） */}
            <div className="relative aspect-square rounded-lg overflow-hidden">
                {/* メニュー画像（Next.jsのImageコンポーネントで最適化） */}
                <Image
                    src={menu.photoUrl}
                    className="object-cover w-full h-full"
                    alt={menu.name}
                    fill
                    sizes="(max-width: 1280px) 18.75vw, 240px" // レスポンシブ画像サイズの指定
                />
            </div>

            {/* メニュー情報エリア（画像の下） */}
            <div className="mt-2">
                {/* メニュー名（長い場合は省略記号で表示） */}
                <p className="font-bold  truncate">{menu.name}</p>
                {/* 価格 */}
                <p className="text-muted-foreground">
                    <span className="text-sm">￥{menu.price}</span>
                </p>
            </div>
        </div>
    );
}
