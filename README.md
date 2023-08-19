# react-keenstore

*SSR-compatible React store for straightforward shared state management*

Dealing with shared state similarly to React's `useState()`.

## Installation

```
npm i react-keenstore
```

## Usage

### Example

This example makes use of React Context (in a pretty typical way) to share a chunk of data across components. Wrapping the data into an instance of the `Store` class allows to make its updates occurring in one component (`<PlusButton/>`) immediately visible to other components subscribed to the store (`<Display/>`). With a store in the Context, there's **no need to devise additional [Context value setters](https://react.dev/reference/react/useContext#updating-an-object-via-context)**.

```jsx
import { createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { Store, useStore } from 'react-keenstore';

const AppContext = createContext(new Store({ counter: 0 }));

const Display = () => {
    const store = useContext(AppContext);
    const [state] = useStore(store);

    return <span>{state.counter}</span>;
};

const PlusButton = () => {
    const store = useContext(AppContext);
    // We're not using the store state value here, so the subscription
    // to its updates is not required, hence the `false` parameter.
    const [, setState] = useStore(store, false);

    const handleClick = () => {
        // Updating the store state via `setState()` triggers updates
        // in all components subscribed to this store.
        setState(prevState => ({
            counter: prevState.counter + 1
        }));
    };

    return <button onClick={handleClick}>+</button>;
};

const App = () => <div><PlusButton/> <Display/></div>;

createRoot(document.querySelector('#app')).render(
    <AppContext.Provider value={new Store({ counter: 42 })}>
        <App/>
    </AppContext.Provider>
);
```

([Live demo](https://codesandbox.io/s/react-keenstore-demo-npu6rb))

### Multiple stores

An application can have **as many stores as needed**, whether on a single Context or multiple Contexts. Splitting the app data into multiple stores can make the scopes of the stores clearer and it can help reduce irrelevant update notifications in the components requiring only a limited portion of the data.

```ts
const AppContext = createContext({
    users: new Store(/* ... */),
    services: new Store(/* ... */)
});

const UserInfo = ({ userId }) => {
    const [users, setUsers] = useStore(useContext(AppContext).users);

    // ...
};
```

### Shorthand hook

A Context value can contain any sort of data alongside stores. But for the common case where a Context value contains only a store, a shorthand hook can be used (with the same optional second parameter as in `useStore()`):

```diff
- const store = useContext(AppContext);
- const [state, setState] = useStore(store);

+ const [state, setState] = useStoreContext(AppContext);
```

### Painlessly switching from local state to shared state

The similarity of the interfaces of `useStore()`, `useStoreContext()` and `useState()` allows to easily switch from local state to shared state without major code rewrites when it becomes necessary to make the state available to multiple components:

```diff
+ const AppContext = createContext(new Store({ counter: 0 }));

const CounterButton = () => {
    // Local state:
    // `state` is only available in the current component
-   const [state, setState] = useState({ counter: 0 });

    // Shared state:
    // `state` is available inside and outside of the component
+   const [state, setState] = useStoreContext(AppContext);

    const handleClick = () => {
        setState(prevState => ({
            counter: prevState.counter + 1
        }));
    };

    return <button onClick={handleClick}>{state.counter}</button>;
};
```

As seen from this example, we only have to switch the source of the state to a Context, with the rest of the code (reading and updating the state) remaining the same.

### Direct subscription to store updates

For some purposes (like logging or debugging the data flow), it might be helpful to directly subscribe to state updates via the store's `onUpdate()` method:

```ts
const App = () => {
    const store = useContext(AppContext);

    useEffect(() => {
        // `onUpdate()` returns an unsubscription function which
        // works as a cleanup function in the effect.
        return store.onUpdate((nextState, prevState) => {
            console.log({ nextState, prevState });
        });
    }, [store]);

    // ...
};
```

### Adding *immer*

*immer* is not part of this package, but it can be used with `useStore()` and `useStoreContext()` just the same way as [with `useState()`](https://immerjs.github.io/immer/example-setstate#usestate--immer). (See [live demo](https://codesandbox.io/s/react-keenstore-demo-with-immer-q9jykm?file=/src/PlusButton.jsx).)

## See also

- [*keenstore*](https://github.com/axtk/keenstore), the `Store` class without the React hook
