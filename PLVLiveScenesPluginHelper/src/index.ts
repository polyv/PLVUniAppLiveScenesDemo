/**
 * PLV Live Scenes Plugin Helper 主入口文件
 *
 * 重构后的简洁导出文件，提供单例模式的插件助手
 */

import { createPlugin, isStreamerPlugin } from "./core";
import type { PluginOptions, PluginInstance, IWatchPlugin, IStreamerPlugin } from "./types";
import { PluginType } from "./utils/native-modules";

// 导出所有类型和接口
export * from "./types";
export * from "./interfaces";

// 导出核心模块
export * from "./core";

// 单例实例缓存
let pluginInstance: IWatchPlugin | IStreamerPlugin | null = null;

/**
 * 获取 PLVLiveScenesPlugin 单例实例
 * @param options - 插件配置选项
 * @param options.type - 插件类型，默认为 LiveScenesPlugin
 * @returns 插件实例
 */
const getPluginInstance = <T extends PluginType = PluginType.LiveScenesPlugin>(
  options?: PluginOptions<T>
): PluginInstance<T> => {
  if (!pluginInstance) {
    pluginInstance = createPlugin(options);
  }
  return pluginInstance as PluginInstance<T>;
};

/**
 * PLV Live Scenes Plugin Helper 单例函数
 *
 * 使用示例：
 * ```typescript
 * // 使用观众插件（默认）- 类型明确为 IWatchPlugin
 * const plugin = PLVLiveScenesPluginHelper();
 * await plugin.initService({...});
 * await plugin.loginLiveRoom({...});
 *
 * // 使用主播插件 - 类型明确为 IStreamerPlugin
 * const streamerPlugin = PLVLiveScenesPluginHelper({
 *   type: PluginType.LiveScenesHostPlugin
 * });
 * await streamerPlugin.initService({...});
 * await streamerPlugin.loginStreamer({...}); // 只有主播插件才有此方法
 * ```
 *
 * @param options - 插件配置选项
 * @param options.type - 插件类型，默认为 LiveScenesPlugin
 * @param options.env - 插件运行环境，默认为 development, 可选值包括 'development' 和 'production' 该值决定日志输出行为
 * @returns 插件实例
 */
export const PLVLiveScenesPluginHelper = getPluginInstance;

// 默认导出单例函数
export default PLVLiveScenesPluginHelper;

// 导出类型判断工具函数
export { isStreamerPlugin };

// 导出 PluginType 枚举
export { PluginType };
