/* eslint-disable @typescript-eslint/no-magic-numbers */
export const DEFAULT_WIDTH = 720 / window.devicePixelRatio;
export const DEFAULT_HEIGHT = 720 / window.devicePixelRatio;
export const DEFAULT_FONT_SIZE = 7;
export const BOARD_LENGTH = 15;
export const BLOCK_SIZE = DEFAULT_WIDTH / 16;
export const DEFAULT_GRID_LINE_WIDTH = 2;
export const DEFAULT_LINE_GRID_COLOR = '#e0dfcd';
export const GRID_FONT_COLOR = 'black';
export const GRID_TILE_OFFSET = { x: 1, y: 2 };
export const FONT_WORD_SPACER = 13;
export const LETTER_CENTER_FACTOR = 5;
export const LETTER_LINE_HEIGHT = 5;
export const LETTER_FONT_MULTIPLIER = 2 / window.devicePixelRatio;
export const ROW_START = 0;
export const COL_START = 0;
export const ROW_OFFSET = 1;
export const COL_IDX = 7;
export const ROW_IDX = 6;
export const IDX_SKIPPER = 3;
export const WORD_SKIPPER = 1;
export const X_OFFSET = 12;
export const LETTER_MULTIPLIER = 3 / window.devicePixelRatio;
export const TILE_PROPERTIES = {
    0: { color: '#bfb89d', text: '' },
    1: { color: '#aec1bf', text: 'LETTRE\nx 2' },
    2: { color: '#70abbb', text: 'LETTRE\nx 3' },
    3: { color: '#b1c5c3', text: 'MOT\nx 2' },
    4: { color: '#e97968', text: 'MOT\nx 3' },
    5: { color: '#e1b1a9', text: '★' },
    6: { color: '#FFFFFF', text: '' },
    7: { color: '#FFFFFF', text: '' },
    8: { color: '#FFFFFF', text: '' },
};

export const ROW_DICT = {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'E',
    6: 'F',
    7: 'G',
    8: 'H',
    9: 'I',
    10: 'J',
    11: 'K',
    12: 'L',
    13: 'M',
    14: 'N',
    15: 'O',
};
export const ROW_DICT_MIN = {
    1: 'a',
    2: 'b',
    3: 'c',
    4: 'd',
    5: 'e',
    6: 'f',
    7: 'g',
    8: 'h',
    9: 'i',
    10: 'j',
    11: 'k',
    12: 'l',
    13: 'm',
    14: 'n',
    15: 'o',
};
