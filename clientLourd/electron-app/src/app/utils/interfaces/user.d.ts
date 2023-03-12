import { Summary } from "@app/utils/interfaces/summary";

export interface User {
    id: string;
    username: string;
    email: string;
    avatar: {url: string, fileId: string};
    preferences: {theme: string};
    joinedChatRooms: string[];
	friends: string[];
	pendingRequests: string[];
	summary: Summary;
}