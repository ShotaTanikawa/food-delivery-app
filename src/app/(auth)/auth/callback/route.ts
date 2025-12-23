import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * OAuth認証のコールバック Route Handler
 * Google OAuth認証後にリダイレクトされるエンドポイント
 * 認証コードをセッションに交換して、指定されたページにリダイレクトする
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    // OAuthプロバイダーから返された認証コード
    const code = searchParams.get("code");
    // リダイレクト先のパス（クエリパラメータから取得、デフォルトは "/"）
    let next = searchParams.get("next") ?? "/";
    // 相対URLでない場合はデフォルトに戻す（セキュリティ対策）
    if (!next.startsWith("/")) {
        next = "/";
    }

    // 認証コードがある場合、セッションに交換
    if (code) {
        const supabase = await createClient();
        // 認証コードをセッションに交換
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // ロードバランサーの前の元のオリジン（本番環境用）
            const forwardedHost = request.headers.get("x-forwarded-host");
            const isLocalEnv = process.env.NODE_ENV === "development";

            if (isLocalEnv) {
                // 開発環境ではロードバランサーがないため、originをそのまま使用
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                // 本番環境でforwardedHostがある場合はそれを使用
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                // それ以外の場合はoriginを使用
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // 認証に失敗した場合はエラーページにリダイレクト
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
