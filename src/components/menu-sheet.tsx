import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Bookmark, Heart, Menu } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/(auth)/login/actions";

/**
 * メニューシートコンポーネント（Server Component）
 * ヘッダーに表示されるサイドメニューで、ユーザー情報とメニュー項目を表示
 * ユーザーがログインしていない場合はログインページにリダイレクト
 */
export default async function MenuSheet() {
    // Supabaseクライアントを作成してユーザー情報を取得
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // ユーザーがログインしていない場合はログインページにリダイレクト
    if (!user) {
        redirect("/login");
    }

    // ユーザーのメタデータからアバターURLとフルネームを取得
    const { avatar_url, full_name } = user.user_metadata;

    return (
        <Sheet>
            {/* メニューボタン（ハンバーガーメニューアイコン） */}
            <SheetTrigger asChild>
                <Button variant={"ghost"} size={"icon"}>
                    <Menu />
                </Button>
            </SheetTrigger>
            {/* サイドシートのコンテンツ（左側から表示） */}
            <SheetContent side="left" className="w-72 p-6">
                {/* スクリーンリーダー用のヘッダー（視覚的には非表示） */}
                <SheetHeader className="sr-only">
                    <SheetTitle>メニュー情報</SheetTitle>
                    <SheetDescription>
                        ユーザー情報とメニュー情報を表示
                    </SheetDescription>
                </SheetHeader>

                {/* ユーザー情報エリア：アバターとユーザー名を表示 */}
                <div className="flex items-center gap-5">
                    <Avatar>
                        <AvatarImage src={avatar_url} />
                        <AvatarFallback>ユーザー名</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-bold">{full_name}</div>
                        <div>
                            {/* アカウント管理ページへのリンク（現在は#に設定） */}
                            <Link href={"#"} className="text-green-500 text-xs">
                                アカウントを管理する
                            </Link>
                        </div>
                    </div>
                </div>

                {/* メニュー情報エリア：注文履歴やお気に入りへのリンク */}
                <ul className="space-y-4">
                    {/* 注文履歴ページへのリンク */}
                    <li>
                        <Link
                            href={"/orders"}
                            className="flex items-center gap-4"
                        >
                            <Bookmark fill="bg-primary" />
                            <span className="font-bold">ご注文内容</span>
                        </Link>
                    </li>

                    {/* お気に入りページへのリンク */}
                    <li>
                        <Link
                            href={"/favorites"}
                            className="flex items-center gap-4"
                        >
                            <Heart fill="bg-primary" />
                            <span className="font-bold">お気に入り</span>
                        </Link>
                    </li>
                </ul>

                {/* フッター：ログアウトボタン */}
                <SheetFooter>
                    <form>
                        {/* Server Actionを使用してログアウト処理を実行 */}
                        <Button className="w-full" formAction={logout}>
                            ログアウト
                        </Button>
                    </form>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
