/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { CommandService } from '@app/services/command/command.service';
import { GameService } from '@app/services/game/game.service';
import { stubGame } from '@app/utils/mocks/game';
import { ClueCommand, CommandError, ExchangeCommand, PlaceCommand } from '@common/command';
import { Game } from '@common/game';
import { BehaviorSubject } from 'rxjs';

describe('CommandService', () => {
    let service: CommandService;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        stubGame.hasEnded = false;
        gameServiceSpy = jasmine.createSpyObj('GameService', ['init'], {
            game$: new BehaviorSubject<Game>(stubGame),
        });

        TestBed.configureTestingModule({
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        });
        service = TestBed.inject(CommandService);
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should not an return error with the input command "  !placer h8 a  "', fakeAsync(() => {
        spyOn<any>(service, 'validatePlaceCommand').and.returnValue(Promise.resolve(true));
        const input = '  !placer h8 a  ';
        const expectedInput = '!placer h8 a';
        const result = service.throwsError(input);
        expect(service.inputCommand).toBe(expectedInput);
        expectAsync(result).toBeResolvedTo(undefined);
        expect(service['validatePlaceCommand']).toHaveBeenCalledWith(['h8', 'a']);
    }));

    it('should not return an error with the input command "!réserve"', fakeAsync(() => {
        const input = '!réserve';
        const result = service.throwsError(input);
        expectAsync(result).toBeResolvedTo(undefined);
    }));

    it('should not return and error with the command "!aide"', fakeAsync(() => {
        const input = '!aide';
        const result = service.throwsError(input);
        expectAsync(result).toBeResolvedTo(undefined);
    }));

    it('should return an error with the input command "!réserve 8"', fakeAsync(() => {
        const input = '!réserve 8 ';
        const expectedInput = '!réserve 8';
        const result = service.throwsError(input);
        expect(service.inputCommand).toBe(expectedInput);
        expectAsync(result).toBeResolvedTo(CommandError.Syntax);
    }));

    it('should return an error with the input command "!aide a"', fakeAsync(() => {
        const input = '!aide 8 ';
        const expectedInput = '!aide 8';
        const result = service.throwsError(input);
        expect(service.inputCommand).toBe(expectedInput);
        expectAsync(result).toBeResolvedTo(CommandError.Syntax);
    }));

    it('should return an error with the input command "  !placer h8g salut tout le monde "', fakeAsync(() => {
        spyOn<any>(service, 'validatePlaceCommand').and.returnValue(Promise.resolve(false));
        const input = '  !placer h8g salut tout le monde  ';
        const expectedInput = '!placer h8g salut tout le monde';
        const result = service.throwsError(input);
        expect(service.inputCommand).toBe(expectedInput);
        expectAsync(result).toBeResolvedTo(CommandError.Syntax);
        expect(service['validatePlaceCommand']).not.toHaveBeenCalled();
    }));

    it('should return an error with the input command "  !placer h8g allo  "', fakeAsync(() => {
        spyOn<any>(service, 'validatePlaceCommand').and.returnValue(Promise.resolve(false));
        const input = '  !placer h8g allo  ';
        const expectedInput = '!placer h8g allo';
        const result = service.throwsError(input);
        expect(service.inputCommand).toBe(expectedInput);
        expectAsync(result).toBeResolvedTo(CommandError.Syntax);
        expect(service['validatePlaceCommand']).toHaveBeenCalledWith(['h8g', 'allo']);
    }));

    it('should not return an error with the input command "  !échanger abc  "', fakeAsync(() => {
        spyOn<any>(service, 'validateExchangeCommand').and.returnValue(true);
        const input = '  !échanger abc  ';
        const expectedInput = '!échanger abc';
        const result = service.throwsError(input);
        expect(service.inputCommand).toBe(expectedInput);
        expectAsync(result).toBeResolvedTo(undefined);
        expect(service['validateExchangeCommand']).toHaveBeenCalledWith('abc');
    }));

    it('should return an error with the input command "  !échanger abc now "', fakeAsync(() => {
        spyOn<any>(service, 'validateExchangeCommand').and.returnValue(false);
        const input = '  !échanger abc now  ';
        const expectedInput = '!échanger abc now';
        const result = service.throwsError(input);
        expect(service.inputCommand).toBe(expectedInput);
        expectAsync(result).toBeResolvedTo(CommandError.Syntax);
        expect(service['validateExchangeCommand']).not.toHaveBeenCalled();
    }));

    it('should return game Is Done error', fakeAsync(() => {
        const input = 'dummyInput';
        const game: Game = { ...stubGame, hasEnded: true };
        gameServiceSpy.game$.next(game);
        expectAsync(service.throwsError(input)).toBeResolvedTo(CommandError.GameDone);
    }));

    it('should return an error with the input command "  !échanger abcsadadsadafwf  "', fakeAsync(() => {
        spyOn<any>(service, 'validateExchangeCommand').and.returnValue(false);
        const input = '  !échanger abcsadadsadafwf  ';
        const expectedInput = '!échanger abcsadadsadafwf';
        const result = service.throwsError(input);
        expect(service.inputCommand).toBe(expectedInput);
        expectAsync(result).toBeResolvedTo(CommandError.Syntax);
        expect(service['validateExchangeCommand']).toHaveBeenCalledWith('abcsadadsadafwf');
    }));

    it('should not return error with the input command "  !passer  "', fakeAsync(() => {
        const input = '  !passer  ';
        const expectedInput = '!passer';
        const result = service.throwsError(input);
        expect(service.inputCommand).toBe(expectedInput);
        expectAsync(result).toBeResolvedTo(undefined);
    }));

    it('should return error with the input command "  !passer now "', fakeAsync(() => {
        const input = '  !passer now  ';
        const expectedInput = '!passer now';
        const result = service.throwsError(input);
        expect(service.inputCommand).toBe(expectedInput);
        expectAsync(result).toBeResolvedTo(CommandError.Syntax);
    }));

    it('should not return error with the input command "  !indice  "', fakeAsync(() => {
        const input = '  !indice  ';
        const expectedInput = '!indice';
        const result = service.throwsError(input);
        expect(service.inputCommand).toBe(expectedInput);
        expectAsync(result).toBeResolvedTo(undefined);
    }));

    it('should return error with the input command "  !indice now "', fakeAsync(() => {
        const input = '  !indice now  ';
        const expectedInput = '!indice now';
        const result = service.throwsError(input);
        expect(service.inputCommand).toBe(expectedInput);
        expectAsync(result).toBeResolvedTo(CommandError.Syntax);
    }));

    it('should return error if no valid command word is given', fakeAsync(() => {
        const input = '  !bad  ';
        const expectedInput = '!bad';
        const result = service.throwsError(input);
        expect(service.inputCommand).toBe(expectedInput);
        expectAsync(result).toBeResolvedTo(CommandError.Invalid);
    }));

    it('should validate the word if there is no capital letter', () => {
        const word = 'allo';
        const result = service['validateNumberOfCaps'](word);
        expect(result).toBe(true);
    });

    it('should validate the word if there is one capital letter', () => {
        const word = 'Allo';
        const result = service['validateNumberOfCaps'](word);
        expect(result).toBe(true);
    });

    it('should validate the word if there are two capital letters', () => {
        const word = 'AllO';
        const result = service['validateNumberOfCaps'](word);
        expect(result).toBe(true);
    });

    it('should not validate the word if there are three capital letters', () => {
        const word = 'ALLo';
        const result = service['validateNumberOfCaps'](word);
        expect(result).toBe(false);
    });

    it('should validate the word if there a valid input', () => {
        const word = 'abcdefghijklmnopqrstuvwxyz';
        const result = service['validateWordIfLowerCase'](word);
        expect(result).toBe(true);
    });

    it('should validate the word if there is one letter', () => {
        const word = 'a';
        const result = service['validateWordIfLowerCase'](word);
        expect(result).toBe(true);
    });

    it('should validate the word if there are accents in the word', () => {
        const word = 'àâäéèêëïîôöùûüÿçæœ';
        const result = service['validateWordIfLowerCase'](word);
        expect(result).toBe(true);
    });

    it('should not validate the word if there no letters', () => {
        const word = '';
        const result = service['validateWordIfLowerCase'](word);
        expect(result).toBe(false);
    });

    it('should not validate the word if there are numbers', () => {
        const word = '1234567890';
        const result = service['validateWordIfLowerCase'](word);
        expect(result).toBe(false);
    });

    it('should return the appropriate regex for a one letter word', () => {
        const word = 'a';
        const result = service['getAppropriateRegex'](word);
        expect(result).toEqual(/^([a-o])([1-9]|1[0-5]?)([vh]?)$/);
    });

    it('should return the appropriate regex for word with more than one letter', () => {
        const word = 'allo';
        const result = service['getAppropriateRegex'](word);
        expect(result).toEqual(/^([a-o])([1-9]|1[0-5]?)([vh])$/);
    });

    it('should return the appropriate regex given no letters', () => {
        const word = '';
        const result = service['getAppropriateRegex'](word);
        expect(result).toEqual(/^([a-o])([1-9]|1[0-5]?)([vh])$/);
    });

    it('should validate the position and direction if input is one letter and we specify the direction', () => {
        const word = 'a';
        const positionAndDirection = 'a1v';
        const regex = service['getAppropriateRegex'](word);
        const result = service['validatePositionAndDirection'](positionAndDirection, regex);
        expect(result).toBe(true);
    });

    it('should validate the position and direction if input is one letter and we do not specify the direction', () => {
        const word = 'a';
        const positionAndDirection = 'a1';
        const regex = service['getAppropriateRegex'](word);
        const result = service['validatePositionAndDirection'](positionAndDirection, regex);
        expect(result).toBe(true);
    });

    it('should validate the position and direction if input is two letters and we specify the direction', () => {
        const word = 'az';
        const positionAndDirection = 'f4h';
        const regex = service['getAppropriateRegex'](word);
        const result = service['validatePositionAndDirection'](positionAndDirection, regex);
        expect(result).toBe(true);
    });

    it('should not validate the position and direction if input is more than one letters and we do not specify the direction', () => {
        const word = 'agz';
        const positionAndDirection = 'f13';
        const regex = service['getAppropriateRegex'](word);
        const result = service['validatePositionAndDirection'](positionAndDirection, regex);
        expect(result).toBe(false);
    });

    it('should not validate the position and direction if input out of bounds vertically', () => {
        const word = 'agz';
        const positionAndDirection = 'z5h';
        const regex = service['getAppropriateRegex'](word);
        const result = service['validatePositionAndDirection'](positionAndDirection, regex);
        expect(result).toBe(false);
    });

    it('should not validate the position and direction if input out of bounds horizontally to the left', () => {
        const word = 'agz';
        const positionAndDirection = 'z-5h';
        const regex = service['getAppropriateRegex'](word);
        const result = service['validatePositionAndDirection'](positionAndDirection, regex);
        expect(result).toBe(false);
    });

    it('should not validate the position and direction if input out of bounds horizontally to the right', () => {
        const word = 'agz';
        const positionAndDirection = 'a24h';
        const regex = service['getAppropriateRegex'](word);
        const result = service['validatePositionAndDirection'](positionAndDirection, regex);
        expect(result).toBe(false);
    });

    it('should return the number of a valid row', () => {
        const row = 'a';
        const result = service['getRowToNumber'](row);
        expect(result).toBe(1);
    });

    it('should return undefined if the row is not valid', () => {
        const row = 'z';
        const result = service['getRowToNumber'](row);
        expect(result).toBeUndefined();
    });

    it('should return the row, column and direction of a valid position and direction for one letter word', () => {
        const positionAndDirection = 'f13';
        const word = 'x';
        const result = service['separatePlaceCommand'](positionAndDirection, word);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- No need to define a constant for the expected result
        expect(result).toEqual(['f', 13, 'h']);
    });

    it('should return the row, column and direction of a valid position and direction', () => {
        const positionAndDirection = 'f3v';
        const word = 'allo';
        const result = service['separatePlaceCommand'](positionAndDirection, word);
        expect(result).toEqual(['f', 3, 'v']);
    });

    it('should check if word placement is out of bounds', () => {
        const start = 15;
        const word = 'allo';
        const result = service['isOutOfBounds'](start, word.length);
        expect(result).toBe(true);
    });

    it('should check if word placement is out of bounds', () => {
        const start = 3;
        const word = 'allo';
        const result = service['isOutOfBounds'](start, word.length);
        expect(result).toBe(false);
    });

    it('wordValidOnGrid() should return false if out of bounds', fakeAsync(() => {
        spyOn<any>(service, 'wordValidOnGrid').and.callThrough();
        const word = 'allo';
        const row = 'f';
        const column = 15;
        const result = service['wordValidOnGrid'](word, row, column, 'h');
        expectAsync(result).toBeResolvedTo(false);
    }));

    it('wordValidOnGrid() should return false if not validated by wordValidatorService', fakeAsync(() => {
        spyOn<any>(service, 'wordValidOnGrid').and.returnValue(Promise.resolve(false));
        const word = 'ewrrs';
        const row = 'f';
        const column = 3;
        const result = service['wordValidOnGrid'](word, row, column, 'h');
        expectAsync(result).toBeResolvedTo(false);
    }));

    it('wordValidOnGrid() should return true if validated by wordValidatorService and not out of bounds', fakeAsync(() => {
        spyOn<any>(service, 'wordValidOnGrid').and.returnValue(Promise.resolve(true));
        const word = 'allo';
        const row = 'f';
        const column = 3;
        const result = service['wordValidOnGrid'](word, row, column, 'h');
        expectAsync(result).toBeResolvedTo(true);
    }));

    describe('validatePlaceCommand', () => {
        beforeEach(() => {
            spyOn<any>(service, 'validateNumberOfCaps').and.callThrough();
            spyOn<any>(service, 'validateWordIfLowerCase').and.callThrough();
            spyOn<any>(service, 'getAppropriateRegex').and.callThrough();
            spyOn<any>(service, 'validatePositionAndDirection').and.callThrough();
            spyOn<any>(service, 'separatePlaceCommand').and.callThrough();
        });

        it('should return true if the word is placed horizontally and in the bounds', fakeAsync(() => {
            const positionAndDirection = 'k10h';
            const word = 'allo';
            const result = service['validatePlaceCommand']([positionAndDirection, word]);

            expect(service['validateNumberOfCaps']).toHaveBeenCalledWith(word);
            expect(service['validateWordIfLowerCase']).toHaveBeenCalledWith(word);
            expect(service['getAppropriateRegex']).toHaveBeenCalledWith(word.toLowerCase());
            expect(service['validatePositionAndDirection']).toHaveBeenCalledWith(
                positionAndDirection,
                service['getAppropriateRegex'](word.toLowerCase()),
            );
            expect(service['separatePlaceCommand']).toHaveBeenCalledWith(positionAndDirection, word);
            expectAsync(result).toBeResolvedTo(true);
        }));

        it('should return true if the word is placed vertically and in the bounds', fakeAsync(() => {
            const positionAndDirection = 'b3v';
            const word = 'allo';
            const result = service['validatePlaceCommand']([positionAndDirection, word]);

            expect(service['validateNumberOfCaps']).toHaveBeenCalledWith(word);
            expect(service['validateWordIfLowerCase']).toHaveBeenCalledWith(word);
            expect(service['getAppropriateRegex']).toHaveBeenCalledWith(word.toLowerCase());
            expect(service['validatePositionAndDirection']).toHaveBeenCalledWith(
                positionAndDirection,
                service['getAppropriateRegex'](word.toLowerCase()),
            );
            expect(service['separatePlaceCommand']).toHaveBeenCalledWith(positionAndDirection, word);
            expectAsync(result).toBeResolvedTo(true);
        }));

        it('should return false if the word is placed vertically but outside of the bounds', fakeAsync(() => {
            const positionAndDirection = 'k10v';
            const word = 'wtyqasdfgdfs';
            const result = service['validatePlaceCommand']([positionAndDirection, word]);

            expect(service['validateNumberOfCaps']).toHaveBeenCalledWith(word);
            expect(service['validateWordIfLowerCase']).toHaveBeenCalledWith(word);
            expect(service['getAppropriateRegex']).toHaveBeenCalledWith(word.toLowerCase());
            expect(service['validatePositionAndDirection']).toHaveBeenCalledWith(
                positionAndDirection,
                service['getAppropriateRegex'](word.toLowerCase()),
            );
            expect(service['separatePlaceCommand']).toHaveBeenCalledWith(positionAndDirection, word);
            expectAsync(result).toBeResolvedTo(false);
        }));

        it('should return false if the word is placed horizontally but outside the bounds', fakeAsync(() => {
            const positionAndDirection = 'k10h';
            const word = 'zzsdaadfg';
            const result = service['validatePlaceCommand']([positionAndDirection, word]);

            expect(service['validateNumberOfCaps']).toHaveBeenCalledWith(word);
            expect(service['validateWordIfLowerCase']).toHaveBeenCalledWith(word);
            expect(service['getAppropriateRegex']).toHaveBeenCalledWith(word.toLowerCase());
            expect(service['validatePositionAndDirection']).toHaveBeenCalledWith(
                positionAndDirection,
                service['getAppropriateRegex'](word.toLowerCase()),
            );
            expect(service['separatePlaceCommand']).toHaveBeenCalledWith(positionAndDirection, word);
            expectAsync(result).toBeResolvedTo(false);
        }));

        it('should return false if the word uses too much capital letters', fakeAsync(() => {
            const positionAndDirection = 'k10h';
            const word = 'ALLo';
            const result = service['validatePlaceCommand']([positionAndDirection, word]);

            expect(service['validateNumberOfCaps']).toHaveBeenCalledWith(word);
            expect(service['validateWordIfLowerCase']).not.toHaveBeenCalled();
            expect(service['getAppropriateRegex']).not.toHaveBeenCalled();
            expect(service['validatePositionAndDirection']).not.toHaveBeenCalled();
            expect(service['separatePlaceCommand']).not.toHaveBeenCalled();
            expectAsync(result).toBeResolvedTo(false);
        }));

        it('should return false if the word is not valid in lowercase', fakeAsync(() => {
            const positionAndDirection = 'k10h';
            const word = 'All$';
            const result = service['validatePlaceCommand']([positionAndDirection, word]);

            expect(service['validateNumberOfCaps']).toHaveBeenCalledWith(word);
            expect(service['validateWordIfLowerCase']).toHaveBeenCalledWith(word);
            expect(service['getAppropriateRegex']).not.toHaveBeenCalled();
            expect(service['validatePositionAndDirection']).not.toHaveBeenCalled();
            expect(service['separatePlaceCommand']).not.toHaveBeenCalled();
            expectAsync(result).toBeResolvedTo(false);
        }));

        it('should return false if the position and/or direction is invalid', fakeAsync(() => {
            const positionAndDirection = 'a25t';
            const word = 'allo';
            const result = service['validatePlaceCommand']([positionAndDirection, word]);

            expect(service['validateNumberOfCaps']).toHaveBeenCalledWith(word);
            expect(service['validateWordIfLowerCase']).toHaveBeenCalledWith(word);
            expect(service['getAppropriateRegex']).toHaveBeenCalledWith(word.toLowerCase());
            expect(service['validatePositionAndDirection']).toHaveBeenCalledWith(
                positionAndDirection,
                service['getAppropriateRegex'](word.toLowerCase()),
            );
            expect(service['separatePlaceCommand']).not.toHaveBeenCalled();
            expectAsync(result).toBeResolvedTo(false);
        }));
    });

    describe('validateExchangeCommand', () => {
        it('should validate the word if given valid letters: abc*', () => {
            const letters = 'abc*';
            const result = service['validateExchangeCommand'](letters);
            expect(result).toBe(true);
        });

        it('should validate the word if given valid letters: oxrfw', () => {
            const letters = 'oxrfw';
            const result = service['validateExchangeCommand'](letters);
            expect(result).toBe(true);
        });

        it('should not validate the word if given invalid letters: abce_+)(', () => {
            const letters = 'abce_+)(';
            const result = service['validateExchangeCommand'](letters);
            expect(result).toBe(false);
        });

        it('should not validate the word if given no letters', () => {
            const letters = '';
            const result = service['validateExchangeCommand'](letters);
            expect(result).toBe(false);
        });

        it('should not validate the word if given to many letters', () => {
            const letters = 'abcdefghijklmnopqrstuvwxyz';
            const result = service['validateExchangeCommand'](letters);
            expect(result).toBe(false);
        });
    });

    describe('parseCommand', () => {
        it('should parse the command correctly for a PlaceCommand', () => {
            const input = '  !placer m3h allo  ';
            spyOn<any>(service, 'parsePlaceCommand').and.callThrough();
            const result = service.parseCommand(input) as PlaceCommand;
            expect(service.inputCommand).toEqual('!placer m3h allo');
            expect(service['parsePlaceCommand']).toHaveBeenCalledWith(['placer', 'm3h', 'allo']);
            expect(result).toEqual({
                fullCommand: '!placer m3h allo',
                name: 'placer',
                column: 3,
                row: 'm',
                direction: 'h',
                word: 'allo',
                wordsInDictionary: true,
            });
        });

        it('should parse the command correctly for an ExchangeCommand', () => {
            const input = '  !échanger abc*  ';
            spyOn<any>(service, 'parseExchangeCommand').and.callThrough();
            const result = service.parseCommand(input) as ExchangeCommand;
            expect(service.inputCommand).toEqual('!échanger abc*');
            expect(service['parseExchangeCommand']).toHaveBeenCalledWith(['échanger', 'abc*']);
            expect(result).toEqual({ fullCommand: '!échanger abc*', name: 'échanger', letters: 'abc*' });
        });

        it('should parse the command correctly for a SkipCommand', () => {
            const input = '  !passer  ';
            spyOn<any>(service, 'parseSkipCommand').and.callThrough();
            const result = service.parseCommand(input);
            expect(service.inputCommand).toEqual('!passer');
            expect(service['parseSkipCommand']).toHaveBeenCalledWith('passer');
            expect(result).toEqual({ fullCommand: '!passer', name: 'passer' });
        });

        it('should parse the command correctly for a ClueCommand', () => {
            const input = '  !indice  ';
            spyOn<any>(service, 'parseClueCommand').and.callThrough();
            const result = service.parseCommand(input) as ClueCommand;
            expect(service.inputCommand).toEqual('!indice');
            expect(service['parseClueCommand']).toHaveBeenCalledWith('indice');
            expect(result).toEqual({ fullCommand: '!indice', name: 'indice', playableWords: [] });
        });

        it('should parse the command correctly for a ReserveCommand', () => {
            const input = '  !réserve  ';
            spyOn<any>(service, 'parseReserveCommand').and.callThrough();
            const result = service.parseCommand(input);
            expect(service.inputCommand).toEqual('!réserve');
            expect(service['parseReserveCommand']).toHaveBeenCalledWith('réserve');
            expect(result).toEqual({ fullCommand: '!réserve', name: 'réserve' });
        });

        it('should parse the command correctly for a HelpCommand', () => {
            const input = '    !aide   ';
            spyOn<any>(service, 'parseHelpCommand').and.callThrough();
            const result = service.parseCommand(input);
            expect(service.inputCommand).toEqual('!aide');
            expect(service['parseHelpCommand']).toHaveBeenCalledWith('aide');
            expect(result).toEqual({ fullCommand: '!aide', name: 'aide' });
        });

        it('should return undefined if the command name is not valid', () => {
            const input = '  !invalid';
            const result = service.parseCommand(input);
            expect(result).toBeUndefined();
        });
    });
});
