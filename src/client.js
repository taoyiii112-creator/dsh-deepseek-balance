window.__ModuleLoader__.load({
  id: 'dsh-deepseek-balance',
  factory: function (require) {
    'use strict'
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var React = require('react')
    var h = React.createElement
    var API_PATH = '/dsh-deepseek-balance/api/balance'
    var KEY_API_PATH = '/dsh-deepseek-balance/api/key'
    var NS = 'dsh-deepseek-balance'
    var DEFAULT_REFRESH_SECONDS = 60
    var REFRESH_STORAGE_KEY = 'dsh-deepseek-balance.refresh-seconds'
    var ROLL_DURATION = 650
    var ROLL_EASING = 'cubic-bezier(.22,.61,.36,1)'
    var ROLL_TRANSITION = 'transform ' + ROLL_DURATION + 'ms ' + ROLL_EASING
    var PLUGIN_VERSION = '__DshBalancePluginVersion__'
    var DECIMAL_PATTERN = /^(?:0|[1-9]\d{0,29})(?:\.\d{1,18})?$/
    var CURRENCY_PATTERN = /^[A-Z]{3,8}$/
    var REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
    var PET_VIDEO_PATH = '/dsh-deepseek-balance/assets/pet/idle.webm'
    var PET_IMAGE_PATH = '/dsh-deepseek-balance/assets/pet/idle.png'
    var PET_STATIC_DURATION = 15000
    var PET_POSITION_STORAGE_KEY = 'dsh-deepseek-balance.pet-position'
    var PET_HIDDEN_STORAGE_KEY = 'dsh-deepseek-balance.pet-hidden'
    var PET_SCALE_STORAGE_KEY = 'dsh-deepseek-balance.pet-scales'
    var CAPSULE_OFFSET_STORAGE_KEY = 'dsh-deepseek-balance.capsule-offset'
    var SETTINGS_PANEL_POSITION_STORAGE_KEY = 'dsh-deepseek-balance.settings-position'
    var THRESHOLD_STORAGE_KEY = 'dsh-deepseek-balance.balance-threshold'
    var TOP_UP_URL = 'https://platform.deepseek.com/usage'

    var zh = {
      title: 'DeepSeek API 余额', balance: '余额', loading: '正在查询', empty: '余额为空',
      notConfigured: '余额未配置', failed: '余额查询失败', refreshFailed: '查询失败', previousBalance: '上次余额', lastSuccessfulBalance: '上次成功余额', refreshHint: '点击刷新',
      available: '账户可用', unavailable: '账户不可用', insufficient: '余额不足', noBalance: '没有余额', unrecognized: '未获取到余额', keyInvalid: 'Key 无效', updating: '正在更新', total: '总余额', topped: '充值余额',
      granted: '赠送余额', queried: '查询时间', lastSuccessfulQuery: '上次成功查询时间', decreased: '本次较上次减少',
      pluginVersion: '插件版本', runtimeBundle: '运行 bundle SHA-256',
      dataMayLag: '金额来自余额接口，可能与控制台短暂不同步。', topUpHint: '余额不足以调用 API，请到 platform.deepseek.com 充值。',
      setup: '点击“设置密钥”，粘贴一次即可；密钥只保存在本机的 Harness 凭据文件中。',
      setupShort: '设置余额', setupTitle: '设置 DeepSeek API Key', setupDescription: '只需粘贴一次。密钥会保存在本机 Harness 的凭据存储中，不会显示给网页或插件作者。',
      setupLabel: 'API Key', setupPlaceholder: '粘贴 sk- 开头的 API Key', setupSave: '保存并查询', setupCancel: '取消', setupSaving: '正在保存…', setupSaved: '已保存，正在查询余额…', setupOpenKeyPage: '没有 Key？打开 DeepSeek 密钥页面',
      thresholdShort: '阈值', thresholdTitle: '设置余额阈值', thresholdDescription: '余额低于此数值时，在余额旁显示充值链接；留空表示关闭提醒。阈值只保存在本机当前 DeepSeek Harness 配置中，不会同步到其他设备。', thresholdLabel: '阈值金额', thresholdPlaceholder: '例如 10.00', thresholdSave: '保存阈值', thresholdClear: '清除阈值', thresholdInvalid: '请输入非负十进制金额（最多 18 位小数）。', lowBalance: '余额低于阈值', topUp: '充值',
      petHide: '隐藏桌宠', petShow: '显示桌宠',
      CONFIG_KEY_INVALID: '请输入有效的 API Key。', CONFIG_CONTENT_TYPE: '请求格式不正确，请重试。', CONFIG_BODY_INVALID: '密钥提交失败，请重试。', CONFIG_BODY_TOO_LARGE: '密钥内容过大，请检查后重试。', CONFIG_STORE_UNAVAILABLE: '当前 Harness 不支持点击保存，请按安装说明配置。', CONFIG_ENV_READONLY: '启动环境里的 API Key 不能在这里覆盖，请修改启动环境后重启 Harness。', CONFIG_WRITE_FAILED: '密钥保存失败，请重试。',
      CONFIG_MISSING: '尚未配置 DeepSeek API Key。', CONFIG_INVALID: '插件配置无效。',
      UPSTREAM_AUTH_FAILED: 'API Key 无效，或没有余额查询权限。', UPSTREAM_RATE_LIMIT: '请求过于频繁，请稍后再试。',
      UPSTREAM_TIMEOUT: '余额查询超时，请检查网络后重试。', UPSTREAM_NETWORK: '无法连接 DeepSeek 余额服务。', UPSTREAM_NO_BALANCE: '没有余额。',
      UPSTREAM_UNAVAILABLE: 'DeepSeek 余额服务暂时不可用。', UPSTREAM_INVALID_RESPONSE: 'DeepSeek 返回了无法识别的余额数据。',
      FORBIDDEN: '当前页面无权读取余额。', INTERNAL_ERROR: '插件发生内部错误。', UNKNOWN: '余额查询失败。'
    }
    var en = {
      title: 'DeepSeek API Balance', balance: 'Balance', loading: 'Checking', empty: 'No balance',
      notConfigured: 'Balance not configured', failed: 'Balance request failed', refreshFailed: 'Refresh failed', previousBalance: 'Last balance', lastSuccessfulBalance: 'Last successful balance', refreshHint: 'Click to refresh',
      available: 'Account available', unavailable: 'Account unavailable', insufficient: 'Insufficient balance', noBalance: 'No balance', unrecognized: 'Balance unavailable', keyInvalid: 'Invalid key', updating: 'Updating', total: 'Total', topped: 'Topped up',
      granted: 'Granted', queried: 'Query time', lastSuccessfulQuery: 'Last successful query', decreased: 'Decrease since last check',
      pluginVersion: 'Plugin version', runtimeBundle: 'Runtime bundle SHA-256',
      dataMayLag: 'The amount comes from the balance API and may briefly differ from the console.', topUpHint: 'The balance is insufficient for API calls; top up at platform.deepseek.com.',
      setup: 'Click “Set up key” and paste it once; the key stays in Harness local credentials.',
      setupShort: 'Set up balance', setupTitle: 'Set up DeepSeek API Key', setupDescription: 'Paste it once. The key is stored in Harness local credentials and is never shown to the page or the plugin author.',
      setupLabel: 'API Key', setupPlaceholder: 'Paste your sk- API key', setupSave: 'Save and check', setupCancel: 'Cancel', setupSaving: 'Saving…', setupSaved: 'Saved; checking balance…', setupOpenKeyPage: 'Need a key? Open the DeepSeek key page',
      thresholdShort: 'Threshold', thresholdTitle: 'Set balance threshold', thresholdDescription: 'When a balance is below this value, show a top-up link beside the balance. Leave it blank to disable the alert. The threshold stays in this local DeepSeek Harness profile and is not synced to other devices.', thresholdLabel: 'Threshold amount', thresholdPlaceholder: 'For example 10.00', thresholdSave: 'Save threshold', thresholdClear: 'Clear threshold', thresholdInvalid: 'Enter a non-negative decimal amount with up to 18 fractional digits.', lowBalance: 'Balance is below the threshold', topUp: 'Top up',
      petHide: 'Hide pet', petShow: 'Show pet',
      CONFIG_KEY_INVALID: 'Enter a valid API key.', CONFIG_CONTENT_TYPE: 'The request format was invalid. Try again.', CONFIG_BODY_INVALID: 'The key could not be submitted. Try again.', CONFIG_BODY_TOO_LARGE: 'The key input is too large. Check it and try again.', CONFIG_STORE_UNAVAILABLE: 'This Harness cannot save from the page. Use the setup instructions instead.', CONFIG_ENV_READONLY: 'A launch-time API key cannot be replaced here. Change the launch environment and restart Harness.', CONFIG_WRITE_FAILED: 'The key could not be saved. Try again.',
      CONFIG_MISSING: 'The DeepSeek API key is not configured.', CONFIG_INVALID: 'The plugin configuration is invalid.',
      UPSTREAM_AUTH_FAILED: 'The API key is invalid or cannot read balances.', UPSTREAM_RATE_LIMIT: 'Too many requests. Try again later.',
      UPSTREAM_TIMEOUT: 'The balance request timed out.', UPSTREAM_NETWORK: 'Could not reach the DeepSeek balance service.', UPSTREAM_NO_BALANCE: 'There is no balance.',
      UPSTREAM_UNAVAILABLE: 'The DeepSeek balance service is temporarily unavailable.', UPSTREAM_INVALID_RESPONSE: 'DeepSeek returned unrecognized balance data.',
      FORBIDDEN: 'This page cannot read the balance.', INTERNAL_ERROR: 'The plugin encountered an internal error.', UNKNOWN: 'Balance request failed.'
    }

    Object.assign(zh, {
      settings: '插件设置', settingsBalance: '余额', settingsPet: '桌宠', settingsAppearance: '外观',
      refreshInterval: '自动刷新间隔（秒）', refreshInvalid: '请输入 30–300 之间的整数秒。', resetPetPosition: '重置桌宠位置',
      petSize: '桌宠大小', resetPetSize: '恢复默认大小', panelBackground: '设置面板背景', pageBackground: 'DeepSeek 页面背景',
      panelBackgroundHint: '只改变插件设置面板，不影响 DeepSeek 页面背景。', defaultBackground: '页面默认背景', defaultPhoto: '默认静态照片',
      wallpaperEngine: 'Wallpaper Engine', localFile: '本地文件', chooseBackgroundFile: '选择图片或视频',
      pageFileSupport: '页面背景支持 PNG、JPG、WebP、MP4、WebM；图片最大 64 MiB，视频最大 256 MiB。',
      panelFileSupport: '设置面板背景支持 PNG、JPG、WebP 图片，最大 64 MiB。',
      wallpaperLocalOnly: '只读取本机已安装壁纸；列表图只是缩略图。Image/Video 使用项目原文件；Scene/Web/Application 通过本机浏览器窗口选择器捕获 Wallpaper Engine 画面。',
      wallpaperQualityHint: 'Video 动态壁纸直接分段读取本机原始 MP4/WebM，不转码、不二次压缩。Scene/Web/Application 会打开系统默认浏览器的本机配对页；点“开始共享”，并按配对页显示的完整名称选择 DSH Balance Wallpaper Engine 窗口。视频只经本机 WebRTC 回传，不录制或上传。Application 每次启动前需勾选确认。',
      wallpaperVideoQuality: '动态视频直接播放原文件', wallpaperVideoFallback: '静态回退图',
      wallpaperNativeSource: '应用后由 Wallpaper Engine 实时渲染；此处图片仅供选择', wallpaperOriginalUnavailable: '没有找到可验证的原图，不能把缩略图当作原图应用。',
      wallpaperPickerTitle: '选择 Wallpaper Engine 壁纸', wallpaperPickerBack: '返回外观设置', wallpaperPickerHint: '图片使用项目原图，视频直接播放原文件；场景、网页和应用由 Wallpaper Engine 实时渲染。列表缩略图只用于选择。',
      wallpaperRenderStartFailed: 'Wallpaper Engine 或本机配对页启动失败；当前背景保持不变。请确认 Wallpaper Engine 正在运行后重试。',
      wallpaperWindowStartFailed: 'Wallpaper Engine 没有打开所选壁纸窗口；当前背景保持不变。请确认该创意工坊项目已完整下载后重试。',
      wallpaperPairingBrowserStartFailed: '本机浏览器配对页没有打开，壁纸窗口已关闭；请检查 Windows 默认浏览器设置后重试。',
      wallpaperRenderUnavailable: '此壁纸的源文件目前不可用；当前背景保持不变。请刷新列表或确认创意工坊项目已完整下载。',
      wallpaperRenderLimit: '已有 Wallpaper Engine 实时捕获会话占用名额；请关闭旧的本机配对页后重试。当前背景保持不变。',
      wallpaperRenderRequestInvalid: '壁纸启动信息不完整或列表已过期；请刷新列表后重试。当前背景保持不变。',
      wallpaperRenderSessionInvalid: '本机捕获会话没有建立；请重新应用壁纸。当前背景保持不变。',
      wallpaperRenderFailed: '本机捕获连接没有完成；请在配对页重新选择 DSH Balance Wallpaper Engine 窗口。当前背景保持不变。',
      wallpaperRenderHostUnavailable: '插件本机服务没有响应；请重启 DeepSeek Harness 后重试。当前背景保持不变。',
      wallpaperPairingTimeout: '本机浏览器没有完成配对；当前背景保持不变。请在配对页选择具名 Wallpaper Engine 窗口后重试。',
      wallpaperCaptureTimeout: '没有收到 Wallpaper Engine 窗口画面；当前背景保持不变。请确认所选窗口正在播放壁纸后重试。',
      wallpaperCaptureSourceInvalid: '配对页连接成功，但没有收到视频画面；请重新共享正在播放的 Wallpaper Engine 窗口。当前背景保持不变。',
      wallpaperPreviewOnly: '仅有预览图（明确的兼容回退）', wallpaperSourceLow: '原图分辨率偏低，放大可能模糊', wallpaperSourceImage: '使用背景原图', wallpaperPreviewSource: '当前使用预览回退', wallpaperCandidateChoice: '发现多个高清素材候选，请选择', wallpaperCandidateHint: '以下是当前项目内可验证的图片候选；选择后页面和面板会使用同一来源。未选择时只能明确使用预览回退。', wallpaperThumbnail: 'Wallpaper 缩略图',
      localImageQualityHint: '本地图片按原文件保存，不缩放或重新压缩。',
      refreshWallpapers: '刷新列表', noWallpapers: '未找到可用壁纸；可添加 Steam 库路径后重试。', wallpaperNoResults: '没有匹配的已下载壁纸。',
      wallpaperSearch: '搜索已下载壁纸的名称、ID 或类型',
      steamLibraryPlaceholder: 'Steam 库目录，例如 D:\\SteamLibrary', addSteamLibrary: '添加目录', browseSteamLibrary: '浏览…',
      wallpaperVideo: '视频 · 静音循环', wallpaperStatic: '静态图片', wallpaperTypeImage: '图片', wallpaperTypeVideo: '视频', wallpaperTypeScene: '场景', wallpaperTypeWeb: '网页', wallpaperTypeApplication: '应用程序', wallpaperTypeUnknown: '静态壁纸', wallpaperCurrentInUse: '当前使用', wallpaperNativeRenderConnecting: '正在打开 Wallpaper Engine，并等待你在本机浏览器中选择窗口并开始共享…', wallpaperNativeRenderWebrtcFailed: '窗口已选中，但浏览器与插件之间的画面连接失败。请返回并重新应用。', backgroundPreview: '背景预览',
      pageDim: '页面遮罩', panelOpacity: '背景遮罩不透明度', useThisBackground: '应用背景', restoreDefault: '恢复默认',
      backgroundApplied: '背景已应用，并保存在本机当前配置中。', fileFormatError: '文件格式或解码不受支持。',
      backgroundStorageError: '无法保存背景设置，请检查本机当前配置的存储空间。',
      wallpaperListError: '无法读取本机 Wallpaper Engine 壁纸；当前环境可能不支持本机文件服务。',
      wallpaperLibraryInvalid: '目录不是有效的 Steam 库，或没有 Wallpaper Engine 创意工坊内容。',
      wallpaperFolderPickerUnavailable: '无法打开文件夹选择器；可手动输入 Steam 库目录。',
      wallpaperNativeRenderUnavailable: '当前 Harness 插件页面缺少 WebRTC 接收接口，无法显示 Scene/Web/Application 实时画面。',
      wallpaperWindowsOnly: 'Scene/Web/Application 实时渲染需要在 Windows 版 DeepSeek Harness Desktop 中运行。',
      wallpaperRenderLocalOnly: '本机壁纸服务拒绝了此请求；请从运行在这台电脑上的 DeepSeek Harness Desktop 页面重新应用。',
      wallpaperRenderSourceUnavailable: '壁纸缺少可供 Wallpaper Engine 启动的源文件，无法显示实时画面。',
      wallpaperNativeRenderAvailable: '点击“应用背景”后会打开本机浏览器配对页；点击“开始共享”，再按页面显示的完整名称选择 DSH Balance Wallpaper Engine 窗口。请先启动 Wallpaper Engine。',
      wallpaperNativeRenderActive: 'Wallpaper Engine 实时画面正在显示；页面和设置面板使用同一背景时会共用全窗口画面。',
      wallpaperNativeRenderReapply: '此设置已保存。重新打开应用后请再次点击“应用背景”以启动原生画面。',
      wallpaperEngineNotRunning: '请先启动 Wallpaper Engine，再应用此壁纸。',
      wallpaperEngineNotInstalled: '未找到 Steam 库中的 Wallpaper Engine 程序。',
      wallpaperApplicationConsent: '我确认此 Application 壁纸来源可信，并允许它在 Wallpaper Engine 中启动。',
      wallpaperCaptureDenied: '窗口捕获未获准；请在捕获提示中允许后重试。',
      wallpaperCaptureEnded: '捕获会话已关闭或超时；请返回设置重新应用壁纸。',
      wallpaperNativeRenderFailed: '这次没有建立 Wallpaper Engine 实时画面，所以当前背景保持不变。请查看本机配对页提示；若配对页未打开，先确认 Wallpaper Engine 正在运行。',
      wallpaperApplicationDeclined: '你取消了 Application 壁纸启动；当前背景保持不变。',
      motionEffectsHint: '系统“减少动态效果”会影响余额滚动、桌宠动画和本地导入视频；Wallpaper Engine 动态视频不受影响。',
      dragSettingsHint: '拖动设置面板顶部标题栏可移动面板；位置保存在本机当前 DeepSeek Harness 配置中。',
      dragSettingsTitle: '拖动标题栏移动设置面板',
      dragCapsule: '拖动此处可沿页面顶部水平移动余额胶囊',
      backgroundMissing: '所选背景文件已不可用，已恢复默认背景。',
    })
    Object.assign(en, {
      settings: 'Plugin settings', settingsBalance: 'Balance', settingsPet: 'Pet', settingsAppearance: 'Appearance',
      refreshInterval: 'Auto refresh interval (seconds)', refreshInvalid: 'Enter an integer from 30 to 300 seconds.', resetPetPosition: 'Reset pet position',
      petSize: 'Pet size', resetPetSize: 'Reset size', panelBackground: 'Settings panel background', pageBackground: 'DeepSeek page background',
      panelBackgroundHint: 'Changes only the plugin settings panel, separately from the DeepSeek page.',
      defaultBackground: 'Page default', defaultPhoto: 'Default static photo', wallpaperEngine: 'Wallpaper Engine', localFile: 'Local file',
      chooseBackgroundFile: 'Choose image or video', pageFileSupport: 'Page: PNG, JPG, WebP, MP4, WebM. Images up to 64 MiB; videos up to 256 MiB.',
      panelFileSupport: 'Panel: PNG, JPG, WebP images up to 64 MiB.', wallpaperLocalOnly: 'Reads installed local wallpapers only. Images and videos use their project files. Scene/Web/Application use a local browser window picker to capture Wallpaper Engine.',
      wallpaperQualityHint: 'Video wallpapers stream the local original MP4/WebM in byte ranges without transcoding or recompression. Scene/Web/Application open a local pairing page in your default browser; click Share and choose the DSH Balance Wallpaper Engine window using the exact name shown on that page. Video returns over local WebRTC and is not recorded or uploaded. Application wallpapers require confirmation each time.',
      wallpaperVideoQuality: 'Plays the original video file directly', wallpaperVideoFallback: 'static fallback image',
      wallpaperNativeSource: 'Wallpaper Engine renders this live after applying; this image is only for selection', wallpaperOriginalUnavailable: 'No verifiable original image was found. The thumbnail cannot be applied as an original.',
      wallpaperPickerTitle: 'Choose a Wallpaper Engine wallpaper', wallpaperPickerBack: 'Back to appearance settings', wallpaperPickerHint: 'Images use project originals and videos play their original files. Scenes, web, and applications render live in Wallpaper Engine. List thumbnails are only for selection.',
      wallpaperRenderStartFailed: 'Wallpaper Engine or the local pairing page failed to start. The current background was kept. Make sure Wallpaper Engine is running, then retry.',
      wallpaperWindowStartFailed: 'Wallpaper Engine did not open the selected wallpaper window. The current background was kept. Confirm the Workshop project is fully downloaded, then retry.',
      wallpaperPairingBrowserStartFailed: 'The local browser pairing page did not open, so the wallpaper window was closed. Check the Windows default browser and retry.',
      wallpaperRenderUnavailable: 'This wallpaper source is unavailable. The current background was kept. Refresh the list or confirm the Workshop item is fully downloaded.',
      wallpaperRenderLimit: 'The active Wallpaper Engine capture sessions are using all available slots. Close an older local pairing page and retry. The current background was kept.',
      wallpaperRenderRequestInvalid: 'The wallpaper launch details are incomplete or out of date. Refresh the list and retry. The current background was kept.',
      wallpaperRenderSessionInvalid: 'The local capture session was not created. Apply the wallpaper again. The current background was kept.',
      wallpaperRenderFailed: 'The local capture connection did not complete. Select the DSH Balance Wallpaper Engine window again on the pairing page. The current background was kept.',
      wallpaperRenderHostUnavailable: 'The plugin local service did not respond. Restart DeepSeek Harness and retry. The current background was kept.',
      wallpaperPairingTimeout: 'The local browser did not finish pairing. The current background was kept. Select the named Wallpaper Engine window on the pairing page, then retry.',
      wallpaperCaptureTimeout: 'No Wallpaper Engine window image arrived. The current background was kept. Confirm the selected window is playing the wallpaper, then retry.',
      wallpaperCaptureSourceInvalid: 'The pairing page connected but returned no video image. Share the Wallpaper Engine window that is playing the wallpaper, then retry. The current background was kept.',
      wallpaperPreviewOnly: 'Preview only (explicit compatibility fallback)', wallpaperSourceLow: 'Low-resolution source; enlargement may look soft', wallpaperSourceImage: 'Using the source image', wallpaperPreviewSource: 'Using the preview fallback', wallpaperCandidateChoice: 'Multiple high-resolution candidates; choose one', wallpaperCandidateHint: 'These are verified image candidates from the current project. The page and panel will use the same selected source. Without a selection, only the explicit preview fallback is available.', wallpaperThumbnail: 'Wallpaper thumbnail',
      localImageQualityHint: 'Local images are saved as-is, without resizing or recompression.',
      refreshWallpapers: 'Refresh list', noWallpapers: 'No wallpapers found. Add a Steam library path and try again.', wallpaperNoResults: 'No downloaded wallpapers match this search.',
      wallpaperSearch: 'Search downloaded wallpaper names, IDs, or types',
      steamLibraryPlaceholder: 'Steam library path, for example D:\\SteamLibrary', addSteamLibrary: 'Add path', browseSteamLibrary: 'Browse…',
      wallpaperVideo: 'Video · muted loop', wallpaperStatic: 'Static image', wallpaperTypeImage: 'Image', wallpaperTypeVideo: 'Video', wallpaperTypeScene: 'Scene', wallpaperTypeWeb: 'Web', wallpaperTypeApplication: 'Application', wallpaperTypeUnknown: 'Static wallpaper', wallpaperCurrentInUse: 'Currently in use', wallpaperNativeRenderConnecting: 'Opening Wallpaper Engine and waiting for you to select its window and start sharing in the local browser…', wallpaperNativeRenderWebrtcFailed: 'The window was selected, but the browser and plugin could not connect. Return and apply it again.', backgroundPreview: 'Background preview',
      pageDim: 'Page scrim', panelOpacity: 'Background scrim opacity', useThisBackground: 'Apply background', restoreDefault: 'Restore default',
      backgroundApplied: 'Background applied and saved in the local profile.', fileFormatError: 'The file format or decoder is not supported.',
      backgroundStorageError: 'Could not save the background. Check storage for the local profile.',
      wallpaperListError: 'Could not read local Wallpaper Engine files. This environment may not support the local file service.',
      wallpaperLibraryInvalid: 'This is not a valid Steam library or has no Wallpaper Engine workshop content.',
      wallpaperFolderPickerUnavailable: 'Could not open the folder picker. You can enter the Steam library path manually.',
      wallpaperNativeRenderUnavailable: 'The Harness plugin page has no WebRTC receive interface, so Scene/Web/Application cannot show a live image.',
      wallpaperWindowsOnly: 'Live Scene/Web/Application rendering requires DeepSeek Harness Desktop running on Windows.',
      wallpaperRenderLocalOnly: 'The local wallpaper service rejected this request. Apply it from the DeepSeek Harness Desktop running on this computer.',
      wallpaperRenderSourceUnavailable: 'This wallpaper has no launchable source file for Wallpaper Engine live rendering.',
      wallpaperNativeRenderAvailable: 'Apply opens a local pairing page in your default browser. Click Share and select the DSH Balance Wallpaper Engine window using the exact name shown there. Start Wallpaper Engine first.',
      wallpaperNativeRenderActive: 'The live Wallpaper Engine image is active. When the page and settings use the same background, they share one full-window renderer.',
      wallpaperNativeRenderReapply: 'This setting is saved. After reopening the app, click Apply again to start native rendering.',
      wallpaperEngineNotRunning: 'Start Wallpaper Engine before applying this wallpaper.',
      wallpaperEngineNotInstalled: 'Wallpaper Engine was not found in a Steam library.',
      wallpaperApplicationConsent: 'I trust this Application wallpaper and allow it to start in Wallpaper Engine.',
      wallpaperCaptureDenied: 'Window capture was not granted. Allow the capture request and try again.',
      wallpaperCaptureEnded: 'The capture session was closed or timed out. Return to settings and apply the wallpaper again.',
      wallpaperNativeRenderFailed: 'A live Wallpaper Engine image was not established, so the current background was kept. Check the local pairing page; if it did not open, make sure Wallpaper Engine is running.',
      wallpaperApplicationDeclined: 'Application wallpaper startup was cancelled. The current background was kept.',
      motionEffectsHint: 'System “Reduce motion” affects balance scrolling, pet animation, and locally imported videos; Wallpaper Engine video backgrounds are unaffected.',
      dragSettingsHint: 'Drag the settings panel title bar to move it. Its position is saved in the local DeepSeek Harness profile.',
      dragSettingsTitle: 'Drag the title bar to move settings',
      dragCapsule: 'Drag here to move the balance capsule horizontally along the top',
      backgroundMissing: 'The selected background is unavailable; the default background was restored.',
    })

    var styles = {
      balanceGroup: { display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 },
      pill: {
        height: 28, maxWidth: 'min(260px, 32vw)', display: 'inline-flex', alignItems: 'center', gap: 7,
        border: '1px solid rgba(127,127,127,.28)', borderRadius: 999, padding: '0 10px',
        color: 'inherit', font: 'inherit', fontSize: 12, fontWeight: 700, lineHeight: 1,
        whiteSpace: 'nowrap', flex: 'none', transition: 'background-color .15s ease, border-color .15s ease'
      },
      dot: { width: 7, height: 7, borderRadius: '50%', flex: 'none' },
      label: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      balanceItems: { display: 'inline-flex', alignItems: 'center', minWidth: 0, gap: 4 },
      balanceItem: { display: 'inline-flex', alignItems: 'center', minWidth: 0, gap: 4 },
      amount: { display: 'inline-flex', alignItems: 'center', fontVariantNumeric: 'tabular-nums' },
      amountViewport: { display: 'inline-block', overflow: 'hidden', height: '1em', lineHeight: 1, verticalAlign: 'middle', whiteSpace: 'nowrap' },
      amountTrack: { display: 'flex', flexDirection: 'column', width: 'max-content', willChange: 'transform' },
      amountLine: { display: 'block', width: 'max-content', height: '1em', lineHeight: 1 },
      delta: { color: '#d94b4b', fontSize: 10, fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
      srOnly: { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 },
      spinner: { flex: 'none', opacity: 0.65, fontSize: 11 },
      thresholdButton: { border: '1px solid rgba(127,127,127,.28)', borderRadius: 999, padding: '5px 8px', color: 'inherit', background: 'transparent', font: 'inherit', fontSize: 11, lineHeight: 1, cursor: 'pointer', whiteSpace: 'nowrap' },
      balanceButton: { display: 'inline-flex', alignItems: 'center', gap: 7, minWidth: 0, height: '100%', border: 0, padding: 0, color: 'inherit', background: 'transparent', font: 'inherit', cursor: 'pointer' },
      topUpLink: { color: '#342516', background: '#f1c47b', borderRadius: 999, padding: '5px 9px', fontSize: 11, fontWeight: 700, lineHeight: 1, textDecoration: 'none', whiteSpace: 'nowrap' },
      capsuleDragHandle: { position: 'absolute', left: '50%', top: -20, width: 32, height: 24, marginLeft: -16, padding: 0, border: 0, background: 'transparent', cursor: 'ew-resize', touchAction: 'none', zIndex: 2 },
      petFrame: { position: 'fixed', right: 24, bottom: 76, zIndex: 30, width: 'min(180px, 28vw)', maxWidth: 180, lineHeight: 0, pointerEvents: 'auto', userSelect: 'none', touchAction: 'none', cursor: 'grab' },
      petMedia: { display: 'block', width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'center bottom', pointerEvents: 'none' }
    }

    var dialogStyles = {
      overlay: { position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,.42)' },
      card: { width: 'min(460px, 100%)', boxSizing: 'border-box', padding: 24, borderRadius: 14, background: 'var(--dsw-alias-bg-primary, #fff)', color: 'var(--dsw-alias-label-primary, #171717)', boxShadow: '0 18px 60px rgba(0,0,0,.25)' },
      title: { margin: '0 0 10px', fontSize: 19, fontWeight: 600 },
      description: { margin: '0 0 18px', fontSize: 13, lineHeight: 1.55, opacity: .78 },
      label: { display: 'block', marginBottom: 7, fontSize: 13, fontWeight: 600 },
      input: { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid rgba(127,127,127,.35)', borderRadius: 8, color: 'inherit', background: 'transparent', font: 'inherit', fontSize: 14 },
      link: { display: 'inline-block', marginTop: 10, color: 'var(--dsw-alias-interactive-label, #3867d6)', fontSize: 12 },
      status: { minHeight: 20, margin: '12px 0 0', color: '#c45151', fontSize: 12, lineHeight: 1.45 },
      footer: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 },
      button: { border: '1px solid rgba(127,127,127,.35)', borderRadius: 8, padding: '8px 13px', color: 'inherit', background: 'transparent', font: 'inherit', cursor: 'pointer' },
      primaryButton: { borderColor: '#3867d6', color: '#fff', background: '#3867d6' },
    }

    function formatAmount(value, currency) {
      var parts = String(value).split('.')
      var integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      var amount = integer + (parts.length > 1 ? '.' + parts[1] : '')
      var symbol = currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : ''
      return symbol ? symbol + amount : amount + ' ' + currency
    }

    function parseDecimal(value) {
      if (typeof value !== 'string' || !DECIMAL_PATTERN.test(value)) return null
      var parts = value.split('.')
      var fraction = parts[1] || ''
      return { units: BigInt(parts[0] + fraction), scale: fraction.length }
    }

    function decimalDifference(current, previous) {
      var left = parseDecimal(current)
      var right = parseDecimal(previous)
      if (!left || !right) return null
      var scale = Math.max(left.scale, right.scale)
      var leftUnits = left.units * (BigInt(10) ** BigInt(scale - left.scale))
      var rightUnits = right.units * (BigInt(10) ** BigInt(scale - right.scale))
      var difference = leftUnits - rightUnits
      var negative = difference < BigInt(0)
      var magnitude = negative ? -difference : difference
      var text = magnitude.toString()
      if (scale === 0) return (negative ? '-' : '') + text
      text = text.padStart(scale + 1, '0')
      var splitAt = text.length - scale
      return (negative ? '-' : '') + text.slice(0, splitAt) + '.' + text.slice(splitAt)
    }

    function isZeroDecimal(value) {
      var parts = String(value).split('.')
      return parts[0] === '0' && (!parts[1] || /^0+$/.test(parts[1]))
    }

    function formatDelta(value, currency) {
      var text = String(value)
      return text.charAt(0) === '-'
        ? '-' + formatAmount(text.slice(1), currency)
        : '+' + formatAmount(text, currency)
    }

    function balanceMap(data) {
      if (!data || data.isAvailable !== true || !Array.isArray(data.balances) || data.balances.length === 0) return null
      var values = {}
      var hasNonZero = false
      for (var index = 0; index < data.balances.length; index += 1) {
        var item = data.balances[index]
        if (!item || typeof item.currency !== 'string' || !CURRENCY_PATTERN.test(item.currency) || Object.prototype.hasOwnProperty.call(values, item.currency)) return null
        if (typeof item.totalBalance !== 'string' || !DECIMAL_PATTERN.test(item.totalBalance)) return null
        values[item.currency] = item.totalBalance
        if (!isZeroDecimal(item.totalBalance)) hasNonZero = true
      }
      return hasNonZero ? values : null
    }

    function sameCurrencySet(left, right) {
      var leftKeys = Object.keys(left)
      var rightKeys = Object.keys(right)
      if (leftKeys.length !== rightKeys.length) return false
      return leftKeys.every(function (currency) { return Object.prototype.hasOwnProperty.call(right, currency) })
    }

    function compareBalanceData(previousByCurrency, data) {
      var currentByCurrency = balanceMap(data)
      if (!currentByCurrency) return { baselineByCurrency: null, changeSet: {}, comparable: false }
      if (!previousByCurrency || !sameCurrencySet(previousByCurrency, currentByCurrency)) {
        return { baselineByCurrency: currentByCurrency, changeSet: {}, comparable: true }
      }

      var changeSet = {}
      var currencies = Object.keys(currentByCurrency)
      for (var index = 0; index < currencies.length; index += 1) {
        var currency = currencies[index]
        var from = previousByCurrency[currency]
        var to = currentByCurrency[currency]
        var delta = decimalDifference(to, from)
        if (delta === null) return { baselineByCurrency: currentByCurrency, changeSet: {}, comparable: true }
        var kind = isZeroDecimal(delta) ? 'same' : delta.charAt(0) === '-' ? 'decrease' : 'increase'
        changeSet[currency] = { from: from, to: to, delta: delta, kind: kind }
      }
      return { baselineByCurrency: currentByCurrency, changeSet: changeSet, comparable: true }
    }

    function createBalanceStore() {
      var snapshot = {
        data: null, error: null, loading: false,
        comparison: { changeSet: {}, revision: 0, comparable: false }
      }
      var listeners = new Set()
      var request = null
      var timer = null
      var sequence = 0
      var lastAttempt = 0
      var active = false
      var baselineByCurrency = null
      var revision = 0
      var intervalSeconds = readRefreshSeconds()

      function publish(next) {
        snapshot = next
        listeners.forEach(function (listener) { listener(snapshot) })
      }

      function resetComparisonState() {
        baselineByCurrency = null
        revision += 1
        return { changeSet: {}, revision: revision, comparable: false }
      }

      function credentialChanged() {
        ++sequence
        if (request) request.abort()
        request = null
        lastAttempt = 0
        var comparison = resetComparisonState()
        publish({ data: null, error: null, loading: false, comparison: comparison })
        load(true)
      }

      function commitSuccessfulData(data) {
        var comparison = compareBalanceData(baselineByCurrency, data)
        baselineByCurrency = comparison.baselineByCurrency
        revision += 1
        return { changeSet: comparison.changeSet, revision: revision, comparable: comparison.comparable }
      }

      function failedComparison() {
        return {
          changeSet: {},
          revision: revision,
          comparable: Boolean(baselineByCurrency),
        }
      }

      function load(force) {
        var now = Date.now()
        if (snapshot.loading) return
        if (!force && lastAttempt > 0 && now - lastAttempt < intervalSeconds * 1000) return
        var current = ++sequence
        lastAttempt = now
        request = new AbortController()
        publish({ data: snapshot.data, error: null, loading: true, comparison: snapshot.comparison })
        if (typeof petStudio !== 'undefined') petStudio.dispatch({ type: 'query-start' })
        void fetch(API_PATH, {
          method: 'GET', cache: 'no-store', credentials: 'same-origin',
          headers: { accept: 'application/json' }, signal: request.signal
        }).then(function (response) {
          return response.json().catch(function () { return { ok: false, code: 'UPSTREAM_INVALID_RESPONSE' } })
            .then(function (body) { return { response: response, body: body } })
        }).then(function (result) {
          if (current !== sequence) return
          if (!result.response.ok || !result.body || result.body.ok !== true) throw new Error(result.body?.code || 'UNKNOWN')
          var comparison = commitSuccessfulData(result.body)
          publish({ data: result.body, error: null, loading: false, comparison: comparison })
          if (typeof petStudio !== 'undefined') {
            var events = Object.keys(comparison.changeSet).map(function (currency) {
              var change = comparison.changeSet[currency]
              return { type: 'balance-' + change.kind, currency: currency, delta: change.delta }
            })
            events.sort(function (left, right) {
              var priority = { 'balance-decrease': 3, 'balance-increase': 2, 'balance-same': 1 }
              return priority[right.type] - priority[left.type]
            })
            events.push({ type: 'query-success' })
            petStudio.dispatchBatch(events)
          }
        }).catch(function (cause) {
          if (current !== sequence || cause.name === 'AbortError') return
          var errorCode = cause.code || cause.message || 'UNKNOWN'
          if (typeof petStudio !== 'undefined') petStudio.dispatch({ type: 'query-failure', code: errorCode })
          if (errorCode === 'CONFIG_MISSING' || errorCode === 'UPSTREAM_AUTH_FAILED') {
            publish({ data: null, error: errorCode, loading: false, comparison: resetComparisonState() })
          } else {
            publish({ data: snapshot.data, error: errorCode, loading: false, comparison: failedComparison() })
          }
        }).finally(function () {
          if (current === sequence) request = null
        })
      }

      function onVisibility() {
        if (document.visibilityState === 'visible') load(false)
      }

      function schedule() {
        if (timer !== null) clearInterval(timer)
        timer = active ? setInterval(function () {
          if (document.visibilityState === 'visible') load(false)
        }, intervalSeconds * 1000) : null
      }

      function start() {
        if (active) return
        active = true
        load(true)
        schedule()
        document.addEventListener('visibilitychange', onVisibility)
      }

      function stop() {
        if (!active) return
        active = false
        clearInterval(timer)
        timer = null
        document.removeEventListener('visibilitychange', onVisibility)
        if (request) {
          ++sequence
          request.abort()
          request = null
          lastAttempt = 0
          snapshot = { data: snapshot.data, error: snapshot.error, loading: false, comparison: snapshot.comparison }
        }
      }

      return {
        getSnapshot: function () { return snapshot },
        subscribe: function (listener) {
          listeners.add(listener)
          if (listeners.size === 1) start()
          return function () {
            listeners.delete(listener)
            if (listeners.size === 0) stop()
          }
        },
        refresh: function () { load(true) },
        resetComparison: function () {
          publish({ data: snapshot.data, error: snapshot.error, loading: snapshot.loading, comparison: resetComparisonState() })
        },
        credentialChanged: credentialChanged
        ,getRefreshSeconds: function () { return intervalSeconds }
        ,setRefreshSeconds: function (value) {
          var normalized = normalizeRefreshSeconds(value)
          if (normalized === null) return false
          intervalSeconds = normalized
          writeRefreshSeconds(normalized)
          schedule()
          return true
        }
      }
    }

    var balanceStore = createBalanceStore()

    function errorKey(error) {
      return error && Object.prototype.hasOwnProperty.call(zh, error) ? error : 'UNKNOWN'
    }

    function useReducedMotion() {
      var _reduced = React.useState(function () {
        return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches
      })
      var reduced = _reduced[0]
      var setReduced = _reduced[1]

      React.useEffect(function () {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
        var media = window.matchMedia(REDUCED_MOTION_QUERY)
        var update = function () { setReduced(media.matches) }
        update()
        if (typeof media.addEventListener === 'function') media.addEventListener('change', update)
        else media.addListener?.(update)
        return function () {
          if (typeof media.removeEventListener === 'function') media.removeEventListener('change', update)
          else media.removeListener?.(update)
        }
      }, [])
      return reduced
    }

    function getLocalStorage() {
      try {
        return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null
      } catch {
        return null
      }
    }

    function normalizeRefreshSeconds(value) {
      var text = String(value).trim()
      if (!/^(?:0|[1-9]\d*)$/.test(text)) return null
      var seconds = Number(text)
      return Number.isSafeInteger(seconds) && seconds >= 30 && seconds <= 300 ? seconds : null
    }

    function readRefreshSeconds() {
      var storage = getLocalStorage()
      if (!storage) return DEFAULT_REFRESH_SECONDS
      try { return normalizeRefreshSeconds(storage.getItem(REFRESH_STORAGE_KEY)) || DEFAULT_REFRESH_SECONDS } catch { return DEFAULT_REFRESH_SECONDS }
    }

    function writeRefreshSeconds(value) {
      var storage = getLocalStorage()
      if (!storage) return
      try { storage.setItem(REFRESH_STORAGE_KEY, String(value)) } catch {}
    }

    function normalizeThreshold(value) {
      if (value === null || value === undefined) return null
      var text = String(value).trim()
      return text !== '' && DECIMAL_PATTERN.test(text) ? text : null
    }

    function readThreshold() {
      var storage = getLocalStorage()
      if (!storage) return null
      try { return normalizeThreshold(storage.getItem(THRESHOLD_STORAGE_KEY)) } catch { return null }
    }

    function writeThreshold(value) {
      var storage = getLocalStorage()
      if (!storage) return
      try {
        var normalized = normalizeThreshold(value)
        if (normalized === null) storage.removeItem(THRESHOLD_STORAGE_KEY)
        else storage.setItem(THRESHOLD_STORAGE_KEY, normalized)
      } catch {}
    }

    function compareDecimals(left, right) {
      var parsedLeft = parseDecimal(left)
      var parsedRight = parseDecimal(right)
      if (!parsedLeft || !parsedRight) return null
      var scale = Math.max(parsedLeft.scale, parsedRight.scale)
      var leftUnits = parsedLeft.units * (BigInt(10) ** BigInt(scale - parsedLeft.scale))
      var rightUnits = parsedRight.units * (BigInt(10) ** BigInt(scale - parsedRight.scale))
      if (leftUnits < rightUnits) return -1
      if (leftUnits > rightUnits) return 1
      return 0
    }

    function hasBalanceBelowThreshold(data, threshold) {
      var normalized = normalizeThreshold(threshold)
      if (normalized === null || !data || data.isAvailable !== true || !Array.isArray(data.balances)) return false
      return data.balances.some(function (item) {
        return item && compareDecimals(item.totalBalance, normalized) === -1
      })
    }

    /*__DshPetStudio__*/

    function readPetPosition() {
      var fallback = { right: 24, bottom: 76 }
      var storage = getLocalStorage()
      if (!storage) return fallback
      try {
        var value = JSON.parse(storage.getItem(PET_POSITION_STORAGE_KEY) || 'null')
        if (!value || !Number.isFinite(value.right) || !Number.isFinite(value.bottom)) return fallback
        return { right: value.right, bottom: value.bottom }
      } catch { return fallback }
    }

    function writePetPosition(position) {
      var storage = getLocalStorage()
      if (!storage) return
      try { storage.setItem(PET_POSITION_STORAGE_KEY, JSON.stringify(position)) } catch {}
    }

    function readPetHidden() {
      var storage = getLocalStorage()
      if (!storage) return false
      try { return storage.getItem(PET_HIDDEN_STORAGE_KEY) === 'true' } catch { return false }
    }

    function writePetHidden(hidden) {
      var storage = getLocalStorage()
      if (!storage) return
      try {
        if (hidden) storage.setItem(PET_HIDDEN_STORAGE_KEY, 'true')
        else storage.removeItem(PET_HIDDEN_STORAGE_KEY)
      } catch {}
    }

    function readPetScale(schemeId) {
      var storage = getLocalStorage()
      if (!storage) return 100
      try {
        var values = JSON.parse(storage.getItem(PET_SCALE_STORAGE_KEY) || '{}')
        var value = Number(values && values[schemeId || 'builtin'])
        return Number.isFinite(value) ? Math.max(50, Math.min(200, Math.round(value))) : 100
      } catch { return 100 }
    }

    function writePetScale(schemeId, value) {
      var storage = getLocalStorage()
      if (!storage) return
      try {
        var values = JSON.parse(storage.getItem(PET_SCALE_STORAGE_KEY) || '{}')
        if (!values || typeof values !== 'object' || Array.isArray(values)) values = {}
        values[schemeId || 'builtin'] = Math.max(50, Math.min(200, Math.round(Number(value) || 100)))
        storage.setItem(PET_SCALE_STORAGE_KEY, JSON.stringify(values))
      } catch {}
    }

    function readCapsuleOffset() {
      var storage = getLocalStorage()
      if (!storage) return 0
      try {
        var value = Number(storage.getItem(CAPSULE_OFFSET_STORAGE_KEY))
        return Number.isFinite(value) ? Math.max(-4000, Math.min(4000, value)) : 0
      } catch { return 0 }
    }

    function writeCapsuleOffset(value) {
      try { getLocalStorage()?.setItem(CAPSULE_OFFSET_STORAGE_KEY, String(Math.round(value))) } catch {}
    }

    function readSettingsPosition() {
      try {
        var value = JSON.parse(getLocalStorage()?.getItem(SETTINGS_PANEL_POSITION_STORAGE_KEY) || 'null')
        if (!value || !Number.isFinite(value.x) || !Number.isFinite(value.y)) return null
        return { x: value.x, y: value.y }
      } catch { return null }
    }

    function writeSettingsPosition(position) {
      try { getLocalStorage()?.setItem(SETTINGS_PANEL_POSITION_STORAGE_KEY, JSON.stringify(position)) } catch {}
    }

    /*__DshPetUi__*/

    function rollingPlan(previousValue, value, direction) {
      if (direction === 'increase') {
        return {
          lines: [value, previousValue],
          fromTransform: 'translateY(-50%)',
          toTransform: 'translateY(0)',
        }
      }
      return {
        lines: [previousValue, value],
        fromTransform: 'translateY(0)',
        toTransform: 'translateY(-50%)',
      }
    }

    function RollingAmount(props) {
      var reduced = useReducedMotion()
      var trackRef = React.useRef(null)
      var animationRef = React.useRef(null)
      var _animation = React.useState({ revision: -1, active: false, from: '', direction: 'decrease' })
      var animation = _animation[0]
      var setAnimation = _animation[1]
      var hasPrevious = typeof props.previousValue === 'string' && props.previousValue !== ''
      var shouldAnimate = Boolean(props.animate && hasPrevious && props.previousValue !== props.value && !reduced)
      var formatted = formatAmount(props.value, props.currency)
      var pending = shouldAnimate && animation.revision !== props.revision
      var active = shouldAnimate && animation.revision === props.revision && animation.active
      var visual = pending || active
      var direction = pending ? props.direction : animation.direction
      var previousValue = pending ? props.previousValue : animation.from
      var plan = visual ? rollingPlan(formatAmount(previousValue, props.currency), formatted, direction) : null
      var trackStyle = Object.assign({}, styles.amountTrack, {
        transform: plan ? plan.fromTransform : 'translateY(0)',
        transition: 'none',
      })

      React.useLayoutEffect(function () {
        var frameOne = null
        var frameTwo = null
        var fallbackTimer = null
        var cancelled = false
        var schedule = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
          ? function (callback) { return window.requestAnimationFrame(callback) }
          : function (callback) { return setTimeout(callback, 0) }
        var cancelFrame = typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function'
          ? function (value) { window.cancelAnimationFrame(value) }
          : function (value) { clearTimeout(value) }

        function finish() {
          if (cancelled) return
          var finishedAnimation = animationRef.current
          animationRef.current = null
          if (finishedAnimation) {
            // Drop the forwards fill after preserving the final visible offset.
            if (trackRef.current && plan) trackRef.current.style.transform = plan.toTransform
            finishedAnimation.cancel?.()
          }
          setAnimation({ revision: props.revision, active: false, from: props.value, direction: props.direction })
        }

        function start() {
          if (cancelled || !trackRef.current || !plan) return
          var track = trackRef.current
          if (typeof track.animate === 'function') {
            var nativeAnimation = track.animate([
              { transform: plan.fromTransform },
              { transform: plan.toTransform },
            ], { duration: ROLL_DURATION, easing: ROLL_EASING, fill: 'forwards' })
            animationRef.current = nativeAnimation
            var settled = function () {
              if (animationRef.current === nativeAnimation) finish()
            }
            if (nativeAnimation.finished && typeof nativeAnimation.finished.then === 'function') {
              nativeAnimation.finished.then(settled, settled)
            } else {
              nativeAnimation.onfinish = settled
            }
            return
          }

          track.style.transition = ROLL_TRANSITION
          frameOne = schedule(function () {
            if (cancelled) return
            track.style.transform = plan.toTransform
            fallbackTimer = setTimeout(finish, ROLL_DURATION + 30)
          })
        }

        if (!shouldAnimate) {
          if (animationRef.current) animationRef.current.cancel?.()
          animationRef.current = null
          if (animation.active) setAnimation({ revision: props.revision, active: false, from: props.value, direction: props.direction })
          return undefined
        }

        if (animation.revision === props.revision && animation.active) return undefined
        if (animationRef.current) animationRef.current.cancel?.()
        animationRef.current = null
        setAnimation({ revision: props.revision, active: true, from: props.previousValue, direction: props.direction })
        frameOne = schedule(function () {
          frameTwo = schedule(start)
        })

        return function () {
          cancelled = true
          if (frameOne !== null) cancelFrame(frameOne)
          if (frameTwo !== null) cancelFrame(frameTwo)
          if (fallbackTimer !== null) clearTimeout(fallbackTimer)
          if (animationRef.current) animationRef.current.cancel?.()
          animationRef.current = null
        }
      }, [props.animate, props.direction, props.previousValue, props.revision, props.value, reduced])

      return h('span', { style: styles.amount, title: formatted },
        h('span', { style: styles.amountViewport, 'aria-hidden': 'true' },
          h('span', { ref: trackRef, style: trackStyle },
            visual
              ? plan.lines.map(function (line, index) { return h('span', { key: 'line-' + index, style: styles.amountLine }, line) })
              : h('span', { style: styles.amountLine }, formatted)
          )
        ),
        h('span', { style: styles.srOnly }, formatted)
      )
    }

    function BalanceDelta(props) {
      var change = props.change
      if (!change || change.kind !== 'decrease') return null
      var value = formatDelta(change.delta, props.currency)
      var announcement = props.t('decreased') + ' ' + value
      return h('span', { style: styles.delta, title: announcement },
        h('span', { 'aria-hidden': 'true' }, value),
        h('span', { key: 'delta-' + props.revision, style: styles.srOnly, 'aria-live': 'polite' }, announcement)
      )
    }

    function compactBalanceItems(data) {
      var children = []
      data.balances.forEach(function (item, index) {
        if (index > 0) children.push(h('span', { key: 'separator-' + index, 'aria-hidden': 'true' }, ' / '))
        children.push(h('span', { key: item.currency, style: styles.balanceItem }, formatAmount(item.totalBalance, item.currency)))
      })
      return children
    }

    function hasNonZeroBalance(data) {
      if (!data || !Array.isArray(data.balances)) return false
      return data.balances.some(function (item) {
        return item && typeof item.totalBalance === 'string' && !isZeroDecimal(item.totalBalance)
      })
    }

    function displayState(snapshot) {
      if (snapshot.error === 'CONFIG_MISSING') return 'setup'
      if (snapshot.error === 'UPSTREAM_AUTH_FAILED') return 'key-invalid'
      if (snapshot.error === 'UPSTREAM_NO_BALANCE') return 'no-balance'
      if (snapshot.error === 'UPSTREAM_INVALID_RESPONSE') return 'unrecognized'
      if (snapshot.error) return 'failed'
      if (!snapshot.data) return snapshot.loading ? 'loading' : 'setup'
      if (snapshot.data.isAvailable !== true || !hasNonZeroBalance(snapshot.data)) return 'no-balance'
      return 'balance'
    }

    function historicalBalanceLines(snapshot, t) {
      if (!snapshot.data || !Array.isArray(snapshot.data.balances) || snapshot.data.balances.length === 0) return []
      return snapshot.data.balances.map(function (item) {
        return t('lastSuccessfulBalance') + ' · ' + item.currency + ' ' + formatAmount(item.totalBalance, item.currency)
      })
    }

    function compactLabel(snapshot, t) {
      var state = displayState(snapshot)
      if (state === 'balance') {
        var changeSet = snapshot.comparison?.changeSet || {}
        var revision = snapshot.comparison?.revision || 0
        var items = []
        snapshot.data.balances.forEach(function (item, index) {
          if (index > 0) items.push(h('span', { key: item.currency + '-separator', 'aria-hidden': 'true' }, ' / '))
          var change = changeSet[item.currency]
          items.push(h('span', { key: item.currency, style: styles.balanceItem },
            h(RollingAmount, {
              value: item.totalBalance,
              previousValue: change?.from,
              currency: item.currency,
              animate: change?.kind === 'decrease' || change?.kind === 'increase',
              direction: change?.kind,
              revision: revision,
            }),
            h(BalanceDelta, { change: change, currency: item.currency, revision: revision, t: t })
          ))
        })
        return h('span', { style: styles.label },
          h('span', null, t('balance') + ' '),
          h('span', { style: styles.balanceItems }, items)
        )
      }
      if (state === 'no-balance') return h('span', { style: styles.label }, t('noBalance'))
      if (state === 'unrecognized') return h('span', { style: styles.label }, t('unrecognized'))
      if (state === 'key-invalid') return h('span', { style: styles.label }, t('keyInvalid'))
      if (state === 'failed') return h('span', { style: styles.label }, t('failed'))
      if (state === 'setup') return h('span', { style: styles.label }, t('setupShort'))
      return h('span', { style: styles.label }, t('loading'))
    }

    function detailText(snapshot, t) {
      var lines = [t('title')]
      var state = displayState(snapshot)
      var currentSuccess = Boolean(snapshot.data && !snapshot.error)
      if (state === 'balance' && currentSuccess) {
        lines.push(t('available'))
        snapshot.data.balances.forEach(function (item) {
          lines.push(item.currency + ' · ' + t('total') + ' ' + formatAmount(item.totalBalance, item.currency))
          lines.push(t('topped') + ' ' + formatAmount(item.toppedUpBalance, item.currency) + ' · ' + t('granted') + ' ' + formatAmount(item.grantedBalance, item.currency))
        })
        Object.keys(snapshot.comparison?.changeSet || {}).forEach(function (currency) {
          var change = snapshot.comparison.changeSet[currency]
          if (change.kind === 'decrease') lines.push(t('decreased') + ': ' + formatDelta(change.delta, currency))
        })
        lines.push(t('queried') + ': ' + new Date(snapshot.data.fetchedAt).toLocaleString())
        if (snapshot.loading) lines.push(t('updating'))
        lines.push(t('dataMayLag'))
      } else if (state === 'no-balance' && currentSuccess) {
        lines.push(t('noBalance'))
        if (snapshot.data.isAvailable === false) {
          lines.push(t('unavailable'))
          lines.push(t('topUpHint'))
          snapshot.data.balances.forEach(function (item) {
            lines.push(t('total') + ' · ' + item.currency + ' ' + formatAmount(item.totalBalance, item.currency))
          })
        }
        lines.push(t('queried') + ': ' + new Date(snapshot.data.fetchedAt).toLocaleString())
      } else if (snapshot.error) {
        lines.push(t(displayState(snapshot) === 'unrecognized' ? 'unrecognized' : errorKey(snapshot.error)))
        historicalBalanceLines(snapshot, t).forEach(function (line) { lines.push(line) })
        if (snapshot.data?.fetchedAt) lines.push(t('lastSuccessfulQuery') + ': ' + new Date(snapshot.data.fetchedAt).toLocaleString())
        if (snapshot.error === 'CONFIG_MISSING') lines.push(t('setup'))
      } else {
        lines.push(t('loading'))
      }
      var version = snapshot.data?.pluginVersion || PLUGIN_VERSION
      lines.push(t('pluginVersion') + ': ' + version)
      if (snapshot.data?.clientSha256) lines.push(t('runtimeBundle') + ': ' + snapshot.data.clientSha256)
      lines.push(t('refreshHint'))
      return lines.join('\n')
    }

    function SetupDialog(props) {
      var _value = React.useState(''), apiKey = _value[0], setApiKey = _value[1]
      var _saving = React.useState(false), saving = _saving[0], setSaving = _saving[1]
      var _message = React.useState(''), message = _message[0], setMessage = _message[1]

      React.useEffect(function () {
        if (!props.open) {
          setApiKey('')
          setSaving(false)
          setMessage('')
        }
      }, [props.open])
      React.useEffect(function () {
        if (!props.open) return undefined
        var onKey = function (event) { if (event.key === 'Escape' && !saving) props.onClose() }
        document.addEventListener('keydown', onKey)
        return function () { document.removeEventListener('keydown', onKey) }
      }, [props.open, saving])

      function save(event) {
        event?.preventDefault?.()
        var value = apiKey.trim()
        if (value === '') {
          setMessage(props.t('CONFIG_KEY_INVALID'))
          return
        }
        setSaving(true)
        setMessage('')
        fetch(KEY_API_PATH, {
          method: 'POST', cache: 'no-store', credentials: 'same-origin',
          headers: { accept: 'application/json', 'content-type': 'application/json' },
          body: JSON.stringify({ apiKey: value })
        }).then(function (response) {
          return response.json().catch(function () { return { ok: false, code: 'CONFIG_WRITE_FAILED' } })
            .then(function (body) { return { response: response, body: body } })
        }).then(function (result) {
          if (!result.response.ok || result.body.ok !== true) throw new Error(result.body.code || 'CONFIG_WRITE_FAILED')
          props.onSaved()
        }).catch(function (error) {
          setMessage(props.t(errorKey(error.message)))
        }).finally(function () {
          setSaving(false)
        })
      }

      if (!props.open) return null
      var saveStyle = Object.assign({}, dialogStyles.button, dialogStyles.primaryButton, saving ? { opacity: .6, cursor: 'progress' } : {})
      return h('div', {
        role: 'presentation', style: dialogStyles.overlay,
        onMouseDown: function (event) { if (event.target === event.currentTarget) props.onClose() }
      }, h('div', {
        role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dsh-balance-setup-title',
        style: dialogStyles.card, onMouseDown: function (event) { event.stopPropagation() }
      }, h('form', { onSubmit: save },
        h('h2', { id: 'dsh-balance-setup-title', style: dialogStyles.title }, props.t('setupTitle')),
        h('p', { style: dialogStyles.description }, props.t('setupDescription')),
        h('label', { style: dialogStyles.label, htmlFor: 'dsh-balance-api-key' }, props.t('setupLabel')),
        h('input', {
          id: 'dsh-balance-api-key', type: 'password', autoComplete: 'off', autoFocus: true,
          value: apiKey, placeholder: props.t('setupPlaceholder'), style: dialogStyles.input,
          onChange: function (event) { setApiKey(event.target.value) }, disabled: saving
        }),
        h('a', { href: 'https://platform.deepseek.com/api_keys', target: '_blank', rel: 'noreferrer', style: dialogStyles.link }, props.t('setupOpenKeyPage')),
        h('p', { role: 'status', 'aria-live': 'polite', style: Object.assign({}, dialogStyles.status, saving ? { color: 'inherit', opacity: .7 } : {}) }, saving ? props.t('setupSaving') : message),
        h('div', { style: dialogStyles.footer },
          h('button', { type: 'button', style: dialogStyles.button, onClick: props.onClose, disabled: saving }, props.t('setupCancel')),
          h('button', { type: 'submit', style: saveStyle, disabled: saving }, saving ? props.t('setupSaving') : props.t('setupSave'))
        )
      )))
    }

    function ThresholdDialog(props) {
      var _value = React.useState(props.threshold || ''), value = _value[0], setValue = _value[1]
      var _message = React.useState(''), message = _message[0], setMessage = _message[1]

      React.useEffect(function () {
        if (props.open) {
          setValue(props.threshold || '')
          setMessage('')
        }
      }, [props.open, props.threshold])
      React.useEffect(function () {
        if (!props.open) return undefined
        var onKey = function (event) { if (event.key === 'Escape') props.onClose() }
        document.addEventListener('keydown', onKey)
        return function () { document.removeEventListener('keydown', onKey) }
      }, [props.open])

      function save(event) {
        event?.preventDefault?.()
        var text = value.trim()
        if (text !== '' && normalizeThreshold(text) === null) {
          setMessage(props.t('thresholdInvalid'))
          return
        }
        var normalized = normalizeThreshold(text)
        writeThreshold(normalized)
        props.onSaved(normalized)
      }

      function clear() {
        writeThreshold(null)
        props.onSaved(null)
      }

      if (!props.open) return null
      var saveStyle = Object.assign({}, dialogStyles.button, dialogStyles.primaryButton)
      return h('div', {
        role: 'presentation', style: dialogStyles.overlay,
        onMouseDown: function (event) { if (event.target === event.currentTarget) props.onClose() }
      }, h('div', {
        role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dsh-balance-threshold-title',
        style: dialogStyles.card, onMouseDown: function (event) { event.stopPropagation() }
      }, h('form', { onSubmit: save },
        h('h2', { id: 'dsh-balance-threshold-title', style: dialogStyles.title }, props.t('thresholdTitle')),
        h('p', { style: dialogStyles.description }, props.t('thresholdDescription')),
        h('label', { style: dialogStyles.label, htmlFor: 'dsh-balance-threshold' }, props.t('thresholdLabel')),
        h('input', {
          id: 'dsh-balance-threshold', type: 'text', inputMode: 'decimal', autoComplete: 'off', autoFocus: true,
          value: value, placeholder: props.t('thresholdPlaceholder'), style: dialogStyles.input,
          onChange: function (event) { setValue(event.target.value) }
        }),
        h('p', { role: 'status', 'aria-live': 'polite', style: dialogStyles.status }, message),
        h('div', { style: dialogStyles.footer },
          h('button', { type: 'button', style: dialogStyles.button, onClick: props.onClose }, props.t('setupCancel')),
          props.threshold ? h('button', { type: 'button', style: dialogStyles.button, onClick: clear }, props.t('thresholdClear')) : null,
          h('button', { type: 'submit', style: saveStyle }, props.t('thresholdSave'))
        )
      )))
    }

    /*__DshAppearanceUi__*/

    function SettingsPanel(props) {
      var _tab = React.useState(props.initialTab || 'balance'), tab = _tab[0], setTab = _tab[1]
      var _seconds = React.useState(String(balanceStore.getRefreshSeconds())), seconds = _seconds[0], setSeconds = _seconds[1]
      var _message = React.useState(''), message = _message[0], setMessage = _message[1]
      var _wallpaperPage = React.useState(null), wallpaperPage = _wallpaperPage[0], setWallpaperPage = _wallpaperPage[1]
      var _panelPosition = React.useState(readSettingsPosition), panelPosition = _panelPosition[0], setPanelPosition = _panelPosition[1]
      var panelRef = React.useRef(null)
      var panelVideoRef = React.useRef(null)
      var panelDragRef = React.useRef(null)
      React.useEffect(function () { if (props.open) { setTab(props.initialTab || 'balance'); setSeconds(String(balanceStore.getRefreshSeconds())); setMessage('') } }, [props.open, props.initialTab])
      React.useEffect(function () { if (!props.open) setWallpaperPage(null) }, [props.open])
      React.useEffect(function () {
        if (!props.open) return undefined
        function keepPanelVisible() {
          var rect = panelRef.current?.getBoundingClientRect?.()
          if (!rect) return
          var next = clampPanelPosition({ x: rect.left, y: rect.top }, rect)
          if (Math.abs(next.x - rect.left) > 1 || Math.abs(next.y - rect.top) > 1) setPanelPosition(next)
        }
        keepPanelVisible()
        window.addEventListener('resize', keepPanelVisible)
        return function () { window.removeEventListener('resize', keepPanelVisible) }
      }, [props.open])
      React.useEffect(function () {
        if (!props.open || props.modalOpen) return undefined
        panelRef.current?.focus?.()
        var onKey = function (event) {
          if (event.key === 'Escape') {
            if (wallpaperPage) { setWallpaperPage(null); return }
            props.onClose(); return
          }
        }
        document.addEventListener('keydown', onKey)
        return function () { document.removeEventListener('keydown', onKey) }
      }, [props.open, props.modalOpen, wallpaperPage])
      if (!props.open) return null
      function clampPanelPosition(position, rect) {
        var width = window.innerWidth || 1280
        var height = window.innerHeight || 800
        return {
          x: Math.max(12, Math.min(width - rect.width - 12, position.x)),
          y: Math.max(12, Math.min(height - rect.height - 12, position.y))
        }
      }
      function startPanelDrag(event) {
        if (event.button !== 0 || event.target.closest?.('button, input, select, textarea, a')) return
        var rect = panelRef.current?.getBoundingClientRect?.()
        if (!rect) return
        var position = { x: rect.left, y: rect.top }
        panelDragRef.current = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, position: position }
        setPanelPosition(position)
        event.currentTarget.setPointerCapture?.(event.pointerId)
        event.preventDefault()
      }
      function movePanelDrag(event) {
        var drag = panelDragRef.current
        if (!drag || drag.pointerId !== event.pointerId) return
        var rect = panelRef.current?.getBoundingClientRect?.()
        if (!rect) return
        var next = clampPanelPosition({ x: event.clientX - drag.offsetX, y: event.clientY - drag.offsetY }, rect)
        drag.position = next
        setPanelPosition(next)
      }
      function finishPanelDrag(event) {
        var drag = panelDragRef.current
        if (!drag || drag.pointerId !== event.pointerId) return
        panelDragRef.current = null
        writeSettingsPosition(drag.position)
        try { event.currentTarget.releasePointerCapture?.(event.pointerId) } catch {}
      }
      function saveSeconds(value) {
        var normalized = normalizeRefreshSeconds(value)
        if (normalized === null) { setMessage(props.t('refreshInvalid')); return }
        balanceStore.setRefreshSeconds(normalized)
        setSeconds(String(normalized)); setMessage('')
      }
      var button = Object.assign({}, dialogStyles.button, { margin: 3, color: 'inherit', borderColor: 'rgba(198,220,245,.34)', background: 'rgba(255,255,255,.07)' })
      var panelConfig = props.appearance?.panel || defaultAppearance().panel
      var panelOpacity = Math.max(10, Math.min(85, Number(panelConfig.opacity ?? 35)))
      var sharedBackground = props.sharedBackground === true
      var viewportWidth = window.innerWidth || 1280
      var defaultPanelWidth = Math.min(560, Math.max(280, viewportWidth - 24))
      var defaultPanelX = Math.max(12, Math.round((viewportWidth - defaultPanelWidth) / 2))
      var card = Object.assign({}, dialogStyles.card, {
        position: 'fixed', left: panelPosition?.x ?? defaultPanelX, right: 'auto', top: panelPosition?.y ?? 64, bottom: 'auto',
        width: 'min(560px, calc(100vw - 24px))', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto',
        margin: 0, padding: 14, borderRadius: 14, color: '#eff6ff',
        background: sharedBackground ? 'rgba(16,30,50,.94)' : 'rgba(18,35,59,.82)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(185,215,245,.30)',
        textShadow: 'none',
        boxShadow: '0 16px 48px rgba(0,0,0,.25)', pointerEvents: 'auto', zIndex: 1000
      })
      var tabButton = function (name, label) {
        return h('button', { type: 'button', role: 'tab', 'aria-selected': tab === name, style: Object.assign({}, button, {
          flex: 1, background: tab === name ? 'rgba(107,158,211,.48)' : 'rgba(5,22,43,.28)'
        }), onClick: function () { setTab(name) } }, label)
      }
      var settingsOverlay = { position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none' }
      return h('div', { style: settingsOverlay, role: 'presentation' },
        h('section', { id: 'dsh-balance-settings-panel', ref: panelRef, tabIndex: -1, style: card, role: 'dialog', 'aria-modal': 'false', 'aria-label': props.t('settings'), 'aria-describedby': 'dsh-balance-settings-note' },
          sharedBackground ? null : h(PanelBackground, { config: panelConfig, opacity: panelOpacity, videoRef: panelVideoRef, onUnavailable: props.onPanelBackgroundUnavailable }),
          h('div', { style: { position: 'relative', zIndex: 1 } },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 34, margin: '-2px -2px 8px', userSelect: 'none', cursor: 'move', touchAction: 'none' },
            title: props.t('dragSettingsTitle'), onPointerDown: startPanelDrag, onPointerMove: movePanelDrag, onPointerUp: finishPanelDrag, onPointerCancel: finishPanelDrag },
            h('h2', { style: Object.assign({}, dialogStyles.title, { margin: 0, fontSize: 16 }) }, props.t('settings')),
            h('button', { type: 'button', style: button, onClick: props.onClose, 'aria-label': props.t('setupCancel') }, '×')),
          h('div', { role: 'tablist', style: { display: 'flex', gap: 3, padding: 3, marginBottom: 8, borderRadius: 8, background: 'rgba(5,22,43,.52)' } },
            tabButton('balance', props.t('settingsBalance')),
            tabButton('pet', props.t('settingsPet')),
            tabButton('appearance', props.t('settingsAppearance'))),
          props.backgroundNotice ? h('p', { role: 'status', 'aria-live': 'polite', style: Object.assign({}, dialogStyles.status, { color: '#ffd2c7' }) }, props.backgroundNotice) : null,
          tab === 'balance' ? h('div', null,
            h('h3', null, 'API Key'), h('p', null, props.t('setupDescription')),
            h('button', { type: 'button', style: button, onClick: props.onSetup }, props.t('setupTitle')),
            h('h3', null, props.t('refreshInterval')),
            h('div', null, [30, 60, 300].map(function (value) { return h('button', { type: 'button', key: value, style: button, onClick: function () { saveSeconds(value) } }, value === 60 ? '1 分钟' : value === 300 ? '5 分钟' : '30 秒') })),
            h('label', null, props.t('refreshInterval'), h('input', { type: 'number', min: 30, max: 300, step: 1, value: seconds, style: dialogStyles.input, onChange: function (event) { setSeconds(event.target.value) }, onBlur: function () { saveSeconds(seconds) }, onKeyDown: function (event) { if (event.key === 'Enter') { event.preventDefault(); saveSeconds(seconds) } } })),
            h('p', { role: 'status', style: dialogStyles.status }, message),
            h('h3', null, props.t('thresholdTitle')),
            h('p', null, props.threshold || '—'),
            h('button', { type: 'button', style: button, onClick: props.onThreshold }, props.t('thresholdTitle'))
          ) : tab === 'pet' ? h('div', null,
            h('label', null, h('input', { type: 'checkbox', checked: !props.hidden, onChange: function (event) { props.onHidden(!event.target.checked) } }), ' ', props.t('petShow')),
            h('div', null, h('button', { type: 'button', style: button, onClick: props.onResetPosition }, props.t('resetPetPosition'))),
            h('h3', null, props.t('petSize') + ' · ' + props.scale + '%'),
            h('input', { type: 'range', min: 50, max: 200, step: 1, value: props.scale,
              onChange: function (event) { props.onScale(Number(event.target.value)) }, style: { width: '100%' } }),
            h('button', { type: 'button', style: button, onClick: function () { props.onScale(100) } }, props.t('resetPetSize')),
            h('h3', null, '桌宠方案'), h(PetEditor, null))
            : h(AppearanceSettings, {
              t: props.t, appearance: props.appearance, onChange: props.onAppearanceChange,
              onOpenWallpaperPicker: function (surface) { setWallpaperPage(surface) }
            }),
          h('div', { id: 'dsh-balance-settings-note', style: { borderTop: '1px solid rgba(198,220,245,.18)', paddingTop: 8, marginTop: 10, fontSize: 11, opacity: .82 } },
            h('p', { role: 'note', style: { margin: '0 0 4px' } }, props.t('motionEffectsHint')),
            h('p', { style: { margin: 0 } }, props.t('dragSettingsHint'))))),
        wallpaperPage ? h(AppearanceSettings, {
          t: props.t, appearance: props.appearance, onChange: props.onAppearanceChange,
          wallpaperPicker: true, initialSurface: wallpaperPage,
          onClose: function () { setWallpaperPage(null) }
        }) : null)
    }

    function BalancePill(props) {
      var snapshot = React.useSyncExternalStore(balanceStore.subscribe, balanceStore.getSnapshot, balanceStore.getSnapshot)
      var petState = React.useSyncExternalStore(petStudio.subscribe, petStudio.snapshot, petStudio.snapshot)
      var _locale = React.useState(0), setLocaleVersion = _locale[1]
      var _setup = React.useState(false), setupOpen = _setup[0], setSetupOpen = _setup[1]
      var _threshold = React.useState(readThreshold), threshold = _threshold[0], setThreshold = _threshold[1]
      var _thresholdOpen = React.useState(false), thresholdOpen = _thresholdOpen[0], setThresholdOpen = _thresholdOpen[1]
      var _settings = React.useState(false), settingsOpen = _settings[0], setSettingsOpen = _settings[1]
      var _initialTab = React.useState('balance'), initialTab = _initialTab[0], setInitialTab = _initialTab[1]
      var _hidden = React.useState(readPetHidden), hidden = _hidden[0], setHidden = _hidden[1]
      var _reset = React.useState(0), resetRevision = _reset[0], setResetRevision = _reset[1]
      var _appearance = React.useState(readAppearance), appearance = _appearance[0], setAppearance = _appearance[1]
      var _appearanceNotice = React.useState(''), appearanceNotice = _appearanceNotice[0], setAppearanceNotice = _appearanceNotice[1]
      var _petScale = React.useState(function () { return readPetScale(petState.selectedId) }), petScale = _petScale[0], setPetScale = _petScale[1]
      var _capsuleOffset = React.useState(readCapsuleOffset), capsuleOffset = _capsuleOffset[0], setCapsuleOffset = _capsuleOffset[1]
      var gearRef = React.useRef(null)
      var capsuleRef = React.useRef(null)
      var capsuleDrag = React.useRef(null)
      var capsuleOffsetRef = React.useRef(capsuleOffset); capsuleOffsetRef.current = capsuleOffset

      function interactiveRectsAroundCapsule(rect) {
        var group = capsuleRef.current
        if (!group) return []
        return Array.from(document.querySelectorAll('button,a[href],input,select,textarea,[role="button"],[tabindex]:not([tabindex="-1"])'))
          .filter(function (element) {
            if (group.contains(element) || element.contains(group) || element.closest('[aria-hidden="true"],[inert]')) return false
            var style = window.getComputedStyle(element)
            if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
            var box = element.getBoundingClientRect()
            return box.width > 0 && box.height > 0 && box.bottom > rect.top + 2 && box.top < rect.bottom - 2
          })
          .map(function (element) { return element.getBoundingClientRect() })
      }
      function capsuleForbiddenIntervals(rect, obstacles) {
        var gap = 6
        return obstacles.map(function (box) {
          return [box.left - rect.right - gap, box.right - rect.left + gap]
        }).sort(function (left, right) { return left[0] - right[0] })
          .reduce(function (merged, interval) {
            var previous = merged[merged.length - 1]
            if (previous && interval[0] <= previous[1] + 1) previous[1] = Math.max(previous[1], interval[1])
            else merged.push(interval.slice())
            return merged
          }, [])
      }
      function safeCapsuleDelta(target, minimum, maximum, forbidden) {
        if (maximum < minimum) return minimum
        var bounded = Math.max(minimum, Math.min(maximum, target))
        var candidates = []
        var cursor = minimum
        forbidden.forEach(function (interval) {
          var left = Math.max(minimum, interval[0])
          var right = Math.min(maximum, interval[1])
          if (left > right) return
          if (cursor < left) candidates.push([cursor, left - 1])
          cursor = Math.max(cursor, right + 1)
        })
        if (cursor <= maximum) candidates.push([cursor, maximum])
        if (!candidates.length) return bounded
        var best = Math.max(candidates[0][0], Math.min(candidates[0][1], bounded))
        candidates.slice(1).forEach(function (range) {
          var candidate = Math.max(range[0], Math.min(range[1], bounded))
          if (Math.abs(candidate - target) < Math.abs(best - target)) best = candidate
        })
        return best
      }

      React.useEffect(function () {
        return typeof props.locale.subscribe === 'function'
          ? props.locale.subscribe(function () { setLocaleVersion(function (value) { return value + 1 }) })
          : undefined
      }, [props.locale])
      React.useEffect(function () { setPetScale(readPetScale(petState.selectedId)) }, [petState.selectedId])
      React.useEffect(function () {
        if (appearance.page.source === 'default' || typeof props.theme?.overrideTokens !== 'function') return undefined
        try { return props.theme.overrideTokens(NS + ':page-background', PAGE_BACKGROUND_TOKENS) }
        catch { return undefined }
      }, [props.theme, appearance.page.source])
      React.useEffect(function () {
        function clampOffset() {
          var rect = capsuleRef.current?.getBoundingClientRect?.()
          if (!rect) return
          var next = capsuleOffsetRef.current
          var edgeDelta = rect.left < 8 ? 8 - rect.left : rect.right > window.innerWidth - 8 ? window.innerWidth - 8 - rect.right : 0
          next += edgeDelta
          var adjustedRect = { left: rect.left + edgeDelta, right: rect.right + edgeDelta, top: rect.top, bottom: rect.bottom }
          var minimum = 8 - adjustedRect.left
          var maximum = window.innerWidth - 8 - adjustedRect.right
          var forbidden = capsuleForbiddenIntervals(adjustedRect, interactiveRectsAroundCapsule(adjustedRect))
          next += safeCapsuleDelta(0, minimum, maximum, forbidden)
          if (next !== capsuleOffsetRef.current) {
            capsuleOffsetRef.current = next
            setCapsuleOffset(next); writeCapsuleOffset(next)
          }
        }
        window.addEventListener('resize', clampOffset)
        clampOffset()
        return function () { window.removeEventListener('resize', clampOffset) }
      }, [capsuleOffset])

      function beginCapsuleDrag(event) {
        if (event.button !== undefined && event.button !== 0) return
        var rect = capsuleRef.current?.getBoundingClientRect?.()
        if (!rect) return
        var minimum = 8 - rect.left
        var maximum = window.innerWidth - 8 - rect.right
        var forbidden = capsuleForbiddenIntervals(rect, interactiveRectsAroundCapsule(rect))
        var initialDelta = safeCapsuleDelta(0, minimum, maximum, forbidden)
        var offset = capsuleOffsetRef.current
        capsuleDrag.current = { id: event.pointerId, x: event.clientX, offset: offset, minimum: minimum, maximum: maximum, forbidden: forbidden }
        if (initialDelta !== 0) {
          offset += initialDelta
          capsuleOffsetRef.current = offset
          setCapsuleOffset(offset)
        }
        event.currentTarget.setPointerCapture?.(event.pointerId)
        event.preventDefault?.()
      }
      function moveCapsule(event) {
        var start = capsuleDrag.current
        if (!start || (start.id !== undefined && event.pointerId !== start.id)) return
        var delta = safeCapsuleDelta(event.clientX - start.x, start.minimum, start.maximum, start.forbidden)
        var next = start.offset + delta
        capsuleOffsetRef.current = next
        setCapsuleOffset(next)
      }
      function endCapsuleDrag(event) {
        if (!capsuleDrag.current || (capsuleDrag.current.id !== undefined && event.pointerId !== capsuleDrag.current.id)) return
        capsuleDrag.current = null
        writeCapsuleOffset(capsuleOffsetRef.current)
      }
      function changePetScale(value) {
        var normalized = Math.max(50, Math.min(200, Math.round(Number(value) || 100)))
        setPetScale(normalized)
        writePetScale(petState.selectedId, normalized)
      }
      function changeAppearance(next) {
        if (writeAppearance(next)) {
          setAppearance(next); setAppearanceNotice('')
        }
      }
      function resetPageBackground() {
        var next = Object.assign({}, appearance, { page: defaultAppearance().page })
        writeAppearance(next); setAppearance(next); setAppearanceNotice(props.t('backgroundMissing'))
      }
      function resetPanelBackground() {
        var next = Object.assign({}, appearance, { panel: defaultAppearance().panel })
        writeAppearance(next); setAppearance(next); setAppearanceNotice(props.t('backgroundMissing'))
      }

      var state = displayState(snapshot)
      var good = state === 'balance'
      var broken = state === 'failed' || state === 'unrecognized' || state === 'no-balance' || state === 'key-invalid'
      var dotColor = broken ? '#d94b4b' : good ? '#20ad68' : snapshot.loading ? '#4c83e6' : '#d88b16'
      var background = broken ? 'rgba(217,75,75,.10)' : good ? 'rgba(32,173,104,.10)' : 'rgba(216,139,22,.10)'
      var title = detailText(snapshot, props.t)
      var needsSetup = state === 'setup' || state === 'key-invalid'
      var lowBalance = state === 'balance' && hasBalanceBelowThreshold(snapshot.data, threshold)
      var sharedBackground = settingsOpen && sameBackgroundSource(appearance.page, appearance.panel)
      var pageBackgroundConfig = sharedBackground
        ? Object.assign({}, appearance.page, { dim: Math.min(18, Math.max(0, Number(appearance.page.dim ?? 38))) })
        : appearance.page
      var pillStyle = Object.assign({}, styles.pill, {
        background: background,
        cursor: 'default',
        padding: '0 7px 0 10px',
        gap: 7
      })
      var dotStyle = Object.assign({}, styles.dot, { background: dotColor })

      return h(React.Fragment, null,
        h(PageBackground, {
          config: pageBackgroundConfig, suspended: settingsOpen && !sharedBackground, onUnavailable: resetPageBackground
        }),
        h('span', { ref: capsuleRef, style: Object.assign({}, styles.balanceGroup, { position: 'relative', transform: 'translateX(' + capsuleOffset + 'px)', zIndex: 40 }) },
          h('button', { type: 'button', 'aria-label': props.t('dragCapsule'), title: props.t('dragCapsule'),
            style: styles.capsuleDragHandle, onPointerDown: beginCapsuleDrag, onPointerMove: moveCapsule,
            onPointerUp: endCapsuleDrag, onPointerCancel: endCapsuleDrag },
            h('span', { 'aria-hidden': 'true', style: { position: 'absolute', left: '50%', top: 7, width: 1, height: 13, background: 'rgba(170,202,233,.78)', boxShadow: '0 0 4px rgba(120,180,240,.45)' } })),
          h('span', { style: pillStyle },
          h('button', {
            type: 'button', style: Object.assign({}, styles.balanceButton, { cursor: snapshot.loading ? 'progress' : 'pointer' }),
            onClick: needsSetup ? function () { setInitialTab('balance'); setSettingsOpen(true) } : balanceStore.refresh,
            title: title, 'aria-label': title.replace(/\n/g, '. '),
            'aria-busy': snapshot.loading ? 'true' : 'false'
          },
          h('span', { style: dotStyle, 'aria-hidden': 'true' }),
          compactLabel(snapshot, props.t),
          snapshot.loading ? h('span', { style: styles.spinner, 'aria-hidden': 'true' }, '↻') : null),
          lowBalance ? h('a', {
            href: TOP_UP_URL, target: '_blank', rel: 'noopener noreferrer', style: styles.topUpLink,
            title: props.t('lowBalance'), 'aria-label': props.t('lowBalance') + ' · ' + props.t('topUp')
          }, props.t('topUp')) : h('span', { style: Object.assign({}, styles.topUpLink, { visibility: 'hidden' }), 'aria-hidden': 'true' }, props.t('topUp'))),
          h('button', {
            ref: gearRef, type: 'button', style: styles.thresholdButton, onClick: function () { setInitialTab('balance'); setSettingsOpen(true) },
            title: props.t('settings'), 'aria-label': props.t('settings')
          }, '⚙')
        ),
        h(SetupDialog, {
          open: setupOpen,
          t: props.t,
          onClose: function () { setSetupOpen(false) },
          onSaved: function () { setSetupOpen(false); balanceStore.credentialChanged() }
        }),
        h(ThresholdDialog, {
          open: thresholdOpen,
          threshold: threshold,
          t: props.t,
          onClose: function () { setThresholdOpen(false) },
          onSaved: function (next) { setThreshold(next); setThresholdOpen(false) }
        }),
        h(SettingsPanel, {
          open: settingsOpen, initialTab: initialTab, t: props.t, threshold: threshold, hidden: hidden, backgroundNotice: appearanceNotice,
          scale: petScale, onScale: changePetScale, appearance: appearance, sharedBackground: sharedBackground, onAppearanceChange: changeAppearance,
          onPanelBackgroundUnavailable: resetPanelBackground,
          modalOpen: setupOpen || thresholdOpen,
          onClose: function () { setSettingsOpen(false); gearRef.current?.focus?.() },
          onSetup: function () { setSetupOpen(true) },
          onThreshold: function () { setThresholdOpen(true) },
          onHidden: function (value) { writePetHidden(value); setHidden(value) },
          onResetPosition: function () { setResetRevision(function (value) { return value + 1 }) }
        }),
        h(PetRuntime, { hidden: hidden, resetRevision: resetRevision, scale: petScale })
      )
    }

    var name = 'dsh-deepseek-balance'
    var inject = ['slots', 'locale', 'theme']
    function apply(ctx) {
      ctx.effect(function () { return ctx.locale.register(NS, { zh: zh, en: en }) }, 'dsh-deepseek-balance: dictionaries')
      var t = ctx.locale.bind(NS)
      ctx.slots.inject('conversation.session.header.utilities', function () {
        return ctx.slots.register({
            name: 'conversation.session.header.utilities', id: 'deepseek-balance', order: -20, locale: NS
        }, function () {
          return h(BalancePill, { t: t, locale: ctx.locale, theme: ctx.theme })
        })
      })
    }

    exports.name = name
    exports.inject = inject
    exports.apply = apply
    return module.exports
  }
})
