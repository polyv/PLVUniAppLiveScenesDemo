/**
 * 原生插件相关常量与名称映射
 * 将不同能力（观看 / 主播）所需的原生模块名称集中管理，便于维护与复用。
 */

export const enum PluginType {
  /** 纯观看插件 */
  LiveScenesPlugin = "PLV-LiveScenesPlugin",
  /** 观看 + 开播复合插件 */
  LiveScenesHostPlugin = "PLV-LiveUniPlugin",
}

/**
 * 不同插件类型对应需要绑定的原生模块名称。
 * 使用 const 断言保证字面量类型，方便后续在 TS 中获得精确字符串类型。
 */
export const PluginModuleNames = {
  [PluginType.LiveScenesPlugin]: {
    watchPlay: `${PluginType.LiveScenesPlugin}-PlayModule`,
    watchConfig: `${PluginType.LiveScenesPlugin}-ConfigModule`,
  },
  [PluginType.LiveScenesHostPlugin]: {
    streamerConfig: `${PluginType.LiveScenesHostPlugin}-StreamerConfigModule`,
    streamerPlay: `${PluginType.LiveScenesHostPlugin}-StreamerLiveModule`,
    viewerConfig: `${PluginType.LiveScenesHostPlugin}-WatchConfigModule`,
    viewerPlay: `${PluginType.LiveScenesHostPlugin}-WatchPlayModule`,
  },
} as const;

export type PluginModuleGroup = typeof PluginModuleNames;
