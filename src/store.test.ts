import {createStore} from "./store.ts";

type State = number;
type Action = { type: "inc" } | { type: "dec" };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "inc": return state + 1;
        case "dec": return state - 1;
    }
}

describe("createStore", () => {
    it("returns the initial state", () => {
        const store = createStore(reducer, 0);
        expect(store.getState()).toBe(0);
    });

    it("updates state via dispatch and notifies subscribers", () => {
        const store = createStore(reducer, 0);
        const listener = jest.fn();
        store.subscribe(listener);

        store.dispatch({type: "inc"});

        expect(store.getState()).toBe(1);
        expect(listener).toHaveBeenCalledWith(1);
    });

    it("stops notifying a listener after it unsubscribes", () => {
        const store = createStore(reducer, 0);
        const listener = jest.fn();
        const unsubscribe = store.subscribe(listener);
        unsubscribe();

        store.dispatch({type: "inc"});

        expect(listener).not.toHaveBeenCalled();
    });

    it("supports multiple independent subscribers", () => {
        const store = createStore(reducer, 0);
        const a = jest.fn();
        const b = jest.fn();
        store.subscribe(a);
        const unsubscribeB = store.subscribe(b);
        unsubscribeB();

        store.dispatch({type: "inc"});

        expect(a).toHaveBeenCalledTimes(1);
        expect(b).not.toHaveBeenCalled();
    });
});
