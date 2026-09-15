# Agent Note：接受 macOS 剪贴板文件列表中的截图

Status: implemented

[English](2026-09-15-macos-screenshot-paste.md) | 中文

## 问题

桌面应用遗漏了 Electron 原生编辑菜单，因此 macOS 无法稳定地把标准 Command+C 和 Command+V 操作派发给渲染页面。此外，对话编辑器过去只从 `DataTransfer.items` 收集粘贴的文件，而 macOS Electron 中的截图可能只出现在 `DataTransfer.files`。这两处缺口共同导致按 Command+V 粘贴截图时没有生成附件。

## 决策

安装 Electron 原生 `editMenu` 角色，让 macOS 接管标准的复制、剪切、粘贴、撤销、重做和全选快捷键。同时从 `DataTransfer.items` 和 `DataTransfer.files` 收集文件，并对指向同一个剪贴板文件的条目去重。部分 Electron 版本不会在这两个集合中提供截图，因此仅向应用自有页面提供一个受限 preload 方法，只读取剪贴板中的图片。仅当粘贴事件不含文件和文字时，编辑器才调用该兜底方法，并把取得的 PNG 送入现有附件流程。此桥接不暴露文字剪贴板读取能力。

## 考虑过的替代方案

**在渲染进程暴露完整的 Electron 原生剪贴板。** 拒绝，因为文字和任意格式会扩大渲染页面读取用户无关数据的能力。当前桥接只向应用自有来源提供图片字节，可复用客户端仅把它作为可选兜底。

## 后果

使用 Command+V 粘贴的 macOS 截图会进入正常附件流程，包括预览、校验、上传和模型输入处理。回归测试覆盖原生编辑菜单要求、`items` 为空而 `files` 含截图的 Electron 事件形态，以及仅限应用页面的图片 IPC 接口。
