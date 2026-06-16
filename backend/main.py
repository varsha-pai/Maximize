import datetime
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, func
from pydantic import BaseModel

from database import create_db_and_tables, get_session
from models import User, Activity, Habit, Task, Insight
from ai_helper import get_ai_analysis, get_ai_chat_response

# Define standard default habits to instantiate daily if not present
DEFAULT_HABITS = [
    "Drink 3L Water",
    "Read 10 Pages",
    "30 min Physical Exercise",
    "Stretch & Meditate"
]

class ChatRequest(BaseModel):
    message: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    create_db_and_tables()
    # Seed default user if not exists
    with Session(get_session().__next__().bind) as session:
        user_check = session.exec(select(User)).first()
        if not user_check:
            user = User(name="Varsha", email="varsha@example.com")
            session.add(user)
            session.commit()
    yield

app = FastAPI(title="Maximize API", lifespan=lifespan)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HELPER: Ensure habits exist for a specific date
def check_and_create_daily_habits(date_str: str, session: Session):
    existing = session.exec(select(Habit).where(Habit.date == date_str)).all()
    if not existing:
        for habit_name in DEFAULT_HABITS:
            new_habit = Habit(name=habit_name, date=date_str, completed=False)
            session.add(new_habit)
        session.commit()
        existing = session.exec(select(Habit).where(Habit.date == date_str)).all()
    return existing

# --- USER ENDPOINTS ---
@app.get("/api/users/me", response_model=User)
def get_current_user(session: Session = Depends(get_session)):
    user = session.exec(select(User)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- ACTIVITY ENDPOINTS ---
@app.get("/api/activities", response_model=List[Activity])
def read_activities(limit: int = 100, session: Session = Depends(get_session)):
    statement = select(Activity).order_by(Activity.timestamp.desc()).limit(limit)
    return session.exec(statement).all()

@app.post("/api/activities", response_model=Activity)
def create_activity(activity: Activity, session: Session = Depends(get_session)):
    # Explicitly ensure timestamp is a datetime object (for SQLite compatibility)
    if isinstance(activity.timestamp, str):
        try:
            # Handle ISO string formatting
            ts_str = activity.timestamp.replace("Z", "+00:00")
            activity.timestamp = datetime.datetime.fromisoformat(ts_str)
        except Exception:
            activity.timestamp = datetime.datetime.utcnow()
    elif activity.timestamp is None:
        activity.timestamp = datetime.datetime.utcnow()

    session.add(activity)
    session.commit()
    session.refresh(activity)
    return activity

@app.delete("/api/activities/{activity_id}")
def delete_activity(activity_id: int, session: Session = Depends(get_session)):
    activity = session.get(Activity, activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    session.delete(activity)
    session.commit()
    return {"message": "Activity deleted successfully"}

# --- HABIT ENDPOINTS ---
@app.get("/api/habits", response_model=List[Habit])
def read_habits(date: Optional[str] = None, session: Session = Depends(get_session)):
    if not date:
        date = datetime.date.today().strftime("%Y-%m-%d")
    return check_and_create_daily_habits(date, session)

@app.post("/api/habits", response_model=Habit)
def create_habit(habit: Habit, session: Session = Depends(get_session)):
    session.add(habit)
    session.commit()
    session.refresh(habit)
    return habit

@app.put("/api/habits/{habit_id}/toggle", response_model=Habit)
def toggle_habit(habit_id: int, session: Session = Depends(get_session)):
    habit = session.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    habit.completed = not habit.completed
    session.add(habit)
    session.commit()
    session.refresh(habit)
    return habit

# --- TASK ENDPOINTS ---
@app.get("/api/tasks", response_model=List[Task])
def read_tasks(date: Optional[str] = None, session: Session = Depends(get_session)):
    if not date:
        date = datetime.date.today().strftime("%Y-%m-%d")
    statement = select(Task).where(Task.date == date)
    return session.exec(statement).all()

@app.post("/api/tasks", response_model=Task)
def create_task(task: Task, session: Session = Depends(get_session)):
    if not task.date:
        task.date = datetime.date.today().strftime("%Y-%m-%d")
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@app.put("/api/tasks/{task_id}", response_model=Task)
def update_task_status(task_id: int, status: str, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if status not in ["todo", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    task.status = status
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()
    return {"message": "Task deleted successfully"}

# --- INSIGHTS ENDPOINTS ---
@app.get("/api/insights", response_model=List[Insight])
def read_insights(limit: int = 10, session: Session = Depends(get_session)):
    return session.exec(select(Insight).order_by(Insight.date.desc()).limit(limit)).all()

@app.post("/api/insights", response_model=Insight)
def create_insight(insight: Insight, session: Session = Depends(get_session)):
    existing = session.exec(select(Insight).where(Insight.date == insight.date)).all()
    for item in existing:
        session.delete(item)
    session.add(insight)
    session.commit()
    session.refresh(insight)
    return insight

@app.post("/api/insights/generate", response_model=Insight)
def generate_insights_now(session: Session = Depends(get_session)):
    activities = session.exec(select(Activity)).all()
    habits = session.exec(select(Habit)).all()
    tasks = session.exec(select(Task)).all()

    activities_list = [{"type": a.type, "duration": a.duration, "mood": a.mood, "energy": a.energy, "notes": a.notes} for a in activities[-50:]]
    habits_list = [{"name": h.name, "completed": h.completed, "date": h.date} for h in habits[-50:]]
    tasks_list = [{"title": t.title, "status": t.status, "date": t.date} for t in tasks[-50:]]

    ai_output = get_ai_analysis(activities_list, habits_list, tasks_list)

    today_str = datetime.date.today().strftime("%Y-%m-%d")
    insight = Insight(
        date=today_str,
        analysis=ai_output["analysis"],
        recommendation=ai_output["recommendation"]
    )
    
    return create_insight(insight, session)

# --- COACH CHAT ENDPOINT ---
@app.post("/api/coach/chat")
def coach_chat(payload: ChatRequest, session: Session = Depends(get_session)):
    activities = session.exec(select(Activity)).all()
    habits = session.exec(select(Habit)).all()
    tasks = session.exec(select(Task)).all()

    activities_list = [{"type": a.type, "duration": a.duration, "mood": a.mood, "energy": a.energy, "notes": a.notes} for a in activities[-50:]]
    habits_list = [{"name": h.name, "completed": h.completed, "date": h.date} for h in habits[-50:]]
    tasks_list = [{"title": t.title, "status": t.status, "date": t.date} for t in tasks[-50:]]

    reply = get_ai_chat_response(payload.message, activities_list, habits_list, tasks_list)
    return {"response": reply}

# --- ANALYTICS ENDPOINTS ---
@app.get("/api/analytics")
def get_analytics(session: Session = Depends(get_session)):
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    
    # 1. Today's Activities
    activities_all = session.exec(select(Activity)).all()
    
    today_activities = []
    for a in activities_all:
        if a.timestamp.strftime("%Y-%m-%d") == today_str:
            today_activities.append(a)
            
    # 2. Today's Focus hours (Coding, Learning, Reading)
    focus_duration = sum(a.duration for a in today_activities if a.type in ["Coding", "Learning", "Reading"])
    
    # 3. Today's Sleep hours
    sleep_duration = sum(a.duration for a in today_activities if a.type == "Sleep")
    if sleep_duration == 0:
        yesterday_str = (datetime.date.today() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        sleep_duration = sum(a.duration for a in activities_all if a.type == "Sleep" and a.timestamp.strftime("%Y-%m-%d") in [today_str, yesterday_str])
    
    # 4. Habits completion rate
    habits_today = check_and_create_daily_habits(today_str, session)
    completed_habits = len([h for h in habits_today if h.completed])
    total_habits = len(habits_today)
    habit_score = (completed_habits / total_habits * 100) if total_habits > 0 else 50
    
    # 5. Mood score
    mood_logs = [a.mood for a in today_activities]
    avg_mood = sum(mood_logs) / len(mood_logs) if mood_logs else 7.0
    
    # Calculate Sub-scores
    focus_score_value = min(focus_duration / 240.0, 1.0) * 100  # Target 4 hrs
    sleep_score_value = min(sleep_duration / 480.0, 1.0) * 100  # Target 8 hrs
    mood_score_value = avg_mood * 10
    
    # Final AI Productivity Score Formula
    productivity_score = int(
        0.35 * focus_score_value +
        0.25 * habit_score +
        0.20 * sleep_score_value +
        0.20 * mood_score_value
    )
    
    # 6. Activity Distribution
    dist_map = {}
    for a in activities_all:
        dist_map[a.type] = dist_map.get(a.type, 0) + a.duration
    activity_distribution = [{"name": k, "value": v} for k, v in dist_map.items()]
    
    # 7. Focus hours over past 7 days
    weekly_timeline = []
    for i in range(6, -1, -1):
        day = datetime.date.today() - datetime.timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        
        day_focus = 0
        for a in activities_all:
            if a.timestamp.strftime("%Y-%m-%d") == day_str and a.type in ["Coding", "Learning", "Reading"]:
                day_focus += a.duration
                
        weekly_timeline.append({
            "date": day.strftime("%a"),
            "focusHours": round(day_focus / 60.0, 1)
        })
        
    # 8. Mood & Energy Correlation
    correlation_data = []
    daily_stats = {}
    for a in activities_all:
        day_str = a.timestamp.strftime("%Y-%m-%d")
        if day_str not in daily_stats:
            daily_stats[day_str] = {"mood": [], "energy": [], "count": 0}
        daily_stats[day_str]["mood"].append(a.mood)
        daily_stats[day_str]["energy"].append(a.energy)
        daily_stats[day_str]["count"] += 1
        
    sorted_days = sorted(list(daily_stats.keys()))[-7:]
    for d in sorted_days:
        day_obj = datetime.datetime.strptime(d, "%Y-%m-%d").date()
        moods = daily_stats[d]["mood"]
        energies = daily_stats[d]["energy"]
        correlation_data.append({
            "date": day_obj.strftime("%m/%d"),
            "Mood": round(sum(moods) / len(moods), 1),
            "Energy": round(sum(energies) / len(energies), 1)
        })

    # 9. Today's Timeline
    today_timeline = []
    for a in sorted(today_activities, key=lambda x: x.timestamp):
        today_timeline.append({
            "id": a.id,
            "time": a.timestamp.strftime("%I:%M %p"),
            "type": a.type,
            "duration": f"{a.duration}m",
            "notes": a.notes or ""
        })

    return {
        "productivityScore": productivity_score,
        "metrics": {
            "focusMinutes": focus_duration,
            "sleepMinutes": sleep_duration,
            "habitsCompleted": completed_habits,
            "habitsTotal": total_habits,
            "averageMood": round(avg_mood, 1)
        },
        "activityDistribution": activity_distribution,
        "weeklyTimeline": weekly_timeline,
        "moodEnergyCorrelation": correlation_data,
        "todayTimeline": today_timeline
    }
