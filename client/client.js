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
    var PLUGIN_VERSION = '1.0.1'
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

        // Inserted into the client factory by scripts/build.mjs.
    var petStudio = (function () {
      var DB_NAME = 'dsh-deepseek-balance-pets-v1'
      var SELECTED_KEY = 'dsh-deepseek-balance.pet-scheme'
      var BASE_SLOTS = ['idle', 'loading', 'decrease', 'increase', 'error']
      var EVENT_TYPES = ['query-start', 'query-success', 'query-failure', 'balance-decrease', 'balance-increase', 'balance-same', 'pet-click', 'idle-cycle', 'idle-duration', 'local-time']
      var MAX_FILE_BYTES = 8 * 1024 * 1024
      var MAX_SCHEME_BYTES = 24 * 1024 * 1024
      var listeners = new Set()
      var state = { schemes: [], selectedId: 'builtin', error: '', ready: false, event: null, preview: null, revision: 0 }
      var dbPromise = null
      var eventNumber = 0
      var lastFired = new Map()

      function publish(next) {
        state = Object.assign({}, state, next)
        listeners.forEach(function (listener) { listener() })
      }
      function subscribe(listener) { listeners.add(listener); return function () { listeners.delete(listener) } }
      function snapshot() { return state }
      function selectedScheme() { return state.schemes.find(function (item) { return item.id === state.selectedId }) || null }
      function select(id) {
        if (id !== 'builtin' && !state.schemes.some(function (item) { return item.id === id })) return false
        var storage = getLocalStorage()
        try { storage?.setItem(SELECTED_KEY, id) } catch {}
        publish({ selectedId: id, event: null, preview: null, revision: state.revision + 1 })
        return true
      }
      function openDb() {
        if (dbPromise) return dbPromise
        dbPromise = new Promise(function (resolve, reject) {
          if (typeof indexedDB === 'undefined') { reject(new Error('当前 DeepSeek Harness 配置无法保存桌宠方案')); return }
          var request = indexedDB.open(DB_NAME, 1)
          request.onupgradeneeded = function () {
            if (!request.result.objectStoreNames.contains('schemes')) request.result.createObjectStore('schemes', { keyPath: 'id' })
          }
          request.onsuccess = function () { resolve(request.result) }
          request.onerror = function () { reject(new Error('桌宠方案数据库无法打开')) }
        }).catch(function (error) { dbPromise = null; throw error })
        return dbPromise
      }
      function allSchemes() {
        return openDb().then(function (db) {
          return new Promise(function (resolve, reject) {
            var transaction = db.transaction('schemes', 'readonly')
            var request = transaction.objectStore('schemes').getAll()
            request.onsuccess = function () { resolve(request.result || []) }
            request.onerror = function () { reject(new Error('无法读取桌宠方案')) }
          })
        })
      }
      function reload() {
        return allSchemes().then(function (schemes) {
          var stored = null
          try { stored = getLocalStorage()?.getItem(SELECTED_KEY) } catch {}
          var selectedId = schemes.some(function (item) { return item.id === stored }) ? stored : 'builtin'
          publish({ schemes: schemes, selectedId: selectedId, ready: true, error: '' })
        }).catch(function (error) { publish({ ready: true, error: error.message }) })
      }
      function validName(value) {
        var text = String(value || '').trim()
        return text.length >= 1 && text.length <= 24 ? text : null
      }
      function validRules(rules) {
        if (!Array.isArray(rules)) return false
        return rules.every(function (rule) {
          if (!EVENT_TYPES.includes(rule.event) || !Array.isArray(rule.conditions)) return false
          if (!['once', 'until-end'].includes(rule.play) || !['replace', 'after'].includes(rule.base)) return false
          if (!Number.isInteger(rule.cooldown) || rule.cooldown < 0 || rule.cooldown > 86400) return false
          if (!Number.isInteger(rule.priority) || rule.priority < -100 || rule.priority > 100) return false
          if (rule.play === 'until-end' && rule.event !== 'query-start' &&
              !(rule.event === 'local-time' && rule.conditions.some(function (condition) { return condition.field === 'hour-from' || condition.field === 'hour-to' }))) return false
          return rule.conditions.every(function (condition) {
            var fields = conditionFields(rule.event)
            if (!fields.includes(condition.field) || typeof condition.value !== 'string') return false
            if (condition.field === 'currency') return CURRENCY_PATTERN.test(condition.value.toUpperCase())
            if (condition.field === 'amount-min' || condition.field === 'amount-max') return DECIMAL_PATTERN.test(condition.value)
            if (condition.field === 'hour-from' || condition.field === 'hour-to') return /^(?:[0-9]|1[0-9]|2[0-3])$/.test(condition.value)
            if (condition.field === 'idle-seconds-min') return /^(?:[1-9]\d{0,4})$/.test(condition.value) && Number(condition.value) <= 86400
            if (condition.field === 'idle') return condition.value === 'true' || condition.value === 'false'
            return condition.value.length >= 1 && condition.value.length <= 64
          })
        })
      }
      function conditionFields(event) {
        if (event === 'balance-decrease' || event === 'balance-increase' || event === 'balance-same') return ['currency', 'amount-min', 'amount-max']
        if (event === 'query-failure') return ['error-code']
        if (event === 'local-time') return ['hour-from', 'hour-to', 'idle']
        if (event === 'idle-duration') return ['idle', 'idle-seconds-min']
        if (event === 'pet-click' || event === 'idle-cycle') return ['idle']
        return []
      }
      function validateScheme(scheme) {
        if (!scheme || !validName(scheme.name) || !scheme.cover || !scheme.slots || !scheme.slots.idle?.media) throw new Error('方案需要名称、透明封面和待机素材')
        if (!Array.isArray(scheme.custom) || scheme.custom.length > 5) throw new Error('每个方案最多 10 个槽位')
        var names = new Set(BASE_SLOTS.concat(['待机', '查询中', '余额减少', '余额增加', '错误']))
        var bytes = scheme.cover.size || 0
        BASE_SLOTS.forEach(function (name) {
          var slot = scheme.slots[name]
          if (slot) bytes += (slot.media?.size || 0) + (slot.poster?.size || 0)
        })
        scheme.custom.forEach(function (slot) {
          var name = validName(slot.name)
          if (!name || names.has(name) || !slot.media || !slot.poster || !validRules(slot.rules)) throw new Error('自定义槽位名称、素材或规则无效')
          names.add(name)
          bytes += (slot.media.size || 0) + (slot.poster.size || 0)
        })
        if (bytes > MAX_SCHEME_BYTES) throw new Error('方案素材总量超过 24 MiB，请压缩后重试')
      }
      async function saveScheme(scheme) {
        validateScheme(scheme)
        var db = await openDb()
        scheme.name = validName(scheme.name)
        scheme.updatedAt = Date.now()
        if (!scheme.createdAt) scheme.createdAt = scheme.updatedAt
        await new Promise(function (resolve, reject) {
          var transaction = db.transaction('schemes', 'readwrite')
          var store = transaction.objectStore('schemes')
          var current = store.get(scheme.id)
          current.onsuccess = function () {
            var count = store.count()
            count.onsuccess = function () {
              if (!current.result && count.result >= 3) { transaction.abort(); return }
              store.put(scheme)
            }
          }
          transaction.oncomplete = resolve
          transaction.onerror = function () { reject(new Error('保存失败；请检查浏览器存储空间')) }
          transaction.onabort = function () { reject(new Error('最多保存 3 个用户方案，或存储空间不足；原方案已保留')) }
        })
        await reload()
        select(scheme.id)
      }
      async function removeScheme(id) {
        var db = await openDb()
        await new Promise(function (resolve, reject) {
          var transaction = db.transaction('schemes', 'readwrite')
          transaction.objectStore('schemes').delete(id)
          transaction.oncomplete = resolve
          transaction.onerror = function () { reject(new Error('删除失败')) }
        })
        if (state.selectedId === id) select('builtin')
        await reload()
      }
      function scanAlpha(canvas, width, height) {
        var pixels = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height).data
        var left = width, top = height, right = 0, bottom = 0, transparent = false, visible = false
        for (var y = 0; y < height; y += 1) for (var x = 0; x < width; x += 1) {
          var alpha = pixels[(y * width + x) * 4 + 3]
          if (alpha < 255) transparent = true
          if (alpha > 8) { visible = true; left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1) }
        }
        if (!transparent || !visible) throw new Error('素材必须包含可见图像和真实透明像素')
        return { left: left / width, top: top / height, right: right / width, bottom: bottom / height }
      }
      function canvasFor(width, height) {
        if (width < 1 || height < 1 || width > 1024 || height > 1024) throw new Error('素材尺寸须在 1024×1024 像素以内')
        var canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
        return canvas
      }
      async function imageInfo(file) {
        var url = URL.createObjectURL(file)
        try {
          var image = await new Promise(function (resolve, reject) {
            var element = new Image()
            element.onload = function () { resolve(element) }
            element.onerror = function () { reject(new Error('图片无法解码')) }
            element.src = url
          })
          var canvas = canvasFor(image.naturalWidth, image.naturalHeight)
          canvas.getContext('2d').drawImage(image, 0, 0)
          var bounds = scanAlpha(canvas, canvas.width, canvas.height)
          var poster = await new Promise(function (resolve, reject) { canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('无法提取静态封面')) }, 'image/png') })
          return { bounds: bounds, poster: poster, width: canvas.width, height: canvas.height }
        } finally { URL.revokeObjectURL(url) }
      }
      async function videoInfo(file) {
        var url = URL.createObjectURL(file)
        var video = document.createElement('video')
        video.muted = true; video.preload = 'auto'; video.playsInline = true
        video.src = url
        try {
          await new Promise(function (resolve, reject) { video.onloadedmetadata = resolve; video.onerror = function () { reject(new Error('视频无法解码')) } })
          if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > 30) throw new Error('视频时长须在 30 秒以内')
          var canvas = canvasFor(video.videoWidth, video.videoHeight)
          var bounds = { left: 1, top: 1, right: 0, bottom: 0 }
          var frames = [0.05, 0.5, 0.95]
          for (var index = 0; index < frames.length; index += 1) {
            video.currentTime = Math.min(video.duration - 0.001, Math.max(0, video.duration * frames[index]))
            await new Promise(function (resolve, reject) { video.onseeked = resolve; video.onerror = function () { reject(new Error('视频帧无法解码')) } })
            var context = canvas.getContext('2d', { willReadFrequently: true })
            context.clearRect(0, 0, canvas.width, canvas.height)
            context.drawImage(video, 0, 0)
            var one = scanAlpha(canvas, canvas.width, canvas.height)
            bounds.left = Math.min(bounds.left, one.left); bounds.top = Math.min(bounds.top, one.top)
            bounds.right = Math.max(bounds.right, one.right); bounds.bottom = Math.max(bounds.bottom, one.bottom)
          }
          var poster = await new Promise(function (resolve, reject) { canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('无法提取静态后备帧')) }, 'image/png') })
          return { bounds: bounds, poster: poster, width: canvas.width, height: canvas.height }
        } finally { video.pause(); video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url) }
      }
      async function importMedia(file) {
        if (!file || file.size > MAX_FILE_BYTES || file.size < 16) throw new Error('单个素材须小于 8 MiB 且不能是空文件')
        var name = String(file.name || '').toLowerCase()
        var bytes = new Uint8Array(await file.slice(0, Math.min(file.size, 65536)).arrayBuffer())
        var png = /\.png$/.test(name) && bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71
        var webp = /\.webp$/.test(name) && String.fromCharCode.apply(null, bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode.apply(null, bytes.slice(8, 12)) === 'WEBP'
        var webm = /\.webm$/.test(name) && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3
        if (!png && !webp && !webm) throw new Error('仅支持透明 PNG、WebP、APNG 或 VP9 WebM')
        var info
        if (webm) {
          var header = new TextDecoder('latin1').decode(new Uint8Array(await file.arrayBuffer()))
          if (!header.includes('V_VP9') || header.includes('A_OPUS') || header.includes('A_VORBIS')) throw new Error('视频须为无音轨 VP9 WebM')
          info = await videoInfo(file)
        } else info = await imageInfo(file)
        return { media: file, kind: webm ? 'video' : 'image', poster: info.poster, bounds: info.bounds, width: info.width, height: info.height }
      }
      function compareSignedDecimal(value, target) {
        if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(String(target))) return null
        var negative = String(value).charAt(0) === '-'
        var otherNegative = String(target).charAt(0) === '-'
        if (negative !== otherNegative) return negative ? -1 : 1
        var compared = compareDecimals(negative ? String(value).slice(1) : String(value), otherNegative ? String(target).slice(1) : String(target))
        return negative ? -compared : compared
      }
      function matchesCondition(condition, event) {
        if (condition.field === 'currency') return event.currency === condition.value.toUpperCase()
        if (condition.field === 'error-code') return event.code === condition.value
        if (condition.field === 'idle') return Boolean(event.idle) === (condition.value === 'true')
        if (condition.field === 'idle-seconds-min') return Number(event.idleSeconds) >= Number(condition.value)
        if (condition.field === 'hour-from' || condition.field === 'hour-to') {
          var hour = Number(condition.value)
          if (!Number.isInteger(hour) || hour < 0 || hour > 23) return false
          return condition.field === 'hour-from' ? event.hour >= hour : event.hour <= hour
        }
        var comparison = compareSignedDecimal(String(event.delta || '').replace(/^-/, ''), condition.value)
        return comparison !== null && (condition.field === 'amount-min' ? comparison >= 0 : comparison <= 0)
      }
      function matchingRules(scheme, event, now) {
        if (!scheme) return []
        var matches = []
        scheme.custom.forEach(function (slot, slotIndex) {
          slot.rules.forEach(function (rule, ruleIndex) {
            if (rule.event !== event.type || !rule.conditions.every(function (condition) { return matchesCondition(condition, event) })) return
            var key = scheme.id + ':' + slot.id + ':' + ruleIndex
            if (now - (lastFired.get(key) || -Infinity) < rule.cooldown * 1000) return
            matches.push({ slot: slot, rule: rule, key: key, order: slotIndex * 100 + ruleIndex })
          })
        })
        return matches.sort(function (a, b) { return b.rule.priority - a.rule.priority || a.order - b.order })
      }
      function dispatchBatch(events) {
        var scheme = selectedScheme()
        var candidates = []
        events.forEach(function (event, index) {
          matchingRules(scheme, event, Date.now()).forEach(function (match) { candidates.push({ event: event, match: match, index: index }) })
        })
        candidates.sort(function (a, b) { return b.match.rule.priority - a.match.rule.priority || a.index - b.index || a.match.order - b.match.order })
        var winner = candidates[0]
        var event = winner?.event || events[0]
        var chosen = winner?.match || null
        if (chosen) lastFired.set(chosen.key, Date.now())
        publish({ event: Object.assign({ sequence: ++eventNumber, chosen: chosen }, event), preview: null })
      }
      function dispatch(event) { dispatchBatch([event]) }
      function preview(slot) { publish({ preview: { slot: slot, sequence: ++eventNumber } }) }
      function newScheme(source) {
        var id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'pet-' + Date.now() + '-' + Math.random().toString(36).slice(2)
        return { id: id, name: source?.name ? source.name + ' 副本' : '我的桌宠', cover: source?.cover || null,
          slots: Object.assign({ idle: null, loading: null, decrease: null, increase: null, error: null }, source?.slots || {}), custom: source?.custom?.slice() || [] }
      }
      return { subscribe: subscribe, snapshot: snapshot, selectedScheme: selectedScheme, select: select, reload: reload,
        saveScheme: saveScheme, removeScheme: removeScheme, newScheme: newScheme, importMedia: importMedia, dispatch: dispatch,
        dispatchBatch: dispatchBatch, preview: preview, matchingRules: matchingRules, validateScheme: validateScheme,
        conditionFields: conditionFields, matchesCondition: matchesCondition, BASE_SLOTS: BASE_SLOTS, EVENT_TYPES: EVENT_TYPES }
    })()
    void petStudio.reload()


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

        // Inserted into the client factory by scripts/build.mjs.
    function PetRuntime(props) {
      var studio = React.useSyncExternalStore(petStudio.subscribe, petStudio.snapshot, petStudio.snapshot)
      var reduced = useReducedMotion()
      var _position = React.useState(readPetPosition), position = _position[0], setPosition = _position[1]
      var _phase = React.useState('video'), phase = _phase[0], setPhase = _phase[1]
      var _active = React.useState(null), active = _active[0], setActive = _active[1]
      var _revision = React.useState(0), revision = _revision[0], setRevision = _revision[1]
      var _failed = React.useState(false), failed = _failed[0], setFailed = _failed[1]
      var _imageFailed = React.useState(false), imageFailed = _imageFailed[0], setImageFailed = _imageFailed[1]
      var _visible = React.useState(document.visibilityState !== 'hidden'), visible = _visible[0], setVisible = _visible[1]
      var _urls = React.useState(null), urls = _urls[0], setUrls = _urls[1]
      var _builtinBounds = React.useState({ left: 0, top: 0, right: 1, bottom: 1 }), builtinBounds = _builtinBounds[0], setBuiltinBounds = _builtinBounds[1]
      var drag = React.useRef(null)
      var frameRef = React.useRef(null)
      var videoRef = React.useRef(null)
      var idleSince = React.useRef(Date.now())
      var positionRef = React.useRef(position); positionRef.current = position
      var scheme = petStudio.selectedScheme()
      var slot = active?.slot || (scheme ? scheme.slots.idle : { media: null, poster: null, kind: 'video' })
      var bounds = slot?.bounds || builtinBounds
      var imageUrl = slot?.media ? (reduced || failed || phase === 'static' ? urls?.poster : urls?.media) : PET_IMAGE_PATH
      var videoUrl = slot?.media ? urls?.media : PET_VIDEO_PATH
      var mediaKind = slot?.media ? slot.kind : 'video'

      React.useEffect(function () {
        var update = function () { setVisible(document.visibilityState !== 'hidden') }
        document.addEventListener('visibilitychange', update)
        return function () { document.removeEventListener('visibilitychange', update) }
      }, [])
      React.useEffect(function () {
        var cancelled = false
        Promise.all([fetch(PET_VIDEO_PATH), fetch(PET_IMAGE_PATH)]).then(function (responses) {
          if (!responses.every(function (response) { return response.ok })) throw new Error('builtin media unavailable')
          return Promise.all(responses.map(function (response) { return response.blob() }))
        }).then(function (blobs) {
          return Promise.all([
            petStudio.importMedia(new File([blobs[0]], 'idle.webm', { type: 'video/webm' })),
            petStudio.importMedia(new File([blobs[1]], 'idle.png', { type: 'image/png' }))
          ])
        }).then(function (items) {
          if (cancelled) return
          setBuiltinBounds({
            left: Math.min(items[0].bounds.left, items[1].bounds.left),
            top: Math.min(items[0].bounds.top, items[1].bounds.top),
            right: Math.max(items[0].bounds.right, items[1].bounds.right),
            bottom: Math.max(items[0].bounds.bottom, items[1].bounds.bottom)
          })
        }).catch(function () {})
        return function () { cancelled = true }
      }, [])
      React.useEffect(function () {
        if (!props.hidden) return
        setActive(null); setPhase('video'); setFailed(false)
      }, [props.hidden])
      React.useEffect(function () { if (!active) idleSince.current = Date.now() }, [active])
      React.useEffect(function () {
        setActive(null); setPhase('video'); setFailed(false); setImageFailed(false); setRevision(function (value) { return value + 1 })
      }, [studio.selectedId, studio.revision])
      React.useEffect(function () {
        if (!slot?.media) { setUrls(null); return undefined }
        var next = { media: URL.createObjectURL(slot.media), poster: URL.createObjectURL(slot.poster || scheme?.cover || slot.media) }
        setUrls(next)
        return function () { URL.revokeObjectURL(next.media); URL.revokeObjectURL(next.poster) }
      }, [slot, scheme])
      React.useEffect(function () {
        var video = videoRef.current
        if (!video || props.hidden || !visible || reduced || failed || phase === 'static' || mediaKind !== 'video') return undefined
        try {
          video.muted = true
          var play = video.play()
          play?.catch?.(function () { setFailed(true); setPhase('static') })
        } catch { setFailed(true); setPhase('static') }
        return function () { video.pause?.() }
      }, [props.hidden, visible, reduced, failed, phase, mediaKind, videoUrl, revision])
      React.useEffect(function () {
        if (!studio.event || !visible || props.hidden) return
        var event = studio.event
        if (event.type === 'local-time' && active?.rule?.play === 'until-end' && active.rule.event === 'local-time') {
          if (active.rule.conditions.every(function (condition) { return petStudio.matchesCondition(condition, event) })) {
            if (!event.chosen || event.chosen.rule === active.rule) return
          } else setActive(null)
        }
        if (event.type === 'query-success' || event.type === 'query-failure') {
          if (active?.rule?.play === 'until-end' && active.rule.event === 'query-start') setActive(null)
        }
        var custom = event.chosen
        var baseKey = event.type === 'query-start' ? 'loading' : event.type === 'query-failure' ? 'error' :
          event.type === 'balance-decrease' ? 'decrease' : event.type === 'balance-increase' ? 'increase' : null
        var base = baseKey && scheme?.slots[baseKey]?.media ? scheme.slots[baseKey] : null
        if (!custom && !base) return
        if (custom && custom.rule.base === 'after' && base) {
          setActive({ slot: base, queued: custom.slot, rule: custom.rule })
        } else setActive({ slot: custom?.slot || base, rule: custom?.rule || null })
        setPhase('video'); setFailed(false); setImageFailed(false); setRevision(function (value) { return value + 1 })
      }, [studio.event?.sequence])
      React.useEffect(function () {
        if (!studio.preview || props.hidden) return
        setActive({ slot: studio.preview.slot, preview: true })
        setPhase('video'); setFailed(false); setImageFailed(false); setRevision(function (value) { return value + 1 })
      }, [studio.preview?.sequence])
      React.useEffect(function () {
        if (props.hidden || !visible || reduced) return undefined
        if (phase !== 'static' && !(active && (mediaKind !== 'video' || failed))) return undefined
        var seconds = active ? Math.max(1, Math.min(60, Number(active.rule?.duration || 3))) : PET_STATIC_DURATION / 1000
        var timer = setTimeout(function () {
          if (active?.rule?.play === 'until-end') return
          if (active?.queued) setActive({ slot: active.queued, rule: active.rule })
          else if (active) setActive(null)
          else { petStudio.dispatch({ type: 'idle-cycle', idle: true }); setPhase('video') }
          setRevision(function (value) { return value + 1 })
        }, seconds * 1000)
        return function () { clearTimeout(timer) }
      }, [props.hidden, visible, reduced, phase, active, mediaKind, failed])
      React.useEffect(function () {
        if (props.hidden || !visible || reduced) return undefined
        var timer = setInterval(function () {
          var events = [{ type: 'local-time', hour: new Date().getHours(), idle: !active }]
          if (!active) events.push({ type: 'idle-duration', idle: true, idleSeconds: Math.floor((Date.now() - idleSince.current) / 1000) })
          petStudio.dispatchBatch(events)
        }, 60000)
        return function () { clearInterval(timer) }
      }, [props.hidden, visible, reduced, active])
      React.useEffect(function () {
        var resize = function () {
          var scale = Math.max(.5, Math.min(2, Number(props.scale || 100) / 100))
          var width = Math.min(180 * scale, window.innerWidth * .28 * scale)
          var height = frameRef.current?.getBoundingClientRect?.().height || width
          setPosition(function (current) {
            var next = {
              right: Math.max(-width * (1 - bounds.right), Math.min(current.right, window.innerWidth - width * (1 - bounds.left))),
              bottom: Math.max(-height * (1 - bounds.bottom), Math.min(current.bottom, window.innerHeight - height * (1 - bounds.top)))
            }
            writePetPosition(next); return next
          })
        }
        window.addEventListener('resize', resize)
        resize()
        return function () { window.removeEventListener('resize', resize) }
      }, [bounds.left, bounds.top, bounds.right, bounds.bottom, props.scale])
      React.useEffect(function () {
        if (!props.resetRevision) return
        var next = { right: 24, bottom: 76 }
        writePetPosition(next); setPosition(next)
      }, [props.resetRevision])
      function endVideo() {
        if (active?.rule?.play === 'until-end') { setPhase('static'); return }
        if (active?.queued) setActive({ slot: active.queued, rule: active.rule })
        else if (active) setActive(null)
        else { petStudio.dispatch({ type: 'idle-cycle', idle: true }); setPhase('static') }
        setRevision(function (value) { return value + 1 })
      }
      function pointerDown(event) {
        if (event.button !== undefined && event.button !== 0) return
        var rect = frameRef.current?.getBoundingClientRect?.() || event.currentTarget.getBoundingClientRect()
        drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, right: position.right, bottom: position.bottom, width: rect.width, height: rect.height, moved: false }
        event.currentTarget.setPointerCapture?.(event.pointerId)
        event.preventDefault?.()
      }
      function pointerMove(event) {
        var start = drag.current
        if (!start || (start.id !== undefined && event.pointerId !== start.id)) return
        var dx = event.clientX - start.x, dy = event.clientY - start.y
        if (!start.moved && Math.abs(dx) + Math.abs(dy) > 4) {
          start.moved = true
          if (!active) { setPhase('video'); setRevision(function (value) { return value + 1 }) }
        }
        var width = Math.max(1, start.width), height = Math.max(1, start.height)
        var right = Math.max(-width * (1 - bounds.right), Math.min(start.right - dx, window.innerWidth - width * (1 - bounds.left)))
        var bottom = Math.max(-height * (1 - bounds.bottom), Math.min(start.bottom - dy, window.innerHeight - height * (1 - bounds.top)))
        setPosition({ right: right, bottom: bottom })
      }
      function pointerUp(event) {
        var start = drag.current
        if (!start || (start.id !== undefined && event.pointerId !== start.id)) return
        drag.current = null
        writePetPosition(positionRef.current)
        if (!start.moved) {
          petStudio.dispatch({ type: 'pet-click', idle: !active })
          if (!petStudio.snapshot().event?.chosen) { setActive(null); setPhase('video'); setRevision(function (value) { return value + 1 }) }
        } else if (!active) { setPhase('video'); setRevision(function (value) { return value + 1 }) }
      }
      if (props.hidden || !visible || imageFailed || (scheme && !slot) || (slot?.media && !urls)) return null
      var scale = Math.max(.5, Math.min(2, Number(props.scale || 100) / 100))
      var petWidth = Math.max(1, Math.min(180 * scale, window.innerWidth * .28 * scale))
      var frameStyle = Object.assign({}, styles.petFrame, { right: position.right, bottom: position.bottom, width: petWidth, maxWidth: petWidth, border: 0, background: 'transparent', pointerEvents: 'none' })
      var hitStyle = { position: 'absolute', left: bounds.left * 100 + '%', top: bounds.top * 100 + '%', width: (bounds.right - bounds.left) * 100 + '%', height: (bounds.bottom - bounds.top) * 100 + '%', pointerEvents: 'auto', touchAction: 'none', cursor: 'grab' }
      var media = reduced || failed || phase === 'static' || mediaKind !== 'video'
        ? h('img', { src: imageUrl, alt: '', draggable: false, style: styles.petMedia, onError: function () { if (active) setActive(null); else setImageFailed(true) } })
        : h('video', { key: 'pet-video-' + revision, ref: videoRef, src: videoUrl, muted: true, autoPlay: true, playsInline: true, preload: 'auto', controls: false, loop: active?.rule?.play === 'until-end',
          style: styles.petMedia, onEnded: endVideo, onError: function () { setFailed(true); setPhase('static') } })
      return h('div', { ref: frameRef, style: frameStyle, 'aria-label': 'DeepSeek pet' }, media,
        h('div', { style: hitStyle, onPointerDown: pointerDown, onPointerMove: pointerMove, onPointerUp: pointerUp, onPointerCancel: pointerUp }))
    }

    function PetCover(props) {
      var _url = React.useState(null), url = _url[0], setUrl = _url[1]
      React.useEffect(function () {
        if (!props.blob) return undefined
        var next = URL.createObjectURL(props.blob)
        setUrl(next)
        return function () { URL.revokeObjectURL(next) }
      }, [props.blob])
      return h('img', { src: props.blob ? url : PET_IMAGE_PATH, alt: '', style: { width: 36, height: 36, objectFit: 'contain', verticalAlign: 'middle' } })
    }

    function PetEditor(props) {
      var studio = React.useSyncExternalStore(petStudio.subscribe, petStudio.snapshot, petStudio.snapshot)
      var _draft = React.useState(null), draft = _draft[0], setDraft = _draft[1]
      var _message = React.useState(''), message = _message[0], setMessage = _message[1]
      var _busy = React.useState(false), busy = _busy[0], setBusy = _busy[1]
      React.useEffect(function () { void petStudio.reload() }, [])
      function edit(scheme) { setDraft(scheme ? Object.assign({}, scheme, { slots: Object.assign({}, scheme.slots), custom: scheme.custom.slice() }) : petStudio.newScheme(null)); setMessage('') }
      async function copyBuiltin() {
        setBusy(true); setMessage('')
        try {
          var results = await Promise.all([fetch(PET_VIDEO_PATH), fetch(PET_IMAGE_PATH)])
          if (!results.every(function (result) { return result.ok })) throw new Error('无法读取内置素材')
          var video = new File([await results[0].blob()], 'idle.webm', { type: 'video/webm' })
          var image = new File([await results[1].blob()], 'idle.png', { type: 'image/png' })
          var idle = await petStudio.importMedia(video)
          var cover = await petStudio.importMedia(image)
          var next = petStudio.newScheme(null)
          next.name = '内置桌宠副本'; next.cover = cover.poster; next.slots.idle = idle
          setDraft(next)
        } catch (error) { setMessage(error.message) }
        finally { setBusy(false) }
      }
      function change(field, value) { setDraft(Object.assign({}, draft, { [field]: value })) }
      function slotChange(key, slot) { setDraft(function (current) { return Object.assign({}, current, { slots: Object.assign({}, current.slots, { [key]: slot }), cover: key === 'idle' && !current.cover ? slot.poster : current.cover }) }) }
      async function importSlot(key, file) {
        if (!file) return
        setBusy(true); setMessage('')
        try {
          var slot = await petStudio.importMedia(file)
          slotChange(key, slot)
        } catch (error) { setMessage(error.message) }
        finally { setBusy(false) }
      }
      async function importCover(file) {
        if (!file) return
        setBusy(true)
        try {
          var cover = await petStudio.importMedia(file)
          if (cover.kind !== 'image') throw new Error('封面请选择透明静态图片')
          change('cover', cover.poster)
        } catch (error) { setMessage(error.message) }
        finally { setBusy(false) }
      }
      function updateCustom(index, patch) {
        var next = draft.custom.slice(); next[index] = Object.assign({}, next[index], patch)
        change('custom', next)
      }
      function addCustom() {
        if (draft.custom.length >= 5) return
        change('custom', draft.custom.concat({ id: 'scene-' + Date.now() + '-' + Math.random().toString(36).slice(2), name: '', media: null, poster: null, rules: [] }))
      }
      async function save() {
        setBusy(true); setMessage('')
        try { await petStudio.saveScheme(draft); setDraft(null) }
        catch (error) { setMessage(error.message) }
        finally { setBusy(false) }
      }
      async function remove(id) {
        if (!window.confirm('确定删除这个桌宠方案及其本地素材吗？')) return
        setBusy(true)
        try { await petStudio.removeScheme(id); setDraft(null) } catch (error) { setMessage(error.message) }
        finally { setBusy(false) }
      }
      var button = Object.assign({}, dialogStyles.button, { margin: 3 })
      var input = Object.assign({}, dialogStyles.input, { margin: '4px 0 8px' })
      if (!draft) return h('div', null,
        h('p', null, '方案保存在本机当前 DeepSeek Harness 配置中；清除应用数据或删除 profile 会删除用户方案。内置方案不占 3 个名额。'),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
          h('button', { type: 'button', style: button, onClick: function () { petStudio.select('builtin') } }, h(PetCover, null), '内置桌宠' + (studio.selectedId === 'builtin' ? ' ✓' : '')),
          studio.schemes.map(function (scheme) { return h('span', { key: scheme.id },
            h('button', { type: 'button', style: button, onClick: function () { petStudio.select(scheme.id) } }, h(PetCover, { blob: scheme.cover }), scheme.name + (studio.selectedId === scheme.id ? ' ✓' : '')),
            h('button', { type: 'button', style: button, onClick: function () { edit(scheme) } }, '编辑')) })
        ),
        h('button', { type: 'button', style: button, disabled: studio.schemes.length >= 3, onClick: function () { edit(null) } }, '导入新方案（' + studio.schemes.length + '/3）'),
        h('button', { type: 'button', style: button, disabled: busy || studio.schemes.length >= 3, onClick: function () { void copyBuiltin() } }, '复制内置方案'),
        h('p', { role: 'status' }, studio.error || message))

      return h('div', null,
        h('label', null, '方案名称', h('input', { style: input, maxLength: 24, value: draft.name, onChange: function (event) { change('name', event.target.value) } })),
        h('label', null, '透明封面', h('input', { type: 'file', accept: '.png,.webp', onChange: function (event) { void importCover(event.target.files?.[0]) } })),
        h('p', null, '场景槽位 ' + (5 + draft.custom.length) + '/10；视频必须无音轨、带真实透明像素。'),
        petStudio.BASE_SLOTS.map(function (key) { return h('div', { key: key, style: { marginBottom: 8 } },
          h('label', null, ({ idle: '待机（必填）', loading: '查询中', decrease: '余额减少', increase: '余额增加', error: '错误' })[key],
            h('input', { type: 'file', accept: '.webm,.png,.webp', onChange: function (event) { void importSlot(key, event.target.files?.[0]) } })),
          draft.slots[key]?.media ? h('span', null, ' 已导入 ', draft.slots[key].media.name || '媒体') : h('span', null, ' 空槽位')) }),
        draft.custom.map(function (slot, index) { return h('fieldset', { key: slot.id, style: { margin: '10px 0', border: '1px solid #8885', borderRadius: 8 } },
          h('legend', null, '自定义槽位 ' + (index + 1)),
          h('input', { style: input, maxLength: 24, placeholder: '场景名称', value: slot.name, onChange: function (event) { updateCustom(index, { name: event.target.value }) } }),
          h('input', { type: 'file', accept: '.webm,.png,.webp', onChange: function (event) { var file = event.target.files?.[0]; if (file) { setBusy(true); petStudio.importMedia(file).then(function (media) { updateCustom(index, media) }).catch(function (error) { setMessage(error.message) }).finally(function () { setBusy(false) }) } } }),
          h('button', { type: 'button', style: button, disabled: !slot.media, onClick: function () { petStudio.preview(slot) } }, '播放预览'),
          h('button', { type: 'button', style: button, onClick: function () { change('custom', draft.custom.filter(function (_, n) { return n !== index })) } }, '删除槽位'),
          slot.rules.map(function (rule, ruleIndex) { return h('div', { key: ruleIndex, style: { padding: 6, background: '#8881', margin: 4 } },
            h('label', null, '当 ', h('select', { value: rule.event, onChange: function (event) { var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { event: event.target.value, conditions: [], play: 'once' }); updateCustom(index, { rules: rules }) } }, petStudio.EVENT_TYPES.map(function (eventName) { return h('option', { key: eventName, value: eventName }, eventName) }))),
            h('label', null, '播放 ', h('select', { value: rule.play, onChange: function (event) { var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { play: event.target.value }); updateCustom(index, { rules: rules }) } }, h('option', { value: 'once' }, '单次'),
              rule.event === 'query-start' || (rule.event === 'local-time' && rule.conditions.some(function (condition) { return condition.field === 'hour-from' || condition.field === 'hour-to' }))
                ? h('option', { value: 'until-end' }, '至状态结束') : null)),
            h('label', null, '基础动作 ', h('select', { value: rule.base, onChange: function (event) { var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { base: event.target.value }); updateCustom(index, { rules: rules }) } }, h('option', { value: 'replace' }, '替代'), h('option', { value: 'after' }, '播完后再播'))),
            ['cooldown', 'priority', 'duration'].map(function (field) { return h('label', { key: field }, field, h('input', { type: 'number', style: { width: 62 }, value: rule[field] || 0, onChange: function (event) { var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { [field]: Number(event.target.value) }); updateCustom(index, { rules: rules }) } })) }),
            rule.conditions.map(function (condition, conditionIndex) { return h('span', { key: conditionIndex },
              h('select', { value: condition.field, onChange: function (event) { var conditions = rule.conditions.slice(); conditions[conditionIndex] = Object.assign({}, condition, { field: event.target.value }); var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { conditions: conditions }); updateCustom(index, { rules: rules }) } },
                petStudio.conditionFields(rule.event).map(function (field) { return h('option', { key: field, value: field }, field) })),
              h('input', { style: { width: 90 }, value: condition.value, onChange: function (event) { var conditions = rule.conditions.slice(); conditions[conditionIndex] = Object.assign({}, condition, { value: event.target.value }); var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { conditions: conditions }); updateCustom(index, { rules: rules }) } }),
              h('button', { type: 'button', onClick: function () { var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { conditions: rule.conditions.filter(function (_, n) { return n !== conditionIndex }) }); updateCustom(index, { rules: rules }) } }, '×')) }),
            h('button', { type: 'button', style: button, disabled: petStudio.conditionFields(rule.event).length === 0, onClick: function () { var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { conditions: rule.conditions.concat({ field: petStudio.conditionFields(rule.event)[0], value: '' }) }); updateCustom(index, { rules: rules }) } }, '＋且条件'),
            h('button', { type: 'button', style: button, onClick: function () { updateCustom(index, { rules: slot.rules.filter(function (_, n) { return n !== ruleIndex }) }) } }, '删除规则')) }),
          h('button', { type: 'button', style: button, onClick: function () { updateCustom(index, { rules: slot.rules.concat({ event: 'pet-click', conditions: [], play: 'once', base: 'replace', cooldown: 0, priority: 0, duration: 3 }) }) } }, '＋触发规则')) }),
        h('button', { type: 'button', style: button, disabled: draft.custom.length >= 5, onClick: addCustom }, '＋添加自定义槽位'),
        h('p', { role: 'status', style: { color: '#c45151' } }, message),
        h('button', { type: 'button', style: button, onClick: function () { setDraft(null) } }, '取消'),
        h('button', { type: 'button', style: button, disabled: busy, onClick: save }, busy ? '处理中…' : '保存方案'),
        studio.schemes.some(function (item) { return item.id === draft.id }) ? h('button', { type: 'button', style: button, onClick: function () { void remove(draft.id) } }, '删除方案') : null)
    }


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

        // Inserted into the client factory by scripts/build.mjs.
    var APPEARANCE_STORAGE_KEY = 'dsh-deepseek-balance.appearance-v1'
    var APPEARANCE_DB_NAME = 'dsh-deepseek-balance-backgrounds-v1'
    var WALLPAPER_API_PATH = '/dsh-deepseek-balance/api/wallpapers'
    var WALLPAPER_LIBRARY_API_PATH = WALLPAPER_API_PATH + '/library'
    var WALLPAPER_LIBRARY_PICK_API_PATH = WALLPAPER_LIBRARY_API_PATH + '/pick'
    var WALLPAPER_RENDER_API_PATH = WALLPAPER_API_PATH + '/render'
    var WALLPAPER_RENDER_OPEN_API_PATH = WALLPAPER_RENDER_API_PATH + '/open'
    var WALLPAPER_RENDER_CLOSE_API_PATH = WALLPAPER_RENDER_API_PATH + '/close'
    var DSH_DESKTOP_WALLPAPER_ORIGINS = ['dsh-app://app', 'app://dsh']
    var DSH_WALLPAPER_RENDERER_ORIGIN_HEADER = 'x-dsh-wallpaper-renderer-origin'
    var WALLPAPER_ASSET_PATH = '/dsh-deepseek-balance/wallpapers'
    var WALLPAPER_LIBRARY_STORAGE_KEY = 'dsh-deepseek-balance.wallpaper-library'
    var MAX_LOCAL_IMAGE_BYTES = 64 * 1024 * 1024
    var MAX_LOCAL_VIDEO_BYTES = 256 * 1024 * 1024
    var wallpaperDbPromise = null
    var nativeWallpaperLeases = new Map()
    var NATIVE_WALLPAPER_EVENT = 'dsh-deepseek-balance:native-wallpaper-change'

    function defaultAppearance() {
      return {
        page: { source: 'default', dim: 38, assetId: null, mediaType: null, wallpaperId: null, libraryId: null, backgroundId: null, renderMode: null, renderKey: null },
        panel: { source: 'builtin', opacity: 35, assetId: null, mediaType: 'image', wallpaperId: null, libraryId: null, backgroundId: null, renderMode: null, renderKey: null }
      }
    }

    function sameBackgroundSource(left, right) {
      if (!left || !right || left.source !== right.source) return false
      if (left.source === 'local') {
        return Boolean(left.assetId && left.assetId === right.assetId && left.mediaType === right.mediaType)
      }
      if (left.source !== 'wallpaper'
        || left.wallpaperId !== right.wallpaperId
        || (left.libraryId || '') !== (right.libraryId || '')
        || (left.backgroundId || '') !== (right.backgroundId || '')
        || left.mediaType !== right.mediaType) return false
      if (left.renderMode === 'native' || right.renderMode === 'native') {
        return left.renderMode === 'native' && right.renderMode === 'native'
          && Boolean(left.renderKey && left.renderKey === right.renderKey)
      }
      return true
    }

    function readAppearance() {
      var fallback = defaultAppearance()
      try {
        var value = JSON.parse(getLocalStorage()?.getItem(APPEARANCE_STORAGE_KEY) || 'null')
        if (!value || typeof value !== 'object') return fallback
        ;['page', 'panel'].forEach(function (surface) {
          var item = value[surface]
          if (!item || typeof item !== 'object') return
          var allowed = ['default', 'builtin', 'local', 'wallpaper']
          if (allowed.includes(item.source)) fallback[surface].source = item.source
          if (Number.isFinite(Number(item.dim))) fallback.page.dim = Math.max(0, Math.min(75, Math.round(Number(item.dim))))
          if (Number.isFinite(Number(item.opacity))) fallback.panel.opacity = Math.max(10, Math.min(85, Math.round(Number(item.opacity))))
          if (typeof item.assetId === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(item.assetId)) fallback[surface].assetId = item.assetId
          if (item.mediaType === 'image' || item.mediaType === 'video' || item.mediaType === 'native') fallback[surface].mediaType = item.mediaType
          if (typeof item.wallpaperId === 'string' && /^\d{5,20}$/.test(item.wallpaperId)) fallback[surface].wallpaperId = item.wallpaperId
          if (typeof item.libraryId === 'string' && /^[a-f0-9]{16}$/.test(item.libraryId)) fallback[surface].libraryId = item.libraryId
          if (typeof item.backgroundId === 'string' && /^[a-f0-9]{16}$/.test(item.backgroundId)) fallback[surface].backgroundId = item.backgroundId
          if (item.renderMode === 'native' && typeof item.renderKey === 'string' && /^[a-f0-9]{16}:\d{5,20}$/.test(item.renderKey)) {
            fallback[surface].renderMode = 'native'
            fallback[surface].renderKey = item.renderKey
          }
        })
        ;['page', 'panel'].forEach(function (surface) {
          if (fallback[surface].source === 'local' && !fallback[surface].assetId) fallback[surface].source = 'default'
          if (fallback[surface].source === 'wallpaper' && !fallback[surface].wallpaperId) fallback[surface].source = 'default'
        })
        if (fallback.panel.source === 'default') {
          fallback.panel.source = 'builtin'
          if (Number(value.panel?.opacity) === 62) fallback.panel.opacity = 35
        }
        if (fallback.page.source === 'builtin') fallback.page.source = 'default'
      } catch {}
      return fallback
    }

    function writeAppearance(value) {
      try {
        var storage = getLocalStorage()
        if (!storage) return false
        storage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(value))
        return true
      } catch { return false }
    }

    function openAppearanceDb() {
      if (wallpaperDbPromise) return wallpaperDbPromise
      wallpaperDbPromise = new Promise(function (resolve, reject) {
        if (typeof indexedDB === 'undefined') { reject(new Error('当前 DeepSeek Harness 配置不支持本地媒体存储')); return }
        var request = indexedDB.open(APPEARANCE_DB_NAME, 1)
        request.onupgradeneeded = function () {
          if (!request.result.objectStoreNames.contains('assets')) request.result.createObjectStore('assets', { keyPath: 'id' })
        }
        request.onsuccess = function () { resolve(request.result) }
        request.onerror = function () { reject(new Error('无法打开本地背景存储')) }
      }).catch(function (error) { wallpaperDbPromise = null; throw error })
      return wallpaperDbPromise
    }

    async function saveBackgroundAsset(file, poster, mediaType) {
      var db = await openAppearanceDb()
      var id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'bg-' + Date.now() + '-' + Math.random().toString(36).slice(2)
      await new Promise(function (resolve, reject) {
        var transaction = db.transaction('assets', 'readwrite')
        transaction.objectStore('assets').put({ id: id, file: file, poster: poster || file, mediaType: mediaType, name: file.name || 'background' })
        transaction.oncomplete = resolve
        transaction.onerror = function () { reject(new Error('保存背景失败；请检查本机当前配置的存储空间')) }
        transaction.onabort = function () { reject(new Error('保存背景失败；请检查本机当前配置的存储空间')) }
      })
      return id
    }

    async function readBackgroundAsset(id) {
      if (!id) return null
      var db = await openAppearanceDb()
      return new Promise(function (resolve, reject) {
        var request = db.transaction('assets', 'readonly').objectStore('assets').get(id)
        request.onsuccess = function () { resolve(request.result || null) }
        request.onerror = function () { reject(new Error('读取本地背景失败')) }
      })
    }

    function useBackgroundAsset(id) {
      var _asset = React.useState(null), asset = _asset[0], setAsset = _asset[1]
      React.useEffect(function () {
        var active = true
        var urls = []
        setAsset(null)
        if (!id) return function () {}
        readBackgroundAsset(id).then(function (record) {
          if (!active || !record) return
          var fileUrl = URL.createObjectURL(record.file)
          urls.push(fileUrl)
          var posterBlob = record.poster || record.file
          var posterUrl = posterBlob === record.file ? fileUrl : URL.createObjectURL(posterBlob)
          if (posterUrl !== fileUrl) urls.push(posterUrl)
          setAsset({ url: fileUrl, posterUrl: posterUrl, mediaType: record.mediaType, name: record.name })
        }).catch(function () {})
        return function () {
          active = false
          urls.forEach(function (url) { URL.revokeObjectURL(url) })
        }
      }, [id])
      return asset
    }

    function useDocumentVisible() {
      var _visible = React.useState(typeof document === 'undefined' || document.visibilityState !== 'hidden')
      var visible = _visible[0], setVisible = _visible[1]
      React.useEffect(function () {
        var update = function () { setVisible(document.visibilityState !== 'hidden') }
        document.addEventListener('visibilitychange', update)
        return function () { document.removeEventListener('visibilitychange', update) }
      }, [])
      return visible
    }

    function nativeWallpaperKey(item) {
      return /^[a-f0-9]{16}$/.test(String(item?.libraryId || '')) && /^\d{5,20}$/.test(String(item?.id || ''))
        ? item.libraryId + ':' + item.id : null
    }

    function useNativeWallpaperStream(renderKey) {
      var _stream = React.useState(function () { return renderKey ? nativeWallpaperLeases.get(renderKey)?.stream || null : null })
      var stream = _stream[0], setStream = _stream[1]
      React.useEffect(function () {
        function update() { setStream(renderKey ? nativeWallpaperLeases.get(renderKey)?.stream || null : null) }
        window.addEventListener(NATIVE_WALLPAPER_EVENT, update)
        update()
        return function () { window.removeEventListener(NATIVE_WALLPAPER_EVENT, update) }
      }, [renderKey])
      return stream
    }

    function publishNativeWallpaperChange() {
      window.dispatchEvent(new Event(NATIVE_WALLPAPER_EVENT))
    }

    function stopNativeWallpaperLease(renderKey, entry) {
      if (nativeWallpaperLeases.get(renderKey) !== entry) return
      nativeWallpaperLeases.delete(renderKey)
      entry.peerConnection?.close()
      entry.stream.getTracks().forEach(function (track) { track.stop() })
      void requestWallpaperRender(WALLPAPER_RENDER_CLOSE_API_PATH, { sessionId: entry.sessionId }).catch(function () {})
      publishNativeWallpaperChange()
    }

    function wallpaperRendererRequestHeaders() {
      var origin = String(window.location?.origin || '')
      return DSH_DESKTOP_WALLPAPER_ORIGINS.includes(origin)
        ? { [DSH_WALLPAPER_RENDERER_ORIGIN_HEADER]: origin }
        : {}
    }

    function removeNativeWallpaperSurface(surface, renderKey) {
      if (!renderKey) return
      var entry = nativeWallpaperLeases.get(renderKey)
      if (!entry) return
      entry.surfaces.delete(surface)
      if (entry.surfaces.size === 0) stopNativeWallpaperLease(renderKey, entry)
    }

    function attachNativeWallpaperSurface(surface, renderKey) {
      var entry = nativeWallpaperLeases.get(renderKey)
      if (entry) entry.surfaces.add(surface)
    }

    async function requestWallpaperRender(url, body) {
      var options = { credentials: 'same-origin', cache: 'no-store' }
      var headers = wallpaperRendererRequestHeaders()
      if (body) {
        options.method = 'POST'
        headers['content-type'] = 'application/json'
        options.body = JSON.stringify(body)
      }
      if (Object.keys(headers).length) options.headers = headers
      var response = await fetch(url, options)
      var result = await response.json().catch(function () { return null })
      if (!response.ok || !result?.ok) {
        var error = new Error(result?.code || 'WALLPAPER_RENDER_FAILED')
        error.code = result?.code || 'WALLPAPER_RENDER_FAILED'
        throw error
      }
      return result
    }

    function waitForWallpaperIce(connection) {
      if (connection.iceGatheringState === 'complete') return Promise.resolve()
      return new Promise(function (resolve) {
        var timer = setTimeout(finish, 8000)
        function finish() {
          clearTimeout(timer)
          connection.removeEventListener('icegatheringstatechange', onChange)
          resolve()
        }
        function onChange() { if (connection.iceGatheringState === 'complete') finish() }
        connection.addEventListener('icegatheringstatechange', onChange)
      })
    }

    async function acquireNativeWallpaper(item, confirmedApplication) {
      var renderKey = nativeWallpaperKey(item)
      if (!renderKey) throw new Error('WALLPAPER_PROJECT_INVALID')
      var existing = nativeWallpaperLeases.get(renderKey)
      if (existing) return { renderKey: renderKey, entry: existing, created: false }
      if (typeof RTCPeerConnection !== 'function') throw new Error('WALLPAPER_RENDER_UNSUPPORTED')
      var pixelRatio = Math.max(1, Number(window.devicePixelRatio) || 1)
      var width = Math.max(320, Math.min(3840, Math.round((Number(window.screen?.width) || window.innerWidth || 1280) * pixelRatio)))
      var height = Math.max(200, Math.min(2160, Math.round((Number(window.screen?.height) || window.innerHeight || 720) * pixelRatio)))
      var opened = await requestWallpaperRender(WALLPAPER_RENDER_OPEN_API_PATH, {
        wallpaperId: item.id,
        libraryId: item.libraryId,
        type: item.type,
        width: width,
        height: height,
        confirmedApplication: item.type !== 'application' || confirmedApplication === true,
      })
      var sessionId = opened.sessionId
      if (typeof sessionId !== 'string' || !/^[0-9a-f-]{36}$/i.test(sessionId)) throw new Error('WALLPAPER_RENDER_SESSION_INVALID')
      var connection = new RTCPeerConnection({ iceServers: [] })
      var streamTimer = null
      var pendingStreamReject = null
      var entry = null
      function onWallpaperConnectionState() {
        if (connection.connectionState === 'failed' && pendingStreamReject) {
          var rejectStream = pendingStreamReject
          pendingStreamReject = null
          clearTimeout(streamTimer)
          rejectStream(new Error('WALLPAPER_RENDER_WEBRTC_FAILED'))
        }
        if (entry && (connection.connectionState === 'failed' || connection.connectionState === 'closed')) {
          stopNativeWallpaperLease(renderKey, entry)
        }
      }
      connection.addEventListener('connectionstatechange', onWallpaperConnectionState)
      var streamPromise = new Promise(function (resolve, reject) {
        pendingStreamReject = reject
        streamTimer = setTimeout(function () {
          pendingStreamReject = null
          reject(new Error('WALLPAPER_RENDER_CAPTURE_TIMEOUT'))
        }, 120000)
        connection.addEventListener('track', function (event) {
          clearTimeout(streamTimer)
          pendingStreamReject = null
          var stream = event.streams?.[0] || new MediaStream([event.track])
          resolve(stream)
        }, { once: true })
      })
      connection.addTransceiver('video', { direction: 'recvonly' })
      try {
        var offer = await connection.createOffer()
        await connection.setLocalDescription(offer)
        await waitForWallpaperIce(connection)
        await requestWallpaperRender(WALLPAPER_RENDER_API_PATH + '/session/' + sessionId + '/offer', {
          peer: 'plugin', signal: connection.localDescription,
        })
        var answerDeadline = Date.now() + 120000
        var answer = null
        while (Date.now() < answerDeadline) {
          var response
          try {
            response = await fetch(WALLPAPER_RENDER_API_PATH + '/session/' + sessionId + '/answer', {
              credentials: 'same-origin', cache: 'no-store', headers: wallpaperRendererRequestHeaders(),
            })
          } catch {
            throw new Error('WALLPAPER_RENDER_HOST_UNAVAILABLE')
          }
          if (response.status === 202) {
            await new Promise(function (resolve) { setTimeout(resolve, 500) })
            continue
          }
          var result = await response.json().catch(function () { return null })
          if (!response.ok || !result?.ok || !result.signal) throw new Error(result?.code || 'WALLPAPER_RENDER_FAILED')
          answer = result.signal
          break
        }
        if (!answer) throw new Error('WALLPAPER_RENDER_PAIRING_TIMEOUT')
        await connection.setRemoteDescription(answer)
        var stream = await streamPromise
        if (!stream.getVideoTracks().length) throw new Error('WALLPAPER_CAPTURE_SOURCE_INVALID')
        entry = { stream: stream, sessionId: sessionId, peerConnection: connection, surfaces: new Set() }
        nativeWallpaperLeases.set(renderKey, entry)
        stream.getVideoTracks().forEach(function (track) {
          track.addEventListener('ended', function () { stopNativeWallpaperLease(renderKey, entry) }, { once: true })
        })
        publishNativeWallpaperChange()
        return { renderKey: renderKey, entry: entry, created: true }
      } catch (error) {
        clearTimeout(streamTimer)
        streamPromise.catch(function () {})
        connection.close()
        await requestWallpaperRender(WALLPAPER_RENDER_CLOSE_API_PATH, { sessionId: sessionId }).catch(function () {})
        throw error
      }
    }

    function wallpaperPreviewUrl(id) {
      return WALLPAPER_ASSET_PATH + '/' + id + '/preview'
    }

    function wallpaperBackgroundUrl(id, backgroundId) {
      var url = WALLPAPER_ASSET_PATH + '/' + id + '/background'
      return backgroundId ? url + '?candidate=' + encodeURIComponent(backgroundId) : url
    }

    function wallpaperMediaUrl(id) {
      return WALLPAPER_ASSET_PATH + '/' + id + '/media'
    }

    function PageBackground(props) {
      var config = props.config || defaultAppearance().page
      var asset = useBackgroundAsset(config.source === 'local' ? config.assetId : null)
      var nativeStream = useNativeWallpaperStream(config.renderMode === 'native' ? config.renderKey : null)
      var reduced = useReducedMotion()
      var visible = useDocumentVisible()
      var _failed = React.useState(false), failed = _failed[0], setFailed = _failed[1]
      var pageMediaRef = React.useRef(null)
      var videoWallpaper = config.source === 'wallpaper' && config.mediaType === 'video'
      var videoLocal = config.source === 'local' && (asset?.mediaType === 'video' || config.mediaType === 'video')
      // A selected Wallpaper Engine video is a background choice, not decorative UI motion.
      var useVideo = visible && !failed && (Boolean(nativeStream) || videoWallpaper || (!reduced && videoLocal))
      var source = config.source === 'local'
        ? (useVideo ? asset?.url : asset?.posterUrl)
        : config.source === 'wallpaper'
          ? (useVideo ? wallpaperMediaUrl(config.wallpaperId) : wallpaperBackgroundUrl(config.wallpaperId, config.backgroundId))
          : null
      React.useEffect(function () { setFailed(false) }, [config.source, config.assetId, config.wallpaperId, config.backgroundId, config.mediaType])
      React.useEffect(function () {
        var active = true
        if (config.source !== 'local' || !config.assetId) return function () { active = false }
        readBackgroundAsset(config.assetId).then(function (record) {
          if (active && !record) props.onUnavailable?.()
        }).catch(function () { if (active) props.onUnavailable?.() })
        return function () { active = false }
      }, [config.source, config.assetId])
      React.useEffect(function () {
        var html = document.documentElement
        var body = document.body
        if (!body || !source || (config.source === 'local' && !asset)) return undefined
        var oldHtmlBackground = html.style.getPropertyValue('background-color')
        var oldHtmlPriority = html.style.getPropertyPriority('background-color')
        var oldBodyBackground = body.style.getPropertyValue('background-color')
        var oldBodyPriority = body.style.getPropertyPriority('background-color')
        html.style.setProperty('background-color', 'transparent', 'important')
        body.style.setProperty('background-color', 'transparent', 'important')
        var layer = document.createElement('div')
        layer.setAttribute('data-dsh-balance-page-background', '')
        Object.assign(layer.style, { position: 'fixed', inset: '0', zIndex: '-1', overflow: 'hidden', pointerEvents: 'none', isolation: 'isolate' })
        var media
        if (useVideo) {
          media = document.createElement('video')
          media.muted = true; media.loop = true; media.playsInline = true; media.autoplay = false; media.preload = 'metadata'
          if (nativeStream) media.srcObject = nativeStream
          else media.src = source
          media.addEventListener('error', function () { setFailed(true) }, { once: true })
          pageMediaRef.current = media
        } else {
          media = document.createElement('img')
          media.alt = ''
          media.draggable = false
          media.src = source
          media.addEventListener('error', function () {
            if (useVideo) setFailed(true)
            else props.onUnavailable?.()
          }, { once: true })
        }
        Object.assign(media.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' })
        layer.appendChild(media)
        var dim = document.createElement('div')
        Object.assign(dim.style, { position: 'absolute', inset: '0', background: 'rgba(0,0,0,' + (Number(config.dim ?? 38) / 100) + ')' })
        layer.appendChild(dim)
        body.insertBefore(layer, body.firstChild)
        return function () {
          if (pageMediaRef.current === media) pageMediaRef.current = null
          media.pause?.()
          layer.remove()
          html.style.setProperty('background-color', oldHtmlBackground, oldHtmlPriority)
          body.style.setProperty('background-color', oldBodyBackground, oldBodyPriority)
        }
      }, [source, useVideo, asset, nativeStream, config.source, config.dim, videoWallpaper, videoLocal, config.backgroundId])
      React.useEffect(function () {
        if (!useVideo || !pageMediaRef.current) return undefined
        if (props.suspended || !visible) {
          pageMediaRef.current.pause?.()
          return undefined
        }
        var play = pageMediaRef.current.play?.()
        play?.catch?.(function () { setFailed(true) })
        return undefined
      }, [props.suspended, visible, useVideo, source])
      return null
    }

    function PanelBackground(props) {
      var config = props.config || defaultAppearance().panel
      var asset = useBackgroundAsset(config.source === 'local' ? config.assetId : null)
      var nativeStream = useNativeWallpaperStream(config.renderMode === 'native' ? config.renderKey : null)
      var visible = useDocumentVisible()
      var _failed = React.useState(false), failed = _failed[0], setFailed = _failed[1]
      var isVideo = config.source === 'wallpaper' && config.mediaType === 'video'
      var useVideo = (isVideo || Boolean(nativeStream)) && visible && !failed
      var url = config.source === 'builtin' ? PET_IMAGE_PATH
        : config.source === 'local' ? asset?.url
        : config.source === 'wallpaper' ? wallpaperBackgroundUrl(config.wallpaperId, config.backgroundId) : null
      React.useEffect(function () { setFailed(false) }, [config.source, config.assetId, config.wallpaperId, config.backgroundId])
      React.useEffect(function () {
        var video = null
        if (!useVideo) return undefined
        video = props.videoRef?.current
        if (!video) return undefined
        video.muted = true
        video.srcObject = nativeStream || null
        var play = video.play()
        play?.catch?.(function () { setFailed(true) })
        return function () {
          video.pause?.()
        }
      }, [useVideo, props.videoRef, nativeStream])
      var style = { position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit' }
      if (config.source === 'default' || (config.source === 'local' && !url)) return h('div', { 'aria-hidden': 'true', style: style })
      var media = useVideo
        ? h('video', { ref: props.videoRef, src: nativeStream ? undefined : wallpaperMediaUrl(config.wallpaperId), poster: url, muted: true, loop: true, autoPlay: true, playsInline: true, preload: 'metadata', onError: function () { setFailed(true) },
          style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
        : h('img', { src: url, alt: '', draggable: false, onError: function () { if (config.source !== 'builtin') props.onUnavailable?.() },
          style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: config.source === 'builtin' ? 'right center' : 'center', opacity: config.source === 'builtin' ? .72 : 1 } })
      var tint = h('div', { style: { position: 'absolute', inset: 0, background: 'rgba(12,27,49,' + Number(props.opacity ?? 35) / 100 + ')' } })
      return h('div', { 'aria-hidden': 'true', style: style }, media, tint)
    }

    function verifyBackgroundFile(file, allowVideo) {
      return Promise.resolve().then(async function () {
        if (!file || file.size < 16) throw new Error('背景文件为空或无法读取')
        var name = String(file.name || '').toLowerCase()
        var bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer())
        var signature = ''
        for (var index = 0; index < Math.min(bytes.length, 12); index += 1) signature += String.fromCharCode(bytes[index])
        var pngSignature = [137, 80, 78, 71, 13, 10, 26, 10]
        var imageType = pngSignature.every(function (value, index) { return bytes[index] === value })
          ? 'image'
          : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
            ? 'image'
            : signature.slice(0, 4) === 'RIFF' && signature.slice(8, 12) === 'WEBP'
              ? 'image' : null
        var videoType = /\.mp4$/.test(name) && signature.slice(4, 8) === 'ftyp'
          ? 'video'
          : /\.webm$/.test(name) && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3
            ? 'video' : null
        var type = imageType || (allowVideo ? videoType : null)
        if (!type) {
          var imageFileName = /\.(png|jpe?g|webp)$/.test(name)
          throw new Error(imageFileName
            ? '文件名后缀是图片格式，但文件内容不是有效的 PNG、JPG 或 WebP 图片，请检查文件格式或完整性'
            : allowVideo ? '请选择 PNG、JPG、WebP、MP4 或 WebM 文件' : '设置面板背景请选择 PNG、JPG 或 WebP 图片')
        }
        if (file.size > (type === 'video' ? MAX_LOCAL_VIDEO_BYTES : MAX_LOCAL_IMAGE_BYTES)) {
          throw new Error(type === 'video' ? '本地视频不能超过 256 MiB' : '本地图片不能超过 64 MiB')
        }
        if (type === 'image') {
          if (typeof createImageBitmap === 'function') {
            var bitmap = await createImageBitmap(file)
            var dimensionsValid = bitmap.width <= 8192 && bitmap.height <= 8192
            bitmap.close?.()
            if (!dimensionsValid) throw new Error('图片尺寸不能超过 8192×8192 像素')
          }
          return { file: file, poster: file, mediaType: 'image' }
        }
        var url = URL.createObjectURL(file)
        var video = document.createElement('video')
        video.muted = true; video.playsInline = true; video.preload = 'metadata'
        video.src = url
        try {
          await new Promise(function (resolve, reject) {
            video.onloadeddata = resolve
            video.onerror = function () { reject(new Error('浏览器无法解码该视频')) }
          })
          if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > 1800) throw new Error('视频时长必须在 30 分钟以内')
          var scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight))
          var canvas = document.createElement('canvas')
          canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
          canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
          var poster = await new Promise(function (resolve, reject) {
            canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('无法生成视频静态预览')) }, 'image/jpeg', .86)
          })
          return { file: file, poster: poster, mediaType: 'video' }
        } finally {
          video.pause(); video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url)
        }
      })
    }

    function AppearanceSettings(props) {
      var _surface = React.useState(props.initialSurface || 'panel'), surface = _surface[0], setSurface = _surface[1]
      var _source = React.useState(props.appearance?.panel?.source === 'local' ? 'local' : props.appearance?.panel?.source === 'builtin' ? 'builtin' : props.appearance?.panel?.source === 'default' ? 'default' : 'wallpaper'), source = _source[0], setSource = _source[1]
      var _items = React.useState([]), items = _items[0], setItems = _items[1]
      var _busy = React.useState(false), busy = _busy[0], setBusy = _busy[1]
      var _message = React.useState(''), message = _message[0], setMessage = _message[1]
      var _libraryPath = React.useState(''), libraryPath = _libraryPath[0], setLibraryPath = _libraryPath[1]
      var _wallpaperSearch = React.useState(''), wallpaperSearch = _wallpaperSearch[0], setWallpaperSearch = _wallpaperSearch[1]
      var _candidate = React.useState(null), candidate = _candidate[0], setCandidate = _candidate[1]
      var _previewUrl = React.useState(null), previewUrl = _previewUrl[0], setPreviewUrl = _previewUrl[1]
      var _selectedWallpaper = React.useState(null), selectedWallpaper = _selectedWallpaper[0], setSelectedWallpaper = _selectedWallpaper[1]
      var _selectedBackgroundId = React.useState(null), selectedBackgroundId = _selectedBackgroundId[0], setSelectedBackgroundId = _selectedBackgroundId[1]
      var _applicationConfirmed = React.useState(false), applicationConfirmed = _applicationConfirmed[0], setApplicationConfirmed = _applicationConfirmed[1]
      var wallpaperPreviewVideoRef = React.useRef(null)
      var key = surface === 'panel' ? 'panel' : 'page'
      var current = props.appearance[key]
      var currentAsset = useBackgroundAsset(current.source === 'local' ? current.assetId : null)
      React.useEffect(function () {
        setSource(current.source === 'local' ? 'local' : current.source === 'builtin' ? 'builtin' : current.source === 'default' ? 'default' : 'wallpaper')
        setCandidate(null); setSelectedWallpaper(null); setSelectedBackgroundId(current.backgroundId || null)
        setApplicationConfirmed(false)
      }, [props.wallpaperPicker, surface, key, current.source, current.wallpaperId, current.backgroundId, current.assetId])
      React.useEffect(function () {
        var active = true
        if (current.source !== 'local' || !current.assetId) return function () { active = false }
        readBackgroundAsset(current.assetId).then(function (record) {
          if (!active || record) return
          patchCurrent(defaultAppearance()[key])
          setMessage(props.t('backgroundMissing'))
        }).catch(function () {
          if (!active) return
          patchCurrent(defaultAppearance()[key])
          setMessage(props.t('backgroundMissing'))
        })
        return function () { active = false }
      }, [key, current.source, current.assetId])
      React.useEffect(function () {
        if (!candidate) { setPreviewUrl(null); return undefined }
        var url = URL.createObjectURL(candidate.poster || candidate.file)
        setPreviewUrl(url)
        return function () { URL.revokeObjectURL(url) }
      }, [candidate])
      function loadWallpapers() {
        setBusy(true); setMessage('')
        var libraryPath = ''
        try { libraryPath = getLocalStorage()?.getItem(WALLPAPER_LIBRARY_STORAGE_KEY) || '' } catch {}
        var registerSavedLibrary = libraryPath ? fetch(WALLPAPER_LIBRARY_API_PATH, {
          method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ libraryPath: libraryPath })
        }).catch(function () {}) : Promise.resolve()
        registerSavedLibrary.then(function () {
          return fetch(WALLPAPER_API_PATH, { credentials: 'same-origin', cache: 'no-store' })
        }).then(function (response) {
          return response.json().then(function (body) {
            if (!response.ok || !body?.ok) throw new Error(props.t('wallpaperListError'))
            setItems(Array.isArray(body.items) ? body.items : [])
          })
        }).catch(function () { setItems([]); setMessage(props.t('wallpaperListError')) }).finally(function () { setBusy(false) })
      }
      React.useEffect(function () { if (props.wallpaperPicker) loadWallpapers() }, [props.wallpaperPicker])
      function patchCurrent(patch) {
        var next = Object.assign({}, props.appearance, { [key]: Object.assign({}, current, patch) })
        if (!writeAppearance(next)) { setMessage(props.t('backgroundStorageError')); return false }
        props.onChange(next)
        return true
      }
      function chooseFile(file) {
        if (!file) return
        setBusy(true); setMessage('')
        verifyBackgroundFile(file, surface === 'page').then(function (result) {
          setCandidate(Object.assign({ name: file.name }, result))
          setSelectedWallpaper(null); setSelectedBackgroundId(null)
        }).catch(function (error) { setMessage(error.message || props.t('fileFormatError')) }).finally(function () { setBusy(false) })
      }
      async function applyCandidate() {
        if (candidate) {
          setBusy(true); setMessage('')
          try {
            var id = await saveBackgroundAsset(candidate.file, candidate.poster, candidate.mediaType)
            var oldRenderKey = current.renderMode === 'native' ? current.renderKey : null
            var next = Object.assign({}, current, { source: 'local', assetId: id, mediaType: candidate.mediaType, wallpaperId: null, libraryId: null, backgroundId: null, renderMode: null, renderKey: null })
            var changed = Object.assign({}, props.appearance, { [key]: next })
            if (!writeAppearance(changed)) throw new Error(props.t('backgroundStorageError'))
            if (oldRenderKey) removeNativeWallpaperSurface(key, oldRenderKey)
            props.onChange(changed)
            setCandidate(null); setMessage(props.t('backgroundApplied'))
            if (props.wallpaperPicker) props.onClose?.()
          } catch (error) { setMessage(error.message || props.t('backgroundStorageError')) }
          finally { setBusy(false) }
          return
        }
        if (selectedWallpaper || appliedWallpaper) {
          var selected = selectedWallpaper || appliedWallpaper
          var candidateId = selectedBackgroundId || selected.backgroundCandidateId || (selected.backgroundCandidates?.length === 1 ? selected.backgroundCandidates[0].id : null)
          var needsNativeRender = ['scene', 'web', 'application'].includes(selected.type)
          var capture = null
          setBusy(true); setMessage(needsNativeRender ? props.t('wallpaperNativeRenderConnecting') : '')
          try {
            if (needsNativeRender) capture = await acquireNativeWallpaper(selected, applicationConfirmed)
            var renderKey = capture?.renderKey || null
            var wallpaperConfig = Object.assign({}, current, {
              source: 'wallpaper',
              wallpaperId: selected.id,
              libraryId: selected.libraryId || null,
              mediaType: capture ? 'native' : selected.playable ? 'video' : 'image',
              assetId: null,
              backgroundId: candidateId,
              renderMode: capture ? 'native' : null,
              renderKey: renderKey
            })
            var changed = Object.assign({}, props.appearance, { [key]: wallpaperConfig })
            if (!writeAppearance(changed)) throw new Error('BACKGROUND_STORAGE_FAILED')
            var oldRenderKey = current.renderMode === 'native' ? current.renderKey : null
            if (oldRenderKey && oldRenderKey !== renderKey) removeNativeWallpaperSurface(key, oldRenderKey)
            if (renderKey) attachNativeWallpaperSurface(key, renderKey)
            props.onChange(changed); setMessage(props.t('backgroundApplied'))
            if (props.wallpaperPicker) props.onClose?.()
          } catch (error) {
            if (capture?.created && capture.entry.surfaces.size === 0) stopNativeWallpaperLease(capture.renderKey, capture.entry)
            var code = String(error?.code || error?.message || '')
            var failureKey = code === 'BACKGROUND_STORAGE_FAILED' ? 'backgroundStorageError'
              : ['WALLPAPER_APPLICATION_DECLINED', 'WALLPAPER_APPLICATION_CONFIRMATION_REQUIRED'].includes(code) ? 'wallpaperApplicationDeclined'
                      : code === 'WALLPAPER_ENGINE_NOT_RUNNING' ? 'wallpaperEngineNotRunning'
                      : code === 'WALLPAPER_ENGINE_NOT_INSTALLED' ? 'wallpaperEngineNotInstalled'
              : code === 'WALLPAPER_RENDER_UNSUPPORTED' ? 'wallpaperWindowsOnly'
                : code === 'WALLPAPER_RENDER_LOCAL_ONLY' ? 'wallpaperRenderLocalOnly'
                      : code === 'WALLPAPER_RENDER_UNAVAILABLE' ? 'wallpaperRenderUnavailable'
            : code === 'WALLPAPER_WINDOW_START_FAILED' ? 'wallpaperWindowStartFailed'
              : code === 'WALLPAPER_PAIRING_BROWSER_START_FAILED' ? 'wallpaperPairingBrowserStartFailed'
              : code === 'WALLPAPER_RENDER_START_FAILED' ? 'wallpaperRenderStartFailed'
                : code === 'WALLPAPER_RENDER_WEBRTC_FAILED' ? 'wallpaperNativeRenderWebrtcFailed'
              : code === 'WALLPAPER_RENDER_LIMIT' ? 'wallpaperRenderLimit'
                : ['WALLPAPER_RENDER_REQUEST_INVALID', 'WALLPAPER_PROJECT_INVALID'].includes(code) ? 'wallpaperRenderRequestInvalid'
                  : code === 'WALLPAPER_RENDER_SESSION_INVALID' ? 'wallpaperRenderSessionInvalid'
                    : code === 'WALLPAPER_RENDER_FAILED' ? 'wallpaperRenderFailed'
                      : code === 'WALLPAPER_RENDER_HOST_UNAVAILABLE' ? 'wallpaperRenderHostUnavailable'
                        : code === 'WALLPAPER_CAPTURE_SOURCE_INVALID' ? 'wallpaperCaptureSourceInvalid'
              : code === 'WALLPAPER_RENDER_PAIRING_TIMEOUT' ? 'wallpaperPairingTimeout'
                : code === 'WALLPAPER_RENDER_CAPTURE_TIMEOUT' ? 'wallpaperCaptureTimeout'
                  : code === 'WALLPAPER_RENDER_SESSION_EXPIRED' ? 'wallpaperCaptureEnded'
                    : error?.name === 'NotAllowedError' ? 'wallpaperCaptureDenied'
                      : error?.name === 'TypeError' ? 'wallpaperRenderHostUnavailable' : 'wallpaperNativeRenderFailed'
            setMessage(props.t(failureKey))
          } finally { setBusy(false) }
        }
      }
      async function addLibrary(suppliedPath) {
        var value = (typeof suppliedPath === 'string' ? suppliedPath : libraryPath).trim()
        if (!value) return
        setBusy(true); setMessage('')
        try {
          var response = await fetch(WALLPAPER_LIBRARY_API_PATH, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ libraryPath: value })
          })
          var body = await response.json().catch(function () { return null })
          if (!response.ok || !body?.ok) throw new Error(props.t('wallpaperLibraryInvalid'))
          try { getLocalStorage()?.setItem(WALLPAPER_LIBRARY_STORAGE_KEY, value) } catch {}
          setLibraryPath(''); loadWallpapers()
        } catch (error) { setMessage(error.message || props.t('wallpaperLibraryInvalid')) }
        finally { setBusy(false) }
      }
      async function browseSteamLibrary() {
        setBusy(true); setMessage('')
        try {
          var response = await fetch(WALLPAPER_LIBRARY_PICK_API_PATH, {
            method: 'POST', credentials: 'same-origin', headers: { accept: 'application/json' }
          })
          var body = await response.json().catch(function () { return null })
          if (!response.ok || !body?.ok) throw new Error(props.t('wallpaperFolderPickerUnavailable'))
          if (body.cancelled) return
          if (typeof body.libraryPath !== 'string' || !body.libraryPath) throw new Error(props.t('wallpaperFolderPickerUnavailable'))
          setLibraryPath(body.libraryPath)
        } catch (error) { setMessage(error.message || props.t('wallpaperFolderPickerUnavailable')) }
        finally { setBusy(false) }
      }
      function restoreDefault() {
        var oldRenderKey = current.renderMode === 'native' ? current.renderKey : null
        if (patchCurrent(defaultAppearance()[key]) && oldRenderKey) removeNativeWallpaperSurface(key, oldRenderKey)
        setSource(surface === 'panel' ? 'builtin' : 'default'); setCandidate(null); setSelectedWallpaper(null); setSelectedBackgroundId(null)
        setApplicationConfirmed(false)
      }
      var button = Object.assign({}, dialogStyles.button, { color: 'inherit', borderColor: 'rgba(198,220,245,.35)', background: 'rgba(255,255,255,.08)', padding: '8px 11px', margin: 2 })
      var activeSource = candidate ? 'local' : source
      var appliedWallpaper = current.source === 'wallpaper' ? items.find(function (item) { return item.id === current.wallpaperId }) : null
      var qualityWallpaper = selectedWallpaper || appliedWallpaper
      var applicationConsentNeeded = qualityWallpaper?.type === 'application'
      var wallpaperCandidates = qualityWallpaper?.backgroundCandidates || []
      var activeBackgroundId = selectedWallpaper ? selectedBackgroundId
        : selectedBackgroundId || appliedWallpaper?.backgroundCandidateId || (appliedWallpaper?.backgroundCandidates?.length === 1 ? appliedWallpaper.backgroundCandidates[0].id : null)
      var activeRenderKey = qualityWallpaper && current.source === 'wallpaper' && current.wallpaperId === qualityWallpaper.id && current.renderMode === 'native'
        ? current.renderKey : null
      var nativePreviewStream = useNativeWallpaperStream(activeRenderKey)
      var wallpaperSelectionReady = Boolean(qualityWallpaper && (
        qualityWallpaper.playable
        || (['scene', 'web', 'application'].includes(qualityWallpaper.type) && qualityWallpaper.render?.available === true
          && typeof RTCPeerConnection === 'function')
        || (qualityWallpaper.type === 'image' && activeBackgroundId
          && wallpaperCandidates.some(function (item) { return item.id === activeBackgroundId }))
      ))
      React.useEffect(function () {
        var video = wallpaperPreviewVideoRef.current
        if (!video || !props.wallpaperPicker) return undefined
        video.srcObject = nativePreviewStream || null
        if (nativePreviewStream) video.play()?.catch?.(function () {})
        return function () { video.pause?.(); if (video.srcObject) video.srcObject = null }
      }, [props.wallpaperPicker, nativePreviewStream])
      function wallpaperNativeStatus(item) {
        if (!item || !['scene', 'web', 'application'].includes(item.type)) return ''
        if (item.render?.available !== true) return props.t('wallpaperRenderSourceUnavailable')
        if (typeof RTCPeerConnection !== 'function') return props.t('wallpaperNativeRenderUnavailable')
        var renderKey = nativeWallpaperKey(item)
        if (renderKey && nativeWallpaperLeases.has(renderKey)) return props.t('wallpaperNativeRenderActive')
        if (current.renderMode === 'native' && current.renderKey === renderKey) return props.t('wallpaperNativeRenderReapply')
        return props.t('wallpaperNativeRenderAvailable')
      }
      function wallpaperQualityText(item) {
        if (!item) return ''
        var width = Number(item.backgroundWidth)
        var height = Number(item.backgroundHeight)
        var resolution = width > 0 && height > 0 ? width + ' × ' + height : ''
        if (item.playable) return props.t('wallpaperVideoQuality') + (resolution ? ' · ' + props.t('wallpaperVideoFallback') + ' ' + resolution : '')
        if (['scene', 'web', 'application'].includes(item.type)) {
          return props.t(item.render?.available === true ? 'wallpaperNativeSource' : 'wallpaperRenderSourceUnavailable')
        }
        if (item.backgroundSource === 'preview' && item.backgroundCandidates?.length > 1) return props.t('wallpaperCandidateChoice') + ' · ' + item.backgroundCandidates.length
        var hasDimensions = width > 0 && height > 0
        var lowResolution = hasDimensions ? Math.max(width, height) < 1280 || Math.min(width, height) < 720 : item.backgroundSource === 'preview'
        var label = lowResolution
          ? props.t(item.backgroundSource === 'preview' ? 'wallpaperPreviewOnly' : 'wallpaperSourceLow')
          : props.t(item.backgroundSource === 'preview' ? 'wallpaperPreviewSource' : 'wallpaperSourceImage')
        return label + (resolution ? ' · ' + resolution : '')
      }
      var previewWallpaper = selectedWallpaper || appliedWallpaper
      var preview = candidate ? previewUrl
        : previewWallpaper ? (previewWallpaper.playable ? wallpaperMediaUrl(previewWallpaper.id) : wallpaperBackgroundUrl(previewWallpaper.id, activeBackgroundId))
          : current.source === 'builtin' ? PET_IMAGE_PATH
            : current.source === 'local' ? currentAsset?.posterUrl : current.source === 'wallpaper' && current.wallpaperId ? wallpaperBackgroundUrl(current.wallpaperId, current.backgroundId) : null
      var previewTitle = candidate?.name || selectedWallpaper?.title || (current.source === 'builtin' ? props.t('defaultPhoto') : current.source === 'wallpaper' ? current.wallpaperId : '')
      var panelLabel = props.t('panelBackground')
      var pageLabel = props.t('pageBackground')
      var query = wallpaperSearch.trim().toLocaleLowerCase()
      var visibleItems = query ? items.filter(function (item) {
        return [item.title, item.id, item.type].some(function (value) { return String(value || '').toLocaleLowerCase().includes(query) })
      }) : items
      var wallpaperTypeLabelKeys = {
        image: 'wallpaperTypeImage',
        video: 'wallpaperTypeVideo',
        scene: 'wallpaperTypeScene',
        web: 'wallpaperTypeWeb',
        application: 'wallpaperTypeApplication',
      }
      var choiceList = visibleItems.map(function (item) {
        var active = selectedWallpaper?.id === item.id
        var applied = !candidate && current.source === 'wallpaper' && current.wallpaperId === item.id
        var thumbnailCandidateId = item.backgroundCandidateId || item.backgroundCandidates?.[0]?.id
        var thumbnailUrl = item.type === 'image' && thumbnailCandidateId
          ? wallpaperBackgroundUrl(item.id, thumbnailCandidateId) : item.previewUrl
        return h('button', { type: 'button', key: item.id, onClick: function () {
            setSelectedWallpaper(item); setSelectedBackgroundId(item.backgroundCandidateId || (item.backgroundCandidates?.length === 1 ? item.backgroundCandidates[0].id : null)); setCandidate(null); setApplicationConfirmed(false); setMessage('')
          },
          'aria-pressed': active, style: Object.assign({}, button, { display: 'flex', alignItems: 'center', gap: 8, width: '100%', minWidth: 0, padding: 6, textAlign: 'left', borderColor: active ? '#94c8ff' : button.borderColor }) },
          h('img', { src: thumbnailUrl, alt: props.t('wallpaperThumbnail'), loading: 'lazy', style: { flex: 'none', width: props.wallpaperPicker ? 86 : 64, height: props.wallpaperPicker ? 54 : 40, objectFit: 'cover', borderRadius: 5 } }),
          h('span', { style: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 } },
            h('strong', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.title),
            applied ? h('small', { style: { color: '#a8d8ff' } }, props.t('wallpaperCurrentInUse')) : null,
            h('small', { style: { opacity: .78 } }, props.t(wallpaperTypeLabelKeys[item.type] || 'wallpaperTypeUnknown')),
            h('small', { style: { opacity: .84, color: item.backgroundSource === 'preview' && !(['scene', 'web', 'application'].includes(item.type) && item.render?.available === true) ? '#ffd08a' : 'inherit', lineHeight: 1.25 } }, wallpaperQualityText(item))))
      })
      if (props.wallpaperPicker) {
        var pickerTitle = surface === 'panel' ? panelLabel : pageLabel
        var previewElement = nativePreviewStream
          ? h('video', { ref: wallpaperPreviewVideoRef, autoPlay: true, muted: true, playsInline: true, style: { display: 'block', width: '100%', maxHeight: 'min(42vh, 360px)', objectFit: 'contain', background: '#050a11', borderRadius: 10 } })
          : qualityWallpaper?.playable
            ? h('video', { src: preview, autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata', style: { display: 'block', width: '100%', maxHeight: 'min(42vh, 360px)', objectFit: 'contain', background: '#050a11', borderRadius: 10 } })
            : preview ? h('img', { src: preview, alt: '', style: { display: 'block', width: '100%', maxHeight: 'min(42vh, 360px)', objectFit: 'contain', background: '#050a11', borderRadius: 10 } }) : null
        var sourceHint = qualityWallpaper?.type === 'image' && qualityWallpaper.backgroundSource === 'preview'
          ? props.t('wallpaperOriginalUnavailable')
          : qualityWallpaper && ['scene', 'web', 'application'].includes(qualityWallpaper.type)
            ? wallpaperNativeStatus(qualityWallpaper) : qualityWallpaper ? wallpaperQualityText(qualityWallpaper) : props.t('wallpaperPickerHint')
        return h('div', { role: 'presentation', style: { position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 18, background: 'rgba(7,15,27,.86)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', pointerEvents: 'auto' } },
          h('section', { role: 'dialog', 'aria-modal': 'true', 'aria-label': props.t('wallpaperPickerTitle'), style: { display: 'flex', flexDirection: 'column', width: 'min(1160px, calc(100vw - 36px))', height: 'min(860px, calc(100vh - 36px))', minHeight: 300, padding: 18, color: '#eff6ff', background: 'rgba(18,35,59,.96)', border: '1px solid rgba(161,196,228,.42)', borderRadius: 16, boxShadow: '0 22px 72px rgba(0,0,0,.48)', overflow: 'hidden' } },
            h('header', { style: { display: 'flex', alignItems: 'center', gap: 12, flex: 'none', paddingBottom: 12, borderBottom: '1px solid rgba(198,220,245,.2)' } },
              h('button', { type: 'button', style: button, onClick: props.onClose }, '‹ ' + props.t('wallpaperPickerBack')),
              h('div', { style: { minWidth: 0 } }, h('h2', { style: Object.assign({}, dialogStyles.title, { margin: 0 }) }, props.t('wallpaperPickerTitle')),
                h('small', { style: { opacity: .76 } }, pickerTitle))),
            h('p', { style: { flex: 'none', opacity: .8, lineHeight: 1.5, margin: '10px 0' } }, props.t('wallpaperPickerHint')),
            h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 14, flex: '1 1 auto', minHeight: 0 } },
              h('div', { style: { display: 'flex', flexDirection: 'column', minHeight: 0 } },
                h('div', { style: { display: 'flex', gap: 8, flex: 'none' } },
                  h('input', { type: 'search', value: wallpaperSearch, placeholder: props.t('wallpaperSearch'), onChange: function (event) { setWallpaperSearch(event.target.value) }, style: Object.assign({}, dialogStyles.input, { flex: 1, minWidth: 0, color: 'inherit', background: 'rgba(0,0,0,.2)' }) }),
                  h('button', { type: 'button', style: button, disabled: busy, onClick: loadWallpapers }, busy ? '…' : props.t('refreshWallpapers'))),
                h('small', { style: { display: 'block', flex: 'none', opacity: .72, margin: '7px 0' } }, props.t('wallpaperLocalOnly')),
                choiceList.length ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: '4px 5px 4px 0' } }, choiceList)
                  : h('p', { style: { opacity: .76 } }, busy ? '…' : items.length ? props.t('wallpaperNoResults') : props.t('noWallpapers')),
                h('div', { style: { display: 'flex', gap: 6, flex: 'none', marginTop: 8 } },
                  h('input', { type: 'text', value: libraryPath, placeholder: props.t('steamLibraryPlaceholder'), onChange: function (event) { setLibraryPath(event.target.value) }, style: Object.assign({}, dialogStyles.input, { flex: 1, minWidth: 0, color: 'inherit', background: 'rgba(0,0,0,.16)' }) }),
                  h('button', { type: 'button', style: button, disabled: busy, onClick: function () { void browseSteamLibrary() } }, props.t('browseSteamLibrary')),
                  h('button', { type: 'button', style: button, disabled: busy || !libraryPath.trim(), onClick: addLibrary }, props.t('addSteamLibrary')))),
              h('div', { style: { minWidth: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: 12, borderRadius: 10, background: 'rgba(5,22,43,.44)' } },
                qualityWallpaper ? h('div', null,
                  previewElement || h('p', { style: { opacity: .75 } }, props.t('wallpaperPickerHint')),
                  h('h3', { style: { margin: '12px 0 4px' } }, qualityWallpaper.title),
                  h('p', { style: { margin: '0 0 8px', opacity: .78 } }, props.t(wallpaperTypeLabelKeys[qualityWallpaper.type] || 'wallpaperTypeUnknown')),
                  h('small', { style: { display: 'block', color: qualityWallpaper.type === 'image' && qualityWallpaper.backgroundSource === 'preview' || ['scene', 'web', 'application'].includes(qualityWallpaper.type) ? '#b8d8ff' : 'inherit', lineHeight: 1.45 } }, sourceHint),
                  qualityWallpaper.type === 'image' && wallpaperCandidates.length > 1 ? h('div', { style: { marginTop: 12 } },
                    h('small', { style: { display: 'block', opacity: .82, marginBottom: 6 } }, props.t('wallpaperCandidateHint')),
                    h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } }, wallpaperCandidates.map(function (item) {
                      var active = activeBackgroundId === item.id
                      return h('button', { type: 'button', key: item.id, 'aria-pressed': active, style: Object.assign({}, button, { margin: 0, background: active ? 'rgba(118,165,218,.48)' : button.background }), onClick: function () { setSelectedBackgroundId(item.id); setMessage('') } }, item.width + ' × ' + item.height)
                    }))) : null,
                  ['scene', 'web', 'application'].includes(qualityWallpaper.type) && qualityWallpaper.render?.available === true ? h('p', { style: { marginTop: 12, opacity: .82, lineHeight: 1.45 } }, props.t('wallpaperQualityHint')) : null,
                  qualityWallpaper.type === 'application' ? h('label', { style: { display: 'flex', alignItems: 'flex-start', gap: 7, marginTop: 12, color: '#ffd08a', lineHeight: 1.4 } },
                    h('input', { type: 'checkbox', checked: applicationConfirmed, onChange: function (event) { setApplicationConfirmed(event.target.checked) } }),
                    props.t('wallpaperApplicationConsent')) : null)
                  : h('p', { style: { opacity: .76 } }, props.t('wallpaperPickerHint')),
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 14 } },
                  h('p', { role: 'status', 'aria-live': 'polite', style: Object.assign({}, dialogStyles.status, { flex: 1, color: message ? '#ffd2c7' : 'inherit' }) }, message),
                  h('button', { type: 'button', style: Object.assign({}, button, { background: 'rgba(84,137,197,.58)' }), disabled: busy || !wallpaperSelectionReady || (applicationConsentNeeded && !applicationConfirmed), onClick: function () { void applyCandidate() } }, busy ? '…' : props.t('useThisBackground')))))))
      }
      return h('div', null,
        h('div', { style: { display: 'flex', gap: 6, margin: '10px 0 14px' } },
          h('button', { type: 'button', role: 'tab', 'aria-selected': surface === 'panel', style: button, onClick: function () { setSurface('panel'); setCandidate(null); setSelectedWallpaper(null) } }, panelLabel),
          h('button', { type: 'button', role: 'tab', 'aria-selected': surface === 'page', style: button, onClick: function () { setSurface('page'); setCandidate(null); setSelectedWallpaper(null) } }, pageLabel)),
        surface === 'page' ? h('strong', null, pageLabel) : h('div', null,
          h('strong', null, panelLabel),
          h('p', { style: { opacity: .8, margin: '4px 0 10px' } }, props.t('panelBackgroundHint'))),
        h('div', { style: { display: 'flex', gap: 6, margin: '10px 0' } },
          h('button', { type: 'button', style: Object.assign({}, button, { background: (surface === 'panel' ? current.source === 'builtin' : current.source === 'default') ? 'rgba(118,165,218,.4)' : button.background }), onClick: restoreDefault }, surface === 'panel' ? props.t('defaultPhoto') : props.t('defaultBackground')),
          h('button', { type: 'button', style: Object.assign({}, button, { background: activeSource === 'wallpaper' ? 'rgba(118,165,218,.4)' : button.background }), onClick: function () { setSource('wallpaper'); setCandidate(null); setMessage(''); props.onOpenWallpaperPicker?.(surface) } }, props.t('wallpaperEngine')),
          h('button', { type: 'button', style: Object.assign({}, button, { background: activeSource === 'local' ? 'rgba(118,165,218,.4)' : button.background }), onClick: function () { setSource('local'); setSelectedWallpaper(null); setSelectedBackgroundId(null); setMessage('') } }, props.t('localFile'))),
        activeSource === 'local' ? h('div', { style: { margin: '8px 0' } },
          h('label', { style: { display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' } },
            h('span', null, props.t('chooseBackgroundFile')),
            h('input', { type: 'file', accept: surface === 'page' ? 'image/png,image/jpeg,image/webp,video/mp4,video/webm' : 'image/png,image/jpeg,image/webp',
              onChange: function (event) { chooseFile(event.target.files?.[0]); event.target.value = '' } })),
          h('small', { style: { display: 'block', opacity: .72, marginTop: 5 } }, surface === 'page' ? props.t('pageFileSupport') : props.t('panelFileSupport')),
          h('small', { style: { display: 'block', opacity: .68, marginTop: 4 } }, props.t('localImageQualityHint'))) : null,
        activeSource === 'wallpaper' ? h('div', null,
          h('p', { style: { opacity: .8, lineHeight: 1.45 } }, props.t('wallpaperPickerHint')),
          h('button', { type: 'button', style: Object.assign({}, button, { background: 'rgba(84,137,197,.58)' }), onClick: function () { props.onOpenWallpaperPicker?.(surface) } }, props.t('wallpaperPickerTitle'))) : null,
        activeSource !== 'wallpaper' && preview ? h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: 8, marginTop: 10, borderRadius: 8, background: 'rgba(7,21,40,.48)' } },
          h('img', { src: preview, alt: '', style: { width: 88, height: 68, objectFit: 'cover', borderRadius: 6 } }),
          h('div', { style: { minWidth: 0 } }, h('strong', null, previewTitle || props.t('backgroundPreview')),
            h('p', { style: { margin: '4px 0', opacity: .76 } }, candidate?.mediaType === 'video' || qualityWallpaper?.playable ? props.t('wallpaperVideo') : props.t('wallpaperStatic')),
            qualityWallpaper ? h('small', { style: { display: 'block', color: qualityWallpaper.backgroundSource === 'preview' && (!qualityWallpaper.backgroundWidth || Math.max(Number(qualityWallpaper.backgroundWidth), Number(qualityWallpaper.backgroundHeight)) < 1280 || Math.min(Number(qualityWallpaper.backgroundWidth), Number(qualityWallpaper.backgroundHeight)) < 720) ? '#ffd08a' : 'inherit', lineHeight: 1.35 } }, wallpaperQualityText(qualityWallpaper)) : null)) : null,
        surface === 'page' ? h('label', { style: { display: 'block', marginTop: 14 } }, props.t('pageDim') + ' · ' + Number(current.dim ?? 38) + '%',
          h('input', { type: 'range', min: 0, max: 75, value: current.dim ?? 38, onChange: function (event) { patchCurrent({ dim: Number(event.target.value) }) }, style: { width: '100%' } })) :
          h('label', { style: { display: 'block', marginTop: 14 } }, props.t('panelOpacity') + ' · ' + Number(current.opacity ?? 35) + '%',
            h('input', { type: 'range', min: 10, max: 85, value: current.opacity ?? 35, onChange: function (event) { patchCurrent({ opacity: Number(event.target.value) }) }, style: { width: '100%' } })),
        h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 12 } },
          h('button', { type: 'button', style: button, onClick: restoreDefault }, props.t('restoreDefault')),
          h('button', { type: 'button', style: Object.assign({}, button, { background: 'rgba(84,137,197,.58)' }), disabled: busy || (!candidate && !selectedWallpaper && !appliedWallpaper) || (applicationConsentNeeded && !applicationConfirmed), onClick: function () { void applyCandidate() } }, props.t('useThisBackground'))),
        h('p', { role: 'status', 'aria-live': 'polite', style: Object.assign({}, dialogStyles.status, { color: busy ? '#acd6ff' : message ? '#ffd2c7' : 'inherit' }) }, message))
    }

    var PAGE_BACKGROUND_TOKENS = {
      '--dsw-alias-bg-base': { light: 'rgba(248,250,255,0.08)', dark: 'rgba(8,18,34,0.08)' },
      '--dsw-alias-bg-layer-1': { light: 'rgba(235,242,251,0.40)', dark: 'rgba(12,25,44,0.44)' },
      '--dsw-alias-bg-layer-2': { light: 'rgba(232,240,251,0.54)', dark: 'rgba(15,29,50,0.56)' },
      '--dsw-alias-bg-layer-3': { light: 'rgba(230,239,251,0.64)', dark: 'rgba(18,34,57,0.68)' },
      '--dsw-specific-sidebar-fill': { light: 'rgba(232,239,249,0.56)', dark: 'rgba(13,26,45,0.58)' },
      '--dsw-specific-bubble': { light: 'rgba(251,252,255,0.72)', dark: 'rgba(17,30,50,0.74)' },
      '--dsw-specific-bubble-highlight': { light: 'rgba(245,249,255,0.72)', dark: 'rgba(24,39,62,0.76)' }
    }


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
