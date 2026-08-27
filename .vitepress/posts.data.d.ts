export interface PostData {
    title: string,
    href: string,
    create: number,
    update: number,
    tags?: string[],
    cover?: string,
    excerpt: string,
    words?: number,
    readingTime?: number,
}
export declare const data: PostData[]
