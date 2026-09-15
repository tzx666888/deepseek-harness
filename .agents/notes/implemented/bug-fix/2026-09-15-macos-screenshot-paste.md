# Agent Note: Accept macOS screenshot paste from the clipboard file list

Status: implemented

English | [中文](2026-09-15-macos-screenshot-paste.zh.md)

## Problem

The desktop application omitted Electron's native edit menu, so macOS did not reliably dispatch standard Command+C and Command+V actions to the renderer. In addition, the conversation editor collected pasted files only from `DataTransfer.items`, while a macOS Electron screenshot can instead be exposed through `DataTransfer.files`. Together these gaps made pressing Command+V with a screenshot produce no attachment.

## Decision

Install Electron's native `editMenu` role so macOS owns the standard copy, cut, paste, undo, redo, and select-all accelerators. Collect files from both `DataTransfer.items` and `DataTransfer.files`, then de-duplicate entries that refer to the same clipboard file. Some Electron releases omit a screenshot from both collections, so the owned application document receives a narrow preload method that reads only image clipboard payloads. The composer invokes that fallback only for an otherwise empty paste event and sends the resulting PNG through the existing attachment pipeline. Text clipboard access is not exposed through this bridge.

## Alternatives considered

**Expose the full native Electron clipboard in the renderer.** Rejected because text and arbitrary formats would widen the renderer's access to unrelated user data. The bridge exposes only image bytes, only to the owned application origin, and the reusable client checks for it as an optional fallback.

## Consequences

macOS screenshots pasted with Command+V enter the normal attachment pipeline, including preview, validation, upload, and model input handling. Regression tests cover the native edit-menu requirement, the Electron-shaped event where `items` is empty and `files` contains the screenshot, and the application-only image IPC surface.
