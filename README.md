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

## PIN security

Apply schema changes after pulling updates:

```bash
bun run db:push
```

Set a dedicated `PIN_PEPPER` environment variable in every deployed
environment. It must be a long random secret and must not be committed. The
application falls back to `BETTER_AUTH_SECRET` for compatibility, but a
separate pepper is recommended. Changing the pepper invalidates existing
Argon2 PIN hashes.

PIN unlocks are bound to the current Better Auth session and expire after 30
minutes. A PIN cannot be reset from the application; an authenticated, unlocked
user can only change it by supplying the current PIN.

There is no user-facing PIN reset. An administrator can perform account
recovery from the server with:

```bash
bun run pin:reset user@example.com
```

This deletes the PIN and all Better Auth sessions for that account. The user is
logged out everywhere and must create a new PIN after signing in again.

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
