export interface Store<State, Action> {
    getState(): State;
    dispatch(action: Action): void;
    subscribe(listener: (state: State) => void): () => void;
}

export function createStore<State, Action>(
    reducer: (state: State, action: Action) => State,
    initialState: State
): Store<State, Action> {
    let state = initialState;
    const listeners = new Set<(state: State) => void>();

    return {
        getState: () => state,
        dispatch(action: Action) {
            state = reducer(state, action);
            listeners.forEach(listener => listener(state));
        },
        subscribe(listener: (state: State) => void) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
