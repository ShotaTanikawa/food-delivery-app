"use client";

import React from "react";
import { CategoryType } from "./categories";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * CategoryコンポーネントのProps
 */
interface CategoryProps {
    category: CategoryType; // 表示するカテゴリー情報
    onClick: (category: string) => void; // カテゴリーがクリックされたときのコールバック関数
    select: boolean; // 現在選択されているかどうか
}

/**
 * カテゴリーコンポーネント
 * カテゴリーの画像と名前を表示
 * クリック可能で、選択状態によって背景色が変わる
 */
export default function Category({ category, onClick, select }: CategoryProps) {
    return (
        <div onClick={() => onClick(category.type)}>
            {/* カテゴリー画像を円形で表示 */}
            <div
                className={cn(
                    "relative aspect-square overflow-hidden rounded-full",
                    // 選択されている場合は緑色の背景を表示
                    select && "bg-green-200"
                )}
            >
                <Image
                    src={category.imageUrl}
                    fill
                    alt={category.categoryName}
                    className="object-cover scale-75"
                    sizes="(max-width: 1280px) 10vw, 97px"
                />
            </div>
            {/* カテゴリー名を表示 */}
            <div className="text-center mt-2">
                <p className="text-xs truncate">{category.categoryName}</p>
            </div>
        </div>
    );
}
