import Link from "next/link";
import MenuSheet from "./menu-sheet";
import PlaceSearchBar from "./place-search-bar";

export default function Header() {
    return (
        <header className="bg-background h-16 fixed top-0 left-0 right-0 w-full z-50">
            <div className="flex items-center  h-full space-x-4 px-4 max-w-[1920px] mx-auto">
                <MenuSheet />
                <div className="font-bold">
                    <Link href={"/"}>Delivery APP</Link>
                </div>
                <div>住所を検索</div>
                <div className="flex-1">
                    <PlaceSearchBar />
                </div>
                <div>カート</div>
            </div>
        </header>
    );
}
