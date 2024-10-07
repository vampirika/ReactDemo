import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Homepage from './pages/Homepage.tsx';
import ImagesPage from './pages/ImagesPage.tsx';
import CrudPage from './pages/CrudPage.tsx';
import Gossip from './pages/Gossip.tsx';
import GamesPage from './pages/GamesPage.tsx';
import ToDoPage from './pages/toDoPage.tsx';
import CardsAndScrollsPage from './pages/CardsAndScrollsPage.tsx';
import ButtonsPage from './pages/ButtonsPage.tsx';

const routes = [
    {
      path: '/',
      element: <App />,
      errorElement: <div>Wrong way!</div>,
      children: [
        { path: '/', element: <Homepage /> },
        { path: '/buttons', element: <ButtonsPage /> },
        { path: '/images', element: <ImagesPage /> },
        { path: '/crud', element: <CrudPage /> },
        { path: '/gossip', element: <Gossip /> },
        { path: '/games', element: <GamesPage /> },
        { path: '/todo', element: <ToDoPage /> },
        { path: '/cardsandscrolls', element: <CardsAndScrollsPage /> },
      ],
    }
  ];

const router = createBrowserRouter(routes);

export { routes };
export default router;