export interface User {
    id: string;
    username: string;
    email: string;
    avatar: {url: string, fileId: string};
    preferences: {theme: string};
}