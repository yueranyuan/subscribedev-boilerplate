import { SubscribeDevProvider } from '@subscribe.dev/react'
import AIDemo from './components/AIDemo'

function App() {
  return (
    <SubscribeDevProvider
      projectToken={import.meta.env.VITE_SUBSCRIBEDEV_PUBLIC_API_KEY}
      accessToken={import.meta.env.VITE_SUBSCRIBEDEV_LOCAL_ACCESS_TOKEN}
    >
      <div className="app">
        <AIDemo />
      </div>
    </SubscribeDevProvider>
  )
}

export default App
