import {debounce} from "./debounce.ts";

describe("debounce", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("delays function execution by the specified delay", () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 500);

        debouncedFn();
        expect(fn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(499);
        expect(fn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("resets the timer on each call", () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 500);

        debouncedFn();
        jest.advanceTimersByTime(300);
        debouncedFn();
        jest.advanceTimersByTime(300);
        expect(fn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(200);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("only calls the function once for rapid consecutive calls", () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 500);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        jest.advanceTimersByTime(500);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("passes the arguments from the last call to the function", () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 500);

        debouncedFn("first");
        debouncedFn("second");
        debouncedFn("third");

        jest.advanceTimersByTime(500);
        expect(fn).toHaveBeenCalledWith("third");
    });

    it("works with multiple arguments", () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 500);

        debouncedFn("arg1", 42, {key: "value"});

        jest.advanceTimersByTime(500);
        expect(fn).toHaveBeenCalledWith("arg1", 42, {key: "value"});
    });
});
