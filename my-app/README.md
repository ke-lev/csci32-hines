This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Spotify now playing

The homepage can show the track currently playing on the site owner's Spotify account.

1. Create a Spotify developer app with the Web API enabled.
2. Register `http://127.0.0.1:3000/api/spotify/callback` and `https://csci32-hines.vercel.app/api/spotify/callback` as redirect URIs.
3. Copy `.env.example` to `.env.local`, then add a newly rotated client ID and client secret. Do not commit this file.
4. Start the app and visit [http://127.0.0.1:3000/api/spotify/login](http://127.0.0.1:3000/api/spotify/login).
5. After approving the `user-read-currently-playing` and `user-read-recently-played` permissions, copy the displayed refresh token into `SPOTIFY_REFRESH_TOKEN`.
6. Restart the local server. Add the same four variables to the Vercel project, using `https://csci32-hines.vercel.app/api/spotify/callback` for the production `SPOTIFY_REDIRECT_URI`, then redeploy.

Spotify refresh tokens expire after six months, so repeat the authorization step when the card reports that Spotify is offline.

When music is actively playing, the card shows the current track. Otherwise it falls back to the most recently played track. Existing installations must authorize again after adding the recently-played permission.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
