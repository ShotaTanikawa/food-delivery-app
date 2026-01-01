"use client";

import React, { useState } from "react";
import CategorySidebar from "./category-sidebar";
import { CategoryMenu } from "@/types";
import Section from "./section";
import CarouselContainer from "./carousel-container";
import MenuCard from "./menu-card";
import FlatMenuCard from "./flat-menu-card";
import { InView } from "react-intersection-observer";

/**
 * メニューコンテンツコンポーネントのProps
 * @param categoryMenus カテゴリー別に分類されたメニューリスト
 */
interface MenuContentProps {
    categoryMenus: CategoryMenu[];
}

/**
 * メニューコンテンツコンポーネント（Client Component）
 * カテゴリーサイドバーとメニュー一覧を表示する
 * スクロールに応じてアクティブなカテゴリーを自動的に更新する
 */
export default function MenuContent({ categoryMenus }: MenuContentProps) {
    // 現在アクティブな（表示されている）カテゴリーのIDを管理
    // 初期値は最初のカテゴリーのID
    const [activeCategoryId, setActiveCategoryId] = useState(
        categoryMenus[0].id
    );

    /**
     * カテゴリーが選択されたときのハンドラー
     * サイドバーでカテゴリーをクリックしたときに、該当するセクションまでスムーズにスクロールする
     * @param categoryId 選択されたカテゴリーのID
     */
    const handleSelectCategory = (categoryId: string) => {
        console.log("handleSelectCategory:", categoryId);
        // 選択されたカテゴリーのセクション要素を取得
        // 各セクションには `{categoryId}-menu` というIDが設定されている
        const element = document.getElementById(`${categoryId}-menu`);
        console.log("element:", element);

        // 要素が存在する場合、その要素までスムーズにスクロール
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="flex gap-4">
            {/* カテゴリーサイドバー（左側に固定表示） */}
            <CategorySidebar
                categoryMenus={categoryMenus}
                onSelectCategory={handleSelectCategory}
                activeCategoryId={activeCategoryId}
            />
            {/* メニュー一覧表示エリア（右側、スクロール可能） */}
            <div className="w-3/4 bg-amber-400">
                {/* 各カテゴリーごとにセクションを表示 */}
                {categoryMenus.map((categoryMenu) => (
                    <InView
                        id={`${categoryMenu.id}-menu`} // スクロール時の識別子として使用
                        className="scroll-mt-16" // スクロール時のマージン調整
                        key={categoryMenu.id}
                        as="div"
                        threshold={0.7} // 要素が70%以上表示されたときにinViewがtrueになる
                        // カテゴリーセクションがビューポートに入ったときに、アクティブなカテゴリーを更新
                        // これにより、スクロールに応じてサイドバーのアクティブ状態が自動的に更新される
                        onChange={(inView, entry) =>
                            inView && setActiveCategoryId(categoryMenu.id)
                        }
                    >
                        {/* カテゴリーごとのセクション */}
                        <Section title={categoryMenu.categoryName}>
                            {categoryMenu.id === "featured" ? (
                                // 注目商品カテゴリーの場合：カルーセル形式で表示（1画面に4個表示）
                                <CarouselContainer slideToShow={4}>
                                    {categoryMenu.items.map((menu) => (
                                        <MenuCard key={menu.id} menu={menu} />
                                    ))}
                                </CarouselContainer>
                            ) : (
                                // その他のカテゴリーの場合：グリッド形式で表示（2列グリッド）
                                <div className="grid grid-cols-2 gap-4">
                                    {categoryMenu.items.map((menu) => (
                                        <FlatMenuCard
                                            key={menu.id}
                                            menu={menu}
                                        />
                                    ))}
                                </div>
                            )}
                        </Section>
                    </InView>
                ))}
            </div>
        </div>
    );
}
