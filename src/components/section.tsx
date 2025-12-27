"use client";

import { useState } from "react";
import { Button } from "./ui/button";

/**
 * SectionコンポーネントのProps
 */
interface SectionProps {
    children: React.ReactNode; // 通常表示されるコンテンツ（カルーセルなど）
    title: string; // セクションのタイトル
    expandedContent?: React.ReactNode; // 展開時に表示されるコンテンツ（レストランリストなど）
}

/**
 * セクションコンポーネント
 * タイトルと展開/折りたたみ機能を持つセクションを表示
 * 展開ボタンをクリックすると、children（通常のコンテンツ）とexpandedContent（展開時のコンテンツ）が切り替わる
 */
export default function Section({
    children,
    title,
    expandedContent,
}: SectionProps) {
    // 展開状態を管理（true: 展開中、false: 折りたたみ中）
    const [isExpanded, setIsExpanded] = useState(false);

    /**
     * 展開ボタンクリック時に展開状態をトグル
     */
    const handleChange = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <section>
            {/* タイトルと展開ボタンのヘッダー */}
            <div className="flex items-center justify-between py-3">
                <h2 className="text-2xl font-bold">{title}</h2>
                <Button onClick={handleChange}>
                    {/* 展開状態に応じてボタンのテキストを変更 */}
                    {isExpanded ? "表示を戻す" : "すべて表示"}
                </Button>
            </div>
            {/* 展開状態に応じてコンテンツを切り替え */}
            {isExpanded ? expandedContent : children}
        </section>
    );
}
