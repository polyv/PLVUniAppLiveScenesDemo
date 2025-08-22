<script setup>
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { nextTick } from "vue";
console.log("Setup Mode is active");

onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  const args = plus.runtime.arguments;
  console.log("App Show");
  console.log("App Arguments:", args);
  if (args) {
    // 提取路径部分
    const match = args.match(/:\/\/(.+)$/);
    console.log("获取路径：", `/${match[1]}`);
    if (match.length) {
      uni.navigateTo({
        url: `/${match[1]}`,
      });
    }
  }
});
onHide(() => {
  console.log("App Hide");
});
</script>

<style>
/*每个页面公共css */
</style>
