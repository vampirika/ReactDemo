import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Homepage from './pages/Homepage.tsx';
import Buttons from './pages/ButtonsPage.tsx';
import ImagesPage from './pages/ImagesPage.tsx';
import CrudPage from './pages/CrudPage.tsx';
import Gossip from './pages/Gossip.tsx';
import GamesPage from './pages/GamesPage.tsx';

const routes = [
    {
      path: '/',
      element: <App />,
      errorElement: <div>Wrong way!</div>,
      children: [
        { path: '/', element: <Homepage /> },
        { path: '/buttons', element: <Buttons /> },
        { path: '/images', element: <ImagesPage /> },
        { path: '/crud', element: <CrudPage /> },
        { path: '/gossip', element: <Gossip /> },
        { path: '/games', element: <GamesPage /> },
      ],
    }
  ];

const router = createBrowserRouter(routes);

export { routes };
export default router;