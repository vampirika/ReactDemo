import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Homepage from './pages/Homepage';
import ImagesPage from './pages/ImagesPage';
import CrudPage from './pages/CrudPage';
import ToDoPage from './pages/toDoPage';
import CardsAndScrollsPage from './pages/CardsAndScrollsPage';
import ButtonsPage from './pages/ButtonsPage';

const GamesPage = React.lazy(() => import('./pages/GamesPage.tsx'));

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
        { path: '/games', element: (
          <Suspense fallback={<div>Loading game prototype...</div>}>
            <GamesPage />
          </Suspense>
        ) },
        { path: '/todo', element: <ToDoPage /> },
        { path: '/cardsandscrolls', element: <CardsAndScrollsPage /> },
      ],
    }
  ];

const router = createBrowserRouter(routes);

export { routes };
export default router;