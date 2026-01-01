import { CategoryMenu, Menu } from "@/types";
import { createClient } from "@/utils/supabase/server";

/**
 * 指定されたジャンルのメニューをカテゴリー別に取得する関数
 * データベースからメニュー情報を取得し、注目商品（is_featured=true）とカテゴリー別に分類して返す
 * 各メニューにはSupabase Storageから取得した画像URLを含める
 * @param primaryType レストランの主要なタイプ（例: "ramen_restaurant", "sushi_restaurant"）
 *                    このタイプに一致するジャンルのメニューを取得する
 * @param searchQuery オプション：メニュー名で検索するキーワード
 *                    指定された場合、メニュー名（nameカラム）に対して部分一致検索を実行する
 *                    例: "ラーメン" → メニュー名に"ラーメン"が含まれるメニューのみを取得
 * @returns カテゴリー別に分類されたメニューリスト、またはエラー情報
 */
export async function fetchCategoryMenus(
    primaryType: string,
    searchQuery?: string
) {
    console.log("fetchCategoryMenus:");

    // Supabaseクライアントを作成（Server Component用）
    const supabase = await createClient();
    // Supabase Storageの"menus"バケットにアクセスするためのオブジェクトを取得
    // メニュー画像の公開URLを取得するために使用する
    const bucket = supabase.storage.from("menus");

    // データベースから指定されたジャンル（genre）のメニュー情報を取得するクエリを構築
    // まず、genreカラムがprimaryTypeと一致するメニューを抽出するベースクエリを作成
    let query = supabase.from("menus").select("*").eq("genre", primaryType);

    // 検索クエリ（searchQuery）が存在する場合、メニュー名（nameカラム）に対して部分一致検索を追加
    // 例: searchQuery = "ラーメン" → nameカラムに"ラーメン"が含まれるメニューのみを抽出
    // LIKE検索のパターン: `%${searchQuery}%` は前後に任意の文字列が存在することを意味する
    if (searchQuery) {
        query = query.like("name", `%${searchQuery}%`);
    }

    // クエリを実行してメニュー情報を取得
    const { data: menus, error: menusError } = await query;

    // エラーハンドリング：メニュー情報の取得に失敗した場合
    if (menusError) {
        console.error("メニュー情報の取得に失敗しました:", menusError);
        return { error: "メニュー情報の取得に失敗しました" };
    }

    console.log("menus:", menus);

    // メニューが存在しない場合、空の配列を返す
    if (menus.length === 0) {
        return { data: [] };
    }

    // カテゴリー別に分類されたメニューリストを格納する配列を初期化
    const categoryMenus: CategoryMenu[] = [];

    // 注目商品（is_featured=true）のメニューのみをフィルタリング
    // データベースの生データを、アプリケーションで使用するMenu型に変換
    // 画像パス（image_path）をSupabase Storageの公開URLに変換してphotoUrlに設定
    // 注意: 検索クエリが存在する場合（searchQueryがある場合）は注目商品セクションを表示しない
    //       検索結果のみを表示するため
    if (!searchQuery) {
        const featuredItems = menus
            .filter((menu) => menu.is_featured) // 注目商品フラグがtrueのメニューのみを抽出
            .map(
                (menu): Menu => ({
                    id: menu.id, // メニューの一意ID
                    name: menu.name, // メニュー名
                    price: menu.price, // 価格
                    // Supabase Storageから画像の公開URLを取得
                    // image_path（例: "ramen/image1.jpg"）を公開アクセス可能なURLに変換
                    photoUrl: bucket.getPublicUrl(menu.image_path).data
                        .publicUrl,
                })
            );
        console.log("featuredItems:", featuredItems);

        // 注目商品をカテゴリーリストの最初に追加
        // id: "featured" は固定値（注目商品カテゴリーの識別子）
        categoryMenus.push({
            id: "featured", // 注目商品カテゴリーの一意ID（固定値）
            categoryName: "注目商品", // カテゴリーの表示名
            items: featuredItems, // 注目商品のメニューリスト
        });
    }

    // メニューに含まれるすべてのカテゴリー名を取得（重複を除去）
    // Setを使用して重複を排除し、Array.fromで配列に変換
    const categories = Array.from(new Set(menus.map((menu) => menu.category)));
    console.log("categories:", categories);

    // 各カテゴリーごとにメニューを分類してカテゴリーリストに追加
    for (const category of categories) {
        // 現在のカテゴリーに属するメニューのみをフィルタリング
        // データベースの生データをMenu型に変換し、画像URLを設定
        const items = menus
            .filter((menu) => menu.category === category) // 現在のカテゴリーに一致するメニューのみを抽出
            .map(
                (menu): Menu => ({
                    id: menu.id, // メニューの一意ID
                    name: menu.name, // メニュー名
                    price: menu.price, // 価格
                    // Supabase Storageから画像の公開URLを取得
                    // image_pathを公開アクセス可能なURLに変換
                    photoUrl: bucket.getPublicUrl(menu.image_path).data
                        .publicUrl,
                })
            );

        // カテゴリーごとのメニューリストをカテゴリーリストに追加
        categoryMenus.push({
            id: category, // カテゴリー名をIDとして使用
            categoryName: category, // カテゴリーの表示名（カテゴリー名と同じ）
            items: items, // このカテゴリーに属するメニューリスト
        });
    }

    console.log("categoryMenus:", categoryMenus);
    // カテゴリー別に分類されたメニューリストを返す
    // 最初に注目商品、その後に各カテゴリーのメニューが順番に格納される
    return { data: categoryMenus };
}
