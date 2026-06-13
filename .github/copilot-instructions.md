## Purpose

This short guide contains repository-specific instructions to help AI coding agents (and contributors) be immediately productive. Focus is on architecture, key files, conventions, and developer workflows discoverable in the codebase.

## Big Picture

- **App type:** Single-page React app bootstrapped with Create React App. Top-level entry is `src/index.js` with `BrowserRouter`.
- **Routing & pages:** `src/App.js` uses `react-router-dom` Routes to mount these pages: `/` -> `src/components/main/main.jsx`, `/login` -> `src/components/login/login.jsx`, `/register` -> `src/components/register/register.jsx`, `/game` -> `src/components/game/Game.jsx`.
- **Auth model:** No backend — authentication and user storage are implemented locally in `src/context/AuthContext.js` using `localStorage`. Any change to auth must preserve or intentionally migrate this behavior.

## Key Files and Patterns

- **Top-level bootstrap:** `src/index.js` and `src/App.js` — check router wrapping order and `AuthProvider` placement.
- **Auth:** `src/context/AuthContext.js` exports `AuthProvider` and `useAuth()`; it stores `users` and `currentUser` in `localStorage` and returns `{ currentUser, register, login, logout }`.
- **Pages barrel:** `src/pages/index.js` re-exports component defaults for named imports used in `App.js`.
- **Components:** Each visible page/component lives in `src/components/<name>/` with a `.jsx` and a `.css` file (e.g., `navbar/navbar.jsx` + `navbar.css`). Follow this pairing when adding new components.
- **Styling:** Plain CSS files (not CSS modules); global import of Bootstrap in `src/index.js`.

## Conventions and Expectations

- **File naming:** Components use `.jsx` and are default-exported. The `pages` barrel file relies on those default exports.
- **State & persistence:** `AuthContext` is the single source of auth state; components call `useAuth()` to access `currentUser`, `login`, `register`, and `logout`.
- **No external API:** There are no network calls in the current codebase — persist changes locally unless explicitly adding remote integration.
- **Routing v7:** The project uses `react-router-dom` v7-style `Routes` and `Route path="..." element={<Component/>}`.

## Developer Workflows (commands)

- **Start dev server:** `npm start` — launches CRA dev server on `http://localhost:3000`.
- **Build production:** `npm run build` — outputs to `build/`.
- **Tests:** `npm test` — uses CRA test runner (no tests included by default in this repo).

## Where to Make Typical Changes

- **Add a page:** Create `src/components/<pagename>/<pagename>.jsx` and `<pagename>.css`, then export it from `src/pages/index.js` and add a `<Route/>` in `src/App.js`.
- **Change auth behavior:** Update `src/context/AuthContext.js`. Note: current register/login logic performs local validation and writes to `localStorage`.
- **Update navbar links/state:** Edit `src/components/navbar/navbar.jsx` and use `useAuth()` to read `currentUser`.

## Examples (quick refs)

- AuthContext usage: `const { currentUser, login } = useAuth();` — see `src/context/AuthContext.js`.
- Page export pattern: `export { default as Login } from '../components/login/login';` — see `src/pages/index.js`.

## Safety and merging guidance for AI edits

- Preserve `localStorage` keys `users` and `currentUser` unless migrating data; explain migration steps in PR description.
- Keep routing imports consistent with the `pages` barrel file. If renaming a component, update `src/pages/index.js` and `src/App.js` together.

## Questions to ask the human before larger changes

- Should auth be converted to a remote API or kept local? If remote, provide API spec and migration plan.
- Are we introducing TypeScript or CSS modules (breaking changes)? If yes, propose a migration PR with small scope.

If anything here is unclear or you want more detail in any section, tell me which area to expand (auth, routing, tests, or component patterns) and I will update this file.
