export default function defineConfig({ command }) {
  if (command === "serve") {
    return {
      server: {
        proxy: {
          "^/api/v1/(search|repos)|view": {
            target: "http://localhost:8910",
            secure: false,
          },
        },
      },
    };
  }

  return {};
}
