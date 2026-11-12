# NGL.ayooluwa

An NGL-inspired anonymous messaging app. Create a profile, share your link, and receive messages from friends and followers without requiring them to sign up. Keep the conversation going with anonymous chats, or turn messages into images to share on social media.

## Features

- **Public profiles** at `/[username]` with anonymous messages and random question prompts.
- **Inbox dashboard** with search, date filters, pinned messages, and bulk deletion.
- **Anonymous chats** with live updates, replies to individual messages, custom conversation names, and a 48-hour session lifetime.
- **Shareable images** for profile links and individual messages.
- **Six profile themes**: Classic, Love, Ocean, Forest, Midnight, and Sunset.
- **Analytics** for daily profile views and question prompt rolls.
- **Web push notifications** for incoming messages and chat replies.
- **PWA support** with an installable manifest, service worker, and offline fallback page.

## Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Ant Design, and Framer Motion. Supabase provides authentication, PostgreSQL, and Realtime; TanStack Query manages client data. Cloudflare Workers deployment uses OpenNext and Wrangler.

## Local setup

You’ll need Node.js **20.9 or newer**, npm, and a Supabase project.

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
NEXT_PUBLIC_VAPID_PRIVATE_KEY=your-vapid-private-key
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL used by browser and server clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase API key; browser access is governed by row-level security policies. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server API access that bypasses row-level security. Keep this secret. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public key for browser push subscriptions. |
| `NEXT_PUBLIC_VAPID_PRIVATE_KEY` | Private key used to sign push requests. See the naming note below. |

Generate a VAPID key pair using the installed dependency:

```bash
./node_modules/.bin/web-push generate-vapid-keys
```

Set both VAPID values even when testing without notifications: the messaging routes initialize `web-push` when loaded. Environment files are ignored by Git.

**Private key naming:** the code currently reads `NEXT_PUBLIC_VAPID_PRIVATE_KEY`. Next.js treats this prefix as eligible for browser exposure. Rename it to a server-only name such as `VAPID_PRIVATE_KEY` in the messaging API routes and your environment before a production deployment. Never commit real credentials.

### 3. Set up the database

In the Supabase SQL Editor, run these files **once, in this order**, against a fresh database:

1. [`utils/supabase/schema.sql`](utils/supabase/schema.sql) — profiles, inbox messages, push subscriptions, row-level security policies, and the signup profile trigger.
2. [`utils/supabase/schema_analytics.sql`](utils/supabase/schema_analytics.sql) — profile themes and analytics events.
3. [`utils/supabase/schema_meta.sql`](utils/supabase/schema_meta.sql) — message metadata.
4. [`utils/supabase/migration_pinned.sql`](utils/supabase/migration_pinned.sql) — pinned messages and inbox update/delete policies.
5. [`utils/supabase/schema_chat.sql`](utils/supabase/schema_chat.sql) — chat sessions, messages, and the expiration function.

The current chat reply implementation also requires a self-referencing column that is not yet included in those SQL files. After creating the chat tables, run:

```sql
alter table public.chat_messages
  add column if not exists reply_to_id uuid
  references public.chat_messages(id) on delete set null;
```

Enable **Realtime replication for `public.chat_messages`** in Supabase so new messages appear in open conversations.

The SQL files are manual setup scripts, not a migration runner; some policies and tables will fail if created twice. `schema_deletion.sql` supplies a delete policy already covered by `migration_pinned.sql`, so it is unnecessary for this setup. **Do not run `schema_reset.sql` as part of installation: it drops existing tables and data.**

### 4. Configure authentication

Enable email/password authentication in Supabase. Set the local Site URL to `http://localhost:3002` and allow `http://localhost:3002/auth/callback` as a redirect URL. Add the equivalent URLs for your deployed domain when hosting the app.

If email confirmation is enabled, confirm your email before signing in. Profiles are created by the database signup trigger, so apply the schema before creating accounts.

### 5. Start the app

```bash
npm run dev
```

Open [localhost:3002](http://localhost:3002). The development script explicitly uses port **3002**.

To try the full flow, create an account, open your profile link in a separate browser or private window, and send a message. Check the dashboard, then start a chat at `/[username]/chat` and exchange replies between both windows. Notification testing requires browser permission and a secure context such as HTTPS or localhost.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server on port 3002. |
| `npm run build` | Build the Next.js app for production. |
| `npm start` | Serve the production build; defaults to port 3000. |
| `npm run lint` | Run ESLint. |
| `npm run preview` | Build with OpenNext and preview locally through Wrangler. |
| `npm run deploy` | Build with OpenNext and deploy to Cloudflare Workers. |
| `npm run cf-typegen` | Generate Cloudflare binding types in `cloudflare-env.d.ts`. |

There is currently no automated test script. Use linting, a production build, and the manual messaging flow above when validating changes.

## Deployment

The repository includes an OpenNext configuration and [`wrangler.jsonc`](wrangler.jsonc) for Cloudflare Workers. The configured Worker name is `ngl`; change it for your own deployment.

1. Authenticate Wrangler with `npx wrangler login`.
2. Provide the environment variables above to the build environment. `NEXT_PUBLIC_*` values are embedded during the Next.js build.
3. Configure server credentials in the deployed Worker's environment, keeping private values in secrets rather than checked-in configuration.
4. Update Supabase's Site URL and allowed auth callback URLs for the deployed domain.
5. Run `npm run preview` to check the Worker build, then `npm run deploy` to publish it.

For a Node.js host, use `npm run build` followed by `npm start`, with the same environment and Supabase configuration.

Before using your own domain and branding, update [`utils/constants.ts`](utils/constants.ts), the metadata in `app/layout.tsx` and `app/[username]/layout.tsx`, the manifest and icons in `public/`, and the VAPID contact address in the messaging API routes. Review `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt` for existing domain references.

## Project structure

```text
app/
  [username]/          Public profile and chat entry pages
  c/[token]/           Anonymous sender's conversation page
  dashboard/           Account owner's inbox and chats
  login/, signup/      Authentication screens
  auth/callback/       Supabase authentication callback
  api/                 Message, chat, and analytics endpoints
components/            Chat UI, inbox controls, share cards, and themes
hooks/                 TanStack Query hooks for inbox and chat sessions
providers/             Query client provider
utils/
  constants.ts         App branding and theme definitions
  push.ts              Service worker and push subscription helpers
  supabase/            Browser/server clients and SQL setup scripts
types/                 Shared TypeScript interfaces
public/                Icons, manifest, service worker, and offline page
```

## Privacy and current limitations

“Anonymous” means senders do not need an account; it does not mean no identifying data is collected. Inbox submissions store browser/device metadata, referrer, timezone, the forwarded IP header, and a timestamp in `messages.meta`.

Chat links contain a secret token that grants access to the conversation. Treat those URLs as credentials. The supplied chat SQL policies allow public reads and inserts on `chat_messages`, and the message POST route accepts the caller's `senderType` without authenticating an owner reply. These access controls need tightening before using chats for sensitive conversations. The public submission endpoints also have no application-level rate limiting or CAPTCHA.

Chat sessions default to 48 hours. Sending checks the expiration timestamp, but reading currently checks only the soft-delete flag. Schedule `select public.expire_old_chat_sessions();` with a database scheduler to mark expired sessions deleted; the repository does not configure that schedule. Soft-deleting a chat does not physically remove its stored messages.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Missing column or relationship errors | Apply the SQL setup files and the `reply_to_id` statement above. |
| New chat messages appear only after reloading | Enable Realtime replication for `public.chat_messages`. |
| VAPID initialization errors | Supply a valid matching public/private key pair and restart the server. |
| No push notifications | Check browser support, notification permission, HTTPS/localhost, and saved subscriptions. |
| Signup succeeds but the profile is missing | Check that the profile trigger exists and the signup includes username metadata. |
| Confirmation links redirect incorrectly | Check Supabase's Site URL and allowed callback URLs. |
| Old UI persists after changes | Unregister the service worker and clear its caches in browser developer tools. |
