/**
 * 插件实例类型定义
 */

import { PluginType } from "../utils/native-modules";
import type { IWatchPlugin, IStreamerPlugin } from "./index";

/**
 * 插件实例类型 - 根据插件类型返回具体接口
 */
export type PluginInstance<T extends PluginType = PluginType.LiveScenesPlugin> = 
  T extends PluginType.LiveScenesHostPlugin ? IStreamerPlugin : IWatchPlugin;