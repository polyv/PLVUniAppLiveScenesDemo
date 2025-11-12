/**
 * 基础插件类
 */

import createLogger, { ILogger } from "../utils/logger";
import { ERROR_MESSAGES } from "../utils/const";
import { PluginType, PluginModuleNames } from "../utils/native-modules";
import {
  IWatchPlayModule,
  IWatchConfigModule,
  IStreamerConfigModule,
  IStreamerPlayModule,
} from "../interfaces";
import {
  PluginOptions,
  IBasePlugin,
  NativeResult,
  ViewerInfo,
  MarqueeConfig,
  UserInfo,
} from "../types";

// uni 全局（由 uni-app 提供）
// 避免在 TS 环境下的类型报错
declare const uni: any;

/**
 * 基础插件抽象类
 */
export abstract class BasePlugin<
  T extends PluginType = PluginType.LiveScenesPlugin
> implements IBasePlugin<T>
{
  protected playModule!: IWatchPlayModule;
  protected configModule!: IWatchConfigModule;
  protected streamerConfigModule!: IStreamerConfigModule;
  protected streamerPlayModule!: IStreamerPlayModule;

  protected isInit = false;
  protected userinfoDone = false;
  protected os: string = "unknown";
  protected platform: string = "unknown";
  protected envInit = false;

  public readonly pluginType: T;
  public readonly env: string; // 默认为 development
  protected readonly logger: ILogger;

  /**
   * 获取是否已初始化
   * @returns 是否已初始化
   */
  public get isInitialized(): boolean {
    return this.isInit;
  }

  /**
   * 获取是否已设置用户信息
   * @returns 是否已设置用户信息
   */
  public get hasUserInfo(): boolean {
    return this.userinfoDone;
  }

  constructor(options?: PluginOptions<T>) {
    const { type = PluginType.LiveScenesPlugin as T, env = "development" } =
      options || {};
    this.pluginType = type;
    this.env = env;
    this.logger = createLogger("PLVLiveScenesPluginHelper", this.env);
    this.init(options as PluginOptions<T>);
  }

  protected _promisify<T>(
    action: (cb: (res: NativeResult) => void) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      action((res: NativeResult = {}) => {
        const { isSuccess, errMsg = "", ...data } = res;
        if (isSuccess) resolve(data as T);
        else reject(new Error(errMsg || "Native module call failed"));
      });
    });
  }

  protected detectEnv(): void {
    if (typeof uni === "undefined") {
      this.logger.error("运行环境错误：仅支持uni-app");
      throw new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR);
    }
    const sys = (uni.getSystemInfoSync && uni.getSystemInfoSync()) || {};
    this.platform = sys.uniPlatform || this.platform;
    this.os = sys.osName || this.os;
    if (this.platform !== "app") {
      this.logger.error("运行环境错误：仅支持uni-app app模式");
      throw new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR);
    }
    if (this.os !== "ios" && this.os !== "android") {
      this.logger.error("运行环境错误：仅支持 iOS 或 Android");
      throw new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR);
    }
    this.logger.info(`运行环境：${this.platform} - ${this.os}`);
    this.logger.info(`插件类型：${this.pluginType}`);
  }

  protected bindModules(type: PluginType): void {
    if (type === PluginType.LiveScenesPlugin) {
      this.playModule = uni.requireNativePlugin(
        PluginModuleNames[PluginType.LiveScenesPlugin].watchPlay
      );
      this.configModule = uni.requireNativePlugin(
        PluginModuleNames[PluginType.LiveScenesPlugin].watchConfig
      );
    } else {
      this.streamerConfigModule = uni.requireNativePlugin(
        PluginModuleNames[PluginType.LiveScenesHostPlugin].streamerConfig
      );
      this.streamerPlayModule = uni.requireNativePlugin(
        PluginModuleNames[PluginType.LiveScenesHostPlugin].streamerPlay
      );
      this.playModule = uni.requireNativePlugin(
        PluginModuleNames[PluginType.LiveScenesHostPlugin].viewerPlay
      );
      this.configModule = uni.requireNativePlugin(
        PluginModuleNames[PluginType.LiveScenesHostPlugin].viewerConfig
      );
    }
  }

  protected init(options?: PluginOptions<T>): void {
    const { type = PluginType.LiveScenesPlugin as T } = options || {};
    this.detectEnv();
    this.bindModules(type);
    this.envInit = true;
  }

  protected ensureEnv(): void {
    if (!this.envInit) {
      this.logger.error("运行环境错误：仅支持uni-app app模式");
      throw new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR);
    }
  }

  protected checkSystem(): void {
    this.logger.info("检查系统状态", {
      isInit: this.isInit,
      userinfoDone: this.userinfoDone,
    });
    if (!this.isInit) throw new Error(ERROR_MESSAGES.NOT_INITIALIZED);
    if (!this.userinfoDone) throw new Error(ERROR_MESSAGES.NOT_USER_INFO);
  }

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
