import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Homepage from './pages/Homepage.tsx';
import Buttons from './pages/Buttons.tsx';
import ImagesPage from './pages/ImagesPage.tsx';

const routes = [
    {
      path: '/',
      element: <App />,
      children: [
        { path: '/', element: <Homepage /> },
        { path: '/buttons', element: <Buttons /> },
        { path: '/images', element: <ImagesPage /> },
      ],
    }
  ];

const router = createBrowserRouter(routes);

export { routes };
export default router;