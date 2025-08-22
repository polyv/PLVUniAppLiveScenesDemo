# PLVUniAppLiveScenesPluginDemo

您只需要确保在 hbuilder 中选择了 [保利威云直播原生 SDK-视频直播聊天互动-直播播放器插件](https://ext.dcloud.net.cn/plugin?id=5307) 和 [Polyv 播放器插件](https://ext.dcloud.net.cn/plugin?id=4798) 两个原生插件以后使用`plv-live-scense-plugin-helper`提供的方法即可。

## plv-live-scense-plugin-helper

本文档介绍了如何使用 `PLVUniAppLiveScenesPlugin` 插件。该插件封装了保利威直播和回放的核心功能。

## 快速开始

### 1. 引入插件

在使用插件之前，需要先引入 `PLVLiveScenesPluginHelper`。

```javascript
import { PLVLiveScenesPluginHelper } from "./tools/plv-live-scense-plugin-helper.js";
```

### 2. 实例化插件

创建插件实例，后续所有操作都通过该实例进行。

```javascript
const plugin = PLVLiveScenesPluginHelper();
```

## API 文档

### `initService(options)`

初始化插件服务。在使用其他功能之前，必须先调用此方法。

**参数 `options`**:

| 参数名         | 类型   | 必填 | 描述                                          |
| -------------- | ------ | ---- | --------------------------------------------- |
| `viewerId`     | String | 是   | 观看者 ID，用于唯一标识用户，例如用户手机号。 |
| `viewerName`   | String | 是   | 观看者昵称。                                  |
| `viewerAvatar` | String | 是   | 观看者头像 URL。                              |
| `code`         | String | 否   | 跑马灯配置代码（可选）。                      |

**示例**:

```javascript
await plugin.initService({
  viewerId: "user001",
  viewerName: "UniappDemo用户",
  viewerAvatar: "https://example.com/avatar.jpg",
});
```

### `setUserInfo(options)`

设置用户账号信息。在 `initService` 之后，进入直播间或回放前调用。

**参数 `options`**:

| 参数名      | 类型   | 必填 | 描述                                  |
| ----------- | ------ | ---- | ------------------------------------- |
| `appId`     | String | 是   | 开发者在保利威平台申请的 App ID。     |
| `userId`    | String | 是   | 开发者在保利威平台申请的 User ID。    |
| `appSecret` | String | 是   | 开发者在保利威平台申请的 App Secret。 |

**示例**:

```javascript
await plugin.setUserInfo({
  appId: "YOUR_APP_ID",
  userId: "YOUR_USER_ID",
  appSecret: "YOUR_APP_SECRET",
});
```

### `loginLiveRoom(options)`

登录并进入直播房间。

**参数 `options`**:

| 参数名      | 类型   | 必填 | 描述                                     |
| ----------- | ------ | ---- | ---------------------------------------- |
| `sceneType` | Number | 是   | 场景类型：`1` 为云课堂，`2` 为直播带货。 |
| `channelId` | String | 是   | 频道的唯一标识 ID。                      |

**示例**:

```javascript
await plugin.loginLiveRoom({
  sceneType: 1, // 云课堂场景
  channelId: "YOUR_CHANNEL_ID",
});
```

### `loginPlaybackRoom(options)`

登录并进入回放房间。

**参数 `options`**:

| 参数名      | 类型   | 必填 | 描述                                           |
| ----------- | ------ | ---- | ---------------------------------------------- |
| `sceneType` | Number | 是   | 场景类型：`1` 为云课堂，`2` 为直播带货。       |
| `channelId` | String | 是   | 频道的唯一标识 ID。                            |
| `videoId`   | String | 是   | 视频的 Vid。                                   |
| `vodType`   | Number | 是   | 回放类型：`0` 为单个视频回放，`1` 为回放列表。 |

**示例**:

```javascript
await plugin.loginPlaybackRoom({
  sceneType: 1,
  channelId: "YOUR_CHANNEL_ID",
  videoId: "YOUR_VIDEO_ID",
  vodType: 0, // 单个视频回放
});
```

### `logoutRoomMessage(callback)`

注册一个回调函数，当用户退出房间时（目前仅支持 iOS）会触发。

**参数 `callback`**:

| 参数名 | 类型     | 必填 | 描述                       |
| ------ | -------- | ---- | -------------------------- |
| `res`  | Function | 是   | 退出房间后执行的回调函数。 |

**示例**:

```javascript
plugin.logoutRoomMessage((res) => {
  console.log("已退出房间", res);
});
```

## 完整使用流程

一个典型的使用流程如下：

1. **引入并实例化插件**。
2. 调用 `initService` **初始化服务**。
3. 调用 `setUserInfo` **设置用户信息**。
4. 根据需要调用 `loginLiveRoom` 或 `loginPlaybackRoom` **进入直播或回放**。

```javascript
import { PLVLiveScenesPluginHelper } from "./tools/plv-live-scense-plugin-helper.js";

const plugin = PLVLiveScenesPluginHelper();

async function start() {
  try {
    // 1. 初始化服务
    await plugin.initService({
      viewerId: "user001",
      viewerName: "Demo用户",
      viewerAvatar: "https://example.com/avatar.jpg",
    });

    // 2. 设置用户信息
    await plugin.setUserInfo({
      appId: "YOUR_APP_ID",
      userId: "YOUR_USER_ID",
      appSecret: "YOUR_APP_SECRET",
    });

    // 3. 登录直播间
    await plugin.loginLiveRoom({
      sceneType: 1,
      channelId: "YOUR_CHANNEL_ID",
    });

    console.log("登录成功");
  } catch (error) {
    console.error("发生错误:", error);
  }
}

start();
```
