export type Packet = {
    event: Event;
    payload: any;
  };
  
  export type JoinedGlobalRoomPayload = {
    roomId: string;
  };
  export type BroadcastPayload = {
    roomId: string;
    message: string;
    from: string;
    timestamp?: string;
  };
  export type User = {
    id: string;
    username: string;
  };
  export type ChatMessage = {
    message: string;
    from: string;
    timestamp: string;
  };
  export type ClientEvent = "join" | "leave" | "broadcast";
export type ServerEvent = "joinedGlobalRoom";
export type Event = ClientEvent | ServerEvent;