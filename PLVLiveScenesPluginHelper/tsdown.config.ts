import { defineConfig, type Options } from "tsdown";

const commonOptions: Options = {
  format: ["commonjs"],
  outDir: "dist",
  clean: true,
  target: "node18",
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
    },
  ];
});
