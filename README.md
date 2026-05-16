# minecraft-bot-api

A production-ready Minecraft bot API server with a web console dashboard.

## Features

- **REST API** — Full bot control via HTTP endpoints
- **WebSocket** — Real-time status and chat updates
- **Web Console** — Browser dashboard to start/stop/control the bot
- **OpenAI Integration** — GPT-4o chat with PostgreSQL conversation history
- **Bot Engine** — AFK mode, combat, pathfinding, anti-kick, sleep at night

## Quick Start

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL, OPENAI_API_KEY, etc.

pnpm install
pnpm build
pnpm start
```

Open `http://localhost:3000` for the web console.

## Development

```bash
pnpm dev   # tsx watch mode
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/healthz | Health check |
| GET | /api/bot/status | Bot status |
| POST | /api/bot/start | Start the bot |
| POST | /api/bot/stop | Stop the bot |
| POST | /api/bot/chat | Send chat message |
| POST | /api/bot/control | Movement control |
| GET | /api/bot/chat-log | Chat history |
| POST | /api/bot/toggle-afk | Toggle AFK mode |
| GET | /api/bot/settings | Get settings |
| PUT | /api/bot/settings | Update settings |
| GET | /api/openai/conversations | List conversations |
| POST | /api/openai/conversations | Create conversation |
| GET | /api/openai/conversations/:id | Get conversation + messages |
| DELETE | /api/openai/conversations/:id | Delete conversation |
| POST | /api/openai/conversations/:id/messages | Send message (SSE stream) |

## Environment Variables

See `.env.example` for all available configuration options.

## Database

Uses Drizzle ORM with PostgreSQL.

```bash
pnpm db:push      # Push schema to database
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
```
