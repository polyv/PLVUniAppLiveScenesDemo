/**
 * 错误信息常量
 */
const ERROR_MESSAGES = {
    NOT_INITIALIZED: 'SDK未初始化，请先调用initService方法',
    NOT_USER_INFO: '用户信息未设置，请先调用setUserInfo方法',
    VIEWER_PARAMS_ERROR: 'viewerId、viewerName、viewerAvatar不能为空',
    USER_PARAMS_ERROR: 'appId、userId、appSecret不能为空',
    ROOM_PARAMS_ERROR: 'sceneType、channelId不能为空'
}

/**
 * 日志工具
 */
const Logger = {
    info: (message, ...args) => {
        console.log(`[PLVLiveScenesPlugin] ${message}`, ...args)
    },
    error: (message, ...args) => {
        console.error(`[PLVLiveScenesPlugin] ${message}`, ...args)
    }
}

export class PLVLiveScenesPlugin {
    constructor() {
        this.playModule = uni.requireNativePlugin("PLV-LiveScenesPlugin-PlayModule")
        this.configModule = uni.requireNativePlugin("PLV-LiveScenesPlugin-ConfigModule")
        this.isInit = false
        this.userinfoDone = false
    }

    /**
     * 设置观看者信息
     * @param {Object} params
     * @param {string} params.viewerId 观看者id，开发者自己用户系统的ID。如用户手机号码等唯一标识符
     * @param {string} params.viewerName 观看者名称
     * @param {string} params.viewerAvatar 观看者头像
     * @returns {Promise<void>}
     */
    setViewerInfo({ viewerId, viewerName, viewerAvatar }) {
        return new Promise((resolve, reject) => {
            if (!viewerId || !viewerName || !viewerAvatar) {
                reject(new Error(ERROR_MESSAGES.VIEWER_PARAMS_ERROR))
                return
            }

            Logger.info('设置观看者信息', { viewerId, viewerName })
            this.configModule.setViewerInfo({
                viewerId,
                viewerName,
                viewerAvatar
            }, (res) => {
                const { isSuccess, errMsg = '' } = res
                if (isSuccess) {
                    Logger.info('设置观看者信息成功')
                    resolve()
                } else {
                    Logger.error('设置观看者信息失败', errMsg)
                    reject(errMsg)
                }
            })
        })
    }

    /**
     * 设置跑马灯配置
     * @param {Object} params
     * @param {string} params.code 跑马灯设置
     * @returns {Promise<void>}
     */
    setMarqueeConfig({ code }) {
        return new Promise((resolve, reject) => {
            Logger.info('设置跑马灯配置', { code })
            this.configModule.setMarqueeConfig({ code }, (res) => {
                const { isSuccess, errMsg = '' } = res
                if (isSuccess) {
                    Logger.info('设置跑马灯配置成功')
                    resolve()
                } else {
                    Logger.error('设置跑马灯配置失败', errMsg)
                    reject(errMsg)
                }
            })
        })
    }

    /**
     * 初始化服务
     * @param {Object} params
     * @param {string} params.viewerId 观看者id，开发者自己用户系统的ID。如用户手机号码等唯一标识符
     * @param {string} params.viewerName 观看者名称
     * @param {string} params.viewerAvatar 观看者头像
     * @param {string} [params.code] 跑马灯设置 (可选)
     * @returns {Promise<void>}
     */
    async initService({ viewerId, viewerName, viewerAvatar, code = '' }) {
        try {
            this.isInit = false
            Logger.info('开始初始化服务')

            if (!viewerId || !viewerName || !viewerAvatar) {
                console.error('初始化服务失败，参数错误', { viewerId, viewerName, viewerAvatar })
                throw new Error(ERROR_MESSAGES.VIEWER_PARAMS_ERROR)
            }

            await Promise.all([
                this.setViewerInfo({ viewerId, viewerName, viewerAvatar }),
                this.setMarqueeConfig({ code })
            ])

            this.isInit = true
            Logger.info('初始化服务完成')
        } catch (error) {
            Logger.error('初始化服务失败', error)
            throw error
        }
    }

    /**
     * 检查SDK初始化和用户登录状态
     * @throws {Error} 如果未初始化或未设置用户信息则抛出错误
     */
    checkSystem() {
        Logger.info('检查系统状态', { isInit: this.isInit, userinfoDone: this.userinfoDone })
        if (!this.isInit) {
            throw new Error(ERROR_MESSAGES.NOT_INITIALIZED)
        }
        if (!this.userinfoDone) {
            throw new Error(ERROR_MESSAGES.NOT_USER_INFO)
        }
    }

    /**
     * 设置用户信息
     * @param {Object} params
     * @param {string} params.appId 开发者在平台申请的 appid
     * @param {string} params.userId 开发者在平台申请的 userid
     * @param {string} params.appSecret 开发者在平台申请的 appSecret
     * @returns {Promise<void>}
     */
    setUserInfo({ appId, userId, appSecret }) {
        return new Promise((resolve, reject) => {
            try {
                this.userinfoDone = false

                if (!this.isInit) {
                    throw new Error(ERROR_MESSAGES.NOT_INITIALIZED)
                }
                if (!appId || !userId || !appSecret) {
                    throw new Error(ERROR_MESSAGES.USER_PARAMS_ERROR)
                }

                Logger.info('设置用户信息', { appId, userId })
                this.configModule.setConfig({ appId, userId, appSecret }, (result) => {
                    const { isSuccess, errMsg = '' } = result
                    if (isSuccess) {
                        this.userinfoDone = true
                        Logger.info('设置用户信息成功')
                        resolve()
                    } else {
                        Logger.error('设置用户信息失败', errMsg)
                        reject(errMsg)
                    }
                })
            } catch (error) {
                Logger.error('设置用户信息失败', error)
                reject(error)
            }
        })
    }

    /**
     * 登录直播房间
     * @param {Object} params
     * @param {number} params.sceneType 场景类型 1云课堂场景, 2直播带货场景
     * @param {string} params.channelId 频道id
     * @returns {Promise<void>}
     */
    loginLiveRoom({ sceneType, channelId }) {
        console.log("loginLiveRoom", sceneType, channelId)
        return new Promise((resolve, reject) => {
            try {
                this.checkSystem()

                if (sceneType == undefined || channelId == undefined) {
                    throw new Error(ERROR_MESSAGES.ROOM_PARAMS_ERROR)
                }

                Logger.info('登录直播房间', { sceneType, channelId })
                this.playModule.loginLiveRoom(sceneType, { channelId }, (result) => {
                    const { isSuccess, errMsg = '' } = result
                    if (isSuccess) {
                        Logger.info('登录直播房间成功')
                        resolve()
                    } else {
                        Logger.error('登录直播房间失败', errMsg)
                        reject(errMsg)
                    }
                })
            } catch (error) {
                Logger.error('登录直播房间失败', error)
                reject(error)
            }
        })
    }

    /**
     * 登录回放房间
     * @param {Object} params
     * @param {string} params.sceneType 场景类型 1云课堂场景, 2直播带货场景
     * @param {string} params.channelId 频道id
     * @param {string} params.videoId 视频Vid
     * @param {string} params.vodType 回放中是否进入回放列表 0回放视频 1回放列表
     * @returns {Promise<void>}
     */
    loginPlaybackRoom({ sceneType, channelId, videoId, vodType }) {
        Logger.info('登录回放房间', { sceneType, channelId, videoId, vodType })
        return new Promise((resolve, reject) => {
            try {
                this.checkSystem()

                if (sceneType === undefined || channelId === undefined || vodType === undefined) {
                    throw new Error(ERROR_MESSAGES.ROOM_PARAMS_ERROR)
                }

                Logger.info('登录回放房间', { sceneType, channelId, videoId, vodType })
                this.playModule.loginPlaybackRoom(sceneType, {
                    channelId,
                    videoId,
                    vodType
                }, (result) => {
                    const { isSuccess, errMsg = '' } = result
                    if (isSuccess) {
                        Logger.info('登录回放房间成功')
                        resolve()
                    } else {
                        Logger.error('登录回放房间失败', errMsg)
                        reject(errMsg)
                    }
                })
            } catch (error) {
                Logger.error('登录回放房间失败', error)
                reject(error)
            }
        })
    }
    /**
     * 注册退出房间事件回调 (仅iOS)
     * @param {function(object): void} cb - 退出房间时执行的回调函数
     * @returns {void}
     */
    logoutRoomMessage(cb) {
        Logger.info('注册退出房间')
        const { osName } = uni.getSystemInfoSync()
        Logger.info('当前系统os:', osName)
        if (osName !== 'ios') return
        this.playModule.setExitRoomCallback((res) => {
            Logger.info('退出房间成功')
            cb && cb(res)
        })
    }
    /**
     * 在 iPad 上显示或隐藏全屏按钮
     * @returns {void}
     */
    showFullScreenButtonOnIPad() {
        Logger.info('显示 iPad 全屏按钮')
        this.playModule.showFullScreenButtonOnIPad({ show: true })
    }
}

/**
 * 导出插件实例化方法
 */
export const PLVLiveScenesPluginHelper = () => new PLVLiveScenesPlugin()