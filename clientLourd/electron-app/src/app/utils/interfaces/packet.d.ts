export interface Packet {
    event: Event;
    payload: any;
}

export interface JoinedGlobalRoomPayload {
    roomId: string;
}

export interface BroadcastPayload {
    roomId: string;
    message: string;
    from: string;
    timesstamp?: string;
}