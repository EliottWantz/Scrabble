export interface Letter {
    character: string;
    value: number;
}

export enum TileType {
    BASIC,
    DOUBLELETTER,
    TRIPLELETTER,
    DOUBLEWORD,
    TRIPLEWORD,
    STAR,
    ROW,
    COL,
    EMPTY,
}
