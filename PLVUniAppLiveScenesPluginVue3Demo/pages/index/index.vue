<template>
  <view class="content">
    <view class="tab-select-view">
      <view
        class="tab-select-item"
        :class="{ 'tab-selected': playType === 0 }"
        @click="playType = 0"
      >
        直播
      </view>
      <view
        class="tab-select-item"
        :class="{ 'tab-selected': playType === 1 }"
        @click="playType = 1"
      >
        回放
      </view>
    </view>
    <view class="live-fill-view">
      <!-- 直播UI -->
      <view v-show="playType === 0">
        <input
          class="live-input"
          v-model="liveInfo.userId"
          placeholder="请输入用户ID"
        />
        <input
          class="live-input"
          v-model="liveInfo.channelId"
          placeholder="请输入频道ID"
        />
        <input
          class="live-input"
          v-model="liveInfo.appId"
          placeholder="请输入App ID"
        />
        <input
          class="live-input"
          v-model="liveInfo.appSecret"
          placeholder="请输入App Secret"
        />
      </view>
      <!-- 回放UI -->
      <view v-show="playType === 1">
        <input
          class="live-input"
          v-model="playbackInfo.userId"
          placeholder="请输入用户ID"
        />
        <input
          class="live-input"
          v-model="playbackInfo.channelId"
          placeholder="请输入频道ID"
        />
        <input
          class="live-input"
          v-model="playbackInfo.appId"
          placeholder="请输入App ID"
        />
        <input
          class="live-input"
          v-model="viewerData.viewerId"
          placeholder="请输入viewerId"
        />
        <input
          class="live-input"
          v-model="playbackInfo.appSecret"
          placeholder="请输入App Secret"
        />
        <input
          class="live-input"
          v-model="playbackInfo.vid"
          placeholder="请输入视频Vid"
        />
        <view class="uni-list-cell uni-list-cell-pd">
          <view class="uni-list-cell-db">点播列表</view>
          <switch @change="handleSwitchChange" />
        </view>
      </view>
    </view>

    <button class="login-button" type="primary" @click="setUserInfo">
      登录
    </button>

    <view class="tab-select-view">
      <view
        class="tab-select-item"
        :class="{ 'tab-selected': sceneType === 1 }"
        @click="sceneType = 1"
      >
        云课堂场景
      </view>
      <view
        class="tab-select-item"
        :class="{ 'tab-selected': sceneType === 2 }"
        @click="sceneType = 2"
      >
        直播带货场景
      </view>
    </view>
    <view v-if="errorMsg">错误信息：</view>
    <view>{{ errorMsg }}</view>

    <view>powered by Vue3</view>
  </view>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { PLVLiveScenesPluginHelper } from "../../tools/plv-live-scense-plugin-helper";

const plugin = PLVLiveScenesPluginHelper();

const sceneType = ref(1); //场景类型 1云课堂场景, 2直播带货场景
const playType = ref(0); //播放类型 0直播，1回放
const isVideoList = ref(0); //回放中是否进入回放列表0回放视频 1回放列表
const errorMsg = ref("");

const liveInfo = reactive({
  channelId: "",
  userId: "",
  appId: "",
  appSecret: "",
});

const playbackInfo = reactive({
  channelId: "",
  userId: "",
  appId: "",
  appSecret: "",
  vid: "",
});

// 配置直播间用户信息
const viewerData = reactive({
  viewerId: "", //开发者自己用户系统的ID。如用户手机号码等唯一标识符
  viewerName: "UniappDemo用户",
  viewerAvatar:
    "https://img-cdn-qiniu.dcloud.net.cn/uploads/avatar/001/53/87/39_avatar_max.jpg",
});

watch(playType, () => {
  errorMsg.value = "";
});

const handleSwitchChange = (event) => {
  isVideoList.value = event.detail.value ? 1 : 0;
};

const iosLonOutRoom = () => {
  // iOS端退出直播间
  plugin.logoutRoomMessage((res) => {
    console.log("退出房间", res);
  });
};

// 设置多场景的账号属性
const setUserInfo = async () => {
  const configInfo = playType.value === 0 ? liveInfo : playbackInfo;
  // 当为直播或者没有填写时，默认给随机数
  if (!viewerData.viewerId) {
    viewerData.viewerId = new Date().getTime().toString();
  }
  try {
    // 初始化插件服务
    await plugin.initService({
      viewerId: viewerData.viewerId,
      viewerName: viewerData.viewerName,
      viewerAvatar: viewerData.viewerAvatar,
    });
    await plugin.setUserInfo({
      appId: configInfo.appId,
      userId: configInfo.userId,
      appSecret: configInfo.appSecret,
    });
    iosLonOutRoom();
    startLive();
  } catch (error) {
    errorMsg.value = error;
    uni.showModal({
      title: "发生错误",
      content: error,
    });
    console.error(error);
  }
};

const startLive = async () => {
  console.log("Start live  " + JSON.stringify(liveInfo), playType.value);
  try {
    if (playType.value === 0) {
      // 直播
      await plugin.loginLiveRoom({
        sceneType: sceneType.value,
        channelId: liveInfo.channelId,
      });
      uni.showToast({
        title: "login succeed",
        icon: "none",
      });
      return;
    }

    // 回放
    await plugin.loginPlaybackRoom({
      sceneType: sceneType.value,
      channelId: playbackInfo.channelId,
      videoId: playbackInfo.vid,
      vodType: isVideoList.value,
    });
  } catch (error) {
    errorMsg.value = error;
    uni.showModal({
      title: "发生错误",
      content: error,
    });
    console.error(error);
  }
};
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  margin-top: 10rpx;
  padding: 0rpx 20rpx;
}

.tab-select-view {
  display: flex;
  width: 100%;
}

.tab-select-item {
  flex: 0.5;
  padding: 20rpx 0;
  text-align: center;
  color: white;
  background-color: #a8d6f8;
}

.tab-select-item.tab-selected {
  background-color: #2b98f0;
}

.live-fill-view {
  padding: 10rpx 0;
  width: 100%;
}

.live-input {
  min-height: 35px;
  height: 35px;
  border-bottom: 1px solid #cccccc;
  font-size: 14px;
  padding-top: 10rpx;
}

.login-button {
  padding: 0 250rpx;
  margin: 30rpx;
}

.uni-list-cell {
  position: relative;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -webkit-flex-direction: row;
  flex-direction: row;
  -webkit-box-pack: justify;
  -webkit-justify-content: space-between;
  justify-content: space-between;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  padding: 20rpx 0;
}

.uni-list-cell::after {
  position: absolute;
  z-index: 3;
  right: 0;
  bottom: 0;
  left: 15px;
  height: 1px;
  content: "";
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  background-color: #c8c7cc;
}
</style>
