import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Homepage from './pages/Homepage.tsx';
import About from './pages/About.tsx';
import Buttons from './pages/Buttons.tsx';

const routes = [
    {
      path: '/',
      element: <App />,
      children: [
        { path: '/', element: <Homepage /> },
        { path: '/buttons', element: <Buttons /> },
      ],
    }
  ];

const router = createBrowserRouter(routes);

export { routes }; // Export the routes array
export default router;