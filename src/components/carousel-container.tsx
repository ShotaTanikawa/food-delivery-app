import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

/**
 * CarouselContainerコンポーネントのProps
 */
interface CarouselContainerProps {
    children: React.ReactNode[]; // カルーセルに表示する子要素の配列
    slideToShow: number; // 1画面に表示するアイテム数（例: 4 = 4つ表示）
}

/**
 * カルーセルコンテナコンポーネント
 * スライダー形式でコンテンツを表示する
 * slideToShowプロパティで1画面に表示するアイテム数を制御できる
 */
export default function CarouselContainer({
    children,
    slideToShow,
}: CarouselContainerProps) {
    return (
        <Carousel
            opts={{
                align: "start", // スライドの配置を開始位置に
            }}
            className="w-full"
        >
            <CarouselContent>
                {children.map((child, index) => (
                    <CarouselItem
                        key={index}
                        // flexBasisで1画面に表示するアイテム数を制御
                        // 例: slideToShow=4 の場合、各アイテムは25%（100/4）の幅を持つ
                        style={{ flexBasis: `${100 / slideToShow}%` }}
                    >
                        <div className="p-1">{child}</div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {/* 前後のスライドに移動するボタン */}
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
}
