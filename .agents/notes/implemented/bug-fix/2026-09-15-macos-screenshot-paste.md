# Agent Note: Accept macOS screenshot paste from the clipboard file list

Status: implemented

English | [中文](2026-09-15-macos-screenshot-paste.zh.md)

## Problem

The desktop application omitted Electron's native edit menu, so macOS did not reliably dispatch standard Command+C and Command+V actions to the renderer. In addition, the conversation editor collected pasted files only from `DataTransfer.items`, while a macOS Electron screenshot can instead be exposed through `DataTransfer.files`. Together these gaps made pressing Command+V with a screenshot produce no attachment.

## Decision

Install Electron's native `editMenu` role so macOS owns the standard copy, cut, paste, undo, redo, and select-all accelerators. Collect files from both `DataTransfer.items` and `DataTransfer.files`, then de-duplicate entries that refer to the same clipboard file. Keep the existing text fallback unchanged: when no files are present, the editor still inserts clipboard text normally.

## Alternatives considered

**Read the native Electron clipboard in the renderer.** This would couple the reusable conversation editor to a desktop-only bridge and require additional IPC surface. The native edit command delivers the standard clipboard event, whose `files` collection carries the image, so no privileged bridge is needed.

## Consequences

macOS screenshots pasted with Command+V enter the normal attachment pipeline, including preview, validation, upload, and model input handling. Regression tests cover both the native edit-menu requirement and the Electron-shaped event where `items` is empty and `files` contains the screenshot.
