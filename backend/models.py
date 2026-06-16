from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str

class Activity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(default=1) # Default to 1 for single-user local app
    type: str  # e.g., 'Coding', 'Exercise', 'Reading', 'Learning', 'Social', 'Sleep'
    duration: int  # in minutes
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    mood: int  # 1 to 10
    energy: int  # 1 to 10
    notes: Optional[str] = Field(default=None)

class Habit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str  # e.g., 'Drink Water', 'Read 10 Pages', 'Stretch'
    frequency: str = Field(default="daily")
    completed: bool = Field(default=False)
    date: Optional[str] = Field(default=None)  # Format: YYYY-MM-DD to track daily check-offs

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    status: str = Field(default="todo") # 'todo', 'completed'
    category: str = Field(default="work") # 'work', 'health', 'learning', 'personal'
    date: Optional[str] = Field(default=None)  # Format: YYYY-MM-DD

class Insight(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: str  # YYYY-MM-DD
    analysis: str  # Detailed text analysis
    recommendation: str  # Actionable bullet points
