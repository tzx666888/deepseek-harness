# Agent Note: Chrome extension adapter

Status: implemented

English | [中文](2026-09-17-chrome-extension-adapter.zh.md)

## Problem

Desktop pixel and focus control makes simple browser tasks depend on macOS privacy grants, window geometry and tab focus. Browser tasks need structured page controls and a visible user consent mechanism.

## Decision

The Desktop host enables a `browser-extension` MCP row in the full-power preset. The row launches the exact installed Playwright MCP version with the bundled Node process and extension mode. Chrome owns installation and connection approval; the application does not extract extension tokens or auto-approve connections. A native menu opens the official store after an explanatory dialog. The browser-control skill chooses browser tools before desktop tools for Chrome pages and keeps macOS permission checks specific to desktop operations.

## Alternatives considered

**Build a custom Chrome debugger bridge.** Rejected for this integration because a maintained extension already owns page snapshots, reference validation, connection consent and reconnect behavior. The DS adapter keeps the dependency pinned and exposes an allowlist rather than arbitrary evaluation or filesystem upload tools.

**Use downloaded-on-demand tooling.** Rejected because task startup would depend on package registry availability and mutable versions.

## Consequences

The browser connection belongs to the standing preset, so sessions on that preset share its active tab; simultaneous browser-control tasks are unsupported. Chrome extension consent remains separate from DS file access. Connection failures stop rather than falling back to scripts that bypass browser consent. The upstream extension is independently installed and retains its own UI language. The extension's localhost transport is separate from the port-free Desktop application protocol.

The Loader test launches the real pinned MCP executable and verifies tool discovery, allowlisting, default-off CLI behavior and disposal. The recorded-session scenario verifies delivery of browser-versus-desktop instructions. Live Chrome consent and form-operation verification remains a manual acceptance step and is not proved by tool discovery.

The browser row opts into stdio process replacement after a timed-out or canceled call. Playwright can retain an unresolved connection promise after MCP cancellation; replacing the owned process clears that promise without modifying the extension or consuming its bypass token. The supervisor waits for transport closure, shares concurrent cleanup, refreshes tools, and does not replay the interrupted action. Ordinary tool errors retain the connection. A real Loader/subprocess fixture ignores cancellation and proves fresh process identity, recovery, no replay and disposal; this does not establish why a Chrome consent page is absent.
