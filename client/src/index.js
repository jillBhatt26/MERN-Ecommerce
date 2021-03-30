import { StrictMode } from 'react';
import { render } from 'react-dom';

// css
import './index.css';

// component
import App from './App';

// context provider
import AppContextProvider from './contexts/AppContext';

render(
    <StrictMode>
        <AppContextProvider>
            <App />
        </AppContextProvider>
    </StrictMode>,
    document.getElementById('root')
);
