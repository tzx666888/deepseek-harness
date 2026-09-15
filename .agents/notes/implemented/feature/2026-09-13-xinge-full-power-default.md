# Agent Note: Xinge Full Power as the personalized desktop default

Status: implemented

English | [中文](2026-09-13-xinge-full-power-default.zh.md)

## Problem

The personalized desktop fork still opened new sessions in the shipped Standard preset. Standard already covered ordinary coding work, but it omitted the persistent terminal, structured replace editor, Codex product provider, and runtime-composition tools that the owner expected from a Codex-like full-capability assistant. Those capabilities existed in the repository but remained split across an optional product bundle, disabled preset rows, and the Creator preset, so branding the application did not change what a new session could actually do.

## Decision

The Web bundle now installs the Codex subagent provider under a bundle-owned host row and selects the `cordis` preset as its deployment default. The preset is presented as **Xinge Full Power** / **鑫哥全能模式** and retains the Standard file, shell, web, image-reading, Skills, planning, goals, background jobs, delegation, workflow, and delivery tools. It additionally mounts an agent-isolated persistent terminal stack, exposes the structured replace editor, enables the Codex delegation tool, and keeps the existing Cordis runtime inspection and extension tools.

On macOS, the desktop shell discovers a locally installed Peekaboo executable or accepts its absolute path through `DSH_CONTROL_COMMAND`. Xinge Full Power conditionally starts that MCP server inside the agent preset and exposes its screen observation, application, window, pointer, and keyboard tools under the `mcp__desktop__` namespace. The tools stay absent from other presets and from installations without the executable. macOS Screen Recording and Accessibility grants remain the authority for individual operations.

The security boundary for existing tools does not change. One-shot and persistent commands continue through the host sandbox and approval policy, terminal sessions remain isolated by owning agent, and the Codex provider keeps its non-interactive permission policy. Existing user preset selection remains authoritative: the new deployment default applies when no user override selects another preset, and Standard, PTC, Minimal, and custom presets remain available.

## Alternatives considered

**Copy every capability into Standard.** Rejected because Standard is the stable general-purpose baseline used by tests, documentation, and user-authored copies. Expanding the existing Cordis superset gives this fork a stronger default without silently changing Standard everywhere.

**Make Schedule global as part of the full preset.** Rejected because the current Schedule owner attaches tools to every root agent from the host plane. Enabling it in the Web bundle would also expand Minimal, breaking its deliberate single-tool contract. Scheduling can be added later behind a preset-aware ownership seam.

**Expose desktop control from the host tool registry.** Rejected because every preset would inherit the tools, including Minimal. The conditional MCP row belongs to Xinge Full Power so the selected preset continues to define an agent's capabilities.

**Bundle the automation executable inside the application.** Rejected because the executable has its own release, signing, and operating-system permission lifecycle. Discovering the installed executable keeps updates and macOS grants owned by that component.

## Consequences

New desktop and browser sessions without a stored override start in Xinge Full Power and can use persistent interactive programs, structured file replacement, native delegation, Codex delegation, workflows, and runtime extension immediately. On a macOS installation with Peekaboo and the required operating-system grants, those sessions can also inspect and operate visible desktop applications. The optional Codex runtime and MCP client become part of the installation closure, increasing packaged size. External account-backed capabilities still appear only after their provider or MCP connection is configured. Existing sessions keep the preset they were created with, so users must start a new session to receive the new default.
