export default function defineConfig({ command }) {
  if (command === "serve") {
    return {
      server: {
        proxy: {
          "^/api/v1/(search|repos)|view|^/assets/": {
            target: "http://localhost:8910",
            secure: false,
          },
        },
      },
    };
  }

  return {};
}
