import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

/**
 * Next.js Middleware
 * すべてのリクエストに対して実行され、Supabaseのセッションを更新する
 */
export async function middleware(request: NextRequest) {
    return await updateSession(request);
}

/**
 * Middlewareの適用対象となるパスを設定
 * 静的ファイルや画像ファイルは除外して、すべてのAPIルートとページに適用
 */
export const config = {
    matcher: [
        /*
         * 以下のパスを除外して、すべてのリクエストに適用:
         * - _next/static (静的ファイル)
         * - _next/image (画像最適化ファイル)
         * - favicon.ico (ファビコン)
         * - 画像ファイル (.svg, .png, .jpg, .jpeg, .gif, .webp)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
