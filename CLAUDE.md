# Subscribe.dev Boilerplate

Minimal React app for AI-powered applications with built-in auth, billing, and rate limiting.

## Stack

- React 18 + TypeScript + Vite
- @subscribe.dev/react ^0.0.240
- Bun package manager

## Setup

```bash
cd samples/boilerplate
bun install
bun run dev  # Vite auto-selects available port
```

**Important:** Vite automatically finds an available port (default 5173, auto-increments if busy). **Always check the terminal output** for the actual port:

```
➜  Local:   http://localhost:5174/
```

**For AI agents:** Only use ports that YOU started. Other Vite servers may be running in different repos/worktrees on this machine. Parse the `bun run dev` output to extract YOUR port number before accessing the app.

### Environment Variables

Create `.env`:
```
VITE_SUBSCRIBEDEV_PUBLIC_API_KEY=your_project_token
```

Get your project token at [platform.subscribe.dev](https://platform.subscribe.dev).

Without a token, the app runs in demo mode with limited functionality.

## Core API

### Provider Setup

```tsx
import { SubscribeDevProvider } from '@subscribe.dev/react'

<SubscribeDevProvider projectToken={import.meta.env.VITE_SUBSCRIBEDEV_PUBLIC_API_KEY}>
  <App />
</SubscribeDevProvider>
```

### Hook: useSubscribeDev()

```tsx
const {
  // Auth
  isSignedIn: boolean,
  signIn: () => void,
  signOut: () => void,
  user: { userId: string, email: string, avatarUrl?: string } | null,

  // API Client
  client: SubscribeDevClient | null,

  // Usage Tracking
  usage: {
    allocatedCredits: number,
    usedCredits: number,
    remainingCredits: number,
    loading: boolean,
    error: string | null,
    refreshUsage: () => Promise<void>
  },

  // Subscriptions
  subscribe: () => void,
  subscriptionStatus: {
    hasActiveSubscription: boolean,
    plan?: { name: string, ... }
  },

  // Storage (persistent user data)
  useStorage: <T>(key: string, initialValue: T) =>
    [T, (value: T) => void, SyncStatus]
} = useSubscribeDev()
```

## AI Model Invocation

### Text Generation

```tsx
const response = await client.run('openai/gpt-4o', {
  input: {
    messages: [
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'Write a haiku.' }
    ]
  }
})
const text = response.output[0] as string
```

### Image Generation

```tsx
const response = await client.run('black-forest-labs/flux-schnell', {
  input: {
    prompt: 'a cute robot'
  }
})
const imageUrl = response.output as string
```

### Video Generation

```tsx
const response = await client.run('wan-video/wan-2.2-5b-fast', {
  input: {
    prompt: 'a robot dancing'
  }
})
const videoUrl = response.output as string
```

### Response Structure

```ts
interface ClientResponse {
  id: string
  output: any  // string | string[] | object - depends on model
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  error?: string
  metrics?: {
    predict_time?: number
    total_time?: number
  }
}
```

## Error Handling

```tsx
try {
  const response = await client.run(model, { input })
  // handle success
} catch (err: any) {
  if (err.type === 'insufficient_credits') {
    // Show subscribe prompt
    // err.remainingCredits, err.requiredCredits available
  } else if (err.type === 'rate_limit_exceeded') {
    // Show retry message
    // err.retryAfter (seconds), err.resetTime available
  } else if (err.type === 'authentication_error') {
    // Prompt sign in
  } else {
    // Generic error
    console.error(err.message)
  }
}
```

### Error Types

- `insufficient_credits` - User needs to add funds or subscribe
- `rate_limit_exceeded` - Too many requests, retry after delay
- `authentication_error` - Invalid/missing auth
- `access_denied` - No permission for resource
- `not_found` - Model or resource doesn't exist

## Persistent Storage

```tsx
const [data, setData, syncStatus] = useStorage('my-key', { count: 0 })

// syncStatus: 'local' | 'syncing' | 'synced' | 'error'
setData({ count: data.count + 1 })
```

Storage is user-scoped and persists across sessions.

## Models

### Text
- `openai/gpt-4o` - Best for complex reasoning
- `openai/gpt-4o-mini` - Faster, cheaper
- `anthropic/claude-3-5-sonnet` - Long context, analysis

### Images
- `black-forest-labs/flux-schnell` - Fast, high quality
- `black-forest-labs/flux-dev` - More detail, slower

### Video
- `wan-video/wan-2.2-5b-fast` - Text-to-video generation

See [docs.subscribe.dev/models](https://docs.subscribe.dev/models) for full list.

## Project Structure

```
src/
├── App.tsx              # SubscribeDevProvider wrapper
├── components/
│   └── AIDemo.tsx       # Main demo with text + image generation
├── main.tsx             # React entry
└── index.css            # Minimal styles

index.html               # HTML template
vite.config.ts           # Vite config
package.json             # Dependencies
```

## Implementation Pattern

```tsx
import { useState } from 'react'
import { useSubscribeDev } from '@subscribe.dev/react'

function MyComponent() {
  const { isSignedIn, signIn, client, user, usage } = useSubscribeDev()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isSignedIn) {
    return <button onClick={signIn}>Sign In</button>
  }

  const handleGenerate = async () => {
    if (!client) return

    setLoading(true)
    setError(null)

    try {
      const response = await client.run('openai/gpt-4o', {
        input: { messages: [{ role: 'user', content: 'Hello' }] }
      })
      setResult(response.output[0])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <header>
        <span>{user.email}</span>
        <span>Credits: {usage.remainingCredits}</span>
      </header>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {error && <div>{error}</div>}
      {result && <div>{result}</div>}
    </div>
  )
}
```

## Build & Deploy

```bash
bun run build  # Output: dist/
```

Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages, etc).

**Important:** Your project token is public and safe to expose. It only allows authenticated users to access your app.

## Advanced Features

### Streaming Responses

```tsx
const stream = await client.run('openai/gpt-4o', {
  input: { messages: [...] },
  stream: true
})

for await (const chunk of stream) {
  console.log(chunk)
}
```

### JSON Response Format

```tsx
const response = await client.run('openai/gpt-4o', {
  input: {
    messages: [{
      role: 'user',
      content: 'Return a JSON object with name and age'
    }]
  },
  response_format: { type: 'json_object' }
})
const json = JSON.parse(response.output[0])
```

### Multimodal Input (Vision)

```tsx
const response = await client.run('openai/gpt-4o', {
  input: {
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'What is in this image?' },
        { type: 'image_url', image_url: { url: 'https://...' } }
      ]
    }]
  }
})
```

## Common Issues

**Wrong port:** Never assume port 5173. Always parse the `bun run dev` output to find YOUR actual port. Multiple Vite servers may be running on this machine in different worktrees/repos.

**Demo mode limitations:** Without a project token, users can't persist data or manage subscriptions.

**Auth redirect:** Sign-in redirects to `auth.subscribe.dev`, then back to your app. Redirect URL must match your actual port.

**Credits depleted:** Show the subscribe button when `usage.remainingCredits` is low. Call `subscribe()` to open Stripe checkout.

**Rate limits:** Display `err.retryAfter` and disable the generate button temporarily.

## Resources

- [Platform Dashboard](https://platform.subscribe.dev)
- [API Documentation](https://docs.subscribe.dev)
- [Model Catalog](https://docs.subscribe.dev/models)
- [Discord Community](https://discord.gg/subscribedev)
