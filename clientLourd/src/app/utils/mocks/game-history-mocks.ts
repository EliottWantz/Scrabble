import { GameMode } from '@common/game-mode';
import { GameHistory } from '@common/player';
import { stubPlayer, stubPlayer2 } from './player';
const date = new Date('March 27, 2022 03:24:00');
export const GAME_HISTORY_MOCKS: GameHistory = {
    started: date,
    duration: 10000,
    creator: stubPlayer,
    creatorScore: stubPlayer.score,
    oponentScore: stubPlayer2.score,
    opponent: stubPlayer2,
    mode: GameMode.Classic,
    gameAbandoned: false,
};
