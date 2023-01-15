import { stubPlayer, stubPlayerInfo } from '@app/utils/mocks/player';
import { Game, GameOptions, JoinMultiplayerOption } from '@common/game';
import { GameMode } from '@common/game-mode';
import { Objective } from '@common/objectives';

export const stubGame: Game = {
    capacity: 1,
    creator: stubPlayer,
    dict: 'Default',
    grid: [[]],
    id: 'game id',
    letterReserve: [],
    opponent: null,
    time: 16000,
    timer: 16000,
    skipCounter: 0,
    hasEnded: false,
    mode: GameMode.Classic,
    isMultiplayer: true,
    totalTime: 300000,
};

export const stubGameOptions: GameOptions = {
    playerName: stubPlayer.name,
    playerId: stubPlayer.id,
    time: stubGame.time,
    dictionary: stubGame.dict,
    isMultiplayer: true,
    gameMode: GameMode.Classic,
};

export const stubJoinMultiplayerOptions: JoinMultiplayerOption = {
    gameId: stubGame.id,
    playerInfo: stubPlayerInfo,
};

export const OBJECTIVE_STUB_1: Objective = {
    name: 'objective1',
    fullName: 'objective1 fullName',
    points: 5,
    isCompleted: false,
};

export const PUBLIC_OBJECTIVES_STUB: Objective[] = [OBJECTIVE_STUB_1];
