import { Summary } from "@app/utils/interfaces/summary";

export interface User {
    id: string;
    username: string;
    email: string;
    avatar: {url: string, fileId: string};
    preferences: Preferences;
    joinedChatRooms: string[];
    joinedDMRooms: string[];
    joinedGame: string;
	friends: string[];
	pendingRequests: string[];
	summary: Summary;
}

export interface Preferences {
    theme: string;
    language: string;
}