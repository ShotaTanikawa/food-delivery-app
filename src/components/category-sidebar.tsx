"use client";

import { cn } from "@/lib/utils";
import { CategoryMenu } from "@/types";
import React from "react";

/**
 * カテゴリーサイドバーコンポーネントのProps
 * @param categoryMenus 表示するカテゴリー別メニューリスト
 * @param onSelectCategory カテゴリーが選択されたときに呼ばれるコールバック関数
 * @param activeCategoryId 現在アクティブな（表示されている）カテゴリーのID
 */
interface CategorySidebarProps {
    categoryMenus: CategoryMenu[];
    onSelectCategory: (categoryId: string) => void;
    activeCategoryId: string;
}

/**
 * カテゴリーサイドバーコンポーネント（Client Component）
 * レストラン詳細ページの左側に表示されるカテゴリー一覧
 * カテゴリーをクリックすると、該当するメニューセクションまでスクロールする
 * スクロールに応じて、アクティブなカテゴリーが自動的にハイライトされる
 */
export default function CategorySidebar({
    categoryMenus,
    onSelectCategory,
    activeCategoryId,
}: CategorySidebarProps) {
    console.log("categorySidebar:", categoryMenus);

    return (
        // サイドバーコンテナ（左側に固定、スクロールしても位置が固定される）
        <aside className="w-1/4  sticky top-16 h-[calc(100vh-64px)]">
            {/* サイドバーのタイトル */}
            <p className="p-3 font-bold">メニュー Menu</p>
            {/* カテゴリー一覧のナビゲーション */}
            <nav>
                <ul>
                    {/* 各カテゴリーごとにボタンを表示 */}
                    {categoryMenus.map((categoryMenu) => (
                        <li key={categoryMenu.id}>
                            <button
                                // カテゴリーボタンがクリックされたときに、該当セクションまでスクロール
                                onClick={() =>
                                    onSelectCategory(categoryMenu.id)
                                }
                                className={cn(
                                    "w-full p-4 text-left border-l-4 transition-colors",
                                    // アクティブなカテゴリーの場合は背景色とボーダー色を変更
                                    activeCategoryId === categoryMenu.id
                                        ? "bg-input font-medium  border-primary"
                                        : "border-transparent hover:bg-muted"
                                )}
                                type="button"
                            >
                                {/* カテゴリー名を表示 */}
                                {categoryMenu.categoryName}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
