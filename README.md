# Mathukai Organic Expo Spin Wheel

A responsive Next.js landing page for expo visitors to scan, submit details, spin a reward wheel, and forward leads to an n8n webhook.

## Features

- Mobile-first Expo spin wheel UI
- Smooth animations with Framer Motion
- Configurable reward probabilities
- WhatsApp opt-in capture
- n8n webhook integration for PostgreSQL, WhatsApp Cloud, Meta Conversion API
- Green herbal theme optimized for expo use

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with your webhook URL:

   ```env
   N8N_WEBHOOK_URL=https://YOUR_N8N_DOMAIN/webhook/expo-spin
   ```

3. Run the project:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`

## Environment Variables

- `N8N_WEBHOOK_URL` — your n8n webhook endpoint for lead capture.

## Deploy

This project is ready for Docker deployment, which is ideal for Hostinger EasyPanel VPS.

### Build and run locally with Docker

```bash
docker build -t mathukai-expo-spin .
docker run -d --name expo-spin -p 3000:3000 \
  -e N8N_WEBHOOK_URL="https://YOUR_N8N_DOMAIN/webhook/expo-spin" \
  mathukai-expo-spin
```

### GitHub deployment

You can push this project to GitHub and use GitHub Actions to build and publish a Docker image to GitHub Container Registry.

1. Create a GitHub repository and push your local project.
2. The workflow at `.github/workflows/docker-publish.yml` will run on pushes to `main`.
3. The image is published to `ghcr.io/<your-username>/<repo>/mathukai-expo-spin:latest`.
4. In Hostinger EasyPanel, pull that image from GitHub Container Registry and run it with `N8N_WEBHOOK_URL` set.

### Hostinger EasyPanel Docker deployment

1. Upload the repository or connect the Git repo.
2. Use the included `Dockerfile` to build the image.
3. Set environment variable:

   ```env
   N8N_WEBHOOK_URL=https://YOUR_N8N_DOMAIN/webhook/expo-spin
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

- `app/` — Next.js App Router pages and layout
- `components/` — reusable UI components
- `app/api/submit/route.ts` — webhook proxy endpoint
- `lib/rewards.ts` — reward probability configuration

## Notes

- The app sends lead data to n8n and relies on n8n workflows for database writes, WhatsApp messages, and Meta tracking.
- Update reward probabilities in `lib/rewards.ts`.
