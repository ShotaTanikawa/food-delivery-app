"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

/**
 * Google OAuth認証を開始するServer Action
 * ユーザーをGoogleの認証ページにリダイレクトする
 */
export async function login() {
    console.log("google login");
    const supabase = await createClient();
    // Google OAuth認証を開始
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            // 認証後のコールバックURL
            redirectTo: "http://localhost:3000/auth/callback",
        },
    });

    if (error) {
        console.error(error);
    }

    // OAuth認証URLが返された場合、そのURLにリダイレクト
    if (data.url) {
        redirect(data.url);
    }
}

/**
 * ログアウト処理を行うServer Action
 * セッションを終了してログインページにリダイレクトする
 */
export async function logout() {
    const supabase = await createClient();
    // セッションを終了
    let { error } = await supabase.auth.signOut();
    if (error) {
        console.error(error);
    }

    // ログインページにリダイレクト
    redirect("/login");
}
