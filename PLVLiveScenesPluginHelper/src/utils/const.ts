/**
 * 错误信息常量
 */
export const enum ERROR_MESSAGES {
  RUNTIME_ENV_ERROR = "运行环境错误",
  NOT_INITIALIZED = "SDK未初始化，请先调用initService方法",
  NOT_USER_INFO = "用户信息未设置，请先调用setUserInfo方法",
  VIEWER_PARAMS_ERROR = "viewerId、viewerName、viewerAvatar不能为空",
  USER_PARAMS_ERROR = "appId、userId、appSecret不能为空",
  ROOM_PARAMS_ERROR = "sceneType、channelId不能为空",
}
