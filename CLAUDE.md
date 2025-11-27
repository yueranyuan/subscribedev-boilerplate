# Subscribe.dev Boilerplate

Minimal React app for AI-powered applications with built-in auth, billing, and rate limiting.

## Stack

- React 18 + TypeScript + Bun
- @subscribe.dev/react ^0.1.14
- Bun bundler & runtime (NOT Vite - uses custom Bun dev server)

## 🤖 AGENT SETUP (CRITICAL - DO THIS FIRST!)

**If you are an AI agent setting up this project, you MUST complete these steps BEFORE writing any application code:**

### Step 1: Create a Subscribe.dev Project

Use the Subscribe.dev MCP tools to create a demo project:

```typescript
// Use: mcp__subscribe-dev__create_project
{
  "name": "Your Project Name",
  "type": "demo",  // Use "demo" for testing, "dev" for development, "production" for live apps
  "description": "Brief description of what this app does"
}
```

This returns a project with an API key (starts with `pub_`). Save this for the next step.

### Step 2: Get the Owner Access Token

Use the MCP tool to get an owner access token for local development:

```typescript
// Use: mcp__subscribe-dev__get_owner_access_token
{
  "projectId": "the-project-id-from-step-1"
}
```

This returns a JWT access token that allows automatic authentication during development.

### Step 3: Create Environment Files

Create `.env.local` with BOTH keys:

```bash
# Project API key (public, can be exposed in frontend)
VITE_SUBSCRIBEDEV_PUBLIC_API_KEY=pub_xxxxxxxxxxxxx

# Local access token (dev-only, for automatic authentication)
VITE_SUBSCRIBEDEV_LOCAL_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ CRITICAL:** Both keys must be set before running the dev server! The app will not function properly without them.

### Step 4: Verify Setup

After creating the environment file, verify the keys are loaded:

1. Run `bun install` to install dependencies
2. Run `bun run dev` to start the dev server
3. Check the console output for: `📌 Public API Key: ✓ Set`
4. Open the app in a browser - you should be automatically authenticated

**Only proceed with implementing the application features after completing these setup steps!**

---

## Manual Setup (for human developers)

```bash
bun install
bun run dev  # Starts on port 3000
```

**Important:** The Bun dev server runs on port 3000 by default. Check the terminal output to confirm:

```
🚀 Server running at http://localhost:3000
```

### Environment Variables

Create `.env.local`:
```bash
# Project API key (public, can be exposed in frontend)
VITE_SUBSCRIBEDEV_PUBLIC_API_KEY=your_project_token

# Optional: Local access token (dev-only, for automatic authentication)
VITE_SUBSCRIBEDEV_LOCAL_ACCESS_TOKEN=your_access_token_here
```

Get your project token at [platform.subscribe.dev](https://platform.subscribe.dev).

Without a token, the app runs in demo mode with limited functionality.

**🔒 SECURITY:**
- `VITE_SUBSCRIBEDEV_PUBLIC_API_KEY` - Safe to expose, included in production builds
- `VITE_SUBSCRIBEDEV_LOCAL_ACCESS_TOKEN` - **Only** injected in dev server (`bun run dev`), **never** in production builds (`bun run build`)

The local access token enables automatic dev authentication but is excluded from production builds to prevent accidental deployment.

**Note on `VITE_` prefix:** This project uses Bun (not Vite), but maintains the `VITE_` naming convention for environment variables for familiarity and compatibility. The Bun dev server and build script use `define` to inject these values at build time.

## Core API

### Provider Setup

```tsx
import { SubscribeDevProvider } from '@subscribe.dev/react'

<SubscribeDevProvider
  projectToken={import.meta.env.VITE_SUBSCRIBEDEV_PUBLIC_API_KEY}
  accessToken={import.meta.env.VITE_SUBSCRIBEDEV_LOCAL_ACCESS_TOKEN}
>
  <App />
</SubscribeDevProvider>
```

**Note:** The `accessToken` prop enables automatic authentication in development. This token is only available during `bun run dev` and is explicitly set to `undefined` in production builds for security.

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

server.ts                # Bun dev server
build.ts                 # Production build script
index.html               # HTML template
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

### 🚀 Recommended: Deploy via Subscribe.dev MCP (Agents)

**If you are an AI agent, use the Subscribe.dev MCP deployment tool:**

```typescript
// Use: mcp__subscribe-dev__deploy_content
{
  "projectId": "your-project-id",
  "content": "file:///absolute/path/to/dist.zip"  // or path to index.html
}
```

**Steps:**
1. Build the project: `bun run build` (creates `dist/` folder)
2. Zip the dist folder if deploying multiple files, or use the index.html directly
3. Call `mcp__subscribe-dev__deploy_content` with the project ID and file path
4. Tool returns a live public URL (e.g., `https://abc123.apps.subscribe.dev`)

**Benefits:**
- ✅ Instant deployment with public HTTPS URL
- ✅ No external hosting setup required
- ✅ Perfect for demos, prototypes, and testing
- ✅ Works seamlessly with Subscribe.dev auth and billing

---

### Manual Deployment (Human Developers)

**Build for production:**

```bash
# Set your project token before building
export VITE_SUBSCRIBEDEV_PUBLIC_API_KEY=your_project_token
bun run build  # Output: dist/
```

The build script (`build.ts`) will inject your project token at build time. The token is **baked into the bundle** and safe to expose - it only allows authenticated users to access your app.

**Deployment platforms:**

- **Subscribe.dev (recommended):** Use the platform dashboard to deploy
- **Vercel/Netlify/Cloudflare Pages:** Set `VITE_SUBSCRIBEDEV_PUBLIC_API_KEY` in your dashboard's environment variables
- **Docker/VPS:** Set the env var in your CI/CD pipeline or build script
- **Static hosts:** Build locally with the env var set, then deploy the `dist/` folder

⚠️ **Important:** The environment variable must be set at **build time**, not runtime. Static deployments bake the values into the JavaScript bundle.

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

**Wrong port:** The Bun dev server always runs on port 3000 (or PORT env var). Check the terminal output to confirm.

**Demo mode limitations:** Without a project token, users can't persist data or manage subscriptions.

**Auth redirect:** Sign-in redirects to `auth.subscribe.dev`, then back to your app. Redirect URL must match your actual port.

**Credits depleted:** Show the subscribe button when `usage.remainingCredits` is low. Call `subscribe()` to open Stripe checkout.

**Rate limits:** Display `err.retryAfter` and disable the generate button temporarily.

## Resources

- [Platform Dashboard](https://platform.subscribe.dev)
- [API Documentation](https://docs.subscribe.dev)
- [Model Catalog](https://docs.subscribe.dev/models)
- [Discord Community](https://discord.gg/subscribedev)
