/**
 * 主播端插件类型定义
 */

import { IWatchPlugin } from "./watch";
import { StreamerRoomParams, NativeResult } from "./base";
import { PluginType } from "../utils/native-modules";

/**
 * 主播端插件接口（继承观众端接口并添加主播专属方法）
 */
export interface IStreamerPlugin extends Omit<IWatchPlugin, 'pluginType'> {
  /** 插件类型 */
  readonly pluginType: PluginType.LiveScenesHostPlugin;
  
  /**
   * 设置屏幕共享组（仅iOS系统有效）
   * @param appGroup - 屏幕共享组标识
   */
  setScreenShareGroup(appGroup: string): Promise<void>;

  /**
   * 登录主播房间
   * @param params - 主播房间参数
   */
  loginStreamer(params: StreamerRoomParams): Promise<void>;
}

// 重新导出相关类型
export type { StreamerRoomParams, NativeResult };