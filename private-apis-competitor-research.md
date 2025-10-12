# Private API Companion Alternatives — Consumer-Oriented Scan

## 1. IFTTT
- **Audience & Access:** Mass-market automation tool with simple mobile apps and web UI; designed for non-developers.
- **How it works:** Users chain together applets with "If This Then That" logic, choosing triggers and actions from hundreds of services. Secrets are handled via OAuth permissions rather than manual key management. It supports manual widgets and buttons, but it focuses on event-driven automations, not ad-hoc API calls with custom payloads like the proposed app.

## 2. Zapier Interfaces + Zaps
- **Audience & Access:** No-code automation platform popular with prosumers and small businesses; approachable drag-and-drop builder.
- **How it works:** Users build zaps connecting apps via templates, with optional front-end forms (Interfaces) to trigger flows. Secrets are stored in Zapier connections managed per app. While users can send webhooks, fine-grained manual request building (custom headers/body) is limited, and the experience is workflow-centric rather than providing a personal command-center for arbitrary APIs.

## 3. Apple Shortcuts
- **Audience & Access:** Built-in automation app on iOS/iPadOS/macOS targeting everyday users with a visual block editor.
- **How it works:** Users assemble shortcuts with actions, including `Get Contents of URL` steps for REST calls, then trigger via widgets, Siri, or automation. It handles secure storage of credentials through Keychain or stored text, but does not offer centralized secret management nor history logging. It’s device-tethered (no cross-platform web UI) and lacks a shared catalog for multiple APIs.

## 4. Bardeen
- **Audience & Access:** Browser automation assistant aimed at productivity-focused non-engineers; provides Chrome extension + web dashboard.
- **How it works:** Users select pre-built playbooks or compose flows that interact with web apps and APIs. Secrets and logins are stored within the extension. Execution happens from the browser with guided UI, but customizing raw API requests or reusing them as quick buttons is secondary to automations, and mobile/PWA support is minimal compared to the envisioned app.

## 5. MacroDroid (Android)
- **Audience & Access:** Consumer automation app for Android offering recipe-style triggers and actions with a friendly UI.
- **How it works:** Users create macros that can include HTTP requests (GET/POST) with configurable headers and body, triggered by buttons, notifications, or sensors. Secrets must be embedded manually per macro, and there is no centralized request catalog or cross-device sync; it’s a powerful mobile automation tool but not a secure multi-platform dashboard for private APIs.

### Key Differences vs Proposed App
- Most consumer tools prioritize trigger-based automation over manual, on-demand API execution with detailed request configuration.
- Secrets are either abstracted away via OAuth (IFTTT/Zapier) or stored per device without vault-like management (Shortcuts/MacroDroid).
- History, logging, and structured response viewers are typically absent or limited.
- True cross-platform PWA experiences with portable, authenticated request catalogs are rare; existing products are native or extension-based.
