/**
 * dsh-IStarty — 宿主半侧
 * ---------------------------------------------------------------------------
 * 只保留开机动画：/dsh-startup/* 路由 + index.html 首屏注入。
 *
 * 相比 dsh-boot-suite 2.16.13 砍掉了整条聊天壁纸半侧（host-wallpaper.js）、
 * 模板商店、更新器、模板编辑器与背景音乐模块——那些是设置页卡顿和空转的来源。
 *
 * 配置仍读 $DSH_HOME/dsh-startup.json，与旧插件同址，迁移不用改设置。
 */
import * as startup from './host-startup.js'

const name = 'dsh-IStarty'
const inject = ['webServer', 'connection']

function apply(ctx) {
  startup.apply(ctx)
}

/* 具名导出给 cordis-plugin-loader（它取 exports.default ?? exports）。
   两边都指向同一个对象，无论走哪条路结果一致。 */
const plugin = { name, inject, apply }
export { apply, inject, name }
export default plugin
