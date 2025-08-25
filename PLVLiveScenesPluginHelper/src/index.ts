import createLogger from "./utils/logger";
import { ERROR_MESSAGES } from "./utils/const";

// uni 全局（由 uni-app 提供）
// 避免在 TS 环境下的类型报错
declare const uni: any;

/**
 * 日志实例（模块名：PLVLiveScenesPlugin）
 * - error 日志会以红色高亮模块名与消息
 */
const Logger = createLogger("PLVLiveScenesPlugin");

type NativeResult = { isSuccess?: boolean; errMsg?: string; [k: string]: any };
const enum SceneType {
  CloudClass = 1,
  Shopping = 2,
}
/**
 * 观看者信息
 */
export type ViewerInfo = {
  viewerId: string;
  viewerName: string;
  viewerAvatar: string;
};

/**
 * 跑马灯配置
 */
export type MarqueeConfig = {
  code?: string;
};

/**
 * 平台用户配置
 */
export type UserInfo = {
  appId: string;
  userId: string;
  appSecret: string;
};

/**
 * 直播房间登录参数
 */
export type LiveRoomParams = {
  sceneType: SceneType;
  channelId: string;
};

/**
 * 回放房间登录参数
 */
export type PlaybackRoomParams = {
  sceneType: SceneType;
  channelId: string;
  videoId?: string;
  vodType: number | string;
};

/**
 * Polyv Live Scenes 辅助插件
 *
 * 提供观看者信息设置、用户鉴权配置、进入直播/回放房间等能力。
 * 与 Demo 中的对外 API 保持一致。
 */
export class PLVLiveScenesPlugin {
  private playModule: any;
  private configModule: any;
  private isInit = false;
  private userinfoDone = false;
  private os: string = "unknown";
  private platform: string = "unknown";
  private envInit = false;

  /**
   * 构造函数
   * - 通过 uni.requireNativePlugin 绑定原生模块
   */
  constructor() {
    this.init();
  }

  /**
   * 将 uni-app 回调风格的 API 转换为 Promise
   * @param action - 接受回调作为最后一个参数的函数
   * @returns Promise
   */
  private _promisify<T>(
    action: (cb: (res: NativeResult) => void) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      action((res: NativeResult = {}) => {
        // 默认空对象防止解构错误
        const { isSuccess, errMsg = "", ...data } = res;
        if (isSuccess) {
          resolve(data as T);
        } else {
          reject(new Error(errMsg || "Native module call failed"));
        }
      });
    });
  }

  private init() {
    if (typeof uni === "undefined") {
      Logger.error("运行环境错误：仅支持uni-app");
      throw new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR);
    }
    const sys = (uni.getSystemInfoSync && uni.getSystemInfoSync()) || {};
    this.platform = sys.uniPlatform || this.platform;
    this.os = sys.osName || this.os;

    // 兼容可能的标识（如 app）
    if (!(this.platform === "app")) {
      Logger.error("运行环境错误：仅支持uni-app app模式");
      throw new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR);
    }
    if (this.os !== "ios" && this.os !== "android") {
      Logger.error("运行环境错误：仅支持 iOS 或 Android");
      throw new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR);
    }
    this.playModule = uni.requireNativePlugin(
      "PLV-LiveScenesPlugin-PlayModule"
    );
    this.configModule = uni.requireNativePlugin(
      "PLV-LiveScenesPlugin-ConfigModule"
    );
    this.envInit = true;
  }

  /**
   * 环境就绪校验：仅允许在 uni-app App(iOS/Android) 模式下调用
   *
   * 抛出：RUNTIME_ENV_ERROR
   */
  private ensureEnv(): void {
    if (!this.envInit) {
      Logger.error("运行环境错误：仅支持uni-app app模式");
      throw new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR);
    }
  }

  /**
   * 设置观看者信息
   *
   * @param {Object} params - 观看者信息对象
   * @param {string} params.viewerId - 开发者侧用户唯一标识（如手机号）
   * @param {string} params.viewerName - 昵称/名称
   * @param {string} params.viewerAvatar - 头像 URL
   * @returns {Promise<void>} - 成功时 resolve，无返回值
   * @throws {Error} 当参数缺失时会直接抛出错误（Promise 将被 reject）
   */
  async setViewerInfo({
    viewerId,
    viewerName,
    viewerAvatar,
  }: ViewerInfo): Promise<void> {
    this.ensureEnv();
    if (!viewerId || !viewerName || !viewerAvatar) {
      throw new Error(ERROR_MESSAGES.VIEWER_PARAMS_ERROR);
    }

    Logger.info("设置观看者信息", { viewerId, viewerName });
    try {
      await this._promisify<void>((cb) =>
        this.configModule.setViewerInfo(
          { viewerId, viewerName, viewerAvatar },
          cb
        )
      );
      Logger.info("设置观看者信息成功");
    } catch (error) {
      Logger.error("设置观看者信息失败", error);
      throw error;
    }
  }

  /**
   * 设置跑马灯配置
   *
   * @param {Object} params - 配置对象
   * @param {string} [params.code] - 跑马灯自定义代码（可选）
   * @returns {Promise<void>} - 成功时 resolve，无返回值
   */
  async setMarqueeConfig({ code = "" }: MarqueeConfig): Promise<void> {
    this.ensureEnv();
    Logger.info("设置跑马灯配置", { code });
    try {
      await this._promisify<void>((cb) =>
        this.configModule.setMarqueeConfig({ code }, cb)
      );
      Logger.info("设置跑马灯配置成功");
    } catch (error) {
      Logger.error("设置跑马灯配置失败", error);
      throw error;
    }
  }

  /**
   * 初始化服务
   *
   * 会串行完成：
   * 1) 校验参数
   * 2) 设置观看者信息 + 跑马灯配置
   * 3) 标记 SDK 已初始化
   *
   * @param {Object} params - 初始化参数
   * @param {string} params.viewerId - 观看者 id
   * @param {string} params.viewerName - 观看者名称
   * @param {string} params.viewerAvatar - 观看者头像
   * @param {string} [params.code] - 跑马灯代码（可选）
   * @returns {Promise<void>} - 成功时 resolve，无返回值
   * @throws {Error} 参数错误或内部调用失败时抛出（Promise 将被 reject）
   */
  async initService({
    viewerId,
    viewerName,
    viewerAvatar,
    code = "",
  }: ViewerInfo & MarqueeConfig): Promise<void> {
    try {
      this.ensureEnv();
      this.isInit = false;
      Logger.info("开始初始化服务");

      if (!viewerId || !viewerName || !viewerAvatar) {
        Logger.error("初始化服务失败，参数错误", {
          viewerId,
          viewerName,
          viewerAvatar,
        });
        throw new Error(ERROR_MESSAGES.VIEWER_PARAMS_ERROR);
      }

      await Promise.all([
        this.setViewerInfo({ viewerId, viewerName, viewerAvatar }),
        this.setMarqueeConfig({ code }),
      ]);

      this.isInit = true;
      Logger.info("初始化服务完成");
    } catch (error) {
      Logger.error("初始化服务失败", error);
      throw error;
    }
  }

  /**
   * 检查系统状态
   *
   * 用于在进入房间等操作前校验是否完成初始化和用户信息设置。
   *
   * @throws {Error} 未初始化或未设置用户信息时抛出对应错误
   */
  private checkSystem(): void {
    Logger.info("检查系统状态", {
      isInit: this.isInit,
      userinfoDone: this.userinfoDone,
    });
    if (!this.isInit) {
      throw new Error(ERROR_MESSAGES.NOT_INITIALIZED);
    }
    if (!this.userinfoDone) {
      throw new Error(ERROR_MESSAGES.NOT_USER_INFO);
    }
  }

  /**
   * 设置用户信息
   *
   * 在 initService 之后调用，用于配置平台鉴权信息。
   *
   * @param {Object} params - 用户鉴权配置
   * @param {string} params.appId - 平台 appId
   * @param {string} params.userId - 平台 userId
   * @param {string} params.appSecret - 平台 appSecret
   * @returns {Promise<void>} - 成功时 resolve，无返回值
   * @throws {Error} 未初始化或参数缺失时抛出错误（Promise 将被 reject）
   */
  async setUserInfo({ appId, userId, appSecret }: UserInfo): Promise<void> {
    this.ensureEnv();
    this.userinfoDone = false;

    if (!this.isInit) {
      throw new Error(ERROR_MESSAGES.NOT_INITIALIZED);
    }
    if (!appId || !userId || !appSecret) {
      throw new Error(ERROR_MESSAGES.USER_PARAMS_ERROR);
    }

    Logger.info("设置用户信息", { appId, userId });
    try {
      await this._promisify<void>((cb) =>
        this.configModule.setConfig({ appId, userId, appSecret }, cb)
      );
      this.userinfoDone = true;
      Logger.info("设置用户信息成功");
    } catch (error) {
      Logger.error("设置用户信息失败", error);
      throw error;
    }
  }

  /**
   * 登录直播房间
   *
   * 需在 initService 与 setUserInfo 成功后调用。
   *
   * @param {Object} params - 登录参数
   * @param {number} params.sceneType - 场景类型：1 云课堂，2 直播带货
   * @param {string} params.channelId - 频道 id
   * @returns {Promise<void>} - 成功时 resolve，无返回值
   * @throws {Error} 当系统未就绪或参数缺失时抛出错误（Promise 将被 reject）
   */
  async loginLiveRoom({ sceneType, channelId }: LiveRoomParams): Promise<void> {
    Logger.info("登录直播房间", sceneType, channelId);
    this.ensureEnv();
    this.checkSystem();

    if (sceneType === undefined || channelId === undefined) {
      throw new Error(ERROR_MESSAGES.ROOM_PARAMS_ERROR);
    }

    Logger.info("登录直播房间", { sceneType, channelId });
    try {
      await this._promisify<void>((cb) =>
        this.playModule.loginLiveRoom(sceneType, { channelId }, cb)
      );
      Logger.info("登录直播房间成功");
    } catch (error) {
      Logger.error("登录直播房间失败", error);
      throw error;
    }
  }

  /**
   * 登录回放房间
   *
   * 需在 initService 与 setUserInfo 成功后调用。
   *
   * @param {Object} params - 登录参数
   * @param {number} params.sceneType - 场景类型：1 云课堂，2 直播带货
   * @param {string} params.channelId - 频道 id
   * @param {string} [params.videoId] - 回放视频 Vid（可选）
   * @param {0|1|number|string} params.vodType - 回放类型：0 回放视频，1 回放列表
   * @returns {Promise<void>} - 成功时 resolve，无返回值
   * @throws {Error} 当系统未就绪或必要参数缺失时抛出错误（Promise 将被 reject）
   */
  async loginPlaybackRoom({
    sceneType,
    channelId,
    videoId,
    vodType,
  }: PlaybackRoomParams): Promise<void> {
    Logger.info("登录回放房间", { sceneType, channelId, videoId, vodType });
    this.ensureEnv();
    this.checkSystem();

    if (
      sceneType === undefined ||
      channelId === undefined ||
      vodType === undefined
    ) {
      throw new Error(ERROR_MESSAGES.ROOM_PARAMS_ERROR);
    }

    Logger.info("登录回放房间", { sceneType, channelId, videoId, vodType });
    try {
      await this._promisify<void>((cb) =>
        this.playModule.loginPlaybackRoom(
          sceneType,
          {
            channelId,
            videoId,
            vodType,
          },
          cb
        )
      );
      Logger.info("登录回放房间成功");
    } catch (error) {
      Logger.error("登录回放房间失败", error);
      throw error;
    }
  }

  /**
   * 注册退出房间回调（仅 iOS 生效）
   *
   * @param {(res: NativeResult) => void} [cb] - 退出房间后的回调（可选）
   * @returns {void}
   */
  logoutRoomMessage(cb?: (res: NativeResult) => void): void {
    this.ensureEnv();
    Logger.info("当前系统os:", this.os);
    Logger.info("非ios系统不注册退出房间回调");
    if (this.os !== "ios") return;
    Logger.info("注册退出房间");
    this.playModule.setExitRoomCallback((res: NativeResult) => {
      Logger.info("退出房间成功");
      cb && cb(res);
    });
  }

  /**
   * 在 iPad 显示全屏按钮
   *
   * @returns {void}
   */
  showFullScreenButtonOnIPad(): void {
    Logger.info("显示 iPad 全屏按钮");
    this.ensureEnv();
    this.playModule.showFullScreenButtonOnIPad({ show: true });
  }
}

/**
 * 获取插件实例
 *
 * @returns {PLVLiveScenesPlugin} 插件实例
 */
let pluginInstance: PLVLiveScenesPlugin | null = null;

const getPluginInstance = (): PLVLiveScenesPlugin => {
  if (!pluginInstance) {
    pluginInstance = new PLVLiveScenesPlugin();
  }
  return pluginInstance;
};

export { getPluginInstance as PLVLiveScenesPluginHelper };
