/**
 * dsh-IStarty — 浏览器半侧（只保留开机动画）
 * ---------------------------------------------------------------------------
 * 由 dsh-boot-suite 2.16.13 的「开机动画」半侧裁剪而来：
 *   · 保留：设置页「启动动画」面板、首屏自举、黑屏自愈、标题栏适配、模板下拉
 *   · 删除：聊天壁纸半侧、模板编辑器、动画导入、背景音乐与波形编辑器、
 *           模板删除/隐藏、模板商店、检查更新/诊断报告
 *
 * 模块 id 必须等于 bundle 行名，否则 ModuleLoader 会报 loaded without registering。
 */
window.__ModuleLoader__.load({
  id: 'dsh-IStarty',

  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    /* 第一段执行：开机动画（原 dsh-startup-screen）*/
    var __bootHalf = (function () {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var react = require('react')
    var h = react.createElement

    var API = '/dsh-startup/config'
    var STARTUP_ROUTE = '/dsh-startup'

    /* ── CSS ─────────────────────────────────────────────────────────────── */
    var CSS = [
      '.__ss_root{max-width:620px;display:flex;flex-direction:column;gap:14px;font-size:13px;color:var(--dsw-alias-label-primary)}',
      '.__ss_version{font-family:ui-monospace,Consolas,monospace;font-size:12px;letter-spacing:.04em;color:var(--dsw-alias-label-tertiary)}',
      '.__ss_group{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:11px}',
      '.__ss_groupTitle{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary)}',
      '.__ss_field{display:flex;flex-direction:column;gap:5px}',
      '.__ss_label{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}',
      '.__ss_hint{font-size:11px;line-height:1.55;color:var(--dsw-alias-label-tertiary)}',
      '.__ss_row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
      '.__ss_input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 10px;font-size:13px;box-sizing:border-box;width:100%;outline:none}',
      '.__ss_input:focus{border-color:var(--dsw-alias-state-business-primary)}',
      '.__ss_inputMono{font-family:ui-monospace,Consolas,monospace;font-size:12px;letter-spacing:.06em}',
      '.__ss_select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 8px;font:inherit;font-size:13px;min-width:180px}',
      '.__ss_check{display:flex;align-items:flex-start;gap:8px;cursor:pointer}',
      '.__ss_check input{margin-top:2px;accent-color:var(--dsw-alias-state-business-primary)}',
      '.__ss_checkText{display:flex;flex-direction:column;gap:2px}',
      '.__ss_two{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.__ss_actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:2px}',
      '.__ss_btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 14px;font:inherit;font-size:13px;cursor:pointer}',
      '.__ss_btn:hover:not(:disabled){border-color:var(--dsw-alias-state-business-primary)}',
      '.__ss_btn:disabled{opacity:.5;cursor:default}',
      '.__ss_btnPrimary{border-color:var(--dsw-alias-state-business-primary,#3964fe);background:var(--dsw-alias-state-business-primary,#3964fe);color:#fff}',
      '.__ss_status{font-size:12px;color:var(--dsw-alias-label-tertiary)}',
      '.__ss_ok{font-size:12px;color:var(--dsw-alias-state-business-primary)}',
      '.__ss_link{font-size:12px;color:var(--dsw-alias-state-business-primary);text-decoration:none;border-bottom:1px dashed currentColor}',
      '.__ss_err{font-size:12px;color:var(--dsw-alias-state-error-primary,#f85149)}',
      '.__ss_swatch{width:38px;height:26px;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:transparent;cursor:pointer}',
      '.__ss_preview{margin-top:2px;border:1px dashed var(--dsw-alias-border-l2);border-radius:10px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:12px}',
      '.__ss_previewText{font-size:12px;color:var(--dsw-alias-label-tertiary);line-height:1.5}',
      '.__ss_selectWrap{position:relative;display:inline-block;min-width:180px;max-width:100%}',
      '.__ss_select{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;cursor:pointer;text-align:left}',
      '.__ss_select.is-open{border-color:var(--dsw-alias-state-business-primary)}',
      '.__ss_selectLabel{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.__ss_selectCaret{flex:none;opacity:.7;font-size:11px}',
      '.__ss_selectMenu{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:40;display:flex;flex-direction:column;gap:0;padding:4px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background-color:#1b1d22;background-image:linear-gradient(var(--dsw-alias-bg-overlay, rgba(22,23,27,.95)), var(--dsw-alias-bg-overlay, rgba(22,23,27,.95))),linear-gradient(var(--dsw-alias-bg-overlay, rgba(22,23,27,.95)), var(--dsw-alias-bg-overlay, rgba(22,23,27,.95)));backdrop-filter:blur(8px);box-shadow:0 10px 28px rgba(0,0,0,.45);max-height:280px;overflow:auto;box-sizing:border-box}',
      '.__ss_selectMenu.is-up{top:auto;bottom:calc(100% + 4px)}',
      '.__ss_selectItem{display:block;width:100%;text-align:left;border:none;background:transparent;color:var(--dsw-alias-label-primary);border-radius:6px;padding:6px 8px;font:inherit;font-size:13px;cursor:pointer}',
      '.__ss_selectItem:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,.12))}',
      '.__ss_selectItem.is-on{color:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #e6762b));font-weight:600}'
    ].join('')
    var tagId = 'dsh-startup-screen/main.css'
    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + tagId + '"]') === null) {
      var tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-startup-screen'
      tag.dataset.pluginCss = tagId
      tag.textContent = CSS
      document.head.appendChild(tag)
    }

    /* ── 表单原子 ────────────────────────────────────────────────────────── */
    function Field(props) {
      return h('div', { className: '__ss_field' },
        h('label', { className: '__ss_label' }, props.label),
        props.children,
        props.hint ? h('div', { className: '__ss_hint' }, props.hint) : null
      )
    }

    function TextInput(props) {
      return h('input', {
        className: '__ss_input' + (props.mono ? ' __ss_inputMono' : ''),
        type: 'text',
        value: props.value == null ? '' : String(props.value),
        placeholder: props.placeholder || '',
        maxLength: props.maxLength || 64,
        spellCheck: false,
        onChange: (e) => props.onChange(e.target.value)
      })
    }

    function Select(props) {
      var openState = react.useState(false)
      var open = openState[0]
      var setOpen = openState[1]
      var upState = react.useState(false)
      var openUp = upState[0]
      var setOpenUp = upState[1]
      var wrapRef = react.useRef(null)
      var btnRef = react.useRef(null)
      var opts = props.options || []
      var cur = opts.find(function (o) { return String(o[0]) === String(props.value) }) || opts[0] || ['', '']
      var label = cur[1]

      function measure() {
        var el = btnRef.current
        if (!el) return
        var r = el.getBoundingClientRect()
        var topLimit = 8
        var bottomLimit = (window.innerHeight || 800) - 8
        var node = el.parentNode
        while (node && node.nodeType === 1 && node !== document.body) {
          var st = window.getComputedStyle(node)
          if (/(auto|scroll)/.test(st.overflowY) && node.clientHeight > 0) {
            var nr = node.getBoundingClientRect()
            topLimit = Math.max(topLimit, nr.top + 2)
            bottomLimit = Math.min(bottomLimit, nr.bottom - 2)
            break
          }
          node = node.parentNode
        }
        var below = bottomLimit - r.bottom
        var above = r.top - topLimit
        var useUp = below < 280 && above > below
        setOpenUp(useUp)
        var maxH = Math.max(120, Math.min(280, (useUp ? above : below) - 8))
        if (wrapRef.current) {
          wrapRef.current.style.setProperty('--ss-menu-max', maxH + 'px')
          var menu = wrapRef.current.querySelector('.__ss_selectMenu')
          if (menu) menu.style.maxHeight = maxH + 'px'
        }
      }

      react.useEffect(function () {
        if (!open) return
        measure()
        function onDocDown(e) {
          if (!wrapRef.current) return
          if (!wrapRef.current.contains(e.target)) setOpen(false)
        }
        function onKey(e) {
          if (e.key === 'Escape') {
            setOpen(false)
            try { btnRef.current.focus() } catch (err) {}
          }
        }
        function onScroll(e) {
          if (!wrapRef.current) return
          if (!wrapRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', onDocDown, true)
        document.addEventListener('keydown', onKey, true)
        window.addEventListener('scroll', onScroll, true)
        return function () {
          document.removeEventListener('mousedown', onDocDown, true)
          document.removeEventListener('keydown', onKey, true)
          window.removeEventListener('scroll', onScroll, true)
        }
      }, [open])

      return h('div', { className: '__ss_selectWrap' + (open ? ' is-open' : ''), ref: wrapRef },
        h('button', {
          className: '__ss_select' + (open ? ' is-open' : ''),
          type: 'button',
          ref: btnRef,
          'aria-haspopup': 'listbox',
          'aria-expanded': open ? 'true' : 'false',
          onClick: function () { setOpen(!open) }
        },
          h('span', { className: '__ss_selectLabel' }, label),
          h('span', { className: '__ss_selectCaret', 'aria-hidden': 'true' }, 'v')
        ),
        open ? h('div', {
          className: '__ss_selectMenu' + (openUp ? ' is-up' : ''),
          role: 'listbox',
          style: { maxHeight: 'var(--ss-menu-max, 280px)' }
        }, opts.map(function (o) {
          var on = String(o[0]) === String(props.value)
          return h('button', {
            key: o[0],
            type: 'button',
            role: 'option',
            'aria-selected': on ? 'true' : 'false',
            className: '__ss_selectItem' + (on ? ' is-on' : ''),
            onClick: function () {
              setOpen(false)
              if (on) return
              props.onChange(o[0])
            }
          }, o[1])
        })) : null
      )
    }


    function Check(props) {
      return h('label', { className: '__ss_check' },
        h('input', {
          type: 'checkbox',
          checked: !!props.checked,
          onChange: (e) => props.onChange(e.target.checked)
        }),
        h('span', { className: '__ss_checkText' },
          h('span', null, props.label),
          props.hint ? h('span', { className: '__ss_hint' }, props.hint) : null
        )
      )
    }

    function ColorInput(props) {
      return h('input', {
        className: '__ss_swatch',
        type: 'color',
        value: props.value,
        onChange: (e) => props.onChange(e.target.value)
      })
    }

    function Range(props) {
      return h('div', { className: '__ss_row' },
        h('input', {
          type: 'range',
          min: props.min, max: props.max, step: props.step || 0.05,
          value: props.value,
          style: { flex: '1 1 200px' },
          onChange: (e) => props.onChange(Number(e.target.value))
        }),
        h('span', { className: '__ss_status' }, props.display)
      )
    }

    /* ── 语音：读系统里可用的音色，女声排在前面 ─────────────────────────── */
    var NATURAL_HINTS = ['natural', 'neural', 'online', 'premium', 'enhanced', 'siri', 'google']
    var FEMALE_HINTS = [
      'aria', 'jenny', 'michelle', 'emma', 'ava', 'libby', 'sonia', 'maisie',
      'zira', 'samantha', 'karen', 'moira', 'tessa', 'victoria', 'serena', 'allison',
      'susan', 'fiona', 'hazel', 'female', 'woman',
      'xiaoxiao', 'xiaoyi', 'xiaomo', 'huihui', 'yaoyao', '晓晓', '晓伊', '女声'
    ]
    var MALE_HINTS = ['david', 'mark', 'guy', 'ryan', 'george', 'daniel', 'alex', 'fred',
      'male', 'yunxi', 'yunjian', 'kangkang']

    function hits(name, list) {
      for (var i = 0; i < list.length; i++) if (name.indexOf(list[i]) !== -1) return true
      return false
    }
    /** 神经网络音色优先，其次女声，最后剔掉男声 —— 和运行时 splash.js 的打分口径一致 */
    function scoreVoice(name, lang, want) {
      var sc = 0
      if (hits(name, NATURAL_HINTS)) sc += 60
      if (hits(name, FEMALE_HINTS)) sc += 40
      if (hits(name, MALE_HINTS)) sc -= 45
      if (String(lang || '').indexOf(want) === 0) sc += 25
      return sc
    }

    function readVoices() {
      try {
        var s = window.speechSynthesis
        if (!s || typeof s.getVoices !== 'function') return []
        var list = s.getVoices() || []
        var want = 'en'
        var scored = list.map(function (v, i) {
          var name = String(v.name || '').toLowerCase()
          return {
            v: v,
            natural: hits(name, NATURAL_HINTS),
            female: hits(name, FEMALE_HINTS),
            sc: scoreVoice(name, String(v.lang || '').toLowerCase(), want),
            i: i
          }
        })
        scored.sort(function (a, b) {
          if (a.sc !== b.sc) return b.sc - a.sc
          return a.i - b.i
        })
        return scored.map(function (x) { return x.v })
      } catch (e) { return [] }
    }

    function speakSample(text, draft) {
      try {
        var s = window.speechSynthesis
        if (!s) return false
        s.cancel()
        var u = new window.SpeechSynthesisUtterance(text || 'Access permission required.')
        var list = readVoices()
        var target = null
        for (var i = 0; i < list.length; i++) if (list[i].name === draft.voiceName) target = list[i]
        if (target) { u.voice = target; u.lang = target.lang }
        u.rate = Math.min(2, Math.max(0.5, Number(draft.voiceRate) || 1))
        u.pitch = Math.min(2, Math.max(0, Number(draft.voicePitch) || 1))
        u.volume = Math.min(1, Math.max(0, Number(draft.voiceVolume) || 0.9))
        if (draft.voiceLang === 'zh') { u.text = '需要访问许可，验证通过。'; u.lang = 'zh-CN' }
        s.speak(u)
        return true
      } catch (e) { return false }
    }

    function VoicePicker(props) {
      var [list, setList] = react.useState(readVoices)
      react.useEffect(function () {
        var s = window.speechSynthesis
        if (!s) return
        var on = function () { setList(readVoices()) }
        try { s.addEventListener('voiceschanged', on) } catch (e) {}
        var t = setTimeout(on, 400)
        return function () {
          try { s.removeEventListener('voiceschanged', on) } catch (e) {}
          clearTimeout(t)
        }
      }, [])
      var auto = window.__DSH_STARTUP_API__ && window.__DSH_STARTUP_API__.voice
      var opts = [['', '自动（优先神经网络女声）' + (auto ? ' → ' + auto : '')]].concat(
        list.map(function (v) {
          var name = String(v.name || '').toLowerCase()
          var mark = hits(name, NATURAL_HINTS) ? '★ ' : (hits(name, FEMALE_HINTS) ? '♀ ' : '')
          return [v.name, mark + v.name + ' · ' + (v.lang || '')]
        })
      )
      return h('div', { className: '__ss_field' },
        h('label', { className: '__ss_label' }, '音色'),
        h('div', { className: '__ss_row' },
          h(Select, { value: props.value || '', options: opts, onChange: props.onChange }),
          h('button', {
            className: '__ss_btn',
            type: 'button',
            onClick: props.onPreview
          }, '试听')
        ),
        h('div', { className: '__ss_hint' },
          list.length
            ? '★ = 神经网络音色（念长句自然，推荐）；♀ = 女声但多为老式拼接合成，念长句会发塑料。'
              + '共 ' + list.length + ' 个，已按"神经网络 → 女声 → 排除男声"排好序。'
            : '这台机器暂时读不到系统音色（浏览器可能要等 voiceschanged，或系统没装英语语音包）。'
        )
      )
    }

    /* ── 面板 ────────────────────────────────────────────────────────────── */
    /* 本地兜底默认值：Host 半侧若是旧版本（配置里还没有语音字段），
       面板也要能正常显示这些控件，而不是一片 undefined。 */
    var FALLBACK = {
      voice: true, voiceLang: 'en', voiceName: '', voiceRate: 0.88, voicePitch: 0.85,
      voiceVolume: 0.9, voiceCue: true, voiceLead: 240, welcomeDelay: 550, voiceSource: 'asset', voicePack: 'f', voiceFx: 'robot',
      sound: true, soundVolume: 0.5, bedNoise: false,
      transitionIn: 'dissolve', transitionJoin: 'dissolve', transitionOut: 'dissolve',
      transitionMs: 600, transitionDir: 'left',
      colorMode: 'color',
      bgmEnabled: false, bgmFile: '', bgmFile2: '', bgmVolume: 0.5, bgmBpm: 100, bgmBeats1: 16, bgmBeats2: 32,
      bgm1Start: 0, bgm2Start: 0, bgm1FadeIn: 1, bgm1FadeOut: 1, bgm2FadeIn: 1, bgm2FadeOut: 2,
      bgmCrossfade: 1200, bgmLoop: true, bgm2Loop: false, bgmDuck: true,
      act1VideoSound: false, act2VideoSound: false
    }
    function num(v, d) {
      var n = Number(v)
      return isFinite(n) ? n : d
    }

    /* 版本号的来源，按可靠性排序：
       1) 面板自己从 /dsh-startup/config 拿到的（Host 读的是它自己的 package.json）
       2) Host 往 index 里注入的 window.__DSH_STARTUP_VERSION__
          —— 桌面端走浏览器半侧自举时没有 1，就靠这一条
       3) 下面这个常量：两份都没拿到时的兜底，别让面板显示 undefined
       版本号本身只在 lib/index.js 里读一次，这里不重复维护。 */
    var FALLBACK_VERSION = '2.16.13'
    function readInjectedVersion() {
      try {
        var v = window.__DSH_STARTUP_VERSION__
        return v ? String(v) : ''
      } catch (e) { return '' }
    }

    function Panel() {
      var [draft, setDraft] = react.useState(null)
      var [defaults, setDefaults] = react.useState(null)
      var [file, setFile] = react.useState('')
      var [version, setVersion] = react.useState(readInjectedVersion)
      var [error, setError] = react.useState(null)
      var [notice, setNotice] = react.useState(null)
      var [busy, setBusy] = react.useState(false)
      var [templates, setTemplates] = react.useState([])
      var [voicePacks, setVoicePacks] = react.useState([])

      function load() {
        setError(null)
        return fetch(API, { headers: { Accept: 'application/json' } })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) throw new Error((j && j.error) || 'load failed')
            setDraft(Object.assign({}, FALLBACK, j.config))
            setDefaults(Object.assign({}, FALLBACK, j.defaults))
            setFile(j.file || '')
            if (j.version) setVersion(String(j.version))
          })
          .catch((e) => setError('读取配置失败：' + String(e && e.message ? e.message : e)))
      }

      react.useEffect(() => { load() }, [])

      /* 模板列表：宿主扫描 templates/ 与 ~/.dsh/startup-templates/
         导入/删除后要能立刻刷新，所以抽成函数 */
      function refreshTemplates() {
        return fetch('/dsh-startup/templates', { headers: { Accept: 'application/json' }, cache: 'no-store' })
          .then((r) => r.json())
          .then((j) => {
            if (j && j.ok === true && Array.isArray(j.templates)) setTemplates(j.templates)
          })
          .catch(() => { /* 拉不到就只显示「内置」 */ })
      }
      react.useEffect(() => { refreshTemplates() }, [])

      /* 音色包列表：来自 lib/assets/voices/manifest.json，由宿主只读下发 */
      function refreshVoices() {
        return fetch('/dsh-startup/voices', { headers: { Accept: 'application/json' }, cache: 'no-store' })
          .then((r) => r.json())
          .then((j) => { if (j && j.ok === true && Array.isArray(j.packs)) setVoicePacks(j.packs) })
          .catch(() => { /* 拉不到就只显示内置音色 */ })
      }
      react.useEffect(() => { refreshVoices() }, [])

      function voiceOptions() {
        var opts = []
        for (var i = 0; i < voicePacks.length; i++) {
          var v = voicePacks[i]
          if (!v || !v.id) continue
          opts.push([v.id, String(v.name || v.id)])
        }
        return opts
      }

      function set(key, value) {
        setNotice(null)
        setDraft((d) => Object.assign({}, d, { [key]: value }))
      }

      function save() {
        if (!draft) return
        setBusy(true); setNotice(null); setError(null)
        fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patch: draft })
        })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) throw new Error((j && j.error) || 'save failed')
            setDraft(j.config)
            setNotice('已保存。下次打开 DSH 生效；点「立即预览」可以先看效果。')
          })
          .catch((e) => setError('保存失败：' + String(e && e.message ? e.message : e)))
          .then(() => setBusy(false))
      }

      function reset() {
        setBusy(true); setNotice(null); setError(null)
        fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reset' })
        })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) throw new Error((j && j.error) || 'reset failed')
            setDraft(j.config)
            setNotice('已恢复默认。')
          })
          .catch((e) => setError('恢复默认失败：' + String(e && e.message ? e.message : e)))
          .then(() => setBusy(false))
      }


      function findTemplate(id) {
        if (!id) return null
        for (var ti2 = 0; ti2 < templates.length; ti2++) {
          if (templates[ti2] && templates[ti2].id === id) return templates[ti2]
        }
        return null
      }


      /** 立即预览：**先把宿主最新的配置和模板灌回 window，再让运行时重播**。
          只调 replay() 的话，运行时手里的还是首屏注入那会儿的旧配置/旧模板 ——
          表现就是「换了模板点预览还是老动画，非得重启」。 */
      function preview() {
        setBusy(true)
        setNotice(null)
        fetch(API, { headers: { Accept: 'application/json' }, cache: 'no-store' })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) return
            /* v2.13.15：预览必须带上「当前还没保存的修改」。
               原来只灌宿主已保存的配置：用户选完音色/效果直接点「立即预览」，
               运行时拿到的还是旧配置 —— 表现就是「选了日文音色，预览仍播英文」。 */
            if (j.config) window.__DSH_STARTUP__ = Object.assign({}, FALLBACK, j.config, draft || {})
            try {
              if (j.template) window.__DSH_STARTUP_TEMPLATE__ = j.template
              else delete window.__DSH_STARTUP_TEMPLATE__
              if (j.template2) window.__DSH_STARTUP_TEMPLATE2__ = j.template2
              else delete window.__DSH_STARTUP_TEMPLATE2__
            } catch (e) { /* 删不掉就让它回落内置 */ }
          })
          .catch(() => { /* 拿不到最新配置就用旧的，至少还能重播 */ })
          .then(function () {
            setBusy(false)
            /* v2.15.2：点「立即预览」后按钮仍保持焦点，播放时空格会再次触发按钮 click（看起来像重播）。
               重播前先失焦，空格才能交给模板自己的交互（切 tips / 彩蛋按钮）。 */
            try { var ae = document.activeElement; if (ae && typeof ae.blur === 'function') ae.blur() } catch (eBlur) { /* noop */ }
            var api = window.__DSH_STARTUP_API__
            if (api && typeof api.replay === 'function') { api.replay(); return }
            window.location.reload()
          })
      }

      /* 版本号常驻顶部，不进骨架屏 —— 它不依赖配置接口，
         接口挂了也该看得见当前装的是哪一版。 */
      var versionLine = h('div', { className: '__ss_version' }, '版本 v' + (version || FALLBACK_VERSION))

      if (!draft) {
        return h('div', { className: '__ss_root' },
          versionLine,
          h('div', { className: '__ss_status' }, error ? error : '读取配置中…'),
          error ? h('div', { className: '__ss_actions' },
            h('button', { className: '__ss_btn', onClick: load }, '重试')
          ) : null
        )
      }

      var modeOptions = [
        ['session', '每个浏览器会话一次'],
        ['daily', '每天一次'],
        ['always', '每次打开都播放']
      ]

      function findTemplate(id) {
        for (var fi = 0; fi < (templates || []).length; fi++) if (templates[fi] && templates[fi].id === id) return templates[fi]
        return null
      }
      function templateLabel(t) { return t.name + (t.source === 'user' ? ' · 本地' : '') }
      var templateOptions = [['', '内置（档案暖白）']].concat(
        (templates || []).map(function (t) { return [t.id, templateLabel(t)] })
      )
      var act2Options = [['', '不播放（第一幕结束直接进聊天）']].concat(
        (templates || []).map(function (t) { return [t.id, templateLabel(t)] })
      )
      var transitionOptions = [
        ['dissolve', '交叉叠化（默认）'],
        ['flash', '闪白'],
        ['glitch', '故障'],
        ['scanline', '扫描线'],
        ['slide', '推移'],
        ['iris', '虹膜'],
        ['black', '黑场'],
        ['none', '硬切']
      ]
      var transitionDirOptions = [
        ['left', '从左往右'],
        ['right', '从右往左'],
        ['up', '从下往上'],
        ['down', '从上往下']
      ]

      /* 档案暖白专属设置组：只有第一幕选「档案暖白」（或内置空值）时才显示；
         其他模板（含新模板/用户导入）应由模板自己提供参数，而不是这套 */
      var isArchiveWarm = !draft.template || draft.template === 'archive-warm'

      return h('div', { className: '__ss_root' },
        versionLine,

        /* 开关 */
        h('div', { className: '__ss_group' },
          h('div', { className: '__ss_groupTitle' }, '播放'),
          h(Check, {
            label: '启用启动动画',
            hint: '关闭后直接进主界面，不再显示启动界面。',
            checked: draft.enabled,
            onChange: (v) => set('enabled', v)
          }),
          h(Field, { label: '播放时机' },
            h(Select, { value: draft.mode, options: modeOptions, onChange: (v) => set('mode', v) })
          ),
          h(Field, { label: '速度倍率', hint: '0.35 慢放 · 1 原速 · 3 快放；参考片时长约 27 秒，默认整套约 16 秒。' },
            h('div', { className: '__ss_row' },
              h('input', {
                type: 'range', min: 0.35, max: 3, step: 0.05,
                value: draft.speed,
                style: { flex: '1 1 240px' },
                onChange: (e) => set('speed', Number(e.target.value))
              }),
              h('span', { className: '__ss_status' }, Number(draft.speed).toFixed(2) + '×')
            )
          )
        ),


        /* 模板：第一幕 / 第二幕 分开选 */
        h('div', { className: '__ss_group' },
          h('div', { className: '__ss_groupTitle' }, '模板'),
          h(Field, {
            label: '启动动画第一幕',
            hint: '先播这一段。默认「档案暖白」，结尾是 WELCOME TO DEEPSEEK HARNESS。'
          },
            h(Select, { value: draft.template || '', options: templateOptions, onChange: (v) => set('template', v) })
          ),
          h(Field, {
            label: '第一幕视频原声',
            hint: '第一幕使用视频/导入动画时，是否播放视频自带的声音；默认静音。'
          },
            h(Check, { checked: draft.act1VideoSound === true, onChange: (v) => set('act1VideoSound', v), label: '播放第一幕视频原声' })
          ),
          h(Field, {
            label: '启动动画第二幕',
            hint: '第一幕播完接着播这一段；选「不播放」就第一幕结束直接进聊天。'
          },
            h(Select, { value: draft.act2 || '', options: act2Options, onChange: (v) => set('act2', v) })
          ),
          h(Field, {
            label: '第二幕视频原声',
            hint: '第二幕视频里自带配音/音乐时打开；默认静音。打开后会和背景音乐同时响。'
          },
            h(Check, { checked: draft.act2VideoSound === true, onChange: (v) => set('act2VideoSound', v), label: '播放第二幕视频原声' })
          ),
        ),

        /* 三段转场（v2.12.0）：第一幕入场 / 两幕衔接 / 第二幕退场 */
        h('div', { className: '__ss_group' },
          h('div', { className: '__ss_groupTitle' }, '转场'),
          h(Field, { label: '第一幕入场', hint: '黑屏进入第一幕的方式；默认交叉叠化（淡入）。' },
            h(Select, { value: draft.transitionIn || 'dissolve', options: transitionOptions, onChange: (v) => set('transitionIn', v) })
          ),
          h(Field, { label: '第一幕 → 第二幕', hint: '两幕之间的衔接；默认交叉叠化。' },
            h(Select, { value: draft.transitionJoin || 'dissolve', options: transitionOptions, onChange: (v) => set('transitionJoin', v) })
          ),
          h(Field, { label: '第二幕 → 桌面', hint: '第二幕结束退场的方式；默认交叉叠化（淡出）。' },
            h(Select, { value: draft.transitionOut || 'dissolve', options: transitionOptions, onChange: (v) => set('transitionOut', v) })
          ),
          h(Field, { label: '转场时长', hint: '200–2000ms；默认 600ms。' },
            h(Range, {
              min: 200, max: 2000, step: 50,
              value: draft.transitionMs == null ? 600 : draft.transitionMs,
              display: (draft.transitionMs == null ? 600 : draft.transitionMs) + ' ms',
              onChange: (v) => set('transitionMs', v)
            })
          ),
          h(Field, { label: '扫描线 / 推移方向', hint: '只对「扫描线」「推移」两种转场生效。' },
            h(Select, { value: draft.transitionDir || 'left', options: transitionDirOptions, onChange: (v) => set('transitionDir', v) })
          )
        ),


        /* 身份 */
        h('div', { className: '__ss_group', style: isArchiveWarm ? null : { display: 'none' } },
          h('div', { className: '__ss_groupTitle' }, '身份资料'),
          h(Field, {
            label: '身份名称',
            hint: '终幕「欢迎 xxx 访问 / WELCOME, XXX」里的 xxx，也出现在第二步的身份卡上。'
          }, h(TextInput, { value: draft.identity, placeholder: '例如：JOYCE MOORE', onChange: (v) => set('identity', v) })),
          h('div', { className: '__ss_two' },
            h(Field, { label: '身份编号', hint: '显示在第二步身份卡上，建议用数字（如 0087）。' },
              h(TextInput, { value: draft.identityId, mono: true, onChange: (v) => set('identityId', v) })),
            h(Field, { label: '权限等级' },
              h(TextInput, { value: draft.accessLevel, mono: true, onChange: (v) => set('accessLevel', v) }))
          )
        ),

        /* 交互 */
        h('div', { className: '__ss_group', style: isArchiveWarm ? null : { display: 'none' } },
          h('div', { className: '__ss_groupTitle' }, '交互'),
          h(Check, {
            label: '需要人工确认',
            hint: '第 1、2 步停下来等按钮 / Enter / 空格；关闭则整段自动播放。',
            checked: draft.requireInteraction,
            onChange: (v) => set('requireInteraction', v)
          }),
          h(Check, {
            label: '允许跳过',
            hint: '右上角显示 SKIP，按 Esc 也能直接进主界面。',
            checked: draft.allowSkip,
            onChange: (v) => set('allowSkip', v)
          }),
          h(Check, {
            label: '音效',
            hint: '默认关闭；开启后在交互确认时有轻微电子音（浏览器需先有一次用户操作）。',
            checked: draft.sound,
            onChange: (v) => set('sound', v)
          }),
          h(Check, {
            label: '背景底噪（硬盘嗡鸣 / 老电视沙沙声）',
            hint: '默认关闭。开启后整段开机铺一层很轻的低频底噪，像机器通电；觉得吵就关掉。',
            checked: draft.bedNoise === true,
            onChange: (v) => set('bedNoise', v)
          })
        ),

        /* 语音与音效 */
        h('div', { className: '__ss_group', style: isArchiveWarm ? null : { display: 'none' } },
          h('div', { className: '__ss_groupTitle' }, '语音与音效'),
          h(Check, {
            label: '启用配音播报',
            hint: '每一行的台词都在文字出现的同一时刻念出来，动画等这句话念完再走下一步。',
            checked: draft.voice,
            onChange: (v) => set('voice', v)
          }),
          draft.voice ? h(Field, {
            label: '配音音色',
            hint: '6 套完整干音：英文 1 套（音色F·默认）+ 日文 5 套（日文音色1–5）；可再叠声音效果。'
              + '选完音色后，下面的「声音效果」可以再叠一层处理，或选「无」保留原声。'
          },
            h(Select, {
              value: draft.voicePack || 'f',
              options: voiceOptions(),
              onChange: (v) => set('voicePack', v)
            })
          ) : null,
          draft.voice ? h(Field, {
            label: '声音效果',
            hint: '默认「机器人」；5 个音效都来自模板编辑器里的同一套参数，实时叠加在所选音色上。'
              + '选「无（原声）」就是干净人声；只影响全局配音素材，模板自带的配音不受影响。'
          },
            h(Select, {
              value: draft.voiceFx || 'none',
              options: [
                ['none', '无（原声）'],
                ['ai-mech', 'AI 机械音'],
                ['robot', '机器人（默认）'],
                ['radio', '无线电'],
                ['oldtv', '老电视'],
                ['dark', '低沉']
              ],
              onChange: (v) => set('voiceFx', v)
            })
          ) : null,
          draft.voice ? h(Field, { label: '开口前留白', hint: '提示音响过之后停多久再开口。电影旁白/机场广播都有这一拍，240ms 起最像"系统在播报"。' },
            h(Range, {
              value: num(draft.voiceLead, 240), min: 0, max: 800, step: 20,
              display: Math.round(num(draft.voiceLead, 240)) + ' ms',
              onChange: (v) => set('voiceLead', v)
            })
          ) : null,
          draft.voice ? h(Field, { label: '终幕语音延迟', hint: '05→06 的过场和声钟约 1.5 秒；默认等它收尾再进最后一句。觉得欢迎语进得太早/太晚，就调这里。' },
            h(Range, {
              value: num(draft.welcomeDelay, 550), min: 0, max: 3000, step: 50,
              display: Math.round(num(draft.welcomeDelay, 550)) + ' ms',
              onChange: (v) => set('welcomeDelay', v)
            })
          ) : null,
          draft.voice ? h(Field, { label: '音量' },
            h(Range, { value: num(draft.voiceVolume, 0.9), min: 0, max: 1, display: Math.round(num(draft.voiceVolume, 0.9) * 100) + '%', onChange: (v) => set('voiceVolume', v) })
          ) : null,
          draft.voice ? h(Check, {
            label: '播报前提示音',
            hint: '念台词之前先响两声轻提示 —— 这一笔让 TTS 从「浏览器念字」变成「系统播报」，是 AI 感的关键。',
            checked: draft.voiceCue,
            onChange: (v) => set('voiceCue', v)
          }) : null,
          h(Check, {
            label: '界面音效',
            hint: '咔哒 / 双音确认 / 过场噪声扫频 / 结尾和声钟，全部 WebAudio 现场合成，不含音频文件。',
            checked: draft.sound,
            onChange: (v) => set('sound', v)
          }),
          draft.sound ? h(Field, { label: '音效音量' },
            h(Range, { value: num(draft.soundVolume, 0.5), min: 0, max: 1, display: Math.round(num(draft.soundVolume, 0.5) * 100) + '%', onChange: (v) => set('soundVolume', v) })
          ) : null
        ),

        /* 视觉 */
        h('div', { className: '__ss_group', style: isArchiveWarm ? null : { display: 'none' } },
          h('div', { className: '__ss_groupTitle' }, '视觉'),
          h(Field, { label: '主题' },
            h(Select, {
              value: draft.theme,
              options: [['light', '浅色 · 暖白档案底板（参考片原色）'], ['dark', '深色 · 暗底板']],
              onChange: (v) => set('theme', v)
            })
          ),
          h('div', { className: '__ss_two' },
            h(Field, { label: '强调色 · 橙' },
              h('div', { className: '__ss_row' },
                h(ColorInput, { value: draft.accent, onChange: (v) => set('accent', v) }),
                h('span', { className: '__ss_status' }, draft.accent)
              )
            ),
            h(Field, { label: '故障色 · 蓝' },
              h('div', { className: '__ss_row' },
                h(ColorInput, { value: draft.glitchB, onChange: (v) => set('glitchB', v) }),
                h('span', { className: '__ss_status' }, draft.glitchB)
              )
            )
          )
        ),

        /* 文案 */
        h('div', { className: '__ss_group', style: isArchiveWarm ? null : { display: 'none' } },
          h('div', { className: '__ss_groupTitle' }, '文案'),
          h('div', { className: '__ss_two' },
            h(Field, { label: '左上 · 主标题' }, h(TextInput, { value: draft.brand1, onChange: (v) => set('brand1', v) })),
            h(Field, { label: '左上 · 产品行' },
              h('div', { className: '__ss_row' },
                h(TextInput, { value: draft.brand3a, onChange: (v) => set('brand3a', v) }),
                h('span', { className: '__ss_status' }, '+'),
                h(TextInput, { value: draft.brand3b, onChange: (v) => set('brand3b', v) })
              )
            )
          ),
          h(Field, { label: '左上 · 副标题' }, h(TextInput, { value: draft.brand2, maxLength: 40, onChange: (v) => set('brand2', v) })),
          h('div', { className: '__ss_two' },
            h(Field, { label: '黑幕 · 中文' }, h(TextInput, { value: draft.orgZh, onChange: (v) => set('orgZh', v) })),
            h(Field, { label: '黑幕 · 英文' }, h(TextInput, { value: draft.orgEn, mono: true, onChange: (v) => set('orgEn', v) }))
          ),
          h('div', { className: '__ss_two' },
            h(Field, { label: '黑幕 · 小字' }, h(TextInput, { value: draft.orgSub, mono: true, onChange: (v) => set('orgSub', v) })),
            h(Field, { label: '终幕 · 黑框' }, h(TextInput, { value: draft.welcomeBox, onChange: (v) => set('welcomeBox', v) }))
          ),
          h(Field, { label: '右下 · 页脚' }, h(TextInput, { value: draft.footer, mono: true, onChange: (v) => set('footer', v) }))
        ),

        /* 预览 + 操作 */
        h('div', { className: '__ss_preview' },
          h('div', { className: '__ss_previewText' },
            '预览会按当前「已保存」的配置重播一次。想先看新配置，先点保存再预览。',
            file ? h('div', { style: { marginTop: '4px', opacity: 0.75 } }, '配置文件：' + file) : null
          ),
          h('button', { className: '__ss_btn', onClick: preview }, '立即预览')
        ),

        /* 鸣谢 */
        h('div', { className: '__ss_group', style: { marginTop: '10px' } },
          h('div', { className: '__ss_groupTitle' }, '鸣谢（原动画版权归原作者）'),
          h('div', { className: '__ss_hint', style: { lineHeight: '1.9' } },
            '片头（档案暖白）参考：沈宏宏（@6shenhonghong9） · ',
            h('a', { className: '__ss_link', href: 'https://github.com/6shenhonghong9/dsh-startup-screen', target: '_blank', rel: 'noreferrer' }, 'dsh-startup-screen'),
            h('br'),
            '鲸鱼娘素材：NativeDog1/dsh-boot-animation 内置片库「DeepSeek娘扫描睁眼」（BSD-3-Clause）；随包提供 2K/4K 两版可选；8K 版请自行下载（桌面端有内存崩溃风险，仅建议网页端/收藏）：https://github.com/1catmint1/dsh-boot-animation-8k（8K 超分：1catmint1，BSD-3-Clause） · ',
            h('a', { className: '__ss_link', href: 'https://github.com/NativeDog1/dsh-boot-animation', target: '_blank', rel: 'noreferrer' }, 'dsh-boot-animation'),
            h('br'),
            '皮肤「封锁橙」原作者：之一ONETHING（B 站） · ',
            h('a', { className: '__ss_link', href: 'https://github.com/oenthing/blockade-orange-dsh-skin', target: '_blank', rel: 'noreferrer' }, 'blockade-orange-dsh-skin'),
            h('br'),
            '余额表盘原作者：胡萨尔cC（B 站）/ @goooooooeg · ',
            h('a', { className: '__ss_link', href: 'https://github.com/goooooooeg/dsh-balance-hud', target: '_blank', rel: 'noreferrer' }, 'dsh-balance-hud'),
            h('br'),
            '配音：DeepSeek · 语音包与台词由作者提供'
          )
        ),

        h('div', { className: '__ss_actions' },
          h('button', {
            className: '__ss_btn __ss_btnPrimary',
            disabled: busy,
            onClick: save
          }, busy ? '处理中…' : '保存'),
          h('button', { className: '__ss_btn', disabled: busy, onClick: reset }, '恢复默认'),
          h('button', { className: '__ss_btn', disabled: busy, onClick: load }, '放弃修改'),
          notice ? h('span', { className: '__ss_ok' }, notice) : null,
          error ? h('span', { className: '__ss_err' }, error) : null
        )
      )
    }

    /* ── 桌面端自举 ──────────────────────────────────────────────────────── */
    /* Host 半侧靠 ctx.webServer.tapIndex 往 index.html 里注入启动界面。
       web profile 一定走这条路；但 Electron 也可能改用 file:// + IPC 直接下发
       前端（dsh-host-webserver 的注释就写着 "Electron uses file:// plus IPC
       instead"），那时 index 注入整条不生效。所以浏览器半侧自己兜一层：
       没被 Host 接管时，由本侧建根节点 + 拉 splash.css/splash.js 自举。

       判定全在 window 上，不去猜宿主类型：
         __DSH_STARTUP_BOOT__  Host 已经注入过（index）/ 本侧已经自举过（client）
         __DSH_STARTUP_SKIP__  Host 侧的兜底脚本已判定"这次不播"
         __DSH_STARTUP__       配置已就位（Host 注入的）
       Host 判定失效时不该被静默吃掉，所以这里在拦到 SKIP 之前，还要看一眼
       Host 侧根本没跑过（BOOT 标记为空）这种情况：把兜底脚本的同款判定补做一遍。 */
    var BOOT_ROUTE = '/dsh-startup'

    function readFlag(store, key) {
      try {
        var s = window[store]
        return s ? s.getItem(key) : null
      } catch (e) { return null }
    }

    function writeFlag(store, key, value) {
      try {
        var s = window[store]
        if (s) s.setItem(key, value)
      } catch (e) { /* 隐私模式下可能抛，忽略 */ }
    }

    /* ── 桌面窗口的原生按钮条 ────────────────────────────────────────────
       Electron 的 titleBarOverlay 画在页面之上，任何 z-index 都盖不住。
       DSH 的 preload 会测量 body 里一个探针 span 的 background-color/color，
       再 setTitleBarOverlay() 画那条带子，并在 <head> 变动时重新测量。
       所以片头期间把探针改成透明：三个按钮就浮在动画上，而不是压在一条实心条上。
       片头结束移除样式，head 变动本身触发重新测量，DSH 恢复自己的颜色。 */
    /* 让 DSH preload 重新测一次探针颜色：往 head 塞一个空 style 再撤掉。
       preload 监听的是 head 的 childList，所以这样能强制它重发 titleBarOverlay。 */
    function syncCaptionProbe() {
      try {
        var s = document.createElement('style')
        s.textContent = '/*dsh-cw-caption-sync*/'
        ;(document.head || document.documentElement).appendChild(s)
        setTimeout(function () {
          try { if (s.parentNode) s.parentNode.removeChild(s) } catch (e) { /* 忽略 */ }
        }, 0)
      } catch (e) { /* 纯装饰，失败不影响功能 */ }
    }
    try { window.__DSH_CW_SYNC_CAPTION__ = syncCaptionProbe } catch (e) { /* 忽略 */ }

    function adaptCaption(on) {
      try {
        var ID = 'dsh-startup-caption'
        var old = document.getElementById(ID)
        /* data-dsh-caption 是给壁纸样式用的开关：片头期间探针必须保持透明，
           壁纸里那对「窗口按钮固定色」规则看到这个属性就不生效。 */
        try {
          if (on) document.documentElement.setAttribute('data-dsh-caption', '1')
          else document.documentElement.removeAttribute('data-dsh-caption')
        } catch (eAttr) { /* 忽略 */ }
        if (!on) {
          if (old && old.parentNode) old.parentNode.removeChild(old)
          /* 片头结束 / 真正移除探针样式后，强制 preload 重测一次，
             让窗口按钮带换上壁纸样式里那对固定色。 */
          syncCaptionProbe()
          return
        }
        if (old) return
        /* mac 没有 titleBarOverlay；其余平台一律尝试（没有探针时这条样式是空操作）。
           早期版本还额外要求 html[data-platform] 存在，实测某些桌面版本该属性为空，
           那条 gate 反而把功能挡掉了。 */
        var platform = document.documentElement && document.documentElement.dataset
          ? document.documentElement.dataset.platform : ''
        if (platform === 'darwin') return
        var st = document.createElement('style')
        st.id = ID
        /* 探针选择器照抄 DSH Desktop preload 的测量对象，另附两种兜底写法 */
        st.textContent = [
          'body>span[style*="dsw-specific-sidebar-fill"]',
          'body span[style*="dsw-specific-sidebar-fill"]',
          'body>span[style*="sidebar-fill"]'
        ].join(',') + '{background-color:transparent !important;color:#dfe7f3 !important}'
        ;(document.head || document.documentElement).appendChild(st)
      } catch (e) { /* 纯装饰，失败不影响任何功能 */ }
    }

    /* 一次性探针：标题栏那条带子到底由什么控制？把现场事实写回诊断日志，
       比反复猜选择器可靠。启动后 1.5 秒跑一次，开销可忽略。 */
    function probeCaption() {
      try {
        var out = {
          dataset: Object.assign({}, document.documentElement.dataset || {}),
          applied: !!document.getElementById('dsh-startup-caption'),
          rootPresent: !!document.getElementById('dsh-startup-root'),
          bootFlag: String(window.__DSH_STARTUP_BOOT__ || ''),
          skipFlag: window.__DSH_STARTUP_SKIP__ === true,
          probes: [],
          corner: '',
          cornerStack: [],
          frameEls: []
        }
        var spans = document.querySelectorAll('body > span, body span')
        for (var i = 0; i < spans.length && out.probes.length < 6; i++) {
          var st = String(spans[i].getAttribute('style') || '')
          if (st.indexOf('sidebar-fill') !== -1) {
            out.probes.push({
              tag: spans[i].tagName,
              parent: spans[i].parentNode ? spans[i].parentNode.tagName : '',
              style: st.slice(0, 140)
            })
          }
        }
        try {
          var el = document.elementFromPoint(window.innerWidth - 40, 18)
          out.corner = el ? (el.tagName + '#' + (el.id || '') + '.' + String(el.className || '').slice(0, 60)) : ''
          /* 记录右上角 6 层堆栈：新 DSH 的标题栏探针可能换了容器，单看一层不够 */
          var node = el
          for (var d = 0; node && d < 6; d++) {
            var cs = null
            try { cs = window.getComputedStyle(node) } catch (e3) { cs = null }
            out.cornerStack.push({
              tag: node.tagName,
              id: node.id || '',
              cls: String(node.className || '').slice(0, 80),
              bg: cs ? cs.backgroundColor : '',
              pe: cs ? cs.pointerEvents : ''
            })
            node = node.parentNode
          }
        } catch (e2) { /* noop */ }
        try {
          var frames = document.querySelectorAll('[class*="frame"], [class*="Frame"]')
          for (var fi = 0; fi < frames.length && out.frameEls.length < 8; fi++) {
            var fe = frames[fi]
            var fcs = null
            try { fcs = window.getComputedStyle(fe) } catch (e4) { fcs = null }
            out.frameEls.push({
              tag: fe.tagName,
              id: fe.id || '',
              cls: String(fe.className || '').slice(0, 80),
              bg: fcs ? fcs.backgroundColor : '',
              rect: (function () { try { var r = fe.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] } catch (e5) { return null } })()
            })
          }
        } catch (e6) { /* noop */ }
        fetch(BOOT_ROUTE + '/diag', {
          method: 'POST',
          headers: { 'content-type': 'text/plain' },
          body: 'caption-probe ' + JSON.stringify(out)
        }).catch(function () { /* 诊断失败不影响启动 */ })
      } catch (e) { /* noop */ }
    }

    function markBooted() {
      try { window.__DSH_STARTUP_BOOT__ = 'client' } catch (e) { /* noop */ }
    }

    /* 片头结束后把标题栏还给 DSH；再兜一个 40 秒的上限，防止动画异常时一直透明 */
    try {
      window.addEventListener('dsh-startup:done', function () { adaptCaption(false) })
      setTimeout(function () { adaptCaption(false) }, 40000)
    } catch (e) { /* noop */ }

    /** 挂一个 <script src>；失败时调 fail(err)。 */
    function loadScript(src, fail) {
      var s = document.createElement('script')
      s.src = src
      s.async = false
      if (typeof fail === 'function') {
        s.addEventListener('load', function () { fail(null) })
        s.addEventListener('error', function () { fail(new Error('script load failed: ' + src)) })
      }
      ;(document.head || document.documentElement).appendChild(s)
    }

    /** 挂一份 <link rel=stylesheet>；失败时调 fail(err)。 */
    function loadCss(href, fail) {
      var link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      if (typeof fail === 'function') {
        link.addEventListener('load', function () { fail(null) })
        link.addEventListener('error', function () { fail(new Error('css load failed: ' + href)) })
      }
      ;(document.head || document.documentElement).appendChild(link)
    }

    /** 移除根节点、解开滚动锁定 —— 自举任何一步失败都要把页面还回去。 */
    function release(ok) {
      if (ok) return
      adaptCaption(false)
      try {
        var r = document.getElementById('dsh-startup-root')
        if (r && r.parentNode) r.parentNode.removeChild(r)
        if (document.documentElement.classList) document.documentElement.classList.remove('dsu-lock')
        if (document.body && document.body.style) document.body.style.overflow = ''
        window.__DSH_STARTUP_FAILED__ = true
      } catch (e) { /* 兜底不再抛 */ }
    }

    function injectRoot(cfg) {
      var root = document.getElementById('dsh-startup-root')
      if (!root) {
        root = document.createElement('div')
        root.id = 'dsh-startup-root'
        document.body.appendChild(root)
      }
      root.className = 'dsu-root dsu-boot'
      adaptCaption(true)
      setTimeout(probeCaption, 1500)
      setTimeout(probeCaption, 4200)
      if (document.documentElement.classList) document.documentElement.classList.add('dsu-lock')
      if (document.body && document.body.style) document.body.style.overflow = 'hidden'

      /* 样式与运行时都从 Host 路由取 —— 同一份文件，不额外维护内联副本 */
      var failed = false
      var cssReady = false
      var scriptReady = false
      function guard(err) {
        if (err) {
          if (!failed && typeof console !== 'undefined' && console.warn) {
            console.warn('[dsh-startup-screen] 启动界面自举失败，已放开页面：', err.message)
            reportDiag('injectRoot 失败: ' + err.message)
          }
          failed = true
          release(false)
          return
        }
        if (cssReady && scriptReady) release(true)
      }

      loadCss(BOOT_ROUTE + '/splash.css', function (err) {
        if (err) { guard(err); return }
        cssReady = true
        guard(null)
      })

      /* 配置先落 window：splash.js 载入时直接读它 */
      window.__DSH_STARTUP__ = cfg || {}
      try {
        delete window.__DSH_STARTUP_LOADED__
      } catch (e) { window.__DSH_STARTUP_LOADED__ = undefined }
      loadScript(BOOT_ROUTE + '/splash.js?t=' + Date.now(), function (err) {
        if (err) { guard(err); return }
        scriptReady = true
        guard(null)
      })

      /* 自愈：样式与脚本都拿到了、这个标记还在，就说明动画没接管，放行 */
      setTimeout(function () {
        try {
          var r = document.getElementById('dsh-startup-root')
          if (r && r.className && r.className.indexOf('dsu-boot') !== -1) release(false)
        } catch (e) { /* 兜底不再抛 */ }
      }, 9000)
    }

    function selfBoot() {
      try {
        if (typeof window === 'undefined' || typeof document === 'undefined') return
        if (!document.body) return
        if (window.__DSH_STARTUP_BOOT__) return          /* 已被 Host 或本侧接管 */
        if (window.__DSH_STARTUP__) return               /* 配置已在页面上：Host 注入过 */
        if (document.getElementById('dsh-startup-root')) return
        /* 已经出过错的地方不要再扑一次 */
        if (window.__DSH_STARTUP_FAILED__ === true) return
        markBooted()
        fetch(API, { headers: { Accept: 'application/json' } })
          .then(function (r) { return r.json() })
          .then(function (j) { return j && j.ok === true ? j.config : null })
          .catch(function () { return null })
          .then(function (cfg) {
            cfg = cfg || { enabled: true, mode: 'session', speed: 1 }
            if (cfg.enabled === false) return
            var today = new Date().toISOString().slice(0, 10)
            if (cfg.mode === 'session' && readFlag('sessionStorage', 'dsh-startup-screen:shown') === '1') return
            if (cfg.mode === 'daily' && readFlag('localStorage', 'dsh-startup-screen:day') === today) return
            /* 回填判定标记，保证与 Host 侧同款语义（splash.js 会读这两个键） */
            if (cfg.mode === 'session') writeFlag('sessionStorage', 'dsh-startup-screen:shown', '1')
            if (cfg.mode === 'daily') writeFlag('localStorage', 'dsh-startup-screen:day', today)
            return injectRoot(cfg)
          })
          .catch(function () { /* 自举失败就算了，页面本来就是好的 */ })
      } catch (e) { /* 自举是兜底，绝不许把宿主带崩 */ }
    }

    /* ── 启动期取证 + 黑屏自愈 ────────────────────────────────────────────── */

    /** 把启动期异常回传宿主（POST /dsh-startup/diag）。最多 8 条，失败静默。 */
    var diagSent = 0
    function reportDiag(msg) {
      if (diagSent >= 8) return
      diagSent++
      try {
        fetch(API.replace('/config', '/diag'), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: String(msg).slice(0, 900)
        }).catch(function () { /* 取证失败不影响启动 */ })
      } catch (e) { /* 同上 */ }
    }

    /* 黑屏自愈：Host 那侧把黑幕（根节点 + CSS）注进来了，但运行时没起来。
       成因可能是 splash.js 被栅栏拦下、加载后抛错，或者注入行里的外部脚本
       被页面侧解释器丢掉了。判据：800ms 后根节点仍带 dsu-boot、运行时既没
       加载过也没挂出 API —— 那就自己把 CSS/JS 补上。800ms 足够让正常的
       script-src 行跑完；跑不完说明它压根没执行，这时候补注入是唯一出路。
       宁可多闪一下，也不能停在一块纯黑屏上干等 9 秒兜底。 */
    var healDone = false
    function healBlackScreen() {
      try {
        setTimeout(function () {
          try {
            if (typeof window === 'undefined' || typeof document === 'undefined') return
            if (window.__DSH_STARTUP_FAILED__ === true) return
            if (window.__DSH_STARTUP_LOADED__) return
            if (window.__DSH_STARTUP_API__) return
            var root = document.getElementById('dsh-startup-root')
            if (!root) return
            if ((root.className || '').indexOf('dsu-boot') === -1) return
            /* 注意：判据只看"运行时有没有真的跑起来"，不看"文档里有没有 script 标签"。
               2.1.1 就是栽在这上面 —— 标签在文档里但被当成 innerHTML 插进去、永远
               不执行，于是自愈以为"只等就好"，动画彻底不出现。
               这里直接补一次 DOM 注入的 loadScript（这条路实测一定能执行），
               splash.js 自身的 __DSH_STARTUP_LOADED__ 单例守卫会挡住第二次初始化。 */
            healDone = true
            reportDiag('heal: 800ms 运行时未起来，自行注入（boot=' + String(window.__DSH_STARTUP_BOOT__) + '）')
            markBooted()
            injectRoot(window.__DSH_STARTUP__ || {})
          } catch (e) { /* 自愈失败也不能带崩宿主 */ }
        }, 800)
      } catch (e) { /* noop */ }
    }

    /* 启动期错误回传：只关心来自 /dsh-startup/ 的脚本错误 */
    try {
      window.addEventListener('error', function (ev) {
        try {
          var file = (ev && ev.filename) || ''
          if (file.indexOf('/dsh-startup/') === -1) return
          reportDiag('onerror: ' + String((ev && ev.message) || '') + ' @ ' + file + ':' + String((ev && ev.lineno) || 0))
        } catch (e) { /* noop */ }
      })
      window.addEventListener('unhandledrejection', function (ev) {
        try {
          var r = ev && ev.reason
          reportDiag('unhandledrejection: ' + String((r && r.message) || r))
        } catch (e) { /* noop */ }
      })
    } catch (e) { /* noop */ }


    /* ── 插件 ────────────────────────────────────────────────────────────── */
    var inject = ['slots']

    function apply(ctx) {
      /* 桌面端兜底：Host 的 index 注入不生效时，由这里自举启动界面。
         正常 web 流程下 __DSH_STARTUP__/__DSH_STARTUP_BOOT__ 已就位，本调用直接返回。 */
      selfBoot()
      /* 标题栏适配不能只放在 injectRoot 里：宿主注入成功时 selfBoot 会提前返回，
         injectRoot 根本不会执行 —— 这就是 2.5.0 里那条没生效的根因。
         这里再补一次（幂等），并挂上一次性探针。 */
      try {
        var bootCfg = window.__DSH_STARTUP__ || null
        if (!bootCfg || bootCfg.enabled !== false) {
          adaptCaption(true)
          setTimeout(probeCaption, 1800)
          setTimeout(probeCaption, 4500)
        }
      } catch (e) { /* noop */ }
      healBlackScreen()
      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register(
          { name: 'settings.section', id: 'startup-screen', order: 26, label: '启动动画' },
          function () { return h(Panel, {}) }
        )
      })
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
    })()


    /* 受管入口：ModuleLoader 只会调这一个 apply。
       本插件只裁下开机动画半侧，inject: [slots] 是设置页要的契约。 */
    Object.assign(module.exports, __bootHalf)

    return module.exports
  }
})
