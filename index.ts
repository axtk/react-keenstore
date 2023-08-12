import {useEffect, useMemo, useState} from 'react';
import type {Store} from 'keenstore';

export * from 'keenstore';

export type SetStoreState<T> = Store<T>['setState'];

export function useStore<T>(store: Store<T>, subscribes = true): [T, SetStoreState<T>] {
    let [, setRevision] = useState(-1);

    let state = store.getState();
    let setState = useMemo(() => store.setState.bind(store), [store]);

    useEffect(() => {
        if (!subscribes)
            return;

        return store.onUpdate(() => {
            setRevision(Math.random());
        });
    }, [store, subscribes]);

    return [state, setState];
}
