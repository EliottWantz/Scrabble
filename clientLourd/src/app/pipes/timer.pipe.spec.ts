import { TimerPipe } from './timer.pipe';

describe('TimerPipe', () => {
    let pipe: TimerPipe;
    const zeroNineSecond = 65400;
    const fiveMinuteFithySecond = 350000;
    beforeEach(() => {
        pipe = new TimerPipe();
    });
    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });
    it('should format second', () => {
        expect(pipe.transform(zeroNineSecond)).toBe('1:05');
    });
    it('should return 5:50 minutes', () => {
        expect(pipe.transform(fiveMinuteFithySecond)).toBe('5:50');
    });
});
