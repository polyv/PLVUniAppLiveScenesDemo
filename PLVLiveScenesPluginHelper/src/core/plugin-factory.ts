/**
 * 插件工厂函数
 */

import { PluginType } from "../utils/native-modules";
import { WatchPlugin } from "./watch-plugin";
import { StreamerPlugin } from "./streamer-plugin";
import { PluginOptions, PluginInstance, IWatchPlugin, IStreamerPlugin } from "../types";

/**
 * 创建插件实例
 * @param options - 插件配置选项
 * @param options.type - 插件类型，默认为 LiveScenesPlugin
 * @returns 插件实例
 */
export function createPlugin<T extends PluginType = PluginType.LiveScenesPlugin>(
  options?: PluginOptions<T>
): PluginInstance<T> {
  const type = options?.type ?? PluginType.LiveScenesPlugin;
  
  const Constructors: Record<PluginType, new (options?: any) => IWatchPlugin | IStreamerPlugin> = {
    [PluginType.LiveScenesHostPlugin]: StreamerPlugin,
    [PluginType.LiveScenesPlugin]: WatchPlugin,
  };
  
  const Constructor = Constructors[type];
  return new Constructor(options) as PluginInstance<T>;
}

/**
 * 判断插件实例是否为主播插件
 * @param plugin - 插件实例
 * @returns 是否为主播插件
 */
export function isStreamerPlugin(plugin: IWatchPlugin | IStreamerPlugin): plugin is IStreamerPlugin {
  return (plugin.pluginType as string) === PluginType.LiveScenesHostPlugin;
}