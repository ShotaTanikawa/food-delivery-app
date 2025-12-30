"use client";

import React from "react";
import CategorySidebar from "./category-sidebar";
import { CategoryMenu } from "@/types";
import Section from "./section";
import CarouselContainer from "./carousel-container";
import MenuCard from "./menu-card";
import FlatMenuCard from "./flat-menu-card";

interface MenuContentProps {
    categoryMenus: CategoryMenu[];
}

export default function MenuContent({ categoryMenus }: MenuContentProps) {
    const handleSelectCategory = (categoryId: string) => {
        console.log("handleSelectCategory:", categoryId);
        const element = document.getElementById(`${categoryId}-menu`);
        console.log("element:", element);

        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="flex gap-4">
            <CategorySidebar
                categoryMenus={categoryMenus}
                onSelectCategory={handleSelectCategory}
            />
            <div className="w-3/4 bg-amber-400">
                {categoryMenus.map((categoryMenu) => (
                    <div
                        id={`${categoryMenu.id}-menu`}
                        className="scroll-mt-16"
                        key={categoryMenu.id}
                    >
                        <Section title={categoryMenu.categoryName}>
                            {categoryMenu.id === "featured" ? (
                                <CarouselContainer slideToShow={4}>
                                    {categoryMenu.items.map((menu) => (
                                        <MenuCard menu={menu} />
                                    ))}
                                </CarouselContainer>
                            ) : (
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
                    </div>
                ))}
            </div>
        </div>
    );
}
