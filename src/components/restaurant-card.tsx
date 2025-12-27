import { Restaurant } from "@/types";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

/**
 * RestaurantCardコンポーネントのProps
 */
interface RestaurantCardProps {
    restaurant: Restaurant; // 表示するレストランの情報
}

/**
 * レストランカードコンポーネント
 * レストランの写真、名前、お気に入りアイコンを表示する
 * クリック可能なリンクとお気に入り機能（ホバー時）を含む
 */
export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
    return (
        <div className="relative">
            {/* レストラン詳細ページへのリンク（現在は#に設定） */}
            <Link href={"#"} className="inset-0 absolute z-10"></Link>
            {/* レストランの写真を表示 */}
            <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                    src={restaurant.photoUrl}
                    fill
                    alt="レストラン画像"
                    className="object-cover"
                    sizes="(max-width: 1280px) 25vw, 280px"
                />
            </div>
            {/* レストラン名とお気に入りアイコン */}
            <div className="flex items-center justify-between">
                <p className="font-bold">{restaurant.restaurantName}</p>
                {/* お気に入りアイコン（ホバー時に赤く塗りつぶされる） */}
                <div className="z-20">
                    <Heart
                        color="gray"
                        strokeWidth={3}
                        size={15}
                        className="hover:fill-red-500 hover:stroke-0"
                    />
                </div>
            </div>
        </div>
    );
}
