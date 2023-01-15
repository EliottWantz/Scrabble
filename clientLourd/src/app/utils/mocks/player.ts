import { Letter } from '@common/grid/node';
import { Player, PlayerInfo } from '@common/player';
import { PlayerScore } from '@common/player-score';

export const stubLetter: Letter = {
    character: 'a',
    value: 1,
};
export const stubPlayer: Player = {
    name: 'test player',
    id: '123456789',
    completedWords: [],
    easel: [stubLetter],
    isPlaying: false,
    score: 0,
    isVirtual: false,
    hasAbandon: false,
};

export const stubPlayer2: Player = {
    name: 'test player2',
    id: '12345',
    completedWords: [],
    easel: [stubLetter],
    isPlaying: true,
    score: 0,
    isVirtual: false,
    hasAbandon: false,
};

export const stubPlayerInfo: PlayerInfo = {
    id: stubPlayer.id,
    name: stubPlayer.name,
};

export const stubScore: PlayerScore = {
    name: 'Schumaner',
    score: 100,
};
