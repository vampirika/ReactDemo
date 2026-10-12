# Copilot Instructions for this repository

## Project shape

This is a React portfolio/demo site built with Create React App. It is not a large app framework or a backend project; it is a route-based single-page experience with demo pages and interactive mini-games.

- App entry: `src/index.js`
- Router and route definitions: `src/router.jsx`
- App shell/layout: `src/App.js`, `src/layout/Header.tsx`, `src/layout/Footer.tsx`
- Page components: `src/pages/*`
- Reusable UI/game logic: `src/components/*`
- Static assets: `public/`
- Firebase client setup: `src/firebase.js`
- Azure deployment pipeline: `.github/workflows/azure-static-web-apps-*.yml`

The app pattern is: page-level feature demos are mounted by route; each page often imports its own CSS file, and navigation is managed from the `Header` component. If you add a new page, update both the router and the header navigation so the route is discoverable.

## Build, test, and validation commands

Use the scripts defined in `package.json`:

- Install dependencies: `npm install`
- Run dev server: `npm start`
- Production build: `npm run build`
- Run the test suite: `npm test -- --watch=false`
- Run a single test file: `CI=true npm test -- --watch=false --runTestsByPath src/App.test.js`
- Run a single matching test name: `CI=true npm test -- --watch=false --runInBand --testNamePattern="renders header"`

There is no dedicated `npm run lint` script in this repo. The project relies on CRA's default React ESLint setup from `react-scripts` and the `eslintConfig` in `package.json`.

The build script also runs a post-build step: `cp web.config build/`, which is important because the site is deployed through Azure Static Web Apps and the `web.config` file is copied into the production output.

## High-level architecture

This repository is organized around a lightweight SPA shell:

- `src/index.js` mounts the app with `RouterProvider` from `react-router-dom`.
- `src/router.jsx` defines the route tree (`/`, `/buttons`, `/images`, `/crud`, `/todo`, `/cardsandscrolls`).
- `src/App.js` renders the shared `Header`, an `Outlet` for the current page, and the `Footer`.
- `src/pages/` contains page-level demos such as games, CRUD examples, image experiments, and a todo list.
- `src/components/` contains reusable, self-contained UI components and game engines used by those pages.
- Most styling is imported directly into the component or page file, using CSS in the same folder (for example `homepage.css`, `gamesPage.css`, `header.css`).

This is intentionally a demo/portfolio app rather than a feature-based app architecture. Keep changes small and local to the relevant page/component unless a bug clearly spans the layout or router.

## Conventions specific to this codebase

- The app uses a mixed JS/TSX setup: some files are `.js`/`.jsx` while several components/pages are `.tsx`. Do not assume the repository is fully TypeScript-only; the project is still CRA-based and JavaScript-first.
- New route pages should be added in `src/router.jsx` and generally also surfaced in the header via `src/layout/Header.tsx`.
- CSS is colocated with the component/page it styles instead of using a central CSS architecture. Follow that pattern for new UI work.
- Keep feature demos self-contained. Many pages are stand-alone experiments; avoid introducing a global state/store pattern unless the change genuinely requires cross-page state.
- The app has a public-facing Azure deployment flow; do not change deployment-related config or secrets without checking the workflow and repo policy.

## Testing and change safety notes

- Existing tests use the router config directly (`src/App.test.js` mounts a memory router created from `routes` from `src/router.jsx`). If you update route names or paths, keep tests aligned.
- The repo is small and route-driven; prefer targeted, page-level validation when making UI changes instead of broad refactors.
- Because this project is a demo site, component behavior is often visual/interactive rather than API-driven. When adding new behavior, validate the relevant route in the browser and keep the change scoped to the affected page or component.
