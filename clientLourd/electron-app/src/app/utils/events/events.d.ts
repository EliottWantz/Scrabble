import { ClientEvent } from "./client-events";
import { ServerEvent } from "./server-events";

export type Event = ClientEvent | ServerEvent;