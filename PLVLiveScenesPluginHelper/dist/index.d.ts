//#region src/index.d.ts
/**
 * 观看者信息
 */
type ViewerInfo = {
  viewerId: string;
  viewerName: string;
  viewerAvatar: string;
};
/**
 * 跑马灯配置
 */
type MarqueeConfig = {
  code?: string;
};
/**
 * 平台用户配置
 */
type UserInfo = {
  appId: string;
  userId: string;
  appSecret: string;
};
/**
 * 直播房间登录参数
 */
type LiveRoomParams = {
  sceneType: number;
  channelId: string;
};
/**
 * 回放房间登录参数
 */
type PlaybackRoomParams = {
  sceneType: number;
  channelId: string;
  videoId?: string;
  vodType: number | string;
};
/**
 * PLVLiveScenesPlugin 主类（与 Demo 中保持一致的 API）
 */
/**
 * Polyv Live Scenes 辅助插件
 *
 * 提供观看者信息设置、用户鉴权配置、进入直播/回放房间等能力。
 * 与 Demo 中的对外 API 保持一致。
 */
declare class PLVLiveScenesPlugin {
  private playModule;
  private configModule;
  private isInit;
  private userinfoDone;
  private os;
  private platform;
  private envInit;
  /**
   * 构造函数
   * - 通过 uni.requireNativePlugin 绑定原生模块
   */
  constructor();
  private init;
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
  setViewerInfo({
    viewerId,
    viewerName,
    viewerAvatar
  }: ViewerInfo): Promise<void>;
  /**
   * 设置跑马灯配置
   *
   * @param {Object} params - 配置对象
   * @param {string} [params.code] - 跑马灯自定义代码（可选）
   * @returns {Promise<void>} - 成功时 resolve，无返回值
   */
  setMarqueeConfig({
    code
  }: MarqueeConfig): Promise<void>;
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
  initService({
    viewerId,
    viewerName,
    viewerAvatar,
    code
  }: ViewerInfo & MarqueeConfig): Promise<void>;
  /**
   * 检查系统状态
   *
   * 用于在进入房间等操作前校验是否完成初始化和用户信息设置。
   *
   * @throws {Error} 未初始化或未设置用户信息时抛出对应错误
   */
  private checkSystem;
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
  setUserInfo({
    appId,
    userId,
    appSecret
  }: UserInfo): Promise<void>;
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
  loginLiveRoom({
    sceneType,
    channelId
  }: LiveRoomParams): Promise<void>;
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
  loginPlaybackRoom({
    sceneType,
    channelId,
    videoId,
    vodType
  }: PlaybackRoomParams): Promise<void>;
  /**
   * 注册退出房间回调（仅 iOS 生效）
   *
   * @param {(res: any) => void} [cb] - 退出房间后的回调（可选）
   * @returns {void}
   */
  logoutRoomMessage(cb?: (res: any) => void): void;
  /**
   * 在 iPad 显示全屏按钮
   *
   * @returns {void}
   */
  showFullScreenButtonOnIPad(): void;
}
/**
 * 获取插件实例
 *
 * @returns {PLVLiveScenesPlugin} 插件实例
 */
declare const PLVLiveScenesPluginHelper: () => PLVLiveScenesPlugin;
//#endregion
export { LiveRoomParams, MarqueeConfig, PLVLiveScenesPlugin, PLVLiveScenesPluginHelper, PlaybackRoomParams, UserInfo, ViewerInfo };