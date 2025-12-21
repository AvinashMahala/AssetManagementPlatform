# 🤝 Context Handoff: AssetManagementPlatform

**Date:** December 18, 2025
**Status:** Active Development / Agent Configuration

## 🎯 Current Mission
We are building a suite of **"God-Level" AI Agents** to automate development, refactoring, and architecture enforcement for the Asset Management Platform.

## 🤖 Created Agents (Capabilities)
These files contain the system prompts for specialized tasks. Reference them to activate the agent.

| Agent Name | File Path | Capability |
| :--- | :--- | :--- |
| **Frontend Architect** | `.github/agents/FrontendArchitect.agent.md` | "God-Level" refactoring, cleanup, centralization, SOLID enforcement, style migration. |
| **Backend Refactor** | `.github/agents/Refactor.backend.agent.md` | Layered architecture enforcement, DTOs, Service extraction. |
| **Frontend Refactor** | `.github/agents/Refactor.frontend.agent.md` | Component composition, hooks extraction, performance. |
| **Feature Scaffolder** | `.github/agents/Feature.scaffolder.agent.md` | Generates full-stack vertical slices (Entity -> UI). |
| **Bug Hunter** | `.github/agents/BugHunter.agent.md` | Root cause analysis, reproduction scripts, log analysis. |
| **Performance Profiler** | `.github/agents/PerformanceProfiler.agent.md` | React re-render analysis, SQL query optimization. |
| **Architectural Guardian** | `.github/agents/ArchitecturalGuardian.agent.md` | Enforces boundaries, prevents circular deps. |
| **Code Archaeologist** | `.github/agents/CodeArchaeologist.agent.md` | Git history analysis, context recovery. |
| **Learning Partner** | `.github/agents/LearningPartner.agent.md` | Teaches advanced concepts while coding. |
| **Documentation** | `.github/agents/Documentation.agent.md` | JSDoc, READMEs, Swagger updates. |
| **ASCII Diagram** | `.github/agents/AsciiDiagram.agent.md` | Visualizes flows and architecture in text. |

## ⏳ Pending Tasks
1.  **Execute Refactoring:** The user wants to clean up unused code and centralize components in `frontend/src`.
2.  **Protocol:** User has explicitly stated they will perform **MANUAL TESTING** and confirmation for all changes. Agents should not block on missing automated tests.

## 🚀 How to Resume
1.  **To Refactor:** "Read `.github/agents/FrontendArchitect.agent.md` and `CONTEXT_HANDOFF.md`. Start Phase 1 (The Purge) on `frontend/src/components`."
2.  **To Build Testing Agent:** "Read `CONTEXT_HANDOFF.md`. Create the missing Testing Agent."
