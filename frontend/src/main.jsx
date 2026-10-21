import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import './app/index.css';
import reduxStore from './Shared/AppStore.js';
import AppRoutes from './app/AppRoutes.jsx';

createRoot(document.getElementById('root')).render(
  <Provider store={reduxStore}>
    <AppRoutes />
  </Provider>,
)
