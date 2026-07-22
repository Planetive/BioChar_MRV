# ARCHIVED — Express API backend

This API server is **not required** while the frontend runs in mock-data mode.

## Current mode
- Product UI (`mrv-platform`) uses an in-browser mock database
- Login/signup still uses Supabase Auth
- You do **not** need to run this package for demos

## Re-enable later
1. Set `VITE_USE_MOCK_API=false` in `artifacts/mrv-platform/.env`
2. Configure `DATABASE_URL` in `artifacts/api-server/.env`
3. Run:
   - `pnpm --filter @workspace/db run push`
   - `pnpm --filter @workspace/api-server run dev`
4. Re-add the Vite `/api` proxy in `mrv-platform/vite.config.ts` if needed
