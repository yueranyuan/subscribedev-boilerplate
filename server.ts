const PORT = parseInt(process.env.PORT || "3000");

// Cache for bundled outputs
const bundleCache = new Map<string, string>();

async function bundleEntry(entryPath: string): Promise<string> {
  // Check cache first
  if (bundleCache.has(entryPath)) {
    return bundleCache.get(entryPath)!;
  }

  const result = await Bun.build({
    entrypoints: [entryPath],
    target: "browser",
    format: "esm",
    minify: false,
    splitting: false,
    define: {
      // Public API key - safe to expose
      "import.meta.env.VITE_SUBSCRIBEDEV_PUBLIC_API_KEY": JSON.stringify(
        process.env.VITE_SUBSCRIBEDEV_PUBLIC_API_KEY || ""
      ),
      // Local access token - ONLY for dev, never in production builds
      "import.meta.env.VITE_SUBSCRIBEDEV_LOCAL_ACCESS_TOKEN": JSON.stringify(
        process.env.VITE_SUBSCRIBEDEV_LOCAL_ACCESS_TOKEN || ""
      ),
      "import.meta.env.DEV": "true",
      "import.meta.env.MODE": JSON.stringify("development"),
    },
  });

  if (result.outputs.length > 0) {
    const bundled = await result.outputs[0].text();
    bundleCache.set(entryPath, bundled);
    return bundled;
  }

  throw new Error("Failed to bundle");
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Serve index.html for root
    if (path === "/") {
      return new Response(Bun.file("index.html"));
    }

    // Serve files from public directory
    if (path.startsWith("/public/")) {
      const file = Bun.file("." + path);
      if (await file.exists()) {
        return new Response(file);
      }
    }

    // Handle source files - bundle with dependencies
    if (path.startsWith("/src/")) {
      const filePath = "." + path;
      const file = Bun.file(filePath);

      if (await file.exists()) {
        // For CSS files, serve as-is
        if (filePath.endsWith(".css")) {
          return new Response(file, {
            headers: { "Content-Type": "text/css" },
          });
        }

        // For TS/TSX files, bundle them
        if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
          try {
            const bundled = await bundleEntry(filePath);
            return new Response(bundled, {
              headers: { "Content-Type": "application/javascript" },
            });
          } catch (err) {
            console.error(`Error bundling ${filePath}:`, err);
            return new Response(`Error bundling: ${err}`, { status: 500 });
          }
        }
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 Server running at http://localhost:${PORT}`);
console.log(`📌 Public API Key: ${process.env.VITE_SUBSCRIBEDEV_PUBLIC_API_KEY ? "✓ Set" : "✗ Not set"}`);

// Watch for file changes and clear cache
import { watch } from "fs";

watch("./src", { recursive: true }, (eventType, filename) => {
  if (filename) {
    console.log(`📝 File changed: ${filename}`);
    bundleCache.clear();
  }
});
