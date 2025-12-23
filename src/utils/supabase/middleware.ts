import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabaseセッションを更新するMiddleware関数
 * すべてのリクエストで実行され、認証状態を確認・更新する
 * 未認証のユーザーはログインページにリダイレクトする
 */
export async function updateSession(request: NextRequest) {
    // レスポンスオブジェクトを初期化
    let supabaseResponse = NextResponse.next({
        request,
    });

    // Middleware用のSupabaseクライアントを作成
    // Cookieからセッション情報を読み書きする
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                // リクエストからすべてのCookieを取得
                getAll() {
                    return request.cookies.getAll();
                },
                // Cookieを設定（セッション更新時に使用）
                setAll(cookiesToSet) {
                    // リクエストオブジェクトにCookieを設定
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    // 新しいレスポンスオブジェクトを作成
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    // レスポンスオブジェクトにもCookieを設定
                    cookiesToSet.forEach(({ name, value }) =>
                        supabaseResponse.cookies.set(name, value)
                    );
                },
            },
        }
    );

    // 重要: createServerClient と getClaims() の間にロジックを書かないこと
    // セッションが意図せず終了する問題の原因になる可能性がある

    // 重要: getClaims() を削除しないこと（セッションを有効化するために必要）
    const { data } = await supabase.auth.getClaims();

    const user = data?.claims;

    // 未認証ユーザーで、ログイン・認証ページ以外にアクセスしようとした場合
    if (
        !user &&
        !request.nextUrl.pathname.startsWith("/login") &&
        !request.nextUrl.pathname.startsWith("/auth")
    ) {
        // ログインページにリダイレクト
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // 重要: supabaseResponse オブジェクトをそのまま返すこと
    // 新しいレスポンスオブジェクトを作成する場合は、必ずCookieをコピーすること
    // そうしないと、ブラウザとサーバー間のセッションが同期されず、
    // ユーザーのセッションが早期に終了する可能性がある

    return supabaseResponse;
}
