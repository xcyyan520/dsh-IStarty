/* ============================================================================
 * dsh-startup-screen — Host 半侧
 * ----------------------------------------------------------------------------
 * 做三件事：
 *   1) 在 index.html 里注入「启动界面」：首屏兜底黑幕 + 关键 CSS + 配置 + 运行时
 *   2) 提供 /dsh-startup/splash.css · splash.js · config 三个路由
 *   3) 把配置持久化到 ~/.dsh/dsh-startup.json（设置页经 /dsh-startup/config 读写）
 *
 * 说明：配置刻意不走 settings 命名空间，而是自带一份 JSON + 自带设置面板
 * （与 dsh-meme 同款做法），这样不受 dsh-settings 版本变更影响。
 * ========================================================================== */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { safeDecodeURIComponent, validateTemplate, guardDecision } from './security.js'

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
const CONFIG_FILE = path.join(DSH_HOME, 'dsh-startup.json')
const VOICE_ROOT = path.join(PACKAGE_ROOT, 'lib', 'assets', 'voices')
/* 音色包清单由 lib/assets/voices/manifest.json 描述（随安装包发布）。
   读不到就当作没有扩展音色，内置音色不受影响。 */
const VOICE_PACKS = (() => {
  try {
    const list = JSON.parse(fs.readFileSync(path.join(VOICE_ROOT, 'manifest.json'), 'utf8'))
    if (!Array.isArray(list)) return []
    return list.filter((v) => v && /^[a-z]$/.test(String(v.id)) && (v.lang === 'en' || v.lang === 'ja'))
      .map((v) => ({ id: String(v.id), name: String(v.name || '').slice(0, 12) || ('音色 ' + String(v.id).toUpperCase()), lang: v.lang }))
  } catch (err) { return [] }
})()
const VOICE_PACK_IDS = [...VOICE_PACKS.map((v) => v.id)]

const NS = 'dsh-startup-screen'
const ROUTE_BASE = '/dsh-startup'

/* 首屏注入走的是哪条通道？桌面端（file:// + IPC）与服务端渲染（tapIndex）
   行为不同，出问题时光看现象分不清。这里留一条极轻的诊断：每次挑注入
   通道就写一行日志，最多写 40 行，绝不因为写日志失败影响启动。 */
const DIAG_FILE = path.join(DSH_HOME, 'boot-suite-diag.log')
let diagBudget = 160
let dumpBudget = 3
function diag(line) {
  if (diagBudget <= 0) return
  diagBudget--
  try { fs.appendFileSync(DIAG_FILE, new Date().toISOString() + '  ' + line + '\n', 'utf8') } catch (err) { /* 忽略 */ }
}

/* 把实际下发到浏览器的 index.html 落盘（前 3 次）。出黑屏时这是唯一能证明
   "注入到底进没进去" 的证据。 */
function dumpHtml(html) {
  if (dumpBudget <= 0 || typeof html !== 'string') return
  dumpBudget--
  try { fs.writeFileSync(path.join(DSH_HOME, 'boot-suite-diag-html-' + (dumpBudget + 1) + '.html'), html, 'utf8') } catch (err) { /* 忽略 */ }
}

/** 插件版本：读自己的 package.json，避免源码与版本号两处各写一份。
    读不到就退回占位符（设置页会显示它，不会显示 undefined）。 */
const PLUGIN_VERSION = (() => {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'))
    const v = String(pkg.version || '').trim()
    return v || '0.0.0'
  } catch (err) {
    return '0.0.0'
  }
})()

/** 默认配置：字段与 lib/splash.js 的 DEFAULTS 一一对应。 */
const DEFAULTS = {
  enabled: true,
  mode: 'session',            // always | session | daily
  theme: 'light',             // light | dark
  speed: 1,
  requireInteraction: true,
  allowSkip: true,
  sound: true,                // 界面音效（WebAudio 合成，无音频文件）
  soundVolume: 0.5,
  bedNoise: false,             // 背景底噪（硬盘嗡鸣）：默认关，用户明确打开才铺
  voice: true,                // 女声播报（Web Speech API）
  voiceLang: 'en',            // en | zh | both
  voiceName: '',              // '' = 自动挑（按分数优先神经网络女声）
  voiceRate: 0.88,            // 电影旁白档：比朗读慢，字与字之间才有重量
  voicePitch: 0.85,           // 压低音调，深沉的 AI 女声
  voiceVolume: 0.9,
  voiceCue: true,             // 念台词前的一声轻提示
  sfx: 'audio',               // 音效来源：audio=lib/assets 里的真素材 / synth=现场合成
  voiceSource: 'asset',       // 语音来源：asset=优先用真声素材（拿不到自动回落 TTS）/ tts=全 TTS
  voicePack: 'f',       // 配音音色：f..k=音色包（默认 F 英文）；用户在设置里可换
  voiceFx: 'robot',           // 声音效果：none | ai-mech | robot | radio | oldtv | dark（默认机器人，贴近旧版听感）
  voiceLead: 240,             // 提示音之后留一小段空白再开口
  welcomeDelay: 550,          // 05→06 过场和声钟之后等多久再进终幕欢迎语（0–3000ms；实测 550 最顺）
  /* v2.15.0：iframe 启动模板（division-bigfish-codex）专属文案覆盖；空串 = 用模板自带的 config.js */
  bigfishUsername: '',
  bigfishTitle: '',
  bigfishDesc: '',
  bigfishForceEgg: false,     // 仅下一次启动：强制判定掉线彩蛋（便于测试）
  bigfishVoiceFx: 'none',    // 全景大肥鱼模板内五句配音的效果：none|ai-mech|robot|radio|oldtv|dark
  bigfishVoiceVolume: 50,       // 全景大肥鱼模板内五句配音的音量（0–100，默认 50%）
  identity: 'JOYCE MOORE',    // ← 设置页里可改的「身份名称」
  identityId: '0087',
  accessLevel: '3',
  brand1: 'DEEPSEEK',
  brand2: 'SYNTHESIZE INTELLIGENCE',
  brand3a: 'HARNESS',
  brand3b: 'OS',
  orgZh: '深度求索',
  orgEn: 'DEEPSEEK',
  orgSub: 'DEEPSEEK HARNESS',
  welcomeBox: 'DEEPSEEK HARNESS',
  footer: 'POWERED BY DEEPSEEK',
  accent: '#ff7500',
  glitchA: '#ff3b30',
  glitchB: '#2971b8',
  template: 'archive-warm',   // 第一幕默认：档案暖白
  act2: 'whale-girl-scan',    // 第二幕默认：鲸鱼娘扫描睁眼（2K）；另有 whale-girl-scan-4k；'' = 不播
  /* v2.16.7：视频原声（第一幕 / 第二幕分开控制；默认静音） */
  act1VideoSound: false,
  act2VideoSound: false,
  /* v2.12.0 三段转场：第一幕入场 / 两幕衔接 / 第二幕退场。默认全部交叉叠化。 */
  transitionIn: 'dissolve',
  transitionJoin: 'dissolve',
  transitionOut: 'dissolve',
  transitionMs: 600,
  transitionDir: 'left',      // 仅 scanline / slide 使用：left|right|up|down
  hiddenTemplates: [],        // v2.12.4：被用户「隐藏」的内置模板 id 列表（本地模板删除走文件）
  testTemplates: [],          // v2.14.0：被归到「测试类模板」的模板 id 列表（正式下拉不再显示）
  promotedTemplates: [],      // v2.14.0：被用户从测试类放回正式列表的模板 id 列表
  /* v2.14.0 用户自备 BGM：只读本机文件、不上传、不内置。三段 = 第一幕 / 第二幕(含终幕) / 结尾淡出 */
  bgmEnabled: false,
  bgmLoop: true,                  // 整体循环；关掉后拍速/拍数/选段不再参与，整首只播一遍
  bgmFile: '',                // 主音乐（存于 ~/.dsh/startup-music 的文件名）
  bgmFile2: '',               // 第二段换曲；'' = 同主音乐
  bgmVolume: 0.5,
  bgmBpm: 100,                // 拍速（只用于算选段时长）
  bgmBeats1: 16,              // 第一段拍数（选段时长 = 拍数 * 60 / BPM）
  bgmBeats2: 32,              // 第二段拍数
  bgm1Start: 0,               // 第一段在音频中的起点（秒）
  bgm2Start: 0,               // 第二段起点（秒）
  bgm1FadeIn: 1,              // 第一段淡入（秒）
  bgm1FadeOut: 1,             // 第一段淡出（到第二段前，秒）
  bgm2FadeIn: 1,              // 第二段淡入（秒）
  bgm2FadeOut: 2,             // 第二段/结束淡出（秒）
  bgmCrossfade: 1200,         // 两段交叉时长（毫秒）
  bgm2Loop: false,            // 第二段是否循环
  bgmDuck: true               // 配音时自动降低音乐（闪避）
}

const TEXT_KEYS = [
  'template', 'act2',
  'identity', 'identityId', 'accessLevel',
  'brand1', 'brand2', 'brand3a', 'brand3b',
  'orgZh', 'orgEn', 'orgSub', 'welcomeBox', 'footer', 'voiceName'
]
const COLOR_KEYS = ['accent', 'glitchA', 'glitchB']
const TRANSITION_TYPES = ['dissolve', 'flash', 'glitch', 'scanline', 'slide', 'iris', 'black', 'none']
const TRANSITION_DIRS = ['left', 'right', 'up', 'down']
const ENUMS = {
  mode: ['always', 'session', 'daily'],
  theme: ['light', 'dark'],
  voiceLang: ['en', 'zh', 'both'],
  sfx: ['audio', 'synth'],
  voiceSource: ['asset', 'tts'],
  voicePack: VOICE_PACK_IDS,
  voiceFx: ['none', 'ai-mech', 'robot', 'radio', 'oldtv', 'dark'],
  transitionIn: TRANSITION_TYPES,
  transitionJoin: TRANSITION_TYPES,
  transitionOut: TRANSITION_TYPES,
  transitionDir: TRANSITION_DIRS
}
const BOOL_KEYS = ['enabled', 'requireInteraction', 'allowSkip', 'sound', 'bedNoise', 'voice', 'voiceCue', 'bgmEnabled', 'bgmLoop', 'bgm2Loop', 'bgmDuck', 'act1VideoSound', 'act2VideoSound']
/** 数值字段的合法区间（越界即夹取）。 */
const RANGES = {
  welcomeDelay: [0, 3000],
  speed: [0.35, 3],
  transitionMs: [200, 2000],
  soundVolume: [0, 1],
  voiceRate: [0.5, 2],
  voiceLead: [0, 1200],
  voicePitch: [0, 2],
  voiceVolume: [0, 1],
  bgmVolume: [0, 1],
  bgmBpm: [40, 220],
  bgmBeats1: [4, 128],
  bgmBeats2: [4, 128],
  bgm1Start: [0, 7200],
  bgm2Start: [0, 7200],
  bgm1FadeIn: [0, 10],
  bgm1FadeOut: [0, 10],
  bgm2FadeIn: [0, 10],
  bgm2FadeOut: [0, 10],
  bgmCrossfade: [0, 5000],
  bigfishVoiceVolume: [0, 100]
}

function normalize(input) {
  const out = { ...DEFAULTS }
  const src = input && typeof input === 'object' ? input : {}
  for (const key of Object.keys(DEFAULTS)) {
    if (!(key in src) || src[key] === undefined || src[key] === null) continue
    const value = src[key]
    if (BOOL_KEYS.includes(key)) {
      out[key] = value === true || value === 'true' || value === 1 || value === '1'
    } else if (ENUMS[key]) {
      out[key] = ENUMS[key].includes(value) ? value : DEFAULTS[key]
    } else if (key === 'speed' || RANGES[key]) {
      const [lo, hi] = RANGES[key] || RANGES.speed
      const n = Number(value)
      out[key] = Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : DEFAULTS[key]
    } else if (COLOR_KEYS.includes(key)) {
      const s = String(value).trim()
      out[key] = /^#[0-9a-fA-F]{3,8}$/.test(s) ? s : DEFAULTS[key]
    } else if (TEXT_KEYS.includes(key)) {
      out[key] = String(value).slice(0, 64)
    } else {
      out[key] = value
    }
  }
  const tplIdOk = (x) => typeof x === 'string' && /^[a-z0-9][a-z0-9-]{0,39}$/.test(x)
  out.hiddenTemplates = Array.isArray(src.hiddenTemplates)
    ? [...new Set(src.hiddenTemplates.filter(tplIdOk))].slice(0, 60)
    : []
  out.testTemplates = Array.isArray(src.testTemplates)
    ? [...new Set(src.testTemplates.filter(tplIdOk))].slice(0, 200)
    : []
  out.promotedTemplates = Array.isArray(src.promotedTemplates)
    ? [...new Set(src.promotedTemplates.filter(tplIdOk))].slice(0, 200)
    : []
  if (!String(out.identity).trim()) out.identity = DEFAULTS.identity
  if (!String(out.identityId).trim()) {
    out.identityId = String(out.identity).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
  }
  if (!String(out.identityId).trim()) out.identityId = 'OPERATOR'
  /* 第一幕没有“不播放”语义：空串 = 内置档案暖白。归一化时就补默认值，
     否则设置页保存的 template:"" 会一路传到首屏注入，导致模板行缺失、动画秒退。 */
  if (!String(out.template || '').trim()) out.template = DEFAULTS.template
  return out
}

function readConfig() {
  try {
    const rawText = fs.readFileSync(CONFIG_FILE, 'utf8')
    const raw = JSON.parse(rawText)
    const cfg = normalize(raw)
    /* 老配置里没有 act2：保持单幕，避免升级后突然多播一段 */
    if (!Object.prototype.hasOwnProperty.call(raw, 'act2')) cfg.act2 = ''
    return cfg
  } catch (err) {
    return { ...DEFAULTS }
  }
}

function writeConfig(next) {
  const cfg = normalize(next)
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
  const tmp = CONFIG_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(cfg, null, 2), 'utf8')
  fs.renameSync(tmp, CONFIG_FILE)
  return cfg
}

/** 静态文件按 mtime 缓存，改完插件刷新页面即生效。 */
function makeReader(rel) {
  let cache = null
  return function read() {
    const file = path.join(PACKAGE_ROOT, rel)
    try {
      const st = fs.statSync(file)
      if (!cache || cache.mtimeMs !== st.mtimeMs) {
        cache = { mtimeMs: st.mtimeMs, text: fs.readFileSync(file, 'utf8') }
      }
      return cache.text
    } catch (err) {
      return ''
    }
  }
}

const readSplashCss = makeReader('lib/splash.css')
const readSplashJs = makeReader('lib/splash.js')

/** 内联脚本里绝对不能出现 `</script>`。 */
function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '')
}

/** 首屏兜底：在应用挂载前先把窗口盖住，避免闪出界面本体。 */
const CRITICAL_CSS = [
  'html.dsu-lock,html.dsu-lock body{overflow:hidden!important}',
  '#dsh-startup-root.dsu-boot{position:fixed;inset:0;z-index:2147483000;background:#000}',
  /* 参考 dsh-550c-boot 的做法：DSH 自己的开机卡片（[data-dsh-boot]，
     "HARNESS / Loading plugins…"）在文档解析阶段就按掉，别让它闪那一帧。
     只在插件接管期间隐藏，出错/关闭时不加 dsu-lock，卡片照常出现。 */
  'html.dsu-lock [data-dsh-boot]{display:none!important}'
].join('')

const BOOTSTRAP_JS = `(function(){try{
var c=window.__DSH_STARTUP__||{};
var root=document.getElementById('dsh-startup-root');
var off=!c.enabled;
if(!off&&c.mode==='session'&&sessionStorage.getItem('dsh-startup-screen:shown')==='1')off=true;
if(!off&&c.mode==='daily'&&localStorage.getItem('dsh-startup-screen:day')===new Date().toISOString().slice(0,10))off=true;
if(off){window.__DSH_STARTUP_SKIP__=true;if(root&&root.parentNode)root.parentNode.removeChild(root);}
else{
document.documentElement.classList.add('dsu-lock');
/* 桌面端标题栏：DSH preload 会造一个内联 background-color:var(--dsw-specific-sidebar-fill)
   的 span 探针，量完颜色用 IPC 让主进程重画 titleBarOverlay。这里在解析阶段就把探针
   改成透明 —— preload 的首次测量发生在 DOMContentLoaded，比这更晚，所以第一帧就是透明。
   片头结束时由 splash.js 移除这条样式，head 变动会触发 DSH 重新测量、还原原色。 */
if(!document.getElementById('dsh-startup-caption')){var st=document.createElement('style');st.id='dsh-startup-caption';st.textContent='body>span[style*="dsw-specific-sidebar-fill"]{background-color:transparent !important;color:#dfe7f3 !important}';document.head.appendChild(st);}/* 兜底：连 splash.js 都没跑起来（404/被拦/语法错）时，9 秒后无条件放行，绝不锁黑屏 */setTimeout(function(){try{var r=document.getElementById('dsh-startup-root');if(r&&r.className&&r.className.indexOf('dsu-boot')!==-1){if(r.parentNode)r.parentNode.removeChild(r);document.documentElement.classList.remove('dsu-lock');if(document.body)document.body.style.overflow='';window.__DSH_STARTUP_FAILED__=true;}}catch(e){}},9000);}
}catch(e){} })()`

const name = NS
const inject = ['webServer', 'connection']

/**
 * 取得 HTTP 载体服务。
 *
 * web profile 与桌面端（DeepSeek Harness Desktop）都会挂 `@deepseek-ai/dsh-web-app`，
 * 其中 `webserver` 这一行提供 `webServer`；但 Electron 也可能改成 `file://` + IPC
 * 直接下发前端（`dsh-host-webserver` 的文档注释就写着 "Electron uses file:// plus
 * IPC instead"）。那种情况下没有 webServer，本插件不该把一颗 fiber 炸掉 ——
 * 交给客户端半侧自举（`lib/client.js` 的 selfBoot）。
 */
function resolveWebServer(ctx) {
  try {
    const viaGet = typeof ctx.get === 'function' ? ctx.get('webServer') : undefined
    if (viaGet) return viaGet
  } catch (err) { /* 取不到就当没有 */ }
  return ctx.webServer
}

function hasRoutes(server) {
  /* 只要求 register：tapIndex 只是 web 部署的兜底通道，DSH 未来版本可能撤掉它，
     而注入行（webserver/index-inject）才是桌面端与静态部署都认的主通道。 */
  return !!server && typeof server.register === 'function'
}

function apply(ctx) {
  const disposers = []
  const webServer = resolveWebServer(ctx)

  /** 没有可注册路由的 HTTP 载体：桌面端若走 IPC 下发前端就是这种形态。
      什么都不注册（plugin 仍然 APPLIED，不报错），页面由客户端半侧自举。 */
  if (!hasRoutes(webServer)) {
    try {
      ctx.logger?.warn?.(
        '[' + NS + '] 当前 profile 没有可用的 webServer（桌面端可能用 file:// + IPC 下发前端）；' +
        'Host 半侧跳过路由与首屏注入，改由浏览器半侧自举启动界面。'
      )
    } catch (err) { /* 日志失败不影响加载 */ }
    return
  }

  /** 浏览器信任栅栏：自定义路由必须过一遍，否则可被任意网页读写。
      fail-closed：栅栏自身出错、或宿主没有 connection 服务时一律拒绝，绝不“放行兜底”。 */
  function rejected(req, res) {
    let code = null
    let failure = null
    try {
      const conn = (typeof ctx.get === 'function' ? ctx.get('connection') : undefined) || ctx.connection
      if (!conn || typeof conn.requestRejection !== 'function') {
        failure = new Error('connection guard unavailable')
      } else {
        code = conn.requestRejection(req)
      }
    } catch (err) {
      failure = err
    }
    if (failure) diag('trust guard fail-closed (' + String((failure && failure.message) || failure) + ') url=' + String((req && req.url) || ''))
    const decision = guardDecision(failure ? null : code, failure)
    if (!decision.reject) return false
    try {
      res.statusCode = decision.status
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.end(JSON.stringify({ ok: false, error: decision.reason || 'request rejected' }))
    } catch (err) { /* 响应对象已坏就放弃 */ }
    return true
  }

  function registerRoute(route) {
    const inner = route && route.handler
    /* 静态资源（splash.js/css、音效）不碰用户数据，不挂信任栅栏：
       桌面端 0.2.2 的 connection 服务不可用时，栅栏 fail-closed 会把
       script 请求一起拒掉，表现为 failed to load /dsh-startup/splash.js。 */
    if (route && route.guard === false) {
      const clean = Object.assign({}, route)
      delete clean.guard
      return webServer.register(clean)
    }
    const wrapped = Object.assign({}, route, {
      handler: async (req, res) => {
        if (rejected(req, res)) return
        return inner(req, res)
      }
    })
    return webServer.register(wrapped)
  }

  function sendJson(res, code, payload) {
    const body = Buffer.from(JSON.stringify(payload), 'utf8')
    res.writeHead(code, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Length': String(body.length)
    })
    res.end(body)
  }


  function readBody(req, limit = 64 * 1024) {
    return new Promise((resolve) => {
      let size = 0
      const chunks = []
      req.on('data', (c) => {
        size += c.length
        if (size > limit) {
          req.destroy()
          resolve('')
          return
        }
        chunks.push(c)
      })
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      req.on('error', () => resolve(''))
    })
  }

  function sendText(res, type, text) {
    const body = Buffer.from(text, 'utf8')
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-store',
      'Content-Length': String(body.length)
    })
    res.end(body)
  }

  disposers.push(registerRoute({
    kind: 'exact',
    guard: false,
    path: ROUTE_BASE + '/splash.css',
    handler: (req, res) => sendText(res, 'text/css; charset=utf-8', readSplashCss())
  }))

  disposers.push(registerRoute({
    kind: 'exact',
    guard: false,
    path: ROUTE_BASE + '/splash.js',
    handler: (req, res) => sendText(res, 'application/javascript; charset=utf-8', readSplashJs())
  }))

  /* 音频素材：从用户提供的音轨里抠出来的音效（选项/确认音）。
     只读、白名单、不含子路径 —— 杜绝目录穿越。素材缺失时浏览器会自动回落到合成音。 */
  disposers.push(registerRoute({
    kind: 'prefix',
    guard: false,
    path: ROUTE_BASE + '/asset',
    handler: (req, res) => {
      const decodedAsset = safeDecodeURIComponent((req.url || '').split('?')[0])
      if (decodedAsset === null) { res.writeHead(400); res.end(); return }
      const name = path.basename(decodedAsset)
      if (!/^[a-z0-9._-]+\.mp3$/i.test(name) || name.includes('..')) {
        res.writeHead(404); res.end(); return
      }
      const file = path.join(PACKAGE_ROOT, 'lib', 'assets', name)
      let bytes
      try { bytes = fs.readFileSync(file) } catch (err) {
        res.writeHead(404); res.end(); return
      }
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
        'Content-Length': String(bytes.length)
      })
      res.end(bytes)
    }
  }))

  /* 音色包：6 套扩展配音（英文 F + 日文 G–K）。设置页只拿 id/名称/语言，音频走只读白名单路由；
     id 与文件名都白名单，且不接受子路径 —— 和 /asset 同样防目录穿越。 */
  disposers.push(registerRoute({
    kind: 'exact',
    path: ROUTE_BASE + '/voices',
    handler: (req, res) => sendJson(res, 200, { ok: true, packs: VOICE_PACKS, default: 'f' })
  }))
  disposers.push(registerRoute({
    kind: 'prefix',
    path: ROUTE_BASE + '/voice',
    handler: (req, res) => {
      const decodedVoice = safeDecodeURIComponent(String(req.url || '').split('?')[0])
      if (decodedVoice === null) { res.writeHead(400); res.end(); return }
      const rest = decodedVoice.slice((ROUTE_BASE + '/voice').length).replace(/^\/+/, '')
      const parts = rest.split('/')
      const id = String(parts[0] || '')
      const name = String(parts[1] || '')
      if (!/^[a-z]$/.test(id) || !/^line-[1-6]\.mp3$/.test(name) || !VOICE_PACK_IDS.includes(id)) {
        res.writeHead(404); res.end(); return
      }
      let bytes
      try { bytes = fs.readFileSync(path.join(VOICE_ROOT, id, name)) } catch (err) { res.writeHead(404); res.end(); return }
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
        'Content-Length': String(bytes.length)
      })
      res.end(bytes)
    }
  }))

  /* 模板自带声音：/dsh-startup/template-asset/<模板id>/<文件名>
     先找用户目录 ~/.dsh/startup-templates/<id>/assets/，再找插件自带 templates/<id>/assets/。
     id 与文件名都过白名单，且不接受子路径 —— 模板作者塞不进来任意文件读取。 */
  /* 模板自带素材：音频 + 图片（身份卡头像之类） */
  const AUDIO_FILE_RE = /^[a-z0-9][a-z0-9._-]{0,40}\.(mp3|wav|ogg|m4a|aac|png|jpe?g|webp|gif|svg|json|mp4|webm)$/i
  disposers.push(registerRoute({
    kind: 'prefix',
    path: ROUTE_BASE + '/template-asset',
    handler: (req, res) => {
      const decodedTplAsset = safeDecodeURIComponent(String(req.url || '').split('?')[0])
      if (decodedTplAsset === null) { res.writeHead(400); res.end(); return }
      const rest = decodedTplAsset.slice((ROUTE_BASE + '/template-asset/').length)
      const parts = rest.split('/')
      const id = String(parts[0] || '')
      const name = String(parts[1] || '')
      if (!TEMPLATE_ID_RE.test(id) || !AUDIO_FILE_RE.test(name) || name.includes('..')) {
        res.writeHead(404); res.end(); return
      }
      const roots = [
        path.join(USER_TPL_ROOT, id, 'assets'),
        path.join(PACKAGE_ROOT, 'templates', id, 'assets')
      ]
      let bytes = null
      for (const root of roots) {
        const file = path.join(root, name)
        try {
          if (!fs.statSync(file).isFile() || !isFileInsideRoot(file, root)) continue
          bytes = fs.readFileSync(file)
          break
        } catch (err) { /* 换下一处 */ }
      }
      if (!bytes) { res.writeHead(404); res.end(); return }
      const type = /\.mp3$/i.test(name) ? 'audio/mpeg'
        : /\.wav$/i.test(name) ? 'audio/wav'
        : /\.(ogg|oga)$/i.test(name) ? 'audio/ogg'
        : /\.(m4a|aac)$/i.test(name) ? 'audio/mp4'
        : /\.png$/i.test(name) ? 'image/png'
        : /\.jpe?g$/i.test(name) ? 'image/jpeg'
        : /\.webp$/i.test(name) ? 'image/webp'
        : /\.gif$/i.test(name) ? 'image/gif'
        : /\.mp4$/i.test(name) ? 'video/mp4'
        : /\.webm$/i.test(name) ? 'video/webm'
        : /\.svg$/i.test(name) ? 'image/svg+xml'
        : /\.json$/i.test(name) ? 'application/json; charset=utf-8'
        : 'application/octet-stream'
      const rangeHeader = req.headers && req.headers.range
      if (rangeHeader && /\.(mp4|webm)$/i.test(name)) {
        const rm = /^bytes=(\d*)-(\d*)$/.exec(String(rangeHeader))
        if (rm) {
          let start = rm[1] ? parseInt(rm[1], 10) : 0
          let end = rm[2] ? parseInt(rm[2], 10) : bytes.length - 1
          if (start >= bytes.length) { res.writeHead(416, { 'Content-Range': 'bytes */' + bytes.length }); res.end(); return }
          if (end >= bytes.length) end = bytes.length - 1
          if (end < start) { res.writeHead(416, { 'Content-Range': 'bytes */' + bytes.length }); res.end(); return }
          const chunk = bytes.slice(start, end + 1)
          res.writeHead(206, {
            'Content-Type': type,
            'X-Content-Type-Options': 'nosniff',
            'Accept-Ranges': 'bytes',
            'Content-Range': 'bytes ' + start + '-' + end + '/' + bytes.length,
            'Content-Length': String(chunk.length),
            'Cache-Control': 'public, max-age=86400'
          })
          res.end(chunk)
          return
        }
      }
      const assetHeaders = {
        'Content-Type': type,
        'X-Content-Type-Options': 'nosniff',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': String(bytes.length)
      }
      /* 模板素材里的 SVG 如果被直接打开成文档，默认会执行内嵌脚本；只允许样式，禁脚本/外联。 */
      if (/.svg$/i.test(name)) assetHeaders['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; img-src data:"
      res.writeHead(200, assetHeaders)
      res.end(bytes)
    }
  }))

  disposers.push(registerRoute({
    kind: 'exact',
    path: ROUTE_BASE + '/config',
    handler: async (req, res) => {
      const method = (req.method || 'GET').toUpperCase()
      if (method === 'GET') {
        const cfgNow = readConfig()
        /* 顺带把当前模板的整份数据带上：设置页「立即预览」要先换掉运行时手里的模板再重播 */
        sendJson(res, 200, {
          ok: true, version: PLUGIN_VERSION, config: cfgNow, defaults: DEFAULTS, file: CONFIG_FILE,
          template: readTemplate(cfgNow.template),
          template2: readTemplate(cfgNow.act2)
        })
        return
      }
      if (method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'method not allowed' })
        return
      }
      const text = await readBody(req)
      let payload = {}
      try {
        payload = text ? JSON.parse(text) : {}
      } catch (err) {
        sendJson(res, 400, { ok: false, error: 'invalid json' })
        return
      }
      try {
        if (payload && payload.action === 'reset') {
          const cfgNow = writeConfig(DEFAULTS)
          sendJson(res, 200, { ok: true, version: PLUGIN_VERSION, config: cfgNow, defaults: DEFAULTS })
          return
        }
        const current = readConfig()
        const patch = payload && typeof payload.patch === 'object' && payload.patch ? payload.patch : payload
        const cfgNow = writeConfig({ ...current, ...patch })
        sendJson(res, 200, { ok: true, version: PLUGIN_VERSION, config: cfgNow, defaults: DEFAULTS })
      } catch (err) {
        sendJson(res, 500, { ok: false, error: String((err && err.message) || err) })
      }
    }
  }))

  /* ── 首屏注入：结构化注入行（主通道）+ 原始 tapIndex（兜底） ─────────────
   *
   * DSH 0.2.x 的桌面端改成 file:// + IPC：index.html 是打包好的静态壳
   * （里面只有一个 <div id="root"></div>），启动数据以「注入行表」经 IPC
   * 下发，由页面侧解释器渲染。那种部署里 webServer.tapIndex 的原始字符串
   * 变换**不会被执行** —— 表现就是 DSH 自己的启动界面先出现、开机动画要等
   * 浏览器半侧自举才补上（老版本首帧就是黑幕，因为那时 index 是服务端渲染的）。
   *
   * 行表是两种呈现方式唯一共用的载体：服务端渲染 renderIndexInjections()
   * 把行拼进 HTML，静态部署把同一张表塞进 boot payload。所以这里以行表为主。
   * tapIndex 保留作 web 部署的兜底 —— 它的幂等守卫认 /splash.js 标记，
   * 行表已经把标记写进 HTML 之后它就自动退化成无操作，不会重复注入。 */
  /** 模板查找顺序：插件自带 templates/ → 用户目录 ~/.dsh/startup-templates/。 */
  const TEMPLATE_ROOTS = [
    path.join(PACKAGE_ROOT, 'templates'),
    path.join(DSH_HOME, 'startup-templates')
  ]
  const TEMPLATE_ID_RE = /^[a-z0-9][a-z0-9-]{0,39}$/


  /** 真实路径包含性校验：防止模板目录里的符号链接把请求带出模板根。 */
  function isFileInsideRoot(file, root) {
    try {
      const realRoot = fs.realpathSync(root)
      const realFile = fs.realpathSync(file)
      const prefix = realRoot.endsWith(path.sep) ? realRoot : realRoot + path.sep
      const lr = realRoot.toLowerCase()
      const lf = realFile.toLowerCase()
      return lf === lr || lf.startsWith(prefix.toLowerCase())
    } catch (err) { return false }
  }

  function readTemplate(id) {
    if (!id || !TEMPLATE_ID_RE.test(String(id))) return null
    try { if ((readConfig().hiddenTemplates || []).includes(String(id))) return null } catch (err) { /* 配置读不到就不隐藏 */ }
    /* 倒序扫：用户目录优先，同名模板覆盖内置（否则在编辑器里改完保存了也看不到） */
    for (let i = TEMPLATE_ROOTS.length - 1; i >= 0; i--) {
      const root = TEMPLATE_ROOTS[i]
      try {
        const file = path.join(root, String(id), 'template.json')
        const st = fs.statSync(file)
        if (!st.isFile()) continue
        if (st.size > 16 * 1024 * 1024) {
          diag('模板 ' + id + ' 超过 2MB（' + Math.round(st.size / 1024) + 'KB），已跳过')
          continue
        }
        let parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) continue
        const checked = validateTemplate(Object.assign({}, parsed, { id: String(id) }))
        if (!checked.ok) { diag('readTemplate rejected: ' + checked.reason); continue }
        parsed = checked.value
        parsed.id = String(id)
        parsed.__file = file.replace(/\\/g, '/')
        return parsed
      } catch (err) { /* 这个目录没有，试下一个 */ }
    }
    return null
  }


  const USER_TPL_ROOT = path.join(DSH_HOME, 'startup-templates')


  /** 列出两处目录里所有可用模板（同 id 以用户目录为准）。 */
  function listTemplates() {
    const out = []
    const seen = new Set()
    for (let i = TEMPLATE_ROOTS.length - 1; i >= 0; i--) {
      const root = TEMPLATE_ROOTS[i]
      let entries = []
      try { entries = fs.readdirSync(root, { withFileTypes: true }) } catch (err) { continue }
      for (const d of entries) {
        if (!d.isDirectory() || !TEMPLATE_ID_RE.test(d.name) || seen.has(d.name)) continue
        const t = readTemplate(d.name)
        if (!t) continue
        seen.add(d.name)
        out.push({
          id: d.name,
          name: String(t.name || d.name).slice(0, 40),
          author: String(t.author || '').slice(0, 40),
          description: String(t.description || '').slice(0, 140),
          source: i === TEMPLATE_ROOTS.length - 1 ? 'user' : 'builtin'
        })
      }
    }
    out.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    return out
  }

  function indexInjectionRows() {
    const cfg = readConfig()
    const rows = [
      /* head：先兜底样式，保证首帧就是黑幕，不是 DSH 的启动界面 */
      { kind: 'style', text: CRITICAL_CSS },
      { kind: 'html', placement: 'head', html: '<link rel="stylesheet" href="' + ROUTE_BASE + '/splash.css">' },
      { kind: 'global', name: '__DSH_STARTUP_BOOT__', value: 'index' },
      { kind: 'global', name: '__DSH_STARTUP_VERSION__', value: PLUGIN_VERSION },
      { kind: 'global', name: '__DSH_STARTUP__', value: cfg },
      /* body：挂载点 → 兜底脚本 → 运行时 */
      { kind: 'html', placement: 'body', html: '<div id="dsh-startup-root" class="dsu-root dsu-boot"></div>' },
      { kind: 'script', placement: 'body', text: BOOTSTRAP_JS },
      /* 运行时脚本必须用 script-src（一等公民行），**不能**包在 html 行里：
         桌面端（file:// + IPC）的页面侧解释器按 HTML 文本插入行，innerHTML 里的
         <script> 不会执行 —— 实测脚本标签在文档里躺着、splash.js 从不运行，
         表现为开机动画整段消失、直接进壁纸。DSH 自己的 bundle 也是用 script-src。
         placement=body 让它排在挂载点之后、应用主包之前（不再等主包 2~4 秒）。 */
      { kind: 'script-preload', src: ROUTE_BASE + '/splash.js' },
      { kind: 'script-src', placement: 'body', src: ROUTE_BASE + '/splash.js' }
    ]
    /* 选中的模板以纯数据形式下发（global 行）：运行时只读它，不执行任何代码。
       放在 __DSH_STARTUP__ 之后，保证运行时能同时拿到配置与模板。 */
    /* 双保险：即使旧配置/手工 JSON 里 template 是空串，也回落到内置档案暖白。 */
    const tpl = readTemplate(cfg.template) || readTemplate(DEFAULTS.template)
    let at = 5
    if (tpl) { rows.splice(at, 0, { kind: 'global', name: '__DSH_STARTUP_TEMPLATE__', value: tpl }); at += 1 }
    const tpl2 = readTemplate(cfg.act2)
    if (tpl2) rows.splice(at, 0, { kind: 'global', name: '__DSH_STARTUP_TEMPLATE2__', value: tpl2 })
    return rows
  }

  function contributeRows(table) {
    try {
      if (!Array.isArray(table)) return
      /* 同一个宿主上下文可能同时把 webserver/index-inject 暴露在父 ctx 与
         注入后的 webCtx 上。无论事件被订阅几次，同一张行表只能贡献一次；
         否则会生成两个同 id 的启动根节点，后插入的空黑层会盖住正常动画。 */
      const alreadyInjected = table.some((row) =>
        row && (
          (row.kind === 'global' && row.name === '__DSH_STARTUP_BOOT__') ||
          (typeof row.html === 'string' && row.html.includes('dsh-startup-root'))
        )
      )
      if (alreadyInjected) {
        diag('index-inject skipped duplicate rows=' + String(table.length))
        return
      }
      table.push(...indexInjectionRows())
      diag('index-inject rows=' + String(table.length))
    } catch (err) {
      diag('index-inject failed: ' + String((err && err.message) || err))
      try { ctx.logger?.warn?.('[' + NS + '] 注入行生成失败：' + String((err && err.message) || err)) } catch (e2) { /* 忽略 */ }
    }
  }

  /* 订阅注入行优先用官方写法（remote-access / client-modules 都这么写）：
     ctx.inject(['webServer'], webCtx => webCtx.on(...))。只有宿主根本不提供 inject
     时才回退 ctx.on；不能在 inject 回调尚未执行时同步订阅 ctx.on，否则同一事件
     会被两个监听器处理，生成两个互相覆盖的启动根节点。 */
  let rowsSubscribed = false
  if (typeof ctx.inject === 'function') {
    try {
      ctx.inject(['webServer'], (webCtx) => {
        if (!webCtx || typeof webCtx.on !== 'function') { diag('webCtx 没有 on'); return }
        const off = webCtx.on('webserver/index-inject', contributeRows)
        rowsSubscribed = true
        diag('rows 订阅成功')
        if (typeof off === 'function') disposers.push(off)
      })
    } catch (err) { diag('ctx.inject 订阅失败: ' + String((err && err.message) || err)) }
  } else {
    if (typeof ctx.on === 'function') {
      try {
        const off = ctx.on('webserver/index-inject', contributeRows)
        rowsSubscribed = true
        diag('rows 订阅成功（直连 ctx.on）')
        if (typeof off === 'function') disposers.push(off)
      } catch (err) { diag('ctx.on 订阅失败: ' + String((err && err.message) || err)) }
    } else {
      diag('no ctx.on / ctx.inject — 只能走 tapIndex')
    }
  }

  /* 可用模板列表：设置页的「模板」下拉框用 */
  disposers.push(registerRoute({
    kind: 'exact',
    path: ROUTE_BASE + '/templates',
    handler: (req, res) => {
      try {
        const cfgNow = readConfig()
        sendJson(res, 200, { ok: true, active: cfgNow.template || '', templates: listTemplates(), hidden: cfgNow.hiddenTemplates || [] })
      }
      catch (err) { sendJson(res, 500, { ok: false, error: String((err && err.message) || err) }) }
    }
  }))


  /* 客户端取证通道：浏览器半侧/运行时把错误回传到这里，写进同一份诊断日志。 */
  disposers.push(registerRoute({
    kind: 'exact',
    path: ROUTE_BASE + '/diag',
    handler: async (req, res) => {
      const method = (req.method || 'GET').toUpperCase()
      if (method !== 'POST') { sendJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      const text = await readBody(req, 8 * 1024)
      diag('client: ' + String(text || '').slice(0, 1200))
      sendJson(res, 200, { ok: true })
    }
  }))

  disposers.push(webServer.tapIndex((html) => {
    diag('tapIndex len=' + (html ? html.length : 0))
    if (html && html.length > 1000) dumpHtml(html)
    if (!html || html.includes(ROUTE_BASE + '/splash.js')) return html
    const cfg = readConfig()
    const head =
      '<link rel="stylesheet" href="' + ROUTE_BASE + '/splash.css">' +
      '<style id="dsh-startup-critical">' + CRITICAL_CSS + '</style>'
    /* 兜底通道也要把模板一起下发：运行时是读 window.__DSH_STARTUP_TEMPLATE__ 建时间线的，
        只给配置不给模板会退化成空的分幕流程（并且旧版这里没有 null 判断，会直接揭幕）。 */
    const tpl = readTemplate(cfg.template) || readTemplate(DEFAULTS.template)
    const tpl2 = readTemplate(cfg.act2)
    const tplJs =
      (tpl ? 'window.__DSH_STARTUP_TEMPLATE__=' + safeJson(tpl) + ';' : '') +
      (tpl2 ? 'window.__DSH_STARTUP_TEMPLATE2__=' + safeJson(tpl2) + ';' : '')
    const body =
      '<div id="dsh-startup-root" class="dsu-root dsu-boot"></div>' +
      '<script>window.__DSH_STARTUP_BOOT__="index";window.__DSH_STARTUP_VERSION__=' + safeJson(PLUGIN_VERSION) + ';window.__DSH_STARTUP__=' + safeJson(cfg) + ';' + tplJs + BOOTSTRAP_JS + '</script>' +
      '<script defer src="' + ROUTE_BASE + '/splash.js"></script>'

    let out = html
    if (out.includes('</head>')) out = out.replace('</head>', head + '</head>')
    else out = head + out
    if (out.includes('<body>')) out = out.replace('<body>', '<body>' + body)
    else if (out.includes('</body>')) out = out.replace('</body>', body + '</body>')
    else out = out + body
    return out
  }))

  ctx.effect(() => () => {
    for (const dispose of disposers) {
      try { dispose() } catch (err) { /* noop */ }
    }
  })
}

/* 导出形状对齐 DSH 内部插件（如 dsh-host-open-in-app）：
   只给具名 name / inject / apply。
   两点刻意不做：
   1) 不导出 default —— cordis-plugin-loader 的 unwrapExports 是
      `exports.default ?? exports`，一旦有 default 就只认 default，
      两边都写反而多一个"改一处忘一处"的坑；
   2) 不导出 Config —— Cordis 约定 Config 是 schemastery schema，
      我这份只是普通默认值对象，当 schema 用会炸。本插件也不吃 profile 配置。 */
export { apply, inject }
