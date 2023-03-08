export interface User {
    id: string;
    username: string;
    email: string;
    avatar: {URL: string, FileId: string};
    preferences: {theme: string};
}