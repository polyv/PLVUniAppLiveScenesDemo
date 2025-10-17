import { defineConfig, type Options } from "tsdown";
import fs from "node:fs/promises";
import path from "node:path";

const commonOptions: Options = {
  format: ["esm"],
  outDir: "dist",
  clean: true,
  target: "node18",
  platform: "browser"
};

// 获取所有Demo项目路径
async function getDemoProjects(): Promise<string[]> {
  const currentDir = process.cwd();
  const parentDir = path.dirname(currentDir);
  const items = await fs.readdir(parentDir);
  
  const demoProjects = items.filter(item =>
    item.endsWith('Demo') &&
    item !== path.basename(currentDir)
  );
  
  return demoProjects.map(project => path.join(parentDir, project));
}

// 复制构建产物到Demo项目的tools文件夹
async function copyToDemoProjects() {
  try {
    const demoProjects = await getDemoProjects();
    const distDir = "dist";
    
    for (const demoProject of demoProjects) {
      const toolsDir = path.join(demoProject, "tools");
      
      // 检查tools文件夹是否存在
      try {
        await fs.access(toolsDir);
      } catch {
        console.log(`Tools directory not found in ${demoProject}, skipping...`);
        continue;
      }
      
      // 清空tools文件夹中的相关文件
      try {
        const existingFiles = await fs.readdir(toolsDir);
        for (const file of existingFiles) {
          if (file.includes('plv-live-scense-plugin-helper')) {
            await fs.unlink(path.join(toolsDir, file));
          }
        }
      } catch (error) {
        console.log(`Error clearing tools directory in ${demoProject}:`, error);
      }
      
      // 复制新文件
      const distFiles = await fs.readdir(distDir);
      for (const file of distFiles) {
        if (file.includes('plv-live-scense-plugin-helper')) {
          const sourcePath = path.join(distDir, file);
          const targetPath = path.join(toolsDir, file);
          await fs.copyFile(sourcePath, targetPath);
          console.log(`Copied ${file} to ${toolsDir}`);
        }
      }
    }
    
    console.log("All files copied to demo projects successfully!");
  } catch (error) {
    console.error("Error copying files to demo projects:", error);
  }
}

export default defineConfig(({ watch }) => {
  const isWatch = !!watch;
  return [
    {
      ...commonOptions,
      entry: ["src/index.ts"],
      outDir: "dist",
      sourcemap: isWatch,
      treeshake: !isWatch,
      minify: !isWatch,
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
            
            // 复制到Demo项目的tools文件夹
            await copyToDemoProjects();
          } catch (error) {
            console.error("Error renaming files:", error);
          }
        });
      },
    },
  ];
});
