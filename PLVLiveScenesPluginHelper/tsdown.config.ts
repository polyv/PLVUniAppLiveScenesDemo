import { defineConfig, type Options } from "tsdown";
import fs from "node:fs/promises";
import path from "node:path";

const commonOptions: Options = {
  format: ["esm"],
  outDir: "dist",
  clean: true,
  target: "node18",
  platform: "browser",
};

export default defineConfig(({ watch }) => {
  const isWatch = !!watch;
  return [
    {
      ...commonOptions,
      entry: ["src/index.ts"],
      outDir: "dist",
      sourcemap: isWatch,
      treeshake: !isWatch,
      minify: false,
      minifyWhitespace: !isWatch,
      keepNames: !isWatch,
      dts: true,
      hooks(hooks) {
        hooks.hook("build:done", async () => {
          console.log("Build completed successfully! Renaming files...");
          const outDir = "dist";
          const newName = "plv-live-scense-plugin-helper";
          try {
            const files = await fs.readdir(outDir);
            for (const file of files) {
              if (file.startsWith("index.")) {
                const oldPath = path.join(outDir, file);
                const newPath = path.join(
                  outDir,
                  file.replace("index", newName)
                );
                await fs.rename(oldPath, newPath);
              }
            }
            console.log("File renaming completed.");
          } catch (error) {
            console.error("Error renaming files:", error);
          }
        });
      },
    },
  ];
});
