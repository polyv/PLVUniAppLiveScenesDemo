/**
 * 观众端插件类
 */

import { BasePlugin } from "./base-plugin";
import { ERROR_MESSAGES } from "../utils/const";
import { PluginType } from "../utils/native-modules";
import { IWatchPlugin } from "../types";
import { 
  ViewerInfo, 
  MarqueeConfig, 
  UserInfo, 
  LiveRoomParams, 
  PlaybackRoomParams, 
  NativeResult 
} from "../types";

/**
 * 观众端插件实现类
 */
export class WatchPlugin extends BasePlugin<PluginType.LiveScenesPlugin> implements IWatchPlugin {
  constructor(options?: { type?: PluginType.LiveScenesPlugin, env?: string }) {
    super({ ...options });
  }

  /**
   * 设置观看者信息
   * @param viewerInfo - 观看者信息
   * @param viewerInfo.viewerId - 观看者ID
   * @param viewerInfo.viewerName - 观看者名称
   * @param viewerInfo.viewerAvatar - 观看者头像
   * @returns Promise<void>
   */
  async setViewerInfo({
    viewerId,
    viewerName,
    viewerAvatar,
  }: ViewerInfo): Promise<void> {
    this.ensureEnv();
    if (!viewerId || !viewerName || !viewerAvatar)
      throw new Error(ERROR_MESSAGES.VIEWER_PARAMS_ERROR);
    this.logger.info("设置观看者信息", { viewerId, viewerName });
    try {
      await this._promisify<void>((cb) =>
        this.configModule.setViewerInfo(
          { viewerId, viewerName, viewerAvatar },
          cb
        )
      );
      this.logger.info("设置观看者信息成功");
    } catch (error) {
      this.logger.error("设置观看者信息失败", error);
      throw error;
    }
  }

  /**
   * 设置跑马灯配置
   * @param config - 跑马灯配置
   * @param config.code - 跑马灯代码
   * @returns Promise<void>
   */
  async setMarqueeConfig({ code = "" }: MarqueeConfig): Promise<void> {
    this.ensureEnv();
    this.logger.info("设置跑马灯配置", { code });
    try {
      await this._promisify<void>((cb) =>
        this.configModule.setMarqueeConfig({ code }, cb)
      );
      this.logger.info("设置跑马灯配置成功");
    } catch (error) {
      this.logger.error("设置跑马灯配置失败", error);
      throw error;
    }
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
  async initService({
    viewerId,
    viewerName,
    viewerAvatar,
    code = "",
  }: ViewerInfo & MarqueeConfig): Promise<void> {
    try {
      this.ensureEnv();
      this.isInit = false;
      this.logger.info("开始初始化服务");
      if (!viewerId || !viewerName || !viewerAvatar) {
        this.logger.error("初始化服务失败，参数错误", {
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
      this.logger.info("初始化服务完成");
    } catch (error) {
      this.logger.error("初始化服务失败", error);
      throw error;
    }
  }

  /**
   * 设置用户信息
   * @param userInfo - 用户信息
   * @param userInfo.appId - 应用ID
   * @param userInfo.userId - 用户ID
   * @param userInfo.appSecret - 应用密钥
   * @returns Promise<void>
   */
  async setUserInfo({ appId, userId, appSecret }: UserInfo): Promise<void> {
    this.ensureEnv();
    this.userinfoDone = false;
    if (!this.isInit) throw new Error(ERROR_MESSAGES.NOT_INITIALIZED);
    if (!appId || !userId || !appSecret)
      throw new Error(ERROR_MESSAGES.USER_PARAMS_ERROR);
    this.logger.info("设置用户信息", { appId, userId });
    try {
      await this._promisify<void>((cb) =>
        this.configModule.setConfig({ appId, userId, appSecret }, cb)
      );
      this.userinfoDone = true;
      this.logger.info("设置用户信息成功");
    } catch (error) {
      this.logger.error("设置用户信息失败", error);
      throw error;
    }
  }

  /**
   * 登录直播房间
   * @param params - 直播房间参数
   * @param params.sceneType - 场景类型
   * @param params.channelId - 频道ID
   * @returns Promise<void>
   */
  async loginLiveRoom({ sceneType, channelId }: LiveRoomParams): Promise<void> {
    this.logger.info("登录直播房间", sceneType, channelId);
    this.ensureEnv();
    this.checkSystem();
    if (sceneType === undefined || channelId === undefined)
      throw new Error(ERROR_MESSAGES.ROOM_PARAMS_ERROR);
    this.logger.info("登录直播房间", { sceneType, channelId });
    try {
      await this._promisify<void>((cb) =>
        this.playModule.loginLiveRoom(sceneType, { channelId }, cb)
      );
      this.logger.info("登录直播房间成功");
    } catch (error) {
      this.logger.error("登录直播房间失败", error);
      throw error;
    }
  }

  /**
   * 登录回放房间
   * @param params - 回放房间参数
   * @param params.sceneType - 场景类型
   * @param params.channelId - 频道ID
   * @param params.videoId - 视频ID（可选）
   * @param params.vodType - 点播类型
   * @returns Promise<void>
   */
  async loginPlaybackRoom({
    sceneType,
    channelId,
    videoId,
    vodType,
  }: PlaybackRoomParams): Promise<void> {
    this.logger.info("登录回放房间", { sceneType, channelId, videoId, vodType });
    this.ensureEnv();
    this.checkSystem();
    if (
      sceneType === undefined ||
      channelId === undefined ||
      vodType === undefined
    )
      throw new Error(ERROR_MESSAGES.ROOM_PARAMS_ERROR);
    this.logger.info("登录回放房间", { sceneType, channelId, videoId, vodType });
    try {
      await this._promisify<void>((cb) =>
        this.playModule.loginPlaybackRoom(
          sceneType,
          { channelId, videoId, vodType },
          cb
        )
      );
      this.logger.info("登录回放房间成功");
    } catch (error) {
      this.logger.error("登录回放房间失败", error);
      throw error;
    }
  }

  /**
   * 注册退出房间回调（仅iOS系统有效）
   * @param cb - 退出房间回调函数
   * @param cb.res - 原生模块返回结果
   */
  logoutRoomMessage(cb?: (res: NativeResult) => void): void {
    this.ensureEnv();
    this.logger.info("当前系统os:", this.os);
    this.logger.warn("非ios系统不注册退出房间回调");
    if (this.os !== "ios") return;
    this.logger.info("注册退出房间");
    this.playModule.setExitRoomCallback?.((res: NativeResult) => {
      this.logger.info("退出房间成功");
      cb && cb(res);
    });
  }

  /**
   * 在iPad上显示全屏按钮
   */
  showFullScreenButtonOnIPad(): void {
    this.logger.info("显示 iPad 全屏按钮");
    this.ensureEnv();
    this.playModule.showFullScreenButtonOnIPad?.({ show: true });
  }
}