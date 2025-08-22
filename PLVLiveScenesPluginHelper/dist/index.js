
//#region src/utils/logger.ts
/** 判断是否在浏览器环境（含 H5 端） */
const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
/** ANSI 颜色码（非浏览器环境使用） */
const ANSI = {
	reset: "\x1B[0m",
	red: "\x1B[31m",
	yellow: "\x1B[33m",
	blue: "\x1B[34m",
	gray: "\x1B[90m",
	bold: "\x1B[1m"
};
/** 将 message 统一为字符串（优先使用 Error.message） */
function toMessage(input) {
	if (input instanceof Error) return input.message || String(input);
	if (typeof input === "string") return input;
	try {
		return JSON.stringify(input);
	} catch {
		return String(input);
	}
}
/** 创建带模块名前缀的 Logger */
function createLogger(name) {
	const prefix = `[${name}]`;
	const info = (message, ...args) => {
		if (isBrowser) console.log(`%c${prefix}%c ${toMessage(message)}`, "color:#1976d2;font-weight:600", "color:inherit", ...args);
		else console.log(`${ANSI.blue}${ANSI.bold}${prefix}${ANSI.reset} ${toMessage(message)}`, ...args);
	};
	const warn = (message, ...args) => {
		if (isBrowser) console.warn(`%c${prefix}%c ${toMessage(message)}`, "color:#f9a825;font-weight:600", "color:inherit", ...args);
		else console.warn(`${ANSI.yellow}${ANSI.bold}${prefix}${ANSI.reset} ${toMessage(message)}`, ...args);
	};
	const error = (message, ...args) => {
		const msg = toMessage(message);
		if (isBrowser) console.error(`%c${prefix} ${msg}`, "color:#e53935;font-weight:700", ...args);
		else console.error(`${ANSI.red}${ANSI.bold}${prefix} ${msg}${ANSI.reset}`, ...args);
	};
	const debug = (message, ...args) => {
		if (isBrowser) console.debug(`%c${prefix}%c ${toMessage(message)}`, "color:#9e9e9e", "color:inherit", ...args);
		else console.debug(`${ANSI.gray}${prefix}${ANSI.reset} ${toMessage(message)}`, ...args);
	};
	return {
		info,
		warn,
		error,
		debug
	};
}

//#endregion
//#region src/utils/const.ts
/**
* 错误信息常量
*/
let ERROR_MESSAGES = /* @__PURE__ */ function(ERROR_MESSAGES$1) {
	ERROR_MESSAGES$1["RUNTIME_ENV_ERROR"] = "运行环境错误";
	ERROR_MESSAGES$1["NOT_INITIALIZED"] = "SDK未初始化，请先调用initService方法";
	ERROR_MESSAGES$1["NOT_USER_INFO"] = "用户信息未设置，请先调用setUserInfo方法";
	ERROR_MESSAGES$1["VIEWER_PARAMS_ERROR"] = "viewerId、viewerName、viewerAvatar不能为空";
	ERROR_MESSAGES$1["USER_PARAMS_ERROR"] = "appId、userId、appSecret不能为空";
	ERROR_MESSAGES$1["ROOM_PARAMS_ERROR"] = "sceneType、channelId不能为空";
	return ERROR_MESSAGES$1;
}({});

//#endregion
//#region src/index.ts
/**
* 日志实例（模块名：PLVLiveScenesPlugin）
* - error 日志会以红色高亮模块名与消息
*/
const Logger = createLogger("PLVLiveScenesPlugin");
/**
* PLVLiveScenesPlugin 主类（与 Demo 中保持一致的 API）
*/
/**
* Polyv Live Scenes 辅助插件
*
* 提供观看者信息设置、用户鉴权配置、进入直播/回放房间等能力。
* 与 Demo 中的对外 API 保持一致。
*/
var PLVLiveScenesPlugin = class {
	playModule;
	configModule;
	isInit = false;
	userinfoDone = false;
	os;
	platform;
	envInit = false;
	/**
	* 构造函数
	* - 通过 uni.requireNativePlugin 绑定原生模块
	*/
	constructor() {
		this.platform = uni.getSystemInfoSync().uniPlatform || "unknown";
		this.os = uni.getSystemInfoSync().osName || "unknown";
		this.init();
	}
	init() {
		if (!uni) {
			Logger.error("运行环境错误：仅支持uni-app");
			throw new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR);
		}
		if (this.platform !== "app") {
			Logger.error("运行环境错误：仅支持uni-app app模式");
			throw new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR);
		}
		if (this.os !== "ios" && this.os !== "android") {
			Logger.error("运行环境错误：仅支持 iOS 或 Android");
			throw new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR);
		}
		this.playModule = uni.requireNativePlugin("PLV-LiveScenesPlugin-PlayModule");
		this.configModule = uni.requireNativePlugin("PLV-LiveScenesPlugin-ConfigModule");
		this.envInit = true;
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
	setViewerInfo({ viewerId, viewerName, viewerAvatar }) {
		return new Promise((resolve, reject) => {
			if (!this.envInit) {
				reject(new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR));
				return;
			}
			if (!viewerId || !viewerName || !viewerAvatar) {
				reject(new Error(ERROR_MESSAGES.VIEWER_PARAMS_ERROR));
				return;
			}
			Logger.info("设置观看者信息", {
				viewerId,
				viewerName
			});
			this.configModule.setViewerInfo({
				viewerId,
				viewerName,
				viewerAvatar
			}, (res) => {
				const { isSuccess, errMsg = "" } = res || {};
				if (isSuccess) {
					Logger.info("设置观看者信息成功");
					resolve();
				} else {
					Logger.error("设置观看者信息失败", errMsg);
					reject(errMsg);
				}
			});
		});
	}
	/**
	* 设置跑马灯配置
	*
	* @param {Object} params - 配置对象
	* @param {string} [params.code] - 跑马灯自定义代码（可选）
	* @returns {Promise<void>} - 成功时 resolve，无返回值
	*/
	setMarqueeConfig({ code = "" }) {
		return new Promise((resolve, reject) => {
			if (!this.envInit) {
				reject(new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR));
				return;
			}
			Logger.info("设置跑马灯配置", { code });
			this.configModule.setMarqueeConfig({ code }, (res) => {
				const { isSuccess, errMsg = "" } = res || {};
				if (isSuccess) {
					Logger.info("设置跑马灯配置成功");
					resolve();
				} else {
					Logger.error("设置跑马灯配置失败", errMsg);
					reject(errMsg);
				}
			});
		});
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
	async initService({ viewerId, viewerName, viewerAvatar, code = "" }) {
		if (!this.envInit) return Promise.reject(new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR));
		try {
			this.isInit = false;
			Logger.info("开始初始化服务");
			if (!viewerId || !viewerName || !viewerAvatar) {
				Logger.error("初始化服务失败，参数错误", {
					viewerId,
					viewerName,
					viewerAvatar
				});
				throw new Error(ERROR_MESSAGES.VIEWER_PARAMS_ERROR);
			}
			await Promise.all([this.setViewerInfo({
				viewerId,
				viewerName,
				viewerAvatar
			}), this.setMarqueeConfig({ code })]);
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
	checkSystem() {
		Logger.info("检查系统状态", {
			isInit: this.isInit,
			userinfoDone: this.userinfoDone
		});
		if (!this.isInit) throw new Error(ERROR_MESSAGES.NOT_INITIALIZED);
		if (!this.userinfoDone) throw new Error(ERROR_MESSAGES.NOT_USER_INFO);
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
	setUserInfo({ appId, userId, appSecret }) {
		return new Promise((resolve, reject) => {
			if (!this.envInit) {
				reject(new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR));
				return;
			}
			try {
				this.userinfoDone = false;
				if (!this.isInit) throw new Error(ERROR_MESSAGES.NOT_INITIALIZED);
				if (!appId || !userId || !appSecret) throw new Error(ERROR_MESSAGES.USER_PARAMS_ERROR);
				Logger.info("设置用户信息", {
					appId,
					userId
				});
				this.configModule.setConfig({
					appId,
					userId,
					appSecret
				}, (result) => {
					const { isSuccess, errMsg = "" } = result || {};
					if (isSuccess) {
						this.userinfoDone = true;
						Logger.info("设置用户信息成功");
						resolve();
					} else {
						Logger.error("设置用户信息失败", errMsg);
						reject(errMsg);
					}
				});
			} catch (error) {
				Logger.error("设置用户信息失败", error);
				reject(error);
			}
		});
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
	loginLiveRoom({ sceneType, channelId }) {
		Logger.debug("loginLiveRoom", sceneType, channelId);
		return new Promise((resolve, reject) => {
			if (!this.envInit) {
				reject(new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR));
				return;
			}
			try {
				this.checkSystem();
				if (sceneType === void 0 || channelId === void 0) throw new Error(ERROR_MESSAGES.ROOM_PARAMS_ERROR);
				Logger.info("登录直播房间", {
					sceneType,
					channelId
				});
				this.playModule.loginLiveRoom(sceneType, { channelId }, (result) => {
					const { isSuccess, errMsg = "" } = result || {};
					if (isSuccess) {
						Logger.info("登录直播房间成功");
						resolve();
					} else {
						Logger.error("登录直播房间失败", errMsg);
						reject(errMsg);
					}
				});
			} catch (error) {
				Logger.error("登录直播房间失败", error);
				reject(error);
			}
		});
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
	loginPlaybackRoom({ sceneType, channelId, videoId, vodType }) {
		Logger.info("登录回放房间", {
			sceneType,
			channelId,
			videoId,
			vodType
		});
		return new Promise((resolve, reject) => {
			if (!this.envInit) {
				reject(new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR));
				return;
			}
			try {
				this.checkSystem();
				if (sceneType === void 0 || channelId === void 0 || vodType === void 0) throw new Error(ERROR_MESSAGES.ROOM_PARAMS_ERROR);
				Logger.info("登录回放房间", {
					sceneType,
					channelId,
					videoId,
					vodType
				});
				this.playModule.loginPlaybackRoom(sceneType, {
					channelId,
					videoId,
					vodType
				}, (result) => {
					const { isSuccess, errMsg = "" } = result || {};
					if (isSuccess) {
						Logger.info("登录回放房间成功");
						resolve();
					} else {
						Logger.error("登录回放房间失败", errMsg);
						reject(errMsg);
					}
				});
			} catch (error) {
				Logger.error("登录回放房间失败", error);
				reject(error);
			}
		});
	}
	/**
	* 注册退出房间回调（仅 iOS 生效）
	*
	* @param {(res: any) => void} [cb] - 退出房间后的回调（可选）
	* @returns {void}
	*/
	logoutRoomMessage(cb) {
		if (!this.envInit) throw new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR);
		Logger.info("注册退出房间");
		const { osName } = uni.getSystemInfoSync() || {};
		Logger.info("当前系统os:", osName);
		if (osName !== "ios") return;
		this.playModule.setExitRoomCallback((res) => {
			Logger.info("退出房间成功");
			cb && cb(res);
		});
	}
	/**
	* 在 iPad 显示全屏按钮
	*
	* @returns {void}
	*/
	showFullScreenButtonOnIPad() {
		Logger.info("显示 iPad 全屏按钮");
		if (!this.envInit) throw new Error(ERROR_MESSAGES.RUNTIME_ENV_ERROR);
		this.playModule.showFullScreenButtonOnIPad({ show: true });
	}
};
/**
* 获取插件实例
*
* @returns {PLVLiveScenesPlugin} 插件实例
*/
const PLVLiveScenesPluginHelper = () => new PLVLiveScenesPlugin();

//#endregion
exports.PLVLiveScenesPlugin = PLVLiveScenesPlugin;
exports.PLVLiveScenesPluginHelper = PLVLiveScenesPluginHelper;