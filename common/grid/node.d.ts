// import { Tile } from '@common/grid/gridTypes';

// export interface Node {
//     letter?: Letter;
//     tileType: Tile;
//     isEmpty: boolean;
// }

// export interface Letter {
//     character: string;
//     value: number;
// }

import { Tile } from '@common/grid/gridTypes';

export interface Word {
    letters: Node[];
    isHorizontal: boolean;
}

export interface Node {
    letter?: Letter;
    tileType: Tile;
    isEmpty: boolean;
    x: number;
    y: number;
    isNewNode?: boolean;
}

export interface Letter {
    character: string;
    value: number;
    selectionType?: SelectionType;
}

export type SelectionType = 'exchange' | 'manipulation' | 'none';
