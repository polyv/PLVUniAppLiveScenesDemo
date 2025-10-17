/**
 * 原生模块接口定义
 */

import { NativeResult } from "../types";

/**
 * 观看播放模块接口
 */
export interface IWatchPlayModule {
  /** 登录直播房间 */
  loginLiveRoom: (
    sceneType: number,
    params: { channelId: string },
    cb: (res: NativeResult) => void
  ) => void;
  /** 登录回放房间 */
  loginPlaybackRoom: (
    sceneType: number,
    params: { channelId: string; videoId?: string; vodType: number | string },
    cb: (res: NativeResult) => void
  ) => void;
  /** 设置退出房间回调（仅iOS系统有效） */
  setExitRoomCallback?: (cb: (res: NativeResult) => void) => void;
  /** 在iPad上显示全屏按钮 */
  showFullScreenButtonOnIPad?: (params: { show: boolean }) => void;
}

/**
 * 观看配置模块接口
 */
export interface IWatchConfigModule {
  /** 设置观看者信息 */
  setViewerInfo: (
    params: { viewerId: string; viewerName: string; viewerAvatar: string },
    cb: (res: NativeResult) => void
  ) => void;
  /** 设置跑马灯配置 */
  setMarqueeConfig: (
    params: { code: string },
    cb: (res: NativeResult) => void
  ) => void;
  /** 设置用户配置 */
  setConfig: (
    params: { appId: string; userId: string; appSecret: string },
    cb: (res: NativeResult) => void
  ) => void;
}

/**
 * 主播配置模块接口
 */
export interface IStreamerConfigModule {
  /** 设置屏幕共享组（仅iOS系统有效） */
  setAppGroup: (
    params: { appGroup: string },
    cb: (res: NativeResult) => void
  ) => void;
}

/**
 * 主播播放模块接口
 */
export interface IStreamerPlayModule {
  /** 登录主播房间 */
  loginStreamer: (
    params: { channelId: string; password: string; nickname: string },
    cb: (res: NativeResult) => void
  ) => void;
}