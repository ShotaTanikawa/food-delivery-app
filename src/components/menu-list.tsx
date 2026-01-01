import { Menu } from "@/types";
import React from "react";
import MenuCard from "./menu-card";

interface MenuListProps {
    menus: Menu[];
}

export default function MenuList({ menus }: MenuListProps) {
    return (
        <ul className="grid grid-cols-6 gap-4">
            {menus.map((menu) => (
                <MenuCard menu={menu} key={menu.id} />
            ))}
        </ul>
    );
}
