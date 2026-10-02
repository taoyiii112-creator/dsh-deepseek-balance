# 安装说明

本说明用于官方 DeepSeek Harness Desktop 插件。v1.0.1 是插件，不包含也不替换 DeepSeek Harness。源码仓库为 https://github.com/taoyiii112-creator/dsh-deepseek-balance；安装 ZIP 位于 [GitHub Release v1.0.1](https://github.com/taoyiii112-creator/dsh-deepseek-balance/releases/tag/v1.0.1)。

Image/Video 直接读取壁纸项目原文件；Scene/Web/Application 会打开 Wallpaper Engine 具名窗口，并在系统默认浏览器的本机配对页让用户明确选择该窗口，画面通过本机 WebRTC 返回插件。捕获页请求浏览器隐藏系统鼠标指针，但浏览器可能忽略该请求，画面仍可能显示鼠标。安装后继续使用官方 DeepSeek Harness。

## 从 GitHub 安装

1. 打开官方 DeepSeek Harness Desktop 左侧栏的“插件”页面，点击“添加插件”。
2. 输入 https://github.com/taoyiii112-creator/dsh-deepseek-balance，检查仓库来源后安装。
3. 安装完成后点击“立即启用”；按提示重启 Desktop，再打开会话确认余额胶囊加载。

也可以在 GitHub 仓库点击“Code”→“Download ZIP”下载源码，解压后在“添加插件”中选择本地插件目录。

必须在 Desktop 主应用的“插件”页面安装。设置页中的插件清单是只读视图。Desktop 由 Electron 独占 desktop profile，并通过主应用插件管理器写入该 profile；manifest 中的 client.platform: web 表示客户端运行在共享 Web 界面，不表示要安装到 web profile。

## 本地 tgz 安装

如果你自行构建了插件包，将生成的 tgz 放在固定目录，然后在官方 Desktop 的“插件”→“添加插件”中填写 tgz 完整路径并安装。不要把源码 ZIP、外层 ZIP 或 sha256 文件填入插件输入框。

## 下载与分发

从 [GitHub Release v1.0.1](https://github.com/taoyiii112-creator/dsh-deepseek-balance/releases/tag/v1.0.1) 下载唯一安装 ZIP `dsh-deepseek-balance-1.0.1-安装包.zip`，解压后按本页说明把 `.tgz` 路径交给官方 Desktop 插件管理器。也可以直接添加公开 GitHub 仓库地址，或从仓库的“Code”菜单下载源码 ZIP 并选择解压后的插件目录。源码 ZIP 不是 `.tgz` 安装包。项目不包含 DeepSeek Harness 桌面应用，也不需要构建或替换官方 Desktop。

## 安装失败排查

- CLI 提示 `profile "desktop" is managed exclusively by the Electron application`：关闭该命令行安装方式，回到 Desktop 主应用左侧栏的“插件”页面安装。
- 插件页面提示仓库地址或本地目录无效：确认使用完整 GitHub 仓库 URL，或选择已解压且包含 package.json 的插件目录。
- 安装报网络、磁盘、权限或 pnpm 错误：在失败详情中查看 Host/pnpm 输出，分别检查网络或包源、磁盘空间、profile 写入权限以及被阻止的依赖安装脚本。修复后在插件页面重试。
- 显示安装完成但没有加载：点“立即启用”，查看 bundle 是否有错误标记，并按提示重启。安装完成不等于运行时已经成功激活；还要在会话顶栏确认余额胶囊。
- 如果启动器/加载器报告插件兼容错误：记录 Desktop 版本和插件页面显示的错误。v1.0.1 的 Desktop 实机功能仍需按具体 Harness 版本及 Wallpaper Engine 项目验收。

## 配置 API Key

进入会话后，点击余额胶囊旁的齿轮 →“余额”→“设置 DeepSeek API Key”，粘贴并保存查询。API Key 通过 DSH 本机 `credentials` 服务保存，不会进入客户端代码、日志或安装包。不要将 Key 发到聊天中。

自动刷新范围为 30–300 秒。可在同一设置页调整余额提醒阈值；“充值”链接只在用户点击时打开 DeepSeek 官方页面。

## Wallpaper Engine 与本地背景

本地 PNG/JPEG/WebP、用户视频和 Wallpaper Engine 背景均保留。设置面板可拖动且没有屏幕边缘的额外箭头；选择 Wallpaper Engine 后会打开独立壁纸页，列表、搜索、原图候选和应用操作都在该页完成。列表缩略图只供识别：Image 使用项目原图，Video 直接播放本机原始 MP4/WebM 并按 HTTP Range 分段读取、不转码；Scene/Web/Application 由 Wallpaper Engine 实时渲染。页面与设置面板使用同一精确来源时，共用同一全窗口背景层，动态壁纸保持播放且只渲染一次；设置卡片叠加高不透明度深色玻璃底，保留少量背景透出并保证文字清晰。当前正在查看的壁纸与当前已应用壁纸会分开展示。两处背景不同时，各自显示所选背景。没有可验证原图的 Image 不会把小预览图当原图应用。要播放清晰的 1080p/4K 动态壁纸，项目本身需要包含对应分辨率的视频文件，Desktop 解码器也需支持该编码。Scene 优先使用项目清单；若清单缺失或损坏且根目录只有一个 `.pkg`，则由 Wallpaper Engine CLI 直接加载，不解包。Web 使用入口 HTML；Application 会在缺少 `type` 时按 `.exe` 项目文件识别，并在每次启动前要求确认。Scene/Web/Application 需要 Windows 本机 Desktop、Wallpaper Engine 和最新版 Chrome/Edge：应用壁纸后会打开本机配对页，用户点击“开始共享”，并按配对页显示的完整名称选择对应的 `DSH Balance` Wallpaper Engine 窗口。捕获请求只在 `getDisplayMedia()` 中设置 `cursor: 'never'`，不对轨道应用精确约束或检查浏览器能力；浏览器可能忽略该请求，系统鼠标仍可能出现在共享画面中。壁纸内容自身绘制的指针也可能出现在画面中。捕获仅本机 WebRTC 传输，不录制、不上传；关闭捕获页或停止共享会结束本次共享并关闭对应 WPE 窗口。再次应用时需要重新打开配对页并授权选择窗口。远程 Web 服务不能访问你电脑上的壁纸目录。

旧版直接在 DSH Web 页面共享屏幕的实现已移除。当前方案把浏览器共享限制在单独的本机捕获页：浏览器只请求用户选择一个窗口，插件不枚举桌面来源或自动选择窗口，也不访问 Electron 主进程。当前版本已回退到 17:47 首轮共享行为：捕获请求设置 `cursor: 'never'`，但不强制轨道约束或阻止共享；浏览器忽略该请求时，系统鼠标仍会显示。官方 Desktop 插件页面使用 `dsh-app://app`；认证转发会移除 Host、Origin 和 Fetch Metadata，所以客户端仅从已知 Desktop 页面附带精确来源标记，Host 校验标记与可用的 loopback Host/peer。兼容旧版官方 `app://dsh`。本机 Host 从 `webServer.port` 生成 Chrome/Edge 能访问的 `http://127.0.0.1:<port>` 配对地址；普通本机 Web 则使用自身 loopback 地址。插件不接受其他自定义协议。只有调用 `getDisplayMedia()` 的捕获页检查安全上下文；插件页面只需 WebRTC 接收接口。用户反馈共享流程已成功；未逐类确认全部 Wallpaper 项目。架构说明见 [本机浏览器壁纸捕获方案](docs/v0.6.2-官方Desktop本机浏览器壁纸捕获方案.md)。

若提示“本机壁纸服务拒绝了此请求”，请安装 v1.0.1 ZIP 并重启 Windows Desktop，让 Host 重新加载插件；当前版本会为官方 Desktop 转发时被剥离来源头的请求附带受限来源标记。随后从 Desktop 主应用重新应用。若提示插件页缺少 WebRTC 接口，说明当前 Harness 客户端内核不支持接收实时流。若提示“WPE 未打开壁纸窗口”，确认项目已完整下载；若提示“本机浏览器配对页没有打开”，检查 Windows 默认浏览器。捕获页打开后点击“开始共享”，按页面显示的完整名称选择 WPE 窗口。失败时插件会保留原背景并关闭本次临时 WPE 窗口；列表缩略图本身不代表可启动的壁纸源。

“减少动态效果”不是全局禁播开关：它会影响余额滚动、桌宠动画和本地导入视频；用户主动选择的 Wallpaper Engine Video 继续播放，不受此开关影响。页面隐藏时插件页面背景会暂停；设置打开时，如果页面和面板来源完全相同，则共用一层并继续动态播放，来源不同时暂停页面层视频。此行为不会暂停或修改 Wallpaper Engine 自己的桌面壁纸。

## v1.0.1 发布状态

- Release `v1.0.1` 提供唯一安装 ZIP，内含 Desktop 插件管理器需要的 `.tgz`、SHA-256 校验文件和说明。
- 本次将已实现的 0.6.2 功能基线重命名为 1.0.1 并重建安装包，没有写入或回读 Desktop profile。安装后需从 Desktop“插件”页启用并重启；不能据此确认已安装。鼠标是否显示取决于浏览器对 `cursor: 'never'` 的实际处理；Application 每次仍需用户确认信任。

## 卸载

在 Desktop“插件管理器”中卸载 `dsh-deepseek-balance`。不要使用 Web profile 的 CLI 命令操作 Desktop 的独立 profile。
