/**
 * 观众端插件类型定义
 */

import {
  NativeResult,
  ViewerInfo,
  MarqueeConfig,
  LiveRoomParams,
  PlaybackRoomParams,
  IBasePlugin
} from "./base";

/**
 * 观众端插件接口
 */
export interface IWatchPlugin extends IBasePlugin {
  /**
   * 设置观看者信息
   * @param viewerInfo - 观看者信息
   */
  setViewerInfo(viewerInfo: ViewerInfo): Promise<void>;

  /**
   * 设置跑马灯配置
   * @param config - 跑马灯配置
   */
  setMarqueeConfig(config: MarqueeConfig): Promise<void>;

  /**
   * 登录直播房间
   * @param params - 直播房间参数
   */
  loginLiveRoom(params: LiveRoomParams): Promise<void>;

  /**
   * 登录回放房间
   * @param params - 回放房间参数
   */
  loginPlaybackRoom(params: PlaybackRoomParams): Promise<void>;

  /**
   * 注册退出房间回调（仅iOS系统有效）
   * @param cb - 退出房间回调函数
   */
  logoutRoomMessage(cb?: (res: NativeResult) => void): void;

  /**
   * 在iPad上显示全屏按钮
   */
  showFullScreenButtonOnIPad(): void;
}

// 重新导出基础类型，方便使用
export type {
  ViewerInfo,
  MarqueeConfig,
  LiveRoomParams,
  PlaybackRoomParams,
  NativeResult,
} from "./base";