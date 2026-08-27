export interface SidebarLink {
    icon?: string,
    text?: string,
    url: string,
}
export interface SidebarAuthor {
    name?: string,
    avatar?: string,
    bio?: string,
    links?: SidebarLink[],
}
export interface SidebarNotice {
    title: string,
    content: string,
}
export interface SidebarData {
    author: SidebarAuthor | null,
    notices: SidebarNotice[],
}
export declare const data: SidebarData
