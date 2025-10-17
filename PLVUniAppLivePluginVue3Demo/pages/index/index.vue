<template>
	<view class="uni-container">
		<view class="uni-panel" v-for="(item, index) in list" :key="item.id">
			<view class="uni-panel-h uni-panel-h-text-center" :class="item.open ? 'uni-panel-h-on' : ''" @click="triggerCollapse(index)">
				<text class="uni-panel-text">{{item.name}}</text>
			</view>
		</view>
		<view style="text-align: center;">powered by Vue3</view>
	</view>
</template>
<script setup>
import { ref } from 'vue';

const list = ref([{
	id: 'live-watch',
	name: '手机开播',
	open: false,
	url: '/pages/index/live-streamer'
},
{
	id: 'live-streamer',
	name: '云直播观看',
	open: false,
	url: '/pages/index/live-watch'
}]);

const triggerCollapse = (index) => {
	if (!list.value[index].pages) {
		goDetailPage(list.value[index].url);
		return;
	}
	for (var i = 0; i < list.value.length; ++i) {
		if (index === i) {
			list.value[i].open = !list.value[index].open;
		} else {
			list.value[i].open = false;
		}
	}
};

const goDetailPage = (url) => {
	uni.navigateTo({
		url
	});
};
</script>

<style>
	.uni-container {
		padding: 20rpx;
	}
	.uni-panel-h-text-center {
		text-align: center;
		background-color: #2B98F0;
		padding: 20rpx 0;
		border-radius: 8px;
		margin-bottom: 20rpx;
	}
	.uni-panel-text {
		color: white;
		font-size: 18px;
	}
</style>
