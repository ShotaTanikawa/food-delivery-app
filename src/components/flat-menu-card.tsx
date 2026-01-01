import Image from "next/image";
import { Card } from "./ui/card";
import { Menu } from "@/types";

/**
 * フラットメニューカードコンポーネントのProps
 * @param menu 表示するメニュー情報
 */
interface FlatMenuCardProps {
    menu: Menu;
}

/**
 * フラットメニューカードコンポーネント
 * グリッド形式で表示されるメニューカード
 * 左側にメニュー名と価格、右側にメニュー画像を表示する横長のカード形式
 * 注目商品以外のカテゴリーのメニューを表示する際に使用される
 */
export default function FlatMenuCard({ menu }: FlatMenuCardProps) {
    return (
        <Card className="p-0 overflow-hidden">
            {/* メニュー情報と画像を横並びに配置 */}
            <div className="flex flex-1">
                {/* メニュー情報エリア（左側、幅60%） */}
                <div className="w-3/5 p-4">
                    {/* メニュー名 */}
                    <p className="font-bold">{menu.name}</p>
                    {/* 価格 */}
                    <p className="text-muted-foreground">¥{menu.price}</p>
                </div>
                {/* メニュー画像エリア（右側、幅40%、正方形） */}
                <div className="w-2/5 relative aspect-square ">
                    {/* メニュー画像（Next.jsのImageコンポーネントで最適化） */}
                    <Image
                        fill
                        src={menu.photoUrl}
                        alt={menu.name}
                        className="object-cover w-full h-full"
                        sizes="176px" // 画像サイズの指定（レスポンシブ画像最適化用）
                    />
                </div>
            </div>
        </Card>
    );
}
