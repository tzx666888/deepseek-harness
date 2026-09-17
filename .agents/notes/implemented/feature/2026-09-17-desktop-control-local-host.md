# Agent Note: Desktop control local host

Status: implemented

English | [中文](2026-09-17-desktop-control-local-host.zh.md)

## Problem

Peekaboo discovers a running bridge automatically. That bridge has its own macOS privacy grants: an unauthorized bridge can report no Chrome windows while the local executable sees them. Repeated screenshots and application activation then fail to establish the intended target.

## Decision

The personalized desktop preset starts Peekaboo MCP with `--no-remote`, keeping permission checks, window discovery, observations and actions in the same local process. The browser-control skill directs the model to select an observed window ID, focus it, read its controls, use snapshot-bound element IDs and verify the result. It instructs the model to stop after two failed attempts and one fresh-observation recovery instead of switching to improvised shell automation.

## Alternatives considered

**Keep automatic bridge discovery.** Rejected because an unrelated application's privacy state would continue deciding whether this installation can see and control windows.

**Use screenshots and AppleScript as the primary path.** Rejected because the observed failure repeatedly changed focus and confused screenshot pixels with input coordinates, while the existing MCP tools already provide window and element selectors.

## Consequences

The local application still requires macOS Screen Recording and Accessibility approval. Remote bridge hosts are not used by this preset. The retry guidance is model-facing instruction, not a hard execution limit. A configuration regression test pins local execution; a recorded-session replay verifies delivery of the browser-control instructions. Live desktop verification remains necessary because CI cannot grant macOS permissions or reproduce the owner's windows.
