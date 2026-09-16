# Agent Note: Xinge desktop full-access default

Status: implemented

English | [中文](2026-09-16-xinge-desktop-full-access-default.zh.md)

## Problem

The personalized desktop composition inherited the general product default of workspace-scoped writes with approval prompts for wider operations. Its owner treats this installation as a trusted local operator and expects one explicit product choice to cover later work, so repeated one-shot approval cards interrupted ordinary repository tasks.

macOS privacy controls are independent of the Harness permission preset. Full access inside Harness cannot grant access to protected Desktop, Documents, Downloads, or other host resources when macOS denies the application itself.

## Decision

The Xinge desktop overlay selects `danger-full-access` for the sandbox policy, `never` for the approval policy, and `danger-full-access` as the default permission preset. Fresh sessions therefore run without the Harness file sandbox and do not request per-command approval. The composer retains its permission selector so an individual session can be reduced to workspace-write or read-only when needed.

The application does not bypass or modify macOS privacy controls. The owner still grants protected-folder or Full Disk Access to the installed application through System Settings, and the operating system remains authoritative for those resources. Personalized local releases use one stable local code-signing identity kept outside the repository, so macOS can associate that approval with the same designated application requirement across upgrades.

## Alternatives considered

**Keep workspace-write and add a persistent “always allow this command” decision.** Rejected because the owner requested a trusted-application policy, not a command-pattern allowlist. A partial allowlist would continue prompting for new command forms and would not match the selected full-access preset.

**Disable the approval UI without changing the sandbox mode.** Rejected because commands outside the workspace would remain denied with no recovery path. The sandbox and approval settings must change together through the existing permission preset.

**Attempt to grant macOS privacy access from the application.** Rejected because macOS requires the user to approve security-sensitive privacy access. Application code cannot silently grant itself that authority.

**Continue ad-hoc signing each build.** Rejected because an ad-hoc signature identifies the application by a changing code hash. macOS privacy decisions would not reliably survive replacement by a later build.

## Consequences

The Bash executor treats a repeated full-access request as redundant only when the resolved session policy already grants full access. Empty approval reasons on that request do not interrupt execution, while the same arguments in a restricted session fail validation. Local signing follows the local Electron build's `hardenedRuntime: false`; forcing hardened runtime with a certificate that has no Apple Team ID prevents Electron libraries from loading.

New Xinge desktop sessions receive full Harness file access without approval cards. Existing sessions keep their recorded permission until the owner switches them through the composer selector or `/permission danger-full-access`. macOS can still deny protected folders independently, and such a denial is reported as a host privacy problem rather than another Harness approval request. Producing an upgrade also requires access to the local signing identity; neither its private key nor the owner's macOS approval is distributable in the repository or release archive.
