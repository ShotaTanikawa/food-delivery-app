"use client";

import React from "react";
import { CategoryType } from "./categories";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CategoryProps {
    category: CategoryType;
    onClick: (category: string) => void;
    select: boolean;
}

export default function Category({ category, onClick, select }: CategoryProps) {
    return (
        <div onClick={() => onClick(category.type)}>
            <div
                className={cn(
                    "relative aspect-square overflow-hidden rounded-full",
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
            <div className="text-center mt-2">
                <p className="text-xs truncate">{category.categoryName}</p>
            </div>
        </div>
    );
}
