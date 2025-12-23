import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server ComponentやRoute Handler用のSupabaseクライアントを作成
 * Cookieからセッション情報を読み取る
 */
export async function createClient() {
    // Next.jsのCookieストアを取得
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                // すべてのCookieを取得
                getAll() {
                    return cookieStore.getAll();
                },
                // Cookieを設定（Server Componentでは通常失敗する）
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value }) =>
                            cookieStore.set(name, value)
                        );
                    } catch {
                        // Server ComponentからsetAllが呼ばれた場合は無視する
                        // Middlewareがセッションを更新しているため問題ない
                    }
                },
            },
        }
    );
}
