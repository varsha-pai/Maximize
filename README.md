# Maximize: AI-Powered Personal Productivity Automation System

Maximize (or LifeOS) is a personal productivity dashboard and AI coaching system. It allows you to track daily activities, habits, tasks, mood, sleep, and focus sessions. It compiles these metrics to calculate a dynamic **AI Productivity Score** and generates automated advice via local/cloud LLMs and n8n workflows.

## Features

- **Personal Metrics Dashboard**: Circular progress indicators and visual metrics for Focus Hours, Sleep duration, Habit check-offs, and Mood scores.
- **Unified Log Center**: Track habits, schedule daily tasks, log details of specific activities, and use the integrated Pomodoro Focus Timer.
- **Analytics View**: High-fidelity charts (via Recharts) displaying daily focus hours, time allocation distribution (donut chart), and mood/energy daily correlations.
- **AI Coach Chat**: Text-based conversational interface powered by local or cloud LLMs. The coach answers questions by reading your actual logged productivity metrics.
- **n8n Automation Engine**: Pre-built workflow JSON definitions for morning briefs, nightly analyses, and weekly performance reports.

---

## Technical Stack (Local / Zero-Docker Setup)

- **Frontend**: React SPA (Vite + Tailwind CSS v4 + Recharts + Lucide React)
- **Backend**: FastAPI (Python 3)
- **Database**: SQLite (Zero-config local file `backend/maximize.db`, pre-populated with 7 days of realistic history)
- **Automation**: n8n running locally via Node/npm (`npx n8n`)

---

## Quick Start

Since all project files, package installs, and database seed data have been initialized, you can launch the entire stack (Frontend + Backend + n8n) with a single command:

1. Open a PowerShell terminal in the project directory:
   ```powershell
   cd c:\projects\Maximize
   ```

2. Run the developer launcher script:
   ```powershell
   .\run-dev.ps1
   ```

This launches three separate terminal windows:
- **Frontend Panel**: Runs on [http://localhost:5173](http://localhost:5173)
- **FastAPI API Server**: Runs on [http://localhost:8000](http://localhost:8000)
- **n8n Automation Console**: Starts n8n locally. Look at the n8n console log for your dashboard url (usually `http://localhost:5678`).

---

## AI Configuration (Google Gemini / Ollama / Fallbacks)

Maximize is designed to work immediately with **zero configuration** by utilizing a smart, rules-based heuristic compiler that references your actual metrics. 

To enable full LLM capabilities:

### Option 1: Google Gemini (Recommended - Free Tier)
1. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. Create a file named `.env` in the `backend/` directory:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
3. Restart the backend. Maximize will automatically switch from heuristics to Gemini (`gemini-2.5-flash`) for all analytics and coaching chat answers.

### Option 2: Ollama (Local LLM)
1. Download and run [Ollama](https://ollama.com/) locally.
2. Pull Llama 3 or Mistral:
   ```bash
   ollama pull llama3
   ```
3. The backend will automatically detect Ollama at `http://localhost:11434` and use it if no Gemini key is provided.

---

## n8n Workflows Setup

To import the workflows:

1. Open your local n8n console (e.g., [http://localhost:5678](http://localhost:5678)).
2. Complete the initial setup if prompted.
3. In n8n, click on **Workflows** -> **Add Workflow** (or **New Workflow**).
4. Click the options menu (three dots in top right) -> **Import from file**.
5. Select one of the JSON files from the `c:/projects/Maximize/n8n/` directory:
   - `daily_reminder_workflow.json` (Triggers at 8 AM, generates a morning notification summary)
   - `ai_analyzer_workflow.json` (Triggers at 11 PM, updates database with daily AI insights)
   - `weekly_report_workflow.json` (Triggers Sunday at 9 PM, compiles a weekly performance report)
6. Save and click **Active** in the top right to enable the automation rules.
