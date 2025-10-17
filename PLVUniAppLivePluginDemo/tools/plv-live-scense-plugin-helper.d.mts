//#region src/utils/logger.d.ts
interface ILogger {
  /** 普通信息日志 */
  info: (message?: unknown, ...args: unknown[]) => void;
  /** 警告日志 */
  warn: (message?: unknown, ...args: unknown[]) => void;
  /** 错误日志（红色显示模块名与 message） */
  error: (message?: unknown, ...args: unknown[]) => void;
  /** 调试日志 */
  debug: (message?: unknown, ...args: unknown[]) => void;
}
//#endregion
//#region src/utils/native-modules.d.ts
/**
 * 原生插件相关常量与名称映射
 * 将不同能力（观看 / 主播）所需的原生模块名称集中管理，便于维护与复用。
 */
declare const enum PluginType {
  /** 纯观看插件 */
  LiveScenesPlugin = "PLV-LiveScenesPlugin",
  /** 观看 + 开播复合插件 */
  LiveScenesHostPlugin = "PLV-LiveUniPlugin",
}
//#endregion
//#region src/types/base.d.ts
/**
 * 原生模块返回结果类型
 */
type NativeResult = {
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
declare const enum SceneType {
  /** 云课堂场景 */
  CloudClass = 1,
  /** 电商场景 */
  Shopping = 2,
}
/**
 * 插件配置选项
 */
type PluginOptions<T extends PluginType = PluginType.LiveScenesPlugin> = {
  /** 插件类型，默认为 LiveScenesPlugin */
  type?: T;
  env?: string;
};
/**
 * 基础插件接口
 */
interface IBasePlugin<T extends PluginType = PluginType.LiveScenesPlugin> {
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
type ViewerInfo = {
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
type MarqueeConfig = {
  /** 跑马灯代码 */
  code?: string;
};
/**
 * 用户信息类型
 */
type UserInfo = {
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
type LiveRoomParams = {
  /** 场景类型 */
  sceneType: SceneType;
  /** 频道ID */
  channelId: string;
};
/**
 * 回放房间参数类型
 */
type PlaybackRoomParams = {
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
type StreamerRoomParams = {
  /** 频道ID */
  channelId: string;
  /** 房间密码 */
  password: string;
  /** 主播昵称 */
  nickname: string;
};
//#endregion
//#region src/types/watch.d.ts
/**
 * 观众端插件接口
 */
interface IWatchPlugin extends IBasePlugin {
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
//#endregion
//#region src/types/streamer.d.ts
/**
 * 主播端插件接口（继承观众端接口并添加主播专属方法）
 */
interface IStreamerPlugin extends Omit<IWatchPlugin, 'pluginType'> {
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
//#endregion
//#region src/types/plugin-instance.d.ts
/**
 * 插件实例类型 - 根据插件类型返回具体接口
 */
type PluginInstance<T extends PluginType = PluginType.LiveScenesPlugin> = T extends PluginType.LiveScenesHostPlugin ? IStreamerPlugin : IWatchPlugin;
//#endregion
//#region src/interfaces/native-modules.d.ts
/**
 * 观看播放模块接口
 */
interface IWatchPlayModule {
  /** 登录直播房间 */
  loginLiveRoom: (sceneType: number, params: {
    channelId: string;
  }, cb: (res: NativeResult) => void) => void;
  /** 登录回放房间 */
  loginPlaybackRoom: (sceneType: number, params: {
    channelId: string;
    videoId?: string;
    vodType: number | string;
  }, cb: (res: NativeResult) => void) => void;
  /** 设置退出房间回调（仅iOS系统有效） */
  setExitRoomCallback?: (cb: (res: NativeResult) => void) => void;
  /** 在iPad上显示全屏按钮 */
  showFullScreenButtonOnIPad?: (params: {
    show: boolean;
  }) => void;
}
/**
 * 观看配置模块接口
 */
interface IWatchConfigModule {
  /** 设置观看者信息 */
  setViewerInfo: (params: {
    viewerId: string;
    viewerName: string;
    viewerAvatar: string;
  }, cb: (res: NativeResult) => void) => void;
  /** 设置跑马灯配置 */
  setMarqueeConfig: (params: {
    code: string;
  }, cb: (res: NativeResult) => void) => void;
  /** 设置用户配置 */
  setConfig: (params: {
    appId: string;
    userId: string;
    appSecret: string;
  }, cb: (res: NativeResult) => void) => void;
}
/**
 * 主播配置模块接口
 */
interface IStreamerConfigModule {
  /** 设置屏幕共享组（仅iOS系统有效） */
  setAppGroup: (params: {
    appGroup: string;
  }, cb: (res: NativeResult) => void) => void;
}
/**
 * 主播播放模块接口
 */
interface IStreamerPlayModule {
  /** 登录主播房间 */
  loginStreamer: (params: {
    channelId: string;
    password: string;
    nickname: string;
  }, cb: (res: NativeResult) => void) => void;
}
//#endregion
//#region src/core/base-plugin.d.ts
/**
 * 基础插件抽象类
 */
declare abstract class BasePlugin<T extends PluginType = PluginType.LiveScenesPlugin> implements IBasePlugin<T> {
  protected playModule: IWatchPlayModule;
  protected configModule: IWatchConfigModule;
  protected streamerConfigModule: IStreamerConfigModule;
  protected streamerPlayModule: IStreamerPlayModule;
  protected isInit: boolean;
  protected userinfoDone: boolean;
  protected os: string;
  protected platform: string;
  protected envInit: boolean;
  readonly pluginType: T;
  readonly env: string;
  protected readonly logger: ILogger;
  /**
   * 获取是否已初始化
   * @returns 是否已初始化
   */
  get isInitialized(): boolean;
  /**
   * 获取是否已设置用户信息
   * @returns 是否已设置用户信息
   */
  get hasUserInfo(): boolean;
  constructor(options?: PluginOptions<T>);
  protected _promisify<T>(action: (cb: (res: NativeResult) => void) => void): Promise<T>;
  protected detectEnv(): void;
  protected bindModules(type: PluginType): void;
  protected init(options?: PluginOptions<T>): void;
  protected ensureEnv(): void;
  protected checkSystem(): void;
  /**
   * 初始化服务
   * @param params - 初始化参数
   * @param params.viewerId - 观看者ID
   * @param params.viewerName - 观看者名称
   * @param params.viewerAvatar - 观看者头像
   * @param params.code - 跑马灯代码（可选）
   * @returns Promise<void>
   */
  abstract initService(params: ViewerInfo & MarqueeConfig): Promise<void>;
  /**
   * 设置用户信息
   * @param userInfo - 用户信息
   * @param userInfo.appId - 应用ID
   * @param userInfo.userId - 用户ID
   * @param userInfo.appSecret - 应用密钥
   * @returns Promise<void>
   */
  abstract setUserInfo(userInfo: UserInfo): Promise<void>;
}
//#endregion
//#region src/core/watch-plugin.d.ts
/**
 * 观众端插件实现类
 */
declare class WatchPlugin extends BasePlugin<PluginType.LiveScenesPlugin> implements IWatchPlugin {
  constructor(options?: {
    type?: PluginType.LiveScenesPlugin;
    env?: string;
  });
  /**
   * 设置观看者信息
   * @param viewerInfo - 观看者信息
   * @param viewerInfo.viewerId - 观看者ID
   * @param viewerInfo.viewerName - 观看者名称
   * @param viewerInfo.viewerAvatar - 观看者头像
   * @returns Promise<void>
   */
  setViewerInfo({
    viewerId,
    viewerName,
    viewerAvatar
  }: ViewerInfo): Promise<void>;
  /**
   * 设置跑马灯配置
   * @param config - 跑马灯配置
   * @param config.code - 跑马灯代码
   * @returns Promise<void>
   */
  setMarqueeConfig({
    code
  }: MarqueeConfig): Promise<void>;
  /**
   * 初始化服务
   * @param params - 初始化参数
   * @param params.viewerId - 观看者ID
   * @param params.viewerName - 观看者名称
   * @param params.viewerAvatar - 观看者头像
   * @param params.code - 跑马灯代码（可选）
   * @returns Promise<void>
   */
  initService({
    viewerId,
    viewerName,
    viewerAvatar,
    code
  }: ViewerInfo & MarqueeConfig): Promise<void>;
  /**
   * 设置用户信息
   * @param userInfo - 用户信息
   * @param userInfo.appId - 应用ID
   * @param userInfo.userId - 用户ID
   * @param userInfo.appSecret - 应用密钥
   * @returns Promise<void>
   */
  setUserInfo({
    appId,
    userId,
    appSecret
  }: UserInfo): Promise<void>;
  /**
   * 登录直播房间
   * @param params - 直播房间参数
   * @param params.sceneType - 场景类型
   * @param params.channelId - 频道ID
   * @returns Promise<void>
   */
  loginLiveRoom({
    sceneType,
    channelId
  }: LiveRoomParams): Promise<void>;
  /**
   * 登录回放房间
   * @param params - 回放房间参数
   * @param params.sceneType - 场景类型
   * @param params.channelId - 频道ID
   * @param params.videoId - 视频ID（可选）
   * @param params.vodType - 点播类型
   * @returns Promise<void>
   */
  loginPlaybackRoom({
    sceneType,
    channelId,
    videoId,
    vodType
  }: PlaybackRoomParams): Promise<void>;
  /**
   * 注册退出房间回调（仅iOS系统有效）
   * @param cb - 退出房间回调函数
   * @param cb.res - 原生模块返回结果
   */
  logoutRoomMessage(cb?: (res: NativeResult) => void): void;
  /**
   * 在iPad上显示全屏按钮
   */
  showFullScreenButtonOnIPad(): void;
}
//#endregion
//#region src/core/streamer-plugin.d.ts
/**
 * 主播端插件
 */
declare class StreamerPlugin extends BasePlugin<PluginType.LiveScenesHostPlugin> implements IStreamerPlugin {
  constructor(options?: {
    type?: PluginType.LiveScenesHostPlugin;
    env?: string;
  });
  /**
   * 初始化服务（重写以支持主播插件）
   * @param params - 初始化参数
   * @param params.viewerId - 观看者ID
   * @param params.viewerName - 观看者名称
   * @param params.viewerAvatar - 观看者头像
   * @param params.code - 跑马灯代码（可选，主播插件中忽略此参数）
   * @returns Promise<void>
   */
  initService({
    viewerId,
    viewerName,
    viewerAvatar,
    code
  }: ViewerInfo & MarqueeConfig): Promise<void>;
  /**
   * 设置观看者信息
   * @param viewerInfo - 观看者信息
   * @param viewerInfo.viewerId - 观看者ID
   * @param viewerInfo.viewerName - 观看者名称
   * @param viewerInfo.viewerAvatar - 观看者头像
   * @returns Promise<void>
   */
  setViewerInfo({
    viewerId,
    viewerName,
    viewerAvatar
  }: ViewerInfo): Promise<void>;
  /**
   * 设置跑马灯配置
   * @param config - 跑马灯配置
   * @param config.code - 跑马灯代码
   * @returns Promise<void>
   */
  setMarqueeConfig({
    code
  }: MarqueeConfig): Promise<void>;
  /**
   * 设置用户信息
   * @param userInfo - 用户信息
   * @param userInfo.appId - 应用ID
   * @param userInfo.userId - 用户ID
   * @param userInfo.appSecret - 应用密钥
   * @returns Promise<void>
   */
  setUserInfo({
    appId,
    userId,
    appSecret
  }: UserInfo): Promise<void>;
  /**
   * 登录直播房间
   * @param params - 直播房间参数
   * @param params.sceneType - 场景类型
   * @param params.channelId - 频道ID
   * @returns Promise<void>
   */
  loginLiveRoom({
    sceneType,
    channelId
  }: LiveRoomParams): Promise<void>;
  /**
   * 登录回放房间
   * @param params - 回放房间参数
   * @param params.sceneType - 场景类型
   * @param params.channelId - 频道ID
   * @param params.videoId - 视频ID（可选）
   * @param params.vodType - 点播类型
   * @returns Promise<void>
   */
  loginPlaybackRoom({
    sceneType,
    channelId,
    videoId,
    vodType
  }: PlaybackRoomParams): Promise<void>;
  /**
   * 注册退出房间回调（仅iOS系统有效）
   * @param cb - 退出房间回调函数
   * @param cb.res - 原生模块返回结果
   */
  logoutRoomMessage(cb?: (res: NativeResult) => void): void;
  /**
   * 在iPad上显示全屏按钮
   */
  showFullScreenButtonOnIPad(): void;
  /**
   * 设置屏幕共享组（仅iOS系统有效）
   * @param appGroup - 屏幕共享组标识
   * @returns Promise<void>
   */
  setScreenShareGroup(appGroup: string): Promise<void>;
  /**
   * 登录主播房间
   * @param params - 主播房间参数
   * @param params.channelId - 频道ID
   * @param params.password - 房间密码
   * @param params.nickname - 主播昵称
   * @returns Promise<void>
   */
  loginStreamer(params: StreamerRoomParams): Promise<void>;
}
//#endregion
//#region src/core/plugin-factory.d.ts
/**
 * 创建插件实例
 * @param options - 插件配置选项
 * @param options.type - 插件类型，默认为 LiveScenesPlugin
 * @returns 插件实例
 */
declare function createPlugin<T extends PluginType = PluginType.LiveScenesPlugin>(options?: PluginOptions<T>): PluginInstance<T>;
/**
 * 判断插件实例是否为主播插件
 * @param plugin - 插件实例
 * @returns 是否为主播插件
 */
declare function isStreamerPlugin(plugin: IWatchPlugin | IStreamerPlugin): plugin is IStreamerPlugin;
//#endregion
//#region src/index.d.ts
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
declare const PLVLiveScenesPluginHelper: <T extends PluginType = PluginType.LiveScenesPlugin>(options?: PluginOptions<T>) => PluginInstance<T>;
//#endregion
export { BasePlugin, IBasePlugin, IStreamerConfigModule, IStreamerPlayModule, IStreamerPlugin, IWatchConfigModule, IWatchPlayModule, IWatchPlugin, type LiveRoomParams, type MarqueeConfig, type NativeResult, PLVLiveScenesPluginHelper, PLVLiveScenesPluginHelper as default, type PlaybackRoomParams, PluginInstance, PluginOptions, PluginType, SceneType, StreamerPlugin, type StreamerRoomParams, UserInfo, type ViewerInfo, WatchPlugin, createPlugin, isStreamerPlugin };