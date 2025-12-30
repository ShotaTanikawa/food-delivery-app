import Image from "next/image";
import { Card } from "./ui/card";
import { Menu } from "@/types";

interface FlatMenuCardProps {
    menu: Menu;
}

export default function FlatMenuCard({ menu }: FlatMenuCardProps) {
    return (
        <Card className="p-0 overflow-hidden">
            <div className="flex flex-1">
                <div className="w-3/5 p-4">
                    <p className="font-bold">{menu.name}</p>
                    <p className="text-muted-foreground">¥{menu.price}</p>
                </div>
                <div className="w-2/5 relative aspect-square ">
                    <Image
                        fill
                        src={menu.photoUrl}
                        alt={menu.name}
                        className="object-cover w-full h-full"
                        sizes="176px"
                    />
                </div>
            </div>
        </Card>
    );
}
