import {useEffect, useMemo, useState} from 'react';
import type {Store} from 'keenstore';

export * from 'keenstore';

export type SetStoreState<T> = Store<T>['setState'];
export type IsResponsive<T> = (nextState: T, prevState: T) => boolean;

export function useStore<T>(
    store: Store<T>,
    responsive: boolean | IsResponsive<T> = true,
): [T, SetStoreState<T>] {
    let [, setRevision] = useState(-1);

    let state = store.getState();
    let setState = useMemo(() => store.setState.bind(store), [store]);

    useEffect(() => {
        if (!responsive)
            return;

        return store.onUpdate((nextState, prevState) => {
            if (typeof responsive !== 'function' || responsive(nextState, prevState))
                setRevision(Math.random());
        });
    }, [store, responsive]);

    return [state, setState];
}
