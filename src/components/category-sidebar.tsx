"use client";

import { CategoryMenu } from "@/types";
import React from "react";

interface CategorySidebarProps {
    categoryMenus: CategoryMenu[];
    onSelectCategory: (categoryId: string) => void;
}

export default function CategorySidebar({
    categoryMenus,
    onSelectCategory,
}: CategorySidebarProps) {
    console.log("categorySidebar:", categoryMenus);

    return (
        <aside className="w-1/4 bg-red-400 sticky top-16 h-[calc(100vh-64px)]">
            <p className="p-3 font-bold">メニュー Menu</p>
            <nav>
                <ul>
                    {categoryMenus.map((categoryMenu) => (
                        <li key={categoryMenu.id}>
                            <button
                                onClick={() =>
                                    onSelectCategory(categoryMenu.id)
                                }
                                className="bg-red-100 w-full p-4 text-left"
                                type="button"
                            >
                                {categoryMenu.categoryName}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
