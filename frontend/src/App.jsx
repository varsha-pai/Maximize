import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  BarChart3, 
  Sparkles, 
  Bot, 
  User, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Logger from './components/Logger';
import Analytics from './components/Analytics';
import AICoach from './components/AICoach';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [latestInsight, setLatestInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all core datasets from the backend
  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Analytics & Timeline
      const analRes = await fetch(`${API_BASE}/api/analytics`);
      if (!analRes.ok) throw new Error("Failed to load analytics");
      const analData = await analRes.json();
      setAnalytics(analData);

      // 2. Fetch today's Habits
      const habitsRes = await fetch(`${API_BASE}/api/habits`);
      const habitsData = await habitsRes.json();
      setHabits(habitsData);

      // 3. Fetch today's Tasks
      const tasksRes = await fetch(`${API_BASE}/api/tasks`);
      const tasksData = await tasksRes.json();
      setTasks(tasksData);

      // 4. Fetch latest AI Insight
      const insightsRes = await fetch(`${API_BASE}/api/insights?limit=1`);
      const insightsData = await insightsRes.json();
      if (insightsData && insightsData.length > 0) {
        setLatestInsight(insightsData[0]);
      } else {
        setLatestInsight(null);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the productivity engine. Make sure the backend FastAPI server is running on port 8000.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---
  const handleToggleHabit = async (habitId) => {
    try {
      const res = await fetch(`${API_BASE}/api/habits/${habitId}/toggle`, {
        method: 'PUT'
      });
      if (res.ok) {
        const updatedHabit = await res.json();
        // Update local habits state
        setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));
        // Refresh analytics silently to update score
        fetchData(true);
      }
    } catch (err) {
      console.error("Error toggling habit:", err);
    }
  };

  const handleAddTask = async (title, category) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, status: 'todo' })
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [...prev, newTask]);
        fetchData(true);
      }
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const handleToggleTask = async (taskId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}?status=${newStatus}`, {
        method: 'PUT'
      });
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
        fetchData(true);
      }
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        fetchData(true);
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleLogActivity = async (activityPayload) => {
    try {
      const res = await fetch(`${API_BASE}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityPayload)
      });
      if (res.ok) {
        // Refresh everything and redirect to dashboard to see new entry
        await fetchData(true);
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error("Error logging activity:", err);
    }
  };

  // Trigger manual AI analysis compilation
  const triggerManualAnalysis = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/api/insights/generate`, {
        method: 'POST'
      });
      if (res.ok) {
        const newInsight = await res.json();
        setLatestInsight(newInsight);
        fetchData(true);
      }
    } catch (err) {
      console.error("Error generating insights:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans antialiased text-slate-100 selection:bg-violet-600/30 selection:text-white">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/60 border-r border-slate-800/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="h-20 px-8 flex items-center gap-3.5 border-b border-slate-800/50">
            <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-violet-600/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Maximize
              </span>
              <span className="text-[10px] block font-bold uppercase tracking-widest text-violet-400 -mt-0.5">
                AI Life OS
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5 mt-6">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'dashboard' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('logger')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'logger' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <Activity className="w-4.5 h-4.5" />
              Logger & Focus
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'analytics' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <BarChart3 className="w-4.5 h-4.5" />
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('coach')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'coach' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <Bot className="w-4.5 h-4.5" />
              AI Coach Chat
            </button>
          </nav>
        </div>

        {/* User profile card */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-950/45 border border-slate-800/40">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow text-sm">
              V
            </div>
            <div>
              <p className="text-xs font-bold text-white">Varsha</p>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Session
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Control Bar */}
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-slate-300">
              API Status: Online
            </span>
            <span className="font-semibold bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-slate-300">
              Database: SQLite
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchData()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={triggerManualAnalysis}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-750 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-[1.02]"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Analyzing Logs...' : 'Compile AI Insights'}
            </button>
          </div>
        </header>

        {/* Viewport for main components */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950/20">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 items-start animate-shake">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-400">Connection Failed</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
              <p className="text-sm text-slate-500 font-medium">Booting productivity layers...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  analytics={analytics} 
                  latestInsight={latestInsight} 
                  setActiveTab={setActiveTab} 
                />
              )}
              {activeTab === 'logger' && (
                <Logger 
                  habits={habits}
                  tasks={tasks}
                  onToggleHabit={handleToggleHabit}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleTask={handleToggleTask}
                  onLogActivity={handleLogActivity}
                />
              )}
              {activeTab === 'analytics' && (
                <Analytics analytics={analytics} />
              )}
              {activeTab === 'coach' && (
                <AICoach apiBase={API_BASE} />
              )}
            </>
          )}
        </div>
      </main>

    </div>
  );
}
