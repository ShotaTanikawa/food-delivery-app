"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";

/**
 * テキストの展開/折りたたみを切り替えるボタンコンポーネント
 * ボタンクリックで展開状態をトグルし、ボタンのテキストも変更される
 */
export default function TextToggleButton() {
    // 展開状態を管理（true: 展開中、false: 折りたたみ中）
    const [isExpanded, setIsExpanded] = useState(false);

    /**
     * ボタンクリック時に展開状態をトグル
     */
    const handleChange = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <Button onClick={handleChange}>
            {/* 展開状態に応じてボタンのテキストを変更 */}
            {isExpanded ? "表示を戻す" : "すべて表示"}
        </Button>
    );
}
