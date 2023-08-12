# react-keenstore

*SSR-compatible React store for straightforward shared state management*

Dealing with shared state similarly to React's `useState()`.

## Example

This example makes use of React Context (in a pretty typical way) to share a chunk of data across components. Wrapping the data into an instance of the `Store` class allows to make its updates occurring in one component (`<PlusButton/>`) immediately visible to other components subscribed to the store (`<Display/>`). With a store in the Context, there's no need to devise additional [value setters](https://react.dev/reference/react/useContext#updating-an-object-via-context) of the Context value.

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
            counter: prevState.counter++
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
