import { Menu } from "@/types";
import Image from "next/image";

interface MenuCardProps {
    menu: Menu;
}

export default function MenuCard({ menu }: MenuCardProps) {
    return (
        <div className="cursor-pointer">
            <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                    src={menu.photoUrl}
                    className="object-cover w-full h-full"
                    alt={menu.name}
                    fill
                    sizes="(max-width: 1280px) 18.75vw, 240px"
                />
            </div>

            <div className="mt-2">
                <p className="font-bold  truncate">{menu.name}</p>
                <p className="text-muted-foreground">
                    <span className="text-sm">￥{menu.price}</span>
                </p>
            </div>
        </div>
    );
}
