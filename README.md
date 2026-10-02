# DeepSeek Harness API 余额

源码仓库：[GitHub](https://github.com/taoyiii112-creator/dsh-deepseek-balance)

## 项目介绍

为 DeepSeek Harness 提供官方 API 余额显示：后端安全读取 `DEEPSEEK_API_KEY` 并查询余额，前端在每个会话的顶部工具栏常驻显示余额，一打开会话即可看到。

主要特性：

- 在 Harness 会话顶栏常驻显示紧凑余额胶囊，不再放在设置页
- 支持多币种余额、点击刷新和 30–300 秒可自定义自动刷新（默认 60 秒）
- 减少时显示精确的红色扣款差额；v0.4.5 用 650ms 的双排整行滚筒显示旧值移出、新值进入
- 刷新失败时主胶囊只显示失败状态，历史余额只在详情中标为“上次成功余额”；402、不可用、空列表和全零统一显示“没有余额”
- 首次加载、失败请求、Key 变化、不可用账户和币种结构变化不会误报扣款
- 系统“减少动态效果”开关只影响余额滚动、桌宠动画和本地导入视频；用户选择的 Wallpaper Engine Video 不受该开关影响。页面隐藏时暂停页面层背景；设置打开且页面与面板背景相同时，共用一层并保持动态播放。
- v0.4.6 开始提供离线透明待机桌宠：待机视频结束后显示原静态图 15 秒，再重新播放待机视频
- 待机媒体失败或页面启用减少动态效果时自动使用透明 PNG，不新增余额请求
- 桌宠可拖动到视口四边；隐藏和恢复统一放在余额胶囊旁的齿轮设置中，位置/隐藏状态只保存在浏览器本地
- 未配置点击规则时，点击或开始拖动桌宠会从头重新播放待机动画；减少动态效果或媒体失败时使用静态后备
- 齿轮设置集中管理 API Key、余额阈值、自动刷新和桌宠；成功余额低于阈值时，余额旁才显示用户点击打开 DeepSeek 充值页面的链接，不自动跳转
- v0.4.7 支持导入透明 PNG/WebP/APNG 或无音轨 VP9 WebM；内置桌宠之外最多保存 3 个本地用户方案，每方案固定 5 个基础槽位并可另加 5 个自定义槽位
- v1.0.1 延续 Wallpaper Engine Image、Video、Scene、Web、Application 支持；设置面板可拖动，Wallpaper 壁纸列表、搜索、候选和应用在独立页面中操作。Image 使用可验证的项目原图，Video 播放原视频；Scene/Web/Application 由 Wallpaper Engine 具名窗口运行，再由用户通过 Chrome/Edge 窗口选择器授权本机捕获并经本机 WebRTC 显示，无需改动官方 DeepSeek Desktop。Scene 优先用 `project.json`；清单缺失、损坏或指向不存在的 Scene 入口时，可在唯一根目录 `.pkg` 且有 preview 的情况下直接打开 `.pkg`。
- 捕获请求只设置 `cursor: 'never'`，不检查或强制轨道约束；浏览器可能忽略隐藏鼠标请求，但共享会继续。用户此前确认本机捕获可显示壁纸；1.0.1 安装包尚未安装验证，所有壁纸类型也未逐项实机验收。
- 自定义场景从已接入的余额查询、余额变化、桌宠点击、待机与本地时间事件中选择触发规则；不执行用户脚本，也不接入未验证的聊天事件
- 鼠标停留可查看账户状态、充值余额、赠送余额和最近刷新时间
- 页面隐藏时暂停轮询，避免无效请求
- 首次显示“设置余额”时，点击顶栏、粘贴一次 API Key、保存即可，不需要改环境变量
- API Key 通过 DSH 本机凭据存储保存，不会进入浏览器、日志或安装包
- 固定调用 DeepSeek 官方 HTTPS 余额接口，带超时、响应校验和安全错误映射

## v1.0.1 Desktop 壁纸与可拖动设置面板

- 用户反馈 v0.6.1 Desktop 中 Wallpaper Engine 设置列表、设置面板背景和 DeepSeek 静态背景仍可能显示低清预览图。只读审计确认：列表缩略图本来就使用 preview；实际背景虽请求 `/background`，但 Host 的原图发现规则会漏掉 `imgs/`、纯数字文件名等高清素材，并在打开设置时把原视频切换成静态回退图。
- v1.0.1 支持全部 Wallpaper 类型：Image/Video 使用原文件；Scene 优先使用 `project.json`，清单缺失、损坏或指向不存在的 Scene 入口时，可受限回退到唯一根目录 `.pkg`；Web 使用项目入口 HTML；Application 在逐次确认后交由 Wallpaper Engine 加载项目清单。随后插件打开本机浏览器配对页，用户在 Chrome/Edge 的系统选择器中选择具名 WPE 窗口，再通过本机 WebRTC 把画面传回插件；无需定制 DeepSeek Shell。Application 清单未声明 `type` 时按 `.exe` 项目文件识别。
- Host 现在把 `thumbnail`、静态 `background`、原始 `media` 和 `render` 元数据分开返回：原图候选使用受限递归与尺寸/内容检查，Web 入口只读分析本地图片引用；多候选项目在独立壁纸页显示候选尺寸，绝对路径不会交给前端。项目原图与列表缩略图分开展示；没有验证到图片原图时，不会把小缩略图作为原图应用。
- 只有 `.pkg + preview` 的 Scene 不放大或解包；`Scene/Web/Application` 使用本机配对捕获页，不向插件暴露 Electron IPC、屏幕枚举或自动窗口选择。捕获请求包含 `cursor: 'never'`，但不再对轨道应用精确约束或检查浏览器能力；浏览器可能忽略隐藏鼠标请求，系统鼠标仍可能出现在共享画面中。壁纸内容自身绘制的指针也不会由此设置移除。捕获前必须由用户在浏览器窗口选择器中选中 WPE 窗口；Application 还需要在设置里明确确认。
- 设置界面是约 560px 的可拖动悬浮面板，位置保存在本机；不再显示屏幕边缘的额外箭头入口。选择 Wallpaper Engine 后打开独立壁纸页。页面与面板选择同一精确来源时，面板透明显示同一全窗口背景层，动态壁纸持续播放且只渲染一次；页面遮罩临时降低以提升清晰度。来源不同则保留各自背景。
- 壁纸失败提示区分项目源文件、WPE 窗口启动、系统默认浏览器配对页启动、浏览器捕获授权、WebRTC 配对和实时视频轨失败；Windows 平台限制、Desktop/Host 来源限制、插件页缺少 WebRTC 接口也分别提示。Desktop 的认证转发会移除 `Host`、`Origin` 和 `Sec-Fetch-Site`，因此客户端仅从已知 Desktop 页面附带精确来源标记；Host 校验标记，并检查仍可用的 loopback Host/peer 信息。兼容 `dsh-app://app` 与旧版 `app://dsh`，Chrome/Edge 配对页单独使用 Host 的 `webServer.port` 生成的 `127.0.0.1` 地址；普通本机 Web 页面继续使用自身 loopback origin。插件主页面不再用 `isSecureContext` 阻止启动；安全上下文检查只保留在实际调用 `getDisplayMedia()` 的 localhost 配对页。启动中途失败会清理临时 WPE 窗口，已应用背景保持不变。当前安装包需从 Desktop 插件页重新安装后生效。
- 只分发普通插件 ZIP，安装到官方 DeepSeek Harness 的插件页；不要求别人下载源码或使用定制 Desktop。Scene/Web/Application 每次应用都需在本机配对页点击“开始共享”，按页面显示的完整名称选择 `DSH Balance` Wallpaper Engine 窗口。浏览器忽略隐藏鼠标请求时共享画面仍可能显示鼠标。尚未逐项验收全部类型；本地 ZIP 不等于公开发布，Codex 未回读已安装 profile。
- Wallpaper 全类型与 Desktop 兼容边界见 [v1.0.1 Desktop 兼容说明](docs/v1.0.1-Desktop兼容说明.md)；原图选择、独立 Wallpaper 页和可拖动设置面板设计见 [0.6.2 历史方案](docs/v0.6.2-Desktop壁纸原图与侧边设置面板方案.md)，捕获流程见 [本机浏览器壁纸捕获方案](docs/v0.6.2-官方Desktop本机浏览器壁纸捕获方案.md)。此前的自建 Shell 方案、补丁和便携 Desktop 包已删除，不属于当前安装前提。

## v0.6.1 DeepSeek Harness Desktop 兼容（历史版本）

- 版本号统一为 `0.6.1`，并新增 [Desktop 兼容说明](docs/v0.6.1-Desktop兼容说明.md)。Desktop 使用独立 `desktop` profile，但客户端运行在共享 Web 应用中，因此插件 manifest 继续声明 `client.platform: web`。
- 删除旧的 Web profile 自制安装器、环境诊断器及其专用测试夹具；在 Desktop 中通过官方插件管理器安装本地 `.tgz`。
- v0.6.1 删除了旧 Web 实现的 Wallpaper Engine `playInWindow` 窗口启动、`getDisplayMedia` 捕获流程和配套 API；因此现有 v0.6.1 Desktop 不具备实时 Scene/Web/Application 捕获能力。v0.6.2 通过本机浏览器配对页重新加入插件侧功能，不修改或替换官方 Desktop。
- v0.6.1 保留本地图片/视频背景和 Wallpaper Engine Video 原文件直放。Video 按 Range 读取，未转码；高分辨率播放取决于素材和 Desktop 解码器。该版 profile 对 Scene/Web/Application 只显示最佳静态来源/预览。
- 当时生成了插件 `.tgz` 与安装 ZIP；本机 profile 曾回读到版本 `0.6.1`。以上是历史快照，不代表当前安装状态。当前版本与安装方式见 [v1.0.1 Desktop 兼容说明](docs/v1.0.1-Desktop兼容说明.md)。

## v0.5.6 Wallpaper Engine 共享鼠标指针修复（历史实现）

- 共享 Wallpaper Engine 窗口时请求浏览器不要把鼠标指针合成进共享视频流，以减少 DeepSeek 内画面与本地鼠标同时出现的重复指针。
- v0.5.6 曾在旧捕获流程中请求隐藏指针；该流程随 v0.6.1 移除。v0.6.2 的本机捕获页只请求 `cursor: 'never'`；浏览器可能忽略请求，系统鼠标仍可能出现在画面中。壁纸内容本身绘制/烘焙的指针不受此约束控制。

## v0.5.8 余额胶囊滚动动画终态修复

- 修复滚动结束后金额像卡住、没有停在刷新值的问题：移除 WAAPI 动画的 `forwards` 填充效果，再切换为最终金额。
- 保留减少向上、增加向下的 650ms 动画、快速刷新时新结果优先，以及减少动态效果设置。
- 修复方案：[v0.5.8 余额胶囊滚动动画终态修复方案](docs/v0.5.8-余额胶囊滚动动画终态修复方案.md)。

余额动画修改保留在后续版本；历史安装包已清理。

## v0.5.7 本地壁纸图片格式识别修复

- 本地图片按 PNG、JPEG、WebP 文件内容签名识别，不再要求扩展名与实际编码一致；保留 64 MiB 文件大小和 8192×8192 像素限制。
- 文件后缀显示为图片但内容签名无效时，提示检查真实格式或文件是否损坏。

该版本源码未安装到本机 profile；历史安装包已清理。

## v0.5.5 Wallpaper Engine Web 实时渲染（历史功能，已移除）

- v0.5.5 曾用具名窗口和浏览器授权捕获 Wallpaper Engine 的 Scene、Web 或 Application 壁纸；这些步骤只对应当时的 Web 版本。
- v0.6.1 曾移除旧版 `playInWindow` 和 `getDisplayMedia` 流程；v0.6.2 后续通过官方 Wallpaper Engine 具名窗口与本机浏览器配对页恢复 Scene/Web/Application 捕获，当前实现边界见 [v1.0.1 Desktop 兼容说明](docs/v1.0.1-Desktop兼容说明.md)。
- Wallpaper Engine Video 在页面内直接播放原始 MP4/WebM，不受系统“减少动态效果”开关影响；余额滚动、桌宠动画和本地导入视频会遵循该开关。页面隐藏时页面层背景暂停；设置打开时，同一精确来源共用一层并保持动态，来源不同则暂停页面层视频。
- Scene、Web、Application 在早期 Desktop 版本中只使用本机静态素材或预览；后续版本改为使用 Wallpaper Engine 窗口和用户授权的本机浏览器捕获。v0.6.1 profile 的历史边界见 [v0.6.1 Desktop 兼容说明](docs/v0.6.1-Desktop兼容说明.md)。

该版本安装包已清理；以上仅保留历史实现记录。

## v0.5.3 Wallpaper 壁纸清晰度修复

- 对没有直接原图入口的壁纸，限量检查根目录和常见素材目录中的背景图片；只有文件名明确表示背景、尺寸可读取且至少为 1280×720（横竖屏均可）时才会采用，并且必须清晰于预览图。
- 壁纸卡片与选中项显示实际背景来源和像素尺寸；只剩小预览图或原图分辨率偏低时给出提示，避免将模糊误认为压缩设置问题。
- v0.5.3 时，支持的视频在静止、减少动态效果或播放失败时回退到最佳静态背景图；从 v0.6.1 起，用户主动选择的 Wallpaper Engine Video 不再受减少动态效果开关控制，当前背景暂停条件见 Desktop 兼容说明。
- v0.5.3 当时不解包或启动 `.pkg`，所以只有 `.pkg + preview` 时无法恢复高清静态原图；v0.6.2 由 Wallpaper Engine 官方 CLI 直接打开 Scene `.pkg` 做实时渲染，不解包该文件。
- 成功生成安装 ZIP 后，构建脚本会移除本轮解压暂存目录，使该版本只保留一个安装 ZIP。

该版本安装包已清理；安装、哈希和视觉验收状态仅作历史记录。

## v0.5.2 外观与壁纸体验修复

`package.json` 与 `dsh.plugin.json` 源码版本现为 0.5.2。该版修复：

- 设置面板默认使用随包静态透明照片；遮罩默认 35%，可在 10%–85% 间调节，面板玻璃模糊降为 10px。
- Wallpaper Engine 搜索框、刷新、Steam 库目录操作、背景预览和应用按钮固定在壁纸卡片滚动区外；可按名称、Workshop ID 和类型筛选已下载壁纸。
- Windows 的“浏览…”打开本机文件夹选择器，选中路径后仍通过 Steam 创意工坊目录校验；也可手动输入路径。
- 胶囊拖动与初始化位置会避让同一顶栏高度内的按钮、链接和输入控件，并保持在窗口内。
- Wallpaper Engine 静态项目若提供独立图片文件，直接使用原始文件；场景/网页若只有压缩预览图，则保留预览，并说明放大无法恢复细节。本地导入图片原样保存，不缩放、不二次压缩。

该版本安装包已清理；profile 与验收状态仅作历史记录。

## v0.5.1 功能基线

v0.5.1 首次实现设置面板半透明、独立页面/面板背景、Wallpaper Engine 接入和胶囊拖动。其功能包括：

- 设置面板半透明、可拖动；面板背景可选本地图片或本机已安装的 Wallpaper Engine 壁纸，并可调节遮罩浓度。
- DeepSeek **整个页面**的背景与设置面板背景分开设置：可选本地图片/视频或本机 Wallpaper Engine 壁纸。视频在浏览器支持解码时静音循环播放；场景/网页项目使用本机预览图，不运行其代码。
- 胶囊由顶部细线悬挂并可水平拖动；低余额时的“充值”入口放入胶囊内部。
- 桌宠大小可在 50%–200% 调节，每个桌宠方案分别记住大小。
- Wallpaper Engine 通过本机 DSH Web 服务探测 Steam 多库；用户可登记额外 Steam 库路径。只读取受限项目元数据和媒体文件，视频使用 Range 流式读取；本机素材不写入插件包。

素材规格与交互边界见[透明设置与桌宠说明](docs/透明可拖动设置界面预览说明.md)和[页面背景接入说明](docs/v0.5.1-DeepSeek页面背景接入方案.md)，七张设计图仍用于对照预期界面。

**历史交付记录：**v0.5.1 安装器目标为官方 `web` profile，具体安装状态曾以 profile manifest 回读确认；该版没有完成真实页面视觉验收或正式发布。Wallpaper Engine 本机目录发现与 Web 服务依赖官方 `webServer`，Desktop 支持尚未验证。

预览图：[默认设置](docs/v0.5.1-透明设置预览-默认.png)、[自定义面板背景](docs/v0.5.1-透明设置预览-自定义背景.png)、[低余额充值](docs/v0.5.1-透明设置预览-低余额充值.png)、[桌宠大小与胶囊拖动](docs/v0.5.1-透明设置预览-桌宠大小与胶囊拖动.png)、[Wallpaper Engine 面板背景选择](docs/v0.5.1-透明设置预览-Wallpaper选择.png)、[Wallpaper Engine 视频作为页面背景](docs/v0.5.1-DeepSeek页面背景-Wallpaper视频.png)、[本地文件作为页面背景](docs/v0.5.1-DeepSeek页面背景-本地文件.png)。

以上是 v0.5.1 的历史设计预览图；其中 Wallpaper 视频预览所示的“减少动态效果时暂停”是当时的设计，当前 Wallpaper Engine Video 播放规则以 [v1.0.1 Desktop 兼容说明](docs/v1.0.1-Desktop兼容说明.md) 为准。

## 使用方法

### 安装到官方 Desktop

1. 在 DeepSeek Harness Desktop 左侧栏打开“插件”页面，点击“添加插件”。
2. 输入公开仓库地址 https://github.com/taoyiii112-creator/dsh-deepseek-balance，检查后安装。
3. 安装完成后选择“立即启用”；若 Desktop 要求重启，则重启后进入会话确认余额胶囊已加载。

插件安装包采用 Web 客户端平台标记，因为官方 Desktop 内嵌共享 Web 应用；Desktop 插件管理器负责安装到独立的 `desktop` profile。`--profile web` 会改到另一套 profile；CLI 对 `--profile desktop` 会返回 Electron 独占 profile 的错误，这是预期保护，不表示插件不兼容。设置中的插件清单是只读视图，应使用左侧栏主“插件”页面。完整步骤和失败排查见 [安装说明](INSTALL.md) 与 [v1.0.1 Desktop 兼容说明](docs/v1.0.1-Desktop兼容说明.md)。

1.0.1 安装 ZIP 可从 [GitHub Release](https://github.com/taoyiii112-creator/dsh-deepseek-balance/releases/tag/v1.0.1) 下载；也可以下载源码 ZIP、解压后，在“添加插件”中选择本地插件目录。

### 配置余额

点击余额胶囊旁的齿轮 →“余额”→“设置 DeepSeek API Key”，粘贴并保存查询。API Key 通过 DSH 本机凭据服务保存，不进入客户端、日志或安装包。自动刷新范围为 30–300 秒；余额阈值只控制是否显示充值链接。

### 背景与 Wallpaper Engine

本地 PNG/JPEG/WebP 图片和 MP4/WebM 背景仍按原文件读取。Wallpaper Engine 搜索与选择会进入独立壁纸页：Image 使用项目原图，Video 在详情区直接播放原 MP4/WebM；Scene/Web/Application 的列表图只作选择缩略图，应用后显示 Wallpaper Engine 实时画面。没有可验证原图的 Image 不会把预览缩略图当原图应用。页面与面板使用相同精确背景来源时，共用同一全窗口媒体/捕获层且视频不中断；设置卡片使用高不透明度深色玻璃底，保留少量背景透出并保证文字清晰。两边来源不同时各自显示。列表会分开展示当前正在查看和当前正在使用的壁纸。Scene/Web/Application 由 WPE CLI 打开具名窗口，再在本机 Chrome/Edge 配对页手动选择页面显示的完整目标名称；捕获流经本机 WebRTC 传递，不录制、不上传，并请求浏览器不要把系统鼠标指针合成到共享流中；浏览器可能忽略该请求，鼠标仍可能出现。用户已确认本机共享能够显示壁纸，但尚未逐项验收全部类型。Application 每次都要确认信任。

## 开发与兼容范围

`npm run lint` 检查 JavaScript 语法与客户端安全边界，`npm run build` 生成客户端和 Host 代码；完整自动测试命令是 `npm test`。此前基线有 47 项测试通过；本轮只运行 lint/build，没有运行自动测试。测试使用隔离 Wallpaper fixture，不访问真实 DeepSeek API 或执行 Wallpaper Engine 项目。

本版适配目标为官方 DeepSeek Harness Desktop。项目此前检查的 Desktop 版本为 `0.1.7-rc.2`；当前运行版本未由本轮重新读取。仅通过 manifest 和构建不能证明本轮安装包已加载到 Desktop profile。

插件需要 DSH 提供 `webServer`、`credentials`、React 客户端模块加载和 `conversation.session.header.utilities` 插槽。第三方桌面版不在兼容声明范围。DSH 处于开发预览期，具体兼容性以实际版本验证为准。

## 当前交付状态

- 源码与两个 manifest 均为 1.0.1；client.platform 为 web，由官方 Desktop 管理器安装到 desktop profile。安装是否成功以用户设备的插件页和会话顶栏为准。
- 源码已公开在 [GitHub 仓库](https://github.com/taoyiii112-creator/dsh-deepseek-balance)，可从官方 Desktop 插件页通过仓库地址安装；1.0.1 安装 ZIP 可从 [GitHub Release](https://github.com/taoyiii112-creator/dsh-deepseek-balance/releases/tag/v1.0.1) 下载。
- Wallpaper 五种类型尚未逐项实机验收；捕获行为与兼容边界见 [v1.0.1 Desktop 兼容说明](docs/v1.0.1-Desktop兼容说明.md)。
## v0.4.0 已实现范围与后续修正

- v0.4.0 已加入余额变化滚轮组件；v0.4.4 已按新状态机方案让轨道常驻，自动测试不能替代真实浏览器视觉验收。
- 余额减少时，在主余额旁用更小的红字显示相对上一次成功查询的净减少，例如 -1.0。
- 首次加载、刷新失败、Key 变化和不可比较币种不会显示推测性扣款；差额使用精确十进制计算。
- 详细交互、算法、边界和验收标准见 [v0.4.0 余额变化动效设计](docs/v0.4.0-余额变化动效设计.md)。

实现细节、边界和验收标准见 [v0.4.0 余额变化动效设计](docs/v0.4.0-余额变化动效设计.md)。自动测试不访问真实 DeepSeek API；真实余额联调仍需用户明确允许并由用户提供运行环境中的 Key。

## 版本历史

- v1.0.1（当前 GitHub Release）：延续 Wallpaper Engine 五类支持、独立选择页、可拖动设置面板和本机窗口捕获配对。捕获页只请求 `cursor: 'never'`，浏览器可能忽略该请求；用户需在最新版 Chrome/Edge 中自行选择 Wallpaper Engine 窗口。五类 Wallpaper 尚未逐项实机验收，Desktop profile 未由 Codex 回读。
- v0.6.2（历史源码基线；旧安装包已清理）：加入 Wallpaper Image/Video/Scene/Web/Application 的来源处理、独立 Wallpaper 选择页、可拖动设置面板和本机浏览器窗口捕获配对。Scene 优先用 `project.json`，无有效清单时可使用唯一根目录 `.pkg`。用户曾确认本机捕获可显示壁纸；这不代表全部类型已逐项验收。
- v0.6.1（源码、插件包和唯一安装 ZIP 已生成；Desktop 实机验收待完成）：适配官方 Desktop 的共享 Web 渲染器，移除只安装到 Web profile 的旧安装器和诊断代码；明确减少动态效果开关只影响余额滚动、桌宠动画和本地导入视频，Wallpaper Engine Video 独立播放。
- v0.5.8（源码和唯一安装 ZIP 已生成，真实 profile 与真实页面验收未完成）：修复余额滚动动画结束后 `fill: 'forwards'` 残留位移、遮住最终余额的问题。
- v0.5.7（源码和唯一安装 ZIP 已生成，未安装到本机 profile）：本地 PNG/JPG/WebP 按文件内容签名识别，不再受文件名扩展名误导。
- v0.5.6（历史 Web 版本）：曾尝试在浏览器共享流中隐藏鼠标指针；该窗口捕获流程已于 v0.6.1 移除，不属于当前 Desktop 功能。
- v0.5.3（源码、唯一安装 ZIP 和本机 web profile 升级已完成；页面验收状态见 历史版本记录）：改进 Wallpaper 高清背景素材选择与像素提示，视频静止态优先高清图，并让 release 目录只保留标准 ZIP。
- v0.5.2（源码与唯一本地安装包已生成）：默认静态照片、透明遮罩调节、Wallpaper 搜索与独立滚动列表、Steam 文件夹选择、胶囊控件避让和原始图像优先。真实页面验收与正式发布状态见 历史版本记录。
- v0.5.1（源码与本地安装包已生成）：半透明设置、独立的面板/DeepSeek 页面背景、Wallpaper Engine 与本地素材选择、胶囊顶部水平拖动及桌宠大小调节。
- v0.4.7（源码、自动测试与本机安装已完成）：胶囊齿轮统一设置、30–300 秒刷新、透明媒体本地导入、3 个用户方案与每方案 5+5 槽位、可观察事件规则和桌宠播放器；真实 `web` profile 已安装并回读，页面视觉验收和正式发布仍待完成。
- v0.4.6（源码已实施，已安装到本机 profile，本地 ZIP 已生成，尚未正式发布）：首个桌宠待机竖切；包含离线透明待机资源、视频结束后静态 15 秒、页面隐藏暂停/恢复、减少动态效果、媒体失败降级、桌宠拖动/隐藏/恢复、本地余额阈值充值链接，以及安装后将包归档放入 profile 内部并清理旧归档。包内、安装后版本/客户端哈希和依赖路径已回读一致，仍需页面视觉验收和正式发布授权。
- v0.4.5（已实施并安装）：重做可验证的余额滚筒、无余额/失败状态机、版本真值链路和不闪退安装器；已完成受控视觉验收，真实 API 联调和正式发布仍待单独处理。
- v0.4.4（真实验收未通过）：曾尝试修复常驻滚轮、失败旧值/余额不足提示、Key 竞态和安装器预检，但现场反馈与后续审计确认仍有上述缺陷。
- v0.4.3：修复 `.cmd` 编码兼容性，确保双击安装脚本在 Windows 上可见执行结果。
- v0.4.2：修复 Windows 双击安装脚本调用 `npx` 后窗口提前关闭的问题，并补充版本更新说明。
- v0.4.1：调整余额滚轮过渡时序并更新离线包版本。
- v0.4.0：新增余额变化滚轮动画、精确十进制扣款差额、减少动态效果支持和比较基准边界处理；新增客户端状态与比较测试。
- v0.3.0：新增顶栏点击式 API Key 配置向导、本机凭据存储和可分享的一键安装脚本。
- v0.2.0：余额改为会话顶栏常驻胶囊，支持一眼查看、点击刷新、多币种摘要和悬停详情。
- v0.1.0：新增 DeepSeek 官方 API 余额查询、设置页面板、手动/自动刷新和安全错误处理。

## 当前状态边界

- 本地 1.0.1 包不等于公开发布；项目没有 GitHub Release。
- Codex 未读取或修改官方 Desktop profile。用户确认过本机共享可用，但这不代表 Image、Video、Scene、Web、Application 每类项目均已逐项验收。
- 当前源码只在捕获请求中设置 `cursor: 'never'`，不阻止可能带鼠标的共享流。安装 1.0.1 后仍需在 Desktop 插件页确认实际运行版本。

## 项目维护

项目开发、交付或暂停准备收尾时，会提交可清理清单，覆盖临时目录、缓存、脚本、日志、构建产物和残留；清单仅供确认，未经用户对具体项明确同意不会删除。

## 备注 / 相关项目

- 余额查询口径以 DeepSeek 官方 API 为准；本插件独立管理配置与进度文档。
