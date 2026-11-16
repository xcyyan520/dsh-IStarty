# dsh-IStarty

鲸醒·上电 —— 精简版 DSH 启动动画插件。

从 [dsh-boot-suite](https://github.com/LeeRolling/dsh-boot-suite) 2.16.13 中**只切出开机动画**这一半，
砍掉聊天壁纸、模板商店、更新器、模板编辑器与背景音乐模块，做成一个能自己维护的插件。

## 为什么有它

原插件把「开机动画」和「聊天壁纸」打包在同一个包里。壁纸半侧每 1.5 秒采一次壁纸亮度
（`setInterval(refreshContrast, 1500)`）、用 `MutationObserver` 盯着 `documentElement`/\`body\` 的每次属性变化、
还整体覆盖 DSH 主题 CSS 变量。开机动画本身只在首屏跑一次 rAF 时间线，跟这些轮询无关——
所以把壁纸半侧摘掉，开机动画一点都不少，设置页的常驻负担却没了。

## 保留了什么

| 能力 | 位置 |
| --- | --- |
| 首屏注入（style/html/script 行 + tapIndex 兜底） | `lib/host-startup.js` |
| 时间线渲染引擎（分幕 + 关键帧 + 特效） | `lib/splash.js` / `lib/splash.css` |
| 模板校验 | `lib/security.js` |
| 设置页「启动动画」分区 | `lib/client.js`（`__bootHalf`） |
| 自带动画 | `templates/archive-warm`、`templates/whale-girl-scan`、`templates/whale-wake` |
| 内置音色与音效 | `lib/assets/voices/`（f..k 六套）、`sfx-tick.mp3`、`sfx-ticks-run.mp3` |

宿主路由只剩 9 条，全在 `/dsh-startup` 下：
`/splash.css`、`/splash.js`、`/asset`、`/voices`、`/voice`、`/template-asset`、`/config`、`/templates`、`/diag`。

## 砍掉了什么

- **聊天壁纸半侧**（`host-wallpaper.js`，36 KB + client 半侧 1.4 千行）：卡顿的主要来源。
- **模板编辑器**（/editor、/editor/draft、/editor/preview、/templates/save、/template-assets/upload）
- **自定义动画导入**（/import-animation）
- **模板商店**（/store、/store/install，以及 GitHub raw 外网依赖）
- **更新器**（/update-check、/update-browser-download、/update-watch-download、/update-download、/update-upload、/update-apply）
- **背景音乐**（/music/list、/music/file、/music/upload、/music/delete，以及设置页的波形编辑器）
- **诊断与模板页**（/diagnose、/preview-template、/idcard、/template-file、/frame-session、/template-frame）
- `templates/` 由 33 MB / 23 个精简为 8.1 MB / 3 个。

## 装了怎么用

```bash
dsh plugin --profile web add link:<本目录绝对路径>
```

重启 `dsh web` 后，设置 → 启动动画：

- **启动动画第一幕** 下拉里，`whale-wake` 显示为「鲸醒·上电 · 本地」，内置的「档案暖白」等也都在，随时切。
- **启动动画第二幕** 选「不播放」可让第一幕结束直接进聊天。

配置在 `$DSH_HOME/dsh-startup.json`（与旧插件同址同格式，迁移不用改）：

```json
{ "template": "whale-wake", "act2": "", "transitionIn": "dissolve", "transitionOut": "dissolve", "transitionMs": 600 }
```

## 模板

模板目录查两次，**用户目录优先**（同名覆盖内置）：

1. `<本插件>/templates/<id>/`
2. `$DSH_HOME/startup-templates/<id>/`

没装进 `templates/` 的模板，只要丢进 `~/.dsh/startup-templates/<id>/` 就能在这个插件的下拉里看到，
标「· 本地」。模板是纯数据 JSON（schemaVersion 1 分幕 / 2 时间线图层），资产放同目录 `assets/`，文件名要过白名单
`/^[a-z0-9][a-z0-9._-]{0,40}\.(mp3|wav|ogg|m4a|aac|png|jpe?g|webp|gif|svg|json|mp4|webm)$/i`。

## 自带模板 whale-wake（鲸醒·上电）v7.3

18.2 秒，16 图层 / 16 特效，一套「逐级对焦」的时间线：

- **0 – 11.3s 逐渐显现**：rv0→rv1→rv2→still 四档清晰度叠在同一位置交叉溶解，
  共用同一条 scale 1.17→1.0 的轨道，所以读作「焦点一路拉实」，而不是某块东西被移开。
- **标题是预渲染图像，不是文字层**：引擎的文字层只能取系统字体链（`--dsu-din`），
  中文写 `weight:700` 也压不出重体。所以「我已启动」四个字用 Noto Sans SC 的 **Black**
  字重离屏烘成 WebP（`assets/title-0..3.webp`），带白→浅蓝纵向渐变、左右各 7px 的
  蓝/红色差边缘、外圈蓝辉，落在**下三分之一**（舞台 y≈604），不压脸也不挡主体。
  逐字错开 100ms、从中心向外推开落位；底下垫一条**全宽渐隐带**（`shade` 层，
  `linear-gradient(to top, rgba(1,5,14,.78), transparent)`，无硬边），保证字压在亮部上也读得清。
- **收尾是掉电，不是整屏变灰**：字幕 17.4s 先退 → 画面按指数衰减（1.0 → 0.90 → 0.68 → 0.40 → 0.13 → 0）
  → 雾与光柱慢一拍跟到 18.2s → **只留两点星芒**活到最后一帧，交给引擎自带的 620ms 交棒淡出。
  v6.1 之前所有图层朝同一个时间点收，观感是「整屏一起灰掉」，这一版拆成了先后层次。
- 结尾亮度曲线实测：16.2s 36 → 17.6s 31 → 18.0s 21 → 18.15s 9，是单调平滑衰减，没有断崖。

改版记：v6.4.x 试过直接调文字层的字号/字重/字距，中文始终撑不起画面；
v7.0 一度把标题放在画面正中并加了柔暗底板，观感是「一块板挡住人」——已废弃；
v7.2 换成图像字 + 下三分之一；v7.3 补上渐隐带解决亮部吃字。

## 相对 2.16.13 修的两个缺陷

1. `lib/splash.js`：`window.__DSH_STARTUP_TEMPLATE__` 缺失时 `TEMPLATE` 为 `null`，
   旧代码 `Array.isArray(TEMPLATE.gates)` 会抛 `TypeError: Cannot read properties of null (reading 'gates')`，
   动画直接揭幕。已改为先判空。
2. `lib/host-startup.js` 的 tapIndex 兜底通道旧代码只下发 `__DSH_STARTUP__` 配置，不下发
   `__DSH_STARTUP_TEMPLATE__` / `__DSH_STARTUP_TEMPLATE2__`，走兜底时退化成空分幕、立刻揭幕。
   已补上模板下发。

## 许可

本插件是从 MIT 许可的 dsh-boot-suite 裁剪而来，沿用 MIT。
`templates/whale-girl-scan` 的上游素材见该目录内 `NOTICE.md`（NativeDog1/dsh-boot-animation，BSD-3-Clause）。
`templates/whale-wake` 为本机自制。
