# Subscribe.dev Boilerplate

A minimal boilerplate application for building AI-powered apps with Subscribe.dev. This project demonstrates authentication, AI model invocation, usage tracking, and subscription management.

## Quick Start

```bash
# Install dependencies
bun install

# Create environment file
cp .env.example .env.local

# Add your Subscribe.dev API key to .env.local
# Get one at: https://platform.subscribe.dev

# Start development server
bun run dev
```

Visit `http://localhost:3000` to see your app.

## Features

✅ Authentication with Subscribe.dev
✅ AI text generation with GPT-4o
✅ AI image generation with FLUX
✅ Usage tracking (credits used/remaining)
✅ Subscription management
✅ Error handling
✅ Loading states
✅ Responsive design

## What's Inside

- **React 18** with TypeScript
- **Bun** for fast runtime and bundling
- **Subscribe.dev** for AI and billing
- Clean, minimal UI ready to customize

## Next Steps

1. Customize the UI in [src/components/AIDemo.tsx](src/components/AIDemo.tsx)
2. Add more AI models (video, audio, etc.)
3. Implement persistent storage with `useStorage`
4. Build your unique features!

## Documentation

See [CLAUDE.md](CLAUDE.md) for detailed development instructions and architecture.

## Resources

- [Subscribe.dev Docs](https://docs.subscribe.dev)
- [Platform Dashboard](https://platform.subscribe.dev)
- [Community Discord](https://discord.gg/subscribedev)
