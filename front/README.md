# Gestor Front (React + Vite)

- Dev server: http://localhost:5173
- API expected at: http://localhost:5000 (proxied via Vite as /api)

## Setup

1. Install Node 18+.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start dev:
   ```sh
   npm run dev
   ```

## Packages
- ag-grid-community, ag-grid-react
- ag-charts-community, ag-charts-react
- react-router-dom
- axios

## Notes
- Static images: copy from `../static/img/` to `public/img/` if needed.
- Axios is configured with baseURL `/api` and `withCredentials: true`.
- Vite proxy forwards `/api/*` to `http://localhost:5000`.
