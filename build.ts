#!/usr/bin/env bun

// Production build script that properly injects environment variables

const result = await Bun.build({
  entrypoints: ["./src/main.tsx"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  splitting: true,
  minify: true,
  define: {
    // Only inject PUBLIC API key - this is safe to expose
    "import.meta.env.VITE_SUBSCRIBEDEV_PUBLIC_API_KEY": JSON.stringify(
      process.env.VITE_SUBSCRIBEDEV_PUBLIC_API_KEY || ""
    ),
    // NEVER inject LOCAL_ACCESS_TOKEN in production builds - set to undefined
    "import.meta.env.VITE_SUBSCRIBEDEV_LOCAL_ACCESS_TOKEN": "undefined",
    "import.meta.env.DEV": "false",
    "import.meta.env.MODE": JSON.stringify("production"),
    "import.meta.env.PROD": "true",
  },
});

if (!result.success) {
  console.error("Build failed");
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

console.log("✅ Build successful!");
console.log(`📦 Generated ${result.outputs.length} files`);

for (const output of result.outputs) {
  const size = (output.size / 1024).toFixed(2);
  console.log(`   ${output.path.replace(process.cwd(), ".")} - ${size} KB`);
}

// Copy and update index.html to reference built files
const html = await Bun.file("./index.html").text();
const updatedHtml = html
  .replace('/src/index.css', '/main.css')
  .replace('/src/main.tsx', '/main.js');
await Bun.write("./dist/index.html", updatedHtml);
console.log("   ./dist/index.html - copied and updated")
