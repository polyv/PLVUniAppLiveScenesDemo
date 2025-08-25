<template>
	<view>此处为uniapp指定测试页面</view>
	<view>接收到的页面参数： </view>
	<view>{{ optionsText }}</view>
</template>

<script setup>
	import { onLoad } from "@dcloudio/uni-app";
	import { ref } from "vue"
	const optionsText = ref('')
	onLoad((options) => {
	  console.log("test Page Show");
	  console.log("指定页面接受参数为:", options);
	  optionsText.value = JSON.stringify(options)
	});
</script>

<style>
</style>