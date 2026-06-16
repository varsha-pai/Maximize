import datetime
import random
from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import Activity, Habit, Task, Insight, User

def seed_database():
    print("Seeding database...")
    create_db_and_tables()

    with Session(engine) as session:
        # Check if already seeded
        if session.exec(select(Activity)).first():
            print("Database already contains data. Skipping seeding.")
            return

        # Ensure Varsha user exists
        user = session.exec(select(User)).first()
        if not user:
            user = User(name="Varsha", email="varsha@example.com")
            session.add(user)
            session.commit()
            session.refresh(user)

        today = datetime.date.today()
        activity_types = ["Coding", "Exercise", "Reading", "Learning", "Social", "Sleep"]
        habit_names = ["Drink 3L Water", "Read 10 Pages", "30 min Physical Exercise", "Stretch & Meditate"]
        
        # Notes categories to make logs realistic
        notes_by_type = {
            "Coding": [
                "Worked on API endpoints in FastAPI",
                "Debugged Recharts layout issues",
                "Configured n8n webhook handlers",
                "Wrote database schemas and SQLModel definitions",
                "Optimized state management in React App"
            ],
            "Exercise": [
                "Morning outdoor run (5km)",
                "Weight training session",
                "Yoga and core stretching",
                "Evening cycling session"
            ],
            "Reading": [
                "Read chapter on Designing Data-Intensive Applications",
                "Read articles on UI/UX micro-interactions",
                "Read documentation about Tailwind CSS v4 features"
            ],
            "Learning": [
                "Watched tutorial on n8n advanced nodes",
                "Completed lecture on LLM fine-tuning techniques",
                "Learned about PostgreSQL index tuning"
            ],
            "Social": [
                "Dinner with colleagues",
                "Weekly catchup call with family",
                "Coffee chat with a developer friend"
            ],
            "Sleep": [
                "Slept around 11:30 PM, woke up refreshed",
                "Tossed and turned, felt slightly tired in the morning",
                "Good deep sleep, woke up at 7 AM"
            ]
        }

        # Seed data for the past 8 days (including today)
        for days_back in range(7, -1, -1):
            current_date = today - datetime.timedelta(days=days_back)
            date_str = current_date.strftime("%Y-%m-%d")

            # 1. Habits for current_date
            for name in habit_names:
                completed = random.choice([True, True, False])  # 66% chance of completion
                # Ensure today's default is uncompleted for user interaction
                if days_back == 0:
                    completed = False
                habit = Habit(name=name, date=date_str, completed=completed)
                session.add(habit)

            # 2. Tasks for current_date
            tasks_titles = [
                ("Setup project repository", "work"),
                ("Design system database schemas", "work"),
                ("Review morning insights", "learning"),
                ("Run 20 mins", "health"),
                ("Clean workspace", "personal"),
                ("Implement Recharts", "work")
            ]
            # Pick 2-3 random tasks per day
            selected_tasks = random.sample(tasks_titles, k=random.randint(2, 4))
            for title, category in selected_tasks:
                status = "completed" if days_back > 0 and random.random() > 0.3 else "todo"
                task = Task(title=title, status=status, category=category, date=date_str)
                session.add(task)

            # 3. Activities for current_date
            # Sleep (every day)
            sleep_duration = random.randint(380, 510)  # ~6.3 to 8.5 hours
            sleep_time = datetime.datetime.combine(current_date, datetime.time(7, 30)) - datetime.timedelta(minutes=sleep_duration)
            session.add(Activity(
                type="Sleep",
                duration=sleep_duration,
                timestamp=sleep_time,
                mood=random.randint(6, 9),
                energy=random.randint(6, 9),
                notes=random.choice(notes_by_type["Sleep"])
            ))

            # Focus Activities (Coding, Learning, Reading)
            if days_back > 0:
                # Seeding historical focus sessions
                num_focus = random.randint(1, 3)
                times = [datetime.time(9, 30), datetime.time(14, 0), datetime.time(19, 0)]
                for i in range(num_focus):
                    type_focus = random.choice(["Coding", "Learning", "Reading"])
                    duration = random.randint(45, 180)
                    timestamp = datetime.datetime.combine(current_date, times[i])
                    session.add(Activity(
                        type=type_focus,
                        duration=duration,
                        timestamp=timestamp,
                        mood=random.randint(6, 10),
                        energy=random.randint(5, 10),
                        notes=random.choice(notes_by_type[type_focus])
                    ))
                
                # Optional Exercise
                if random.random() > 0.4:
                    session.add(Activity(
                        type="Exercise",
                        duration=random.choice([30, 45, 60]),
                        timestamp=datetime.datetime.combine(current_date, datetime.time(17, 30)),
                        mood=random.randint(7, 10),
                        energy=random.randint(7, 10),
                        notes=random.choice(notes_by_type["Exercise"])
                    ))
                    
                # Optional Social
                if random.random() > 0.6:
                    session.add(Activity(
                        type="Social",
                        duration=random.randint(60, 120),
                        timestamp=datetime.datetime.combine(current_date, datetime.time(20, 0)),
                        mood=random.randint(7, 10),
                        energy=random.randint(6, 9),
                        notes=random.choice(notes_by_type["Social"])
                    ))
            else:
                # Seeding today's activities (make sure it's partial so the user can log activities)
                # Morning Sleep
                # Morning Coding Session (9:30 AM to 11:30 AM = 120 mins)
                session.add(Activity(
                    type="Coding",
                    duration=120,
                    timestamp=datetime.datetime.combine(current_date, datetime.time(9, 30)),
                    mood=8,
                    energy=9,
                    notes="Implemented core routers and Tailwind templates in React."
                ))
                # Afternoon Reading (1:30 PM to 2:00 PM = 30 mins)
                session.add(Activity(
                    type="Reading",
                    duration=30,
                    timestamp=datetime.datetime.combine(current_date, datetime.time(13, 30)),
                    mood=7,
                    energy=6,
                    notes="Read about web sockets and automation triggers in n8n."
                ))

        # 4. Seed some mock insights
        session.add(Insight(
            date=(today - datetime.timedelta(days=3)).strftime("%Y-%m-%d"),
            analysis="Your productivity peaks between 9 AM and 12 PM, with coding duration averaging 4.5 hours on high-energy days. There is a noticeable energy drop of 30% on days when sleep drops below 6.5 hours or when you skip morning exercises.",
            recommendation="- Schedule core coding blocks strictly between 9:00 AM and noon.\n- Keep caffeine intake before 1:00 PM to improve deep sleep score.\n- Log exercise sessions at 5 PM to boost evening energy levels."
        ))
        
        session.add(Insight(
            date=(today - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
            analysis="Excellent focus yesterday! You accumulated 5.2 hours of total learning and programming. Your mood remained consistent at 8/10, aided by completing 3 out of 4 daily habits. Your sleep duration was optimal at 7.8 hours.",
            recommendation="- Maintain this layout. Your habit consistency directly correlates with high mood scores.\n- Ensure daily hydration target is met early in the day."
        ))

        session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
