/**
 * 基础类型定义
 */

import { PluginType } from "../utils/native-modules";

/**
 * 原生模块返回结果类型
 */
export type NativeResult = {
  /** 是否成功 */
  isSuccess?: boolean;
  /** 错误信息 */
  errMsg?: string;
  /** 其他扩展字段 */
  [k: string]: any;
};

/**
 * 场景类型枚举
 */
export const enum SceneType {
  /** 云课堂场景 */
  CloudClass = 1,
  /** 电商场景 */
  Shopping = 2,
}

/**
 * 插件配置选项
 */
export type PluginOptions<T extends PluginType = PluginType.LiveScenesPlugin> =
  {
    /** 插件类型，默认为 LiveScenesPlugin */
    type?: T;
    env?: string;
  };

/**
 * 基础插件接口
 */
export interface IBasePlugin<
  T extends PluginType = PluginType.LiveScenesPlugin
> {
  /** 插件类型 */
  readonly pluginType: T;
  /** 是否已初始化 */
  readonly isInitialized: boolean;
  /** 是否已设置用户信息 */
  readonly hasUserInfo: boolean;
  /** 环境变量 */
  readonly env: string;

  /**
   * 初始化服务
   * @param params - 初始化参数
   */
  initService(params: ViewerInfo & MarqueeConfig): Promise<void>;

  /**
   * 设置用户信息
   * @param userInfo - 用户信息
   */
  setUserInfo(userInfo: UserInfo): Promise<void>;
}

/**
 * 观看者信息类型
 */
export type ViewerInfo = {
  /** 观看者ID */
  viewerId: string;
  /** 观看者名称 */
  viewerName: string;
  /** 观看者头像 */
  viewerAvatar: string;
};

/**
 * 跑马灯配置类型
 */
export type MarqueeConfig = {
  /** 跑马灯代码 */
  code?: string;
};

/**
 * 用户信息类型
 */
export type UserInfo = {
  /** 应用ID */
  appId: string;
  /** 用户ID */
  userId: string;
  /** 应用密钥 */
  appSecret: string;
};

/**
 * 直播房间参数类型
 */
export type LiveRoomParams = {
  /** 场景类型 */
  sceneType: SceneType;
  /** 频道ID */
  channelId: string;
};

/**
 * 回放房间参数类型
 */
export type PlaybackRoomParams = {
  /** 场景类型 */
  sceneType: SceneType;
  /** 频道ID */
  channelId: string;
  /** 视频ID（可选） */
  videoId?: string;
  /** 点播类型 */
  vodType: number | string;
};

/**
 * 主播房间参数类型
 */
export type StreamerRoomParams = {
  /** 频道ID */
  channelId: string;
  /** 房间密码 */
  password: string;
  /** 主播昵称 */
  nickname: string;
};
