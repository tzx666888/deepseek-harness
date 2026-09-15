# Agent Note：接受 macOS 剪贴板文件列表中的截图

Status: implemented

[English](2026-09-15-macos-screenshot-paste.md) | 中文

## 问题

桌面应用遗漏了 Electron 原生编辑菜单，因此 macOS 无法稳定地把标准 Command+C 和 Command+V 操作派发给渲染页面。此外，对话编辑器过去只从 `DataTransfer.items` 收集粘贴的文件，而 macOS Electron 中的截图可能只出现在 `DataTransfer.files`。这两处缺口共同导致按 Command+V 粘贴截图时没有生成附件。

## 决策

安装 Electron 原生 `editMenu` 角色，让 macOS 接管标准的复制、剪切、粘贴、撤销、重做和全选快捷键。同时从 `DataTransfer.items` 和 `DataTransfer.files` 收集文件，并对指向同一个剪贴板文件的条目去重。保留原有文字兜底逻辑：没有文件时，编辑器仍会正常插入剪贴板文字。

## 考虑过的替代方案

**在渲染进程读取 Electron 原生剪贴板。** 这会让可复用的对话编辑器依赖桌面端专用桥接，并增加新的 IPC 接口。原生编辑命令会派发标准剪贴板事件，其中的 `files` 集合已经携带图片，因此不需要额外的高权限桥接。

## 后果

使用 Command+V 粘贴的 macOS 截图会进入正常附件流程，包括预览、校验、上传和模型输入处理。回归测试同时覆盖原生编辑菜单要求，以及 Electron 事件形态：`items` 为空，而 `files` 中包含截图。
