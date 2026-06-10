---
description: 
---

# Antigravity Feature Development Workflow

This document explains how to collaborate with Antigravity (your AI pair programmer) to successfully investigate, analyze, design, write, and verify code for new features.

---

## 🧭 Phase 1: Investigate & Research (AI-Assisted Exploration)

In this phase, you introduce the requirement to Antigravity and work together to map it to the existing codebase.

### What You Do:
*   **Provide requirements:** Share the feature description, user stories, or bugs.
*   **Point to key areas:** Mention files or components you think are relevant (e.g., "Take a look at [CompositionOverlays.tsx](file:///home/kynguyen/Projects/camera-trainer-web/src/components/CompositionOverlays.tsx)").

### What Antigravity Does:
*   **Searches the codebase:** Uses high-precision tools like `grep_search` and `list_dir` to locate relevant symbols, entry points, and configurations.
*   **Analyzes constraints:** Investigates dependencies, build configuration, and existing style rules (like CSS/Tailwind configs).
*   **Explains existing patterns:** Provides summaries of how similar components or data flows are implemented in the project.

---

## 📐 Phase 2: Analyze & Design (Planning Mode)

Before any code is modified, Antigravity enters **Planning Mode** to establish a shared, approved roadmap.

### The Planning Artifacts:
1.  **Implementation Plan (`implementation_plan.md`):** 
    *   Antigravity creates this file under the conversation's brain folder.
    *   It lists the proposed changes grouped by component, details open design questions, and outlines how changes will be verified.
2.  **Review & Feedback:**
    *   Antigravity will set `RequestFeedback: true` on the implementation plan, prompting you to review it.
    *   You can approve the plan or leave comments directly in the chat to iterate on the design.

---

## 💻 Phase 3: Execute & Code (Structured Implementation)

Once you approve the plan, the implementation phase begins.

### The Task Checklist (`task.md`):
*   Antigravity creates a `task.md` file listing granular, checkable TODO items.
*   As coding progresses, Antigravity updates task states:
    *   `[ ]` Uncompleted tasks
    *   `[/]` In-progress tasks
    *   `[x]` Completed tasks
*   This keeps execution structured, transparent, and easy to monitor.

### Code Quality Rules Applied by Antigravity:
*   **Aesthetics:** Designs premium layouts, curated HSL color schemes, and micro-animations instead of basic MVPs.
*   **Integrity:** Retains existing unrelated docstrings/comments.
*   **Type Safety:** Uses strict TypeScript definitions and avoids placeholders.

---

## 🧪 Phase 4: Verify & Walkthrough

After the checklist items are implemented, the changes are validated.

### Verification:
*   Antigravity runs linters, tests, and builds to verify that there are no compilation or syntax errors.
*   If interactive UI components were built, Antigravity can launch a browser subagent (`browser_subagent`) to record a video/animation of the interface for your visual approval.

### The Walkthrough (`walkthrough.md`):
*   Antigravity writes a `walkthrough.md` summarizing all code modifications and verification results.
*   It embeds any screenshots or screen recordings to clearly demonstrate the new behavior.
