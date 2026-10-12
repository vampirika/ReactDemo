# Copilot Instructions for this repository

## Project shape

This is a React demo/portfolio app built with Create React App. The app is route-driven and is intentionally organized as a set of smaller experiences rather than a large feature-based application.

- App entry: `src/index.js`
- Router: `src/router.jsx` (includes `/`, `/buttons`, `/images`, `/crud`, `/games`, `/todo`, `/cardsandscrolls`)
- Shared app shell: `src/App.js`, `src/layout/Header.tsx`, `src/layout/Footer.tsx`
- Page-level screens: `src/pages/*`
- Reusable UI and game components: `src/components/*`
- Game rules/state layer: `src/game/*` (for example `hexStrategy.ts` and its tests)
- Static assets: `public/`
- Firebase client setup: `src/firebase.js`
- Azure deployment config: `.github/workflows/azure-static-web-apps-*.yml`

The app pattern is: page-level experience -> route -> component. If you add or rename a page, update the router and usually the header navigation so the route remains discoverable.

## Build, test, and validation commands

Use the scripts defined in `package.json`:

- Install dependencies: `npm install`
- Start the app locally: `npm start`
- Production build: `npm run build`
- Run the full test suite: `npm test -- --watch=false`
- Run a single test file: `CI=true npm test -- --watch=false --runTestsByPath src/game/hexStrategy.test.ts`
- Run a single matching test name: `CI=true npm test -- --watch=false --runInBand --testNamePattern="creates a valid blue peasant move"`
- Run a local browser check to inspect the page visually: `npm start` and open `http://localhost:3000`

There is no dedicated `npm run lint` script in this repo. The project relies on CRA's default React ESLint setup via `react-scripts` and `eslintConfig` in `package.json`.

The build script also copies `web.config` into `build/` via the `postbuild` script. Keep that behavior intact for the Azure Static Web Apps deployment flow.

## High-level architecture

This repository is organized around a lightweight SPA shell, but it also includes a growing strategy-game prototype that has been separated from the UI layer:

- `src/index.js` mounts the app and provides the router.
- `src/router.jsx` defines the route tree and lazy-loads the games page.
- `src/App.js` provides the shared layout and renders the content area.
- `src/pages/` contains the UI for each route. The games page is hosted here and loads the interactive prototype.
- `src/components/HexPrototypeGame.tsx` is the rendering and interaction layer for the hex-board prototype.
- `src/game/hexStrategy.ts` holds the game rules, board geometry, turn flow, unit movement rules, territory counting, and win/tie logic. This is the layer to update first when changing gameplay rules.
- `src/game/hexStrategy.test.ts` verifies the rules without relying on the browser UI.
- Most styling is co-located with the page/component it affects (for example `src/pages/gamesPage.css` and nearby component CSS files).

This is a demo app, not a backend-heavy project. Prefer small, local changes; keep game logic separate from rendering where possible; and avoid introducing global app state unless a feature truly requires it.

## Project guardrails from the repo-specific instructions

- Keep work inside `G:\Coding\ReactApp\react-demo` and its subfolders; do not read or modify anything outside the repository.
- Do not change secrets, environment variables, or `.env` files unless the user explicitly asks for a template or a safe local placeholder.
- Do not modify deployment, hosting, or CI configuration unless specifically required and approved.
- The current focus is to keep the codebase clean and to host playable game prototypes on the website.

## Conventions specific to this codebase

- The repo is a mixed JS/TSX codebase: some files are `.js`/`.jsx` while others are `.ts`/`.tsx`. Do not assume it is fully TypeScript-only.
- Route pages should usually be declared in `src/router.jsx` and surfaced in the header navigation via `src/layout/Header.tsx`.
- CSS is colocated with the component/page it styles instead of a single app-wide stylesheet; follow that pattern for new UI work.
- Keep feature demos self-contained. Most pages are independent experiments, so avoid a large shared state store unless the change genuinely requires it.
- Game logic belongs in `src/game/*` and should be testable independently from React rendering. Keep rules and UI concerns separate.
- The app is deployed through Azure Static Web Apps; do not change deployment or secret configuration without checking the workflow and repo policy.

## Relevant repo notes

- Existing tests mount the router from `src/router.jsx` (`src/App.test.js`), so route renames and additions should keep those tests in sync.
- The Games page is lazy-loaded, so a new route often needs both route registration and deep UI content.
- Because this is a website/demo codebase, validation is usually most effective with targeted route checks and focused rule tests rather than large architectural refactors.

## AI assistant config already present

- `CLAUDE.md` exists and should be treated as an additional repo-specific prompt for AI guidance.
- Prefer small, repo-aware improvements instead of replacing the existing project-specific guidance wholesale.
