import Header from "@/components/Header";

/**
 * 認証が必要なページのレイアウトコンポーネント
 * すべてのプライベートページ（ログイン後のページ）に適用される
 */
export default function PrivatePageLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {/* ヘッダーコンポーネント */}
            <Header />
            {/* メインコンテンツエリア */}
            <main className=" max-w-screen-xl mx-auto px-10 pt-16">
                {children}
            </main>
        </>
    );
}
