import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  Smile, 
  Activity as ActivityIcon,
  CheckCircle,
  PlusCircle
} from 'lucide-react';

export default function Logger({ habits, tasks, onToggleHabit, onAddTask, onDeleteTask, onToggleTask, onLogActivity }) {
  // --- Pomodoro States ---
  const [timerMode, setTimerMode] = useState('pomodoro'); // 'pomodoro', 'short', 'long'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // --- Logger Form States ---
  const [actType, setActType] = useState('Coding');
  const [actDuration, setActDuration] = useState(25);
  const [actMood, setActMood] = useState(8);
  const [actEnergy, setActEnergy] = useState(8);
  const [actNotes, setActNotes] = useState('');

  // --- Add Task Form States ---
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('work');

  // --- Pomodoro Effect ---
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setSessionCompleted(true);
      // Auto-populate duration based on mode
      const durationMap = { pomodoro: 25, short: 5, long: 15 };
      setActDuration(durationMap[timerMode]);
      setActNotes(`Completed ${timerMode === 'pomodoro' ? 'Focus Session' : 'Break'} via Pomodoro Timer`);
      if (timerMode === 'pomodoro') {
        setActType('Coding');
      } else {
        setActType('Social');
      }
      // Audio notification
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-120.wav');
        audio.play();
      } catch (e) {
        console.log("Audio play blocked");
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode]);

  const changeTimerMode = (mode, minutes) => {
    setIsRunning(false);
    setTimerMode(mode);
    setTimeLeft(minutes * 60);
    setSessionCompleted(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const durationMap = { pomodoro: 25, short: 5, long: 15 };
    setTimeLeft(durationMap[timerMode] * 60);
    setSessionCompleted(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Handlers ---
  const handleLogSubmit = (e) => {
    e.preventDefault();
    onLogActivity({
      type: actType,
      duration: parseInt(actDuration),
      mood: parseInt(actMood),
      energy: parseInt(actEnergy),
      notes: actNotes,
      timestamp: new Date().toISOString()
    });
    // Reset form (except sliders/dropdown defaults)
    setActNotes('');
    setSessionCompleted(false);
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onAddTask(taskTitle, taskCategory);
    setTaskTitle('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Logger & Focus Panel</h1>
        <p className="text-slate-400 mt-1">Track habits, schedule tasks, and run focus sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Pomodoro Timer & Activity Logger */}
        <div className="space-y-8">
          
          {/* Pomodoro Timer Card */}
          <div className={`glass-panel rounded-3xl p-8 transition-all duration-300 ${isRunning ? 'pulse-glow-active ring-1 ring-violet-500/30' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-400" /> Focus Pomodoro
              </h2>
              <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                <button 
                  onClick={() => changeTimerMode('pomodoro', 25)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${timerMode === 'pomodoro' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Focus (25m)
                </button>
                <button 
                  onClick={() => changeTimerMode('short', 5)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${timerMode === 'short' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Short (5m)
                </button>
                <button 
                  onClick={() => changeTimerMode('long', 15)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${timerMode === 'long' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Long (15m)
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-7xl font-black tracking-tighter text-white font-mono text-glow-purple">
                {formatTime(timeLeft)}
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${isRunning ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' : 'bg-violet-600 hover:bg-violet-500 active:bg-violet-750 text-white hover:scale-105'}`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning ? 'Pause' : 'Start Focus'}
                </button>
                <button 
                  onClick={resetTimer}
                  className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {sessionCompleted && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-bounce">
                <span className="text-emerald-400 text-sm font-semibold">
                  🎉 Session completed! Scroll down to log this activity.
                </span>
              </div>
            )}
          </div>

          {/* Activity Logger Form */}
          <div className="glass-panel rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-indigo-400" /> Log Daily Activity
            </h2>
            <form onSubmit={handleLogSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Activity Type</label>
                  <select 
                    value={actType}
                    onChange={(e) => setActType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-200"
                  >
                    <option value="Coding">Coding</option>
                    <option value="Reading">Reading</option>
                    <option value="Learning">Learning</option>
                    <option value="Exercise">Exercise</option>
                    <option value="Social">Social</option>
                    <option value="Sleep">Sleep</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Duration (mins)</label>
                  <input 
                    type="number" 
                    required
                    value={actDuration}
                    onChange={(e) => setActDuration(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-200"
                  />
                </div>
              </div>

              {/* Mood & Energy sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Focus / Mood ({actMood}/10)</label>
                    <Smile className="w-4 h-4 text-amber-400" />
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={actMood}
                    onChange={(e) => setActMood(parseInt(e.target.value))}
                    className="w-full accent-violet-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Energy Level ({actEnergy}/10)</label>
                    <ActivityIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={actEnergy}
                    onChange={(e) => setActEnergy(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Notes</label>
                <textarea 
                  rows="3" 
                  value={actNotes}
                  onChange={(e) => setActNotes(e.target.value)}
                  placeholder="What did you achieve during this focus block?"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-200 placeholder:text-slate-600 resize-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-720 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.01]"
              >
                Log Activity Record
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Task Planner & Habits Checklist */}
        <div className="space-y-8">
          
          {/* Habits Checklist Card */}
          <div className="glass-panel rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" /> Today's Habits
            </h2>
            <div className="space-y-3">
              {habits.map((habit) => (
                <div 
                  key={habit.id}
                  onClick={() => onToggleHabit(habit.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${habit.completed ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'}`}
                >
                  <span className={`text-sm font-semibold ${habit.completed ? 'line-through opacity-60' : ''}`}>
                    {habit.name}
                  </span>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition border ${habit.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700 text-transparent'}`}>
                    <Check className="w-4 h-4 stroke-[3px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Tasks List */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" /> Daily Task Planner
              </h2>
              
              {/* Task Form */}
              <form onSubmit={handleTaskSubmit} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 px-4 py-2.5 rounded-xl glass-input text-sm text-slate-200 placeholder:text-slate-600"
                />
                <select 
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="px-3 rounded-xl glass-input text-xs font-semibold text-slate-300"
                >
                  <option value="work">Work</option>
                  <option value="learning">Learn</option>
                  <option value="health">Health</option>
                  <option value="personal">Personal</option>
                </select>
                <button 
                  type="submit" 
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* Tasks List */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className={`flex items-center justify-between p-3.5 rounded-xl border ${task.status === 'completed' ? 'bg-slate-900/20 border-slate-900/40 opacity-70' : 'bg-slate-950/20 border-slate-800/60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onToggleTask(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-700 text-transparent hover:border-indigo-500'}`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        </button>
                        <div>
                          <p className={`text-sm font-medium text-slate-200 ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                          </p>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                            {task.category}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => onDeleteTask(task.id)}
                        className="text-slate-600 hover:text-red-400 p-1.5 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8 text-sm">No tasks added for today.</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
