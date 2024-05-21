# react-keenstore

*SSR-compatible React store for straightforward shared state management*

Dealing with shared state similarly to React's `useState()`.

## Installation

```
npm i react-keenstore
```

## Usage example

This package exports the `Store` class and the `useStore()` React hook that are sufficient to set up shared state without bulky boilerplate.

In the example below, the data shared across components by means of React Context is wrapped into an instance of the `Store` class. It allows to make data updates occurring in one component (`<PlusButton/>`) immediately visible to other components subscribed to the store via the `useStore()` hook (`<Display/>`).

While a plain object as a Context value requires devising additional [value setters](https://react.dev/reference/react/useContext#updating-an-object-via-context) to update the shared data, the store exposes a method to update the data out of the box and triggers a re-render only in the components subscribed to this store.

```jsx
import {createContext, useContext} from 'react';
import {Store, useStore} from 'react-keenstore';

const AppContext = createContext(new Store({counter: 0}));

const Display = () => {
    let store = useContext(AppContext);
    let [state] = useStore(store);

    return <span>{state.counter}</span>;
};

const PlusButton = () => {
    let store = useContext(AppContext);
    // We're not using the store state value here, so the subscription
    // to its updates is not required, hence the `false` parameter.
    let [, setState] = useStore(store, false);

    let handleClick = () => {
        // Updating the store state via `setState()` triggers updates
        // in all components subscribed to this store.
        setState(prevState => ({
            counter: prevState.counter + 1,
        }));
    };

    return <button onClick={handleClick}>+</button>;
};

export const App = () => <div><PlusButton/> <Display/></div>;
```

```jsx
import {createRoot} from 'react-dom/client';
import {Store} from 'react-keenstore';
import {App} from './App';

createRoot(document.querySelector('#app')).render(
    <AppContext.Provider value={new Store({counter: 42})}>
        <App/>
    </AppContext.Provider>,
);
```

([Live demo](https://codesandbox.io/s/react-keenstore-demo-npu6rb))

## Multiple stores

An application can have as many stores as needed, whether on a single Context or multiple Contexts. Splitting the app data into multiple stores can make the scopes of the stores clearer and it can help reduce irrelevant update notifications in the components requiring only a limited portion of the data.

```js
const AppContext = createContext({
    users: new Store(/* ... */),
    services: new Store(/* ... */),
});

const UserInfo = ({userId}) => {
    let [users, setUsers] = useStore(useContext(AppContext).users);

    // ...
};
```

## Painless transition from local state to shared state

The similarity of the interfaces of `useStore()` and `useState()` allows to easily switch from local state to shared state without major code rewrites when it becomes necessary to make the state available to multiple components:

```diff
+ const AppContext = createContext(new Store({counter: 0}));

const CounterButton = () => {
    // Local state:
    // `state` is only available in the current component
-   const [state, setState] = useState({counter: 0});

    // Shared state:
    // `state` is available inside and outside of the component
+   const [state, setState] = useStore(useContext(AppContext));

    const handleClick = () => {
        setState(prevState => ({
            counter: prevState.counter + 1
        }));
    };

    return <button onClick={handleClick}>{state.counter}</button>;
};
```

As seen from this example, we only have to switch the source of the state to a Context, with the rest of the code (reading and updating the state) remaining the same.

## Direct subscription to store updates

For some purposes (like logging or debugging the data flow), it might be helpful to directly subscribe to state updates via the store's `onUpdate()` method:

```js
const App = () => {
    let store = useContext(AppContext);

    useEffect(() => {
        // `onUpdate()` returns an unsubscription function which
        // works as a cleanup function in the effect.
        return store.onUpdate((nextState, prevState) => {
            console.log({nextState, prevState});
        });
    }, [store]);

    // ...
};
```

## Persistent local state

Maintaining local state of a component with the React's `useState()` hook is commonplace and works fine for many cases, but it has its downsides in the popular scenarios:

- the updated state from `useState()` is lost whenever the component unmounts, and
- setting the state in an asynchronous callback after the component gets unmounted causes an error that requires extra handling.

Both of these issues can be addressed by using a store created outside of the component instead of `useState()`. Such a store doesn't have to be shared with other components (although it's also possible) and it will act as:

- local state persistent across remounts, and
- unmount-safe storage for asynchronously fetched data.

```diff
+ const itemStore = new Store();

const List = () => {
-   const [items, setItems] = useState();
+   const [items, setItems] = useStore(itemStore);

    useEffect(() => {
        if (items !== undefined)
            return;

        fetch('/items')
            .then(res => res.json())
            .then(items => setItems(items));
    }, [items]);

    // Rendering
};
```

In the example above, if the request completes after the component has unmounted the fetched data will be safely put into `itemStore` and this data will be reused when the component remounts without fetching it again.

### Connecting a store to external storage

`itemStore` from the example above can be further upgraded to make the component state persistent across page reloads without affecting the component's internals.

```js
let initialState;

try {
    initialState = JSON.parse(localStorage.getItem('list'));
}
catch {}

export const itemStore = new Store(initialState);

itemStore.onUpdate(nextState => {
    localStorage.setItem('list', JSON.stringify(nextState));
});
```

```js
import {itemStore} from './itemStore';

export const List = () => {
    let [items, setItems] = useStore(itemStore);

    // ...
};
```

## Adding *immer*

*immer* is not part of this package, but it can be used with `useStore()` just the same way as [with `useState()`](https://immerjs.github.io/immer/example-setstate#usestate--immer) to facilitate deeply nested data changes. (See [live demo](https://codesandbox.io/s/react-keenstore-demo-with-immer-q9jykm?file=/src/PlusButton.jsx).)

## See also

- [*keenstore*](https://github.com/axtk/keenstore), the `Store` class without the React hook
