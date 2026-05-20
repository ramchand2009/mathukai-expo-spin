# Banu Herbals Spin Wheel

A responsive Next.js landing page for Banu Herbals visitors to scan, submit details, spin a reward wheel, and forward leads to an n8n webhook.

## Features

- Mobile-first spin wheel UI
- Dashboard for dynamic spin wheel offers
- Shared Postgres-backed offer configuration
- Shared Postgres-backed customer and reward entries
- Duplicate phone number prevention
- Optional reward inventory limits
- Password protection for the dashboard
- Smooth animations with Framer Motion
- Configurable reward probabilities
- WhatsApp opt-in capture
- n8n webhook integration for lead capture
- Green herbal theme optimized for visitor engagement

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with your webhook and database URLs:

   ```env
   N8N_WEBHOOK_URL=https://YOUR_N8N_DOMAIN/webhook/expo-spin
   DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE
   DATABASE_SSL=false
   DASHBOARD_USERNAME=admin
   DASHBOARD_PASSWORD=change-this-password
   ```

3. Run the project:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`

## Environment Variables

- `N8N_WEBHOOK_URL` - your n8n webhook endpoint for lead capture.
- `DATABASE_URL` - Postgres connection string used by `/dashboard` to save dynamic spin wheel offers globally.
- `DATABASE_SSL` - set to `true` only when your Postgres connection requires SSL.
- `DASHBOARD_USERNAME` - dashboard login username. Defaults to `admin` if omitted.
- `DASHBOARD_PASSWORD` - dashboard login password. If omitted, dashboard protection is disabled.

## Deploy

This project is ready for Docker deployment, which is ideal for Hostinger EasyPanel VPS.

### Build and run locally with Docker

```bash
docker build -t mathukai-expo-spin .
docker run -d --name expo-spin -p 3000:3000 \
  -e N8N_WEBHOOK_URL="https://YOUR_N8N_DOMAIN/webhook/expo-spin" \
  -e DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE" \
  -e DATABASE_SSL="false" \
  mathukai-expo-spin
```

### GitHub deployment

Push this project to GitHub and use your hosting workflow to build and deploy the app.

### Hostinger EasyPanel Docker deployment

1. Upload the repository or connect the Git repo.
2. Use the included `Dockerfile` to build the image.
3. Set environment variables:

   ```env
   N8N_WEBHOOK_URL=https://YOUR_N8N_DOMAIN/webhook/expo-spin
   DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE
   DATABASE_SSL=false
   DASHBOARD_USERNAME=admin
   DASHBOARD_PASSWORD=change-this-password
   ```

4. Expose port `3000` and configure site routing to the app.
5. For `expo.mathukaiorganic.store`, point your subdomain DNS to the VPS IP and configure EasyPanel to route that domain to the container.

### Subdomain setup

If you are using `expo.mathukaiorganic.store`, no Next.js `basePath` is required. Deploy normally and ensure the DNS record points to your VPS or reverse proxy.

### Without Docker

If you choose not to use Docker, run:

```bash
npm install
npm run build
npm run start
```

## Project Structure

- `app/` - Next.js App Router pages and layout
- `components/` - reusable UI components
- `app/api/offers/route.ts` - Postgres-backed dynamic offer endpoint
- `app/api/entries/route.ts` - Postgres-backed customer entry list endpoint
- `app/api/submit/route.ts` - webhook proxy endpoint
- `lib/db.ts` - Postgres connection and offer persistence
- `lib/rewards.ts` - default reward configuration and validation helpers

## Notes

- The dashboard saves offers and reads customer entries from Postgres when `DATABASE_URL` is configured.
- Set `DASHBOARD_PASSWORD` in production to protect customer data and offer controls.
- Set an offer limit in `/dashboard` to stop that reward after the configured number of claims.
- A mobile number can claim only once.
- If `DATABASE_URL` is missing, the app falls back to default/browser-local offers for testing.
- The app saves lead data to Postgres first, then also forwards it to n8n for WhatsApp messages and Meta tracking.
