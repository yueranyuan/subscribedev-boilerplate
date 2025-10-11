# Subscribe.dev Boilerplate

A minimal boilerplate application for building AI-powered apps with Subscribe.dev. This project demonstrates authentication, AI model invocation, usage tracking, and subscription management.

## Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Subscribe.dev API key to .env
# Get one at: https://dashboard.subscribe.dev

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see your app.

## Features

✅ Authentication with Subscribe.dev
✅ AI text generation with GPT-4o
✅ Usage tracking (credits used/remaining)
✅ Subscription management
✅ Error handling
✅ Loading states
✅ Responsive design

## What's Inside

- **React 18** with TypeScript
- **Vite** for fast development
- **Subscribe.dev** for AI and billing
- Clean, minimal UI ready to customize

## Next Steps

1. Customize the UI in [src/components/AIDemo.tsx](src/components/AIDemo.tsx)
2. Add more AI models (images, video, etc.)
3. Implement persistent storage with `useStorage`
4. Build your unique features!

## Documentation

See [CLAUDE.md](CLAUDE.md) for detailed development instructions and architecture.

## Resources

- [Subscribe.dev Docs](https://docs.subscribe.dev)
- [Dashboard](https://dashboard.subscribe.dev)
- [Community Discord](https://discord.gg/subscribedev)
