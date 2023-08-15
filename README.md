# react-keenstore

*SSR-compatible React store for straightforward shared state management*

Dealing with shared state similarly to React's `useState()`.

## Installation

```
npm i react-keenstore
```

## Example

This example makes use of React Context (in a pretty typical way) to share a chunk of data across components. Wrapping the data into an instance of the `Store` class allows to make its updates occurring in one component (`<PlusButton/>`) immediately visible to other components subscribed to the store (`<Display/>`). With a store in the Context, there's no need to devise additional [value setters](https://react.dev/reference/react/useContext#updating-an-object-via-context) of the Context value.

In this example, there's only one store, but there can be as many stores as needed. Splitting the app data into multiple stores will make the scopes of the stores clearer and it can help reduce irrelevant update notifications in the components requiring only a limited portion of the data.

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

The similarity of the interfaces of the `useStore()` hook and `useState()` allows to easily switch from local state to shared state without major code rewrites:

```diff
const CounterButton = () => {
    // Local state:
    // `state` is only available in the current component
-   const [state, setState] = useState(data);

    // Shared state:
    // `state` is available inside and outside of the component
+   const [state, setState] = useStore(useContext(StoreContext));

    const handleClick = () => {
        setState(prevState => ({
            counter: prevState.counter + 1
        }));
    };

    return <button onClick={handleClick}>{state.counter}</button>;
};
```

## See also

- [*keenstore*](https://github.com/axtk/keenstore), the `Store` class without the React hook
