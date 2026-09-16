# Agent Note: Xinge desktop model catalog

Status: implemented

English | [中文](2026-09-16-xinge-desktop-model-catalog.zh.md)

## Problem

The personalized desktop package installed the multi-provider adapter but left it without routes. A user could store a private gateway key and still see only the built-in DeepSeek catalog until they manually recreated the endpoint, protocol, and model list in user settings. Reinstalling the application therefore preserved the personalized shell while leaving its intended Gemini and GPT choices absent.

## Decision

The desktop Host patch now declares the `tokaxis` OpenAI-compatible route, its Gemini and GPT chat-model catalog, and `gemini-3.8-flash-high` as the default for new sessions. The route names `XINGE_DS_API_KEY` as a credential reference; the application package contains no credential value. User settings can still override the route, and the writable credential store remains the only place the local desktop saves the owner's key.

Image-generation-only model ids are not placed in the chat-model selector. The current Harness adapter sends selected models through chat completions, while those models require an image-generation endpoint. Advertising them in this selector would create a visible option that cannot complete an Agent turn.

## Alternatives considered

**Store the route only in the owner's user settings.** Rejected because that fixes one machine but leaves every fresh installation with the same empty personalized catalog. User settings remain the override layer, not the only definition of the product's intended providers.

**Package the dedicated API key with the application.** Rejected because an application archive and repository release are distributable artifacts. A private credential belongs only in the owner's local credential store and must never enter source history or a release asset.

**Expose image-generation ids beside chat models.** Rejected because the selector drives Agent chat-completion requests. Models that require the image-generation endpoint would be visible but unusable.

## Consequences

A fresh personalized desktop installation exposes the intended Gemini and GPT chat choices before any manual catalog entry. After the owner stores the private gateway credential, new sessions start on Gemini 3.8 and can switch among the declared models. Packaging and repository history remain free of the secret. Dedicated image generation remains a separate capability rather than a misleading chat-model choice.
