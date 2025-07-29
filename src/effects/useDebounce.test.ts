// useDebounce.test.ts
import {renderHook, act} from '@testing-library/react';
import {useDebounce} from './useDebounce';

describe('useDebounce', () => {
    // Mock timers for controlling setTimeout
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('should return initial value immediately', () => {
        const {result} = renderHook(() => useDebounce('initial', 500));

        expect(result.current).toBe('initial');
    });

    it('should update value after specified delay', () => {
        const {result, rerender} = renderHook(
            ({value, delay}) => useDebounce(value, delay),
            {initialProps: {value: 'initial', delay: 500}}
        );

        // Change the value
        rerender({value: 'updated', delay: 500});

        // Value should still be initial
        expect(result.current).toBe('initial');

        // Fast forward time by 499ms
        act(() => {
            jest.advanceTimersByTime(499);
        });
        expect(result.current).toBe('initial');

        // Fast forward the remaining 1ms
        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(result.current).toBe('updated');
    });

    it('should handle multiple rapid updates', () => {
        const {result, rerender} = renderHook(
            ({value, delay}) => useDebounce(value, delay),
            {initialProps: {value: 'initial', delay: 500}}
        );

        // Multiple rapid updates
        rerender({value: 'update1', delay: 500});
        rerender({value: 'update2', delay: 500});
        rerender({value: 'update3', delay: 500});

        expect(result.current).toBe('initial');

        // Fast forward time
        act(() => {
            jest.advanceTimersByTime(500);
        });

        // Should only have the last update
        expect(result.current).toBe('update3');
    });

    it('should handle delay changes', () => {
        const {result, rerender} = renderHook(
            ({value, delay}) => useDebounce(value, delay),
            {initialProps: {value: 'initial', delay: 500}}
        );

        // Change value and delay
        rerender({value: 'updated', delay: 1000});

        // Advance timer by original delay
        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(result.current).toBe('initial');

        // Advance to new delay
        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(result.current).toBe('updated');
    });

    it('should cleanup timeout on unmount', () => {
        const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
        const {unmount} = renderHook(
            ({value, delay}) => useDebounce(value, delay),
            {initialProps: {value: 'initial', delay: 500}}
        );

        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should work with different value types', () => {
        // Test with number
        const {result: numberResult, rerender: numberRerender, unmount: numberUnmount} = renderHook(
            ({value, delay}) => useDebounce(value, delay),
            {initialProps: {value: 0, delay: 500}}
        );

        numberRerender({value: 42, delay: 500});
        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(numberResult.current).toBe(42);
        numberUnmount();

        // Test with object
        const {result: objectResult, rerender: objectRerender, unmount: objectUnmount} = renderHook(
            ({value, delay}) => useDebounce(value, delay),
            {initialProps: {value: {test: 'initial'}, delay: 500}}
        );

        objectRerender({value: {test: 'updated'}, delay: 500});
        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(objectResult.current).toEqual({test: 'updated'});
        objectUnmount();
    });
});