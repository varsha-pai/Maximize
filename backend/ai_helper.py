import os
import json
import httpx
from google import genai
from google.genai import types

def get_ai_analysis(activities_data, habits_data, tasks_data):
    """
    Generates productivity insights based on recent activities, habits, and tasks.
    Tries Gemini, then Ollama, and falls back to a smart heuristic engine.
    """
    prompt = f"""
    Analyze the following weekly user productivity logs and generate personal insights.
    
    Activities: {json.dumps(activities_data)}
    Habits: {json.dumps(habits_data)}
    Tasks: {json.dumps(tasks_data)}

    Structure your response exactly as a JSON object with two keys:
    {{
      "analysis": "A detailed 2-3 paragraph summary outlining their best focus times, energy patterns, distractions, and habits.",
      "recommendation": "4-5 actionable bullet points (separated by newlines or markdown) indicating what they can do to improve focus, sleep, or habits."
    }}
    Do not output any markdown formatting other than the JSON block itself.
    """

    # 1. Try Google Gemini API
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        try:
            client = genai.Client(api_key=gemini_key)
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                ),
            )
            data = json.loads(response.text)
            if "analysis" in data and "recommendation" in data:
                return data
        except Exception as e:
            print(f"Error calling Gemini: {e}")

    # 2. Try Ollama (Local LLM)
    ollama_url = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate")
    try:
        payload = {
            "model": "llama3",
            "prompt": prompt + "\nRespond ONLY with a raw JSON block.",
            "stream": False,
            "format": "json"
        }
        response = httpx.post(ollama_url, json=payload, timeout=5.0)
        if response.status_code == 200:
            data = json.loads(response.json().get("response", "{}"))
            if "analysis" in data and "recommendation" in data:
                return data
    except Exception as e:
        print(f"Ollama not available: {e}")

    # 3. Fallback: Heuristic Rule-Based Insights Engine
    return generate_heuristics_insights(activities_data, habits_data, tasks_data)


def get_ai_chat_response(user_message, activities_data, habits_data, tasks_data):
    """
    Handles conversational questions from the user based on their logs.
    """
    context_prompt = f"""
    You are an expert AI Productivity Coach. The user is asking you a question: "{user_message}"
    
    Here is their productivity context:
    - Activities: {json.dumps(activities_data)}
    - Habits: {json.dumps(habits_data)}
    - Tasks: {json.dumps(tasks_data)}
    
    Provide an encouraging, analytical, and highly actionable response (2-3 short paragraphs).
    Refer to specific metrics in their logs where relevant (e.g. sleep duration, focus hours, habits).
    """

    # 1. Try Gemini
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        try:
            client = genai.Client(api_key=gemini_key)
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=context_prompt
            )
            return response.text
        except Exception as e:
            print(f"Chat: Gemini error: {e}")

    # 2. Try Ollama
    ollama_url = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate")
    try:
        payload = {
            "model": "llama3",
            "prompt": context_prompt,
            "stream": False
        }
        response = httpx.post(ollama_url, json=payload, timeout=5.0)
        if response.status_code == 200:
            return response.json().get("response", "")
    except Exception as e:
        print(f"Chat: Ollama error: {e}")

    # 3. Fallback: Smart Heuristic Conversational Handler
    return get_fallback_chat_reply(user_message.lower(), activities_data, habits_data, tasks_data)


def generate_heuristics_insights(activities, habits, tasks):
    """
    A smart rule-based fallback analyzer that generates custom productivity insights.
    """
    total_hours = sum(a['duration'] for a in activities) / 60
    coding_hours = sum(a['duration'] for a in activities if a['type'] == 'Coding') / 60
    exercise_count = len([a for a in activities if a['type'] == 'Exercise'])
    avg_mood = sum(a['mood'] for a in activities) / len(activities) if activities else 7.0
    avg_energy = sum(a['energy'] for a in activities) / len(activities) if activities else 7.0
    
    completed_habits = len([h for h in habits if h.get('completed')])
    total_habits = len(habits)
    habit_ratio = completed_habits / total_habits if total_habits > 0 else 0.5

    # Craft Analysis
    analysis = (
        f"You logged a total of {total_hours:.1f} hours of activities recently, with "
        f"{coding_hours:.1f} hours dedicated to technical focus (Coding). Your average mood "
        f"stands at {avg_mood:.1f}/10, and your daily energy level has hovered around {avg_energy:.1f}/10. "
    )
    
    if coding_hours > 10:
        analysis += "Your coding focus is strong, showing consistent deep work blocks. "
    else:
        analysis += "Your technical focus has been light; try scheduling dedicated programming intervals. "

    if habit_ratio >= 0.7:
        analysis += "Your habit completion rate is excellent, contributing to a strong routine. "
    else:
        analysis += f"Habit completion is at {habit_ratio * 100:.0f}%, showing some inconsistency in your daily routine. "
        
    if exercise_count >= 3:
        analysis += "Regular exercise is keeping your mood high and fatigue levels low."
    else:
        analysis += "Physical exercise logs are low, which might explain minor drops in energy."

    # Craft Recommendations
    recommendations = []
    if coding_hours < 10:
        recommendations.append("- Allocate at least 90 minutes of distraction-free coding time in the mornings.")
    if exercise_count < 3:
        recommendations.append("- Insert a 20-minute movement block (walk, jog, or stretch) mid-afternoon to battle the 3 PM energy dip.")
    if habit_ratio < 0.7:
        recommendations.append("- Set up reminders in the morning to stick to your main habits (e.g., hydration, reading).")
    if avg_mood < 6.5:
        recommendations.append("- Mood logs indicate high fatigue. Try batching context switches and limit meetings to preserve mental energy.")
    if not recommendations:
        recommendations.append("- Maintain your current focus. Add a 15-minute weekly retro to set goals for next week.")
        recommendations.append("- Experiment with a 50-minute focus/10-minute break cycle (Double Pomodoro) to extend study capacity.")
        
    # Always ensure at least 3 items
    while len(recommendations) < 3:
        recommendations.append("- Ensure at least 7-8 hours of sleep to sustain these high energy levels.")

    return {
        "analysis": analysis,
        "recommendation": "\n".join(recommendations)
    }


def get_fallback_chat_reply(message_lower, activities, habits, tasks):
    """
    Matches keywords in user chat to deliver personalized metrics-backed responses.
    """
    total_focus = sum(a['duration'] for a in activities if a['type'] in ['Coding', 'Learning', 'Reading']) / 60
    sleep_logs = [a['duration'] for a in activities if a['type'] == 'Sleep']
    avg_sleep = (sum(sleep_logs) / len(sleep_logs) / 60) if sleep_logs else 7.2
    
    if "sleep" in message_lower:
        if avg_sleep < 7.0:
            return (
                f"Looking at your sleep records, your average sleep is {avg_sleep:.1f} hours, which is below the 8-hour target. "
                "This correlates with lower energy logs (averaging 6/10) in your afternoon sessions. "
                "I suggest setting a sleep alarm 30 minutes before bed, dimming lights, and avoiding screens after 10:30 PM."
            )
        else:
            return (
                f"Your sleep patterns look healthy! You're averaging {avg_sleep:.1f} hours per night. "
                "This healthy foundation helps keep your morning focus sharp. To optimize further, "
                "try keeping a consistent wake-up time even on weekends."
            )
            
    if "coding" in message_lower or "focus" in message_lower or "productivity" in message_lower:
        coding_hours = sum(a['duration'] for a in activities if a['type'] == 'Coding') / 60
        if coding_hours < 8.0:
            return (
                f"You have tracked {coding_hours:.1f} hours of coding this week. This is slightly lower than your benchmark. "
                "To increase output, try using the Pomodoro timer in the Logger tab. Start with just two 25-minute blocks "
                "each morning before checking notifications."
            )
        else:
            return (
                f"Awesome work! You've accumulated {coding_focus_hours(activities):.1f} hours of coding and focus activities. "
                "Your focus sessions show strong momentum. Make sure to log regular breaks to prevent cognitive burnout."
            )
            
    if "habit" in message_lower:
        completed = len([h for h in habits if h.get('completed')])
        total = len(habits)
        ratio = completed / total if total > 0 else 0.5
        if ratio < 0.6:
            return (
                f"Your habit completion rate is sitting around {ratio * 100:.0f}%. "
                "Consistency in habits builds identity and rhythm. Try pairing a habit with a daily action "
                "(e.g., 'Right after my morning coding block, I will drink 500ml of water')."
            )
        else:
            return (
                f"Superb! Your habit compliance is high ({ratio * 100:.0f}%). "
                "This routine is the backbone of your productivity. Keep stacking these small wins!"
            )
            
    if "energy" in message_lower or "mood" in message_lower:
        moods = [a['mood'] for a in activities]
        avg_m = sum(moods) / len(moods) if moods else 7.0
        if avg_m < 7.0:
            return (
                f"Your mood rating averages {avg_m:.1f}/10. High fatigue or stress is evident. "
                "Try doing shorter 20-minute focus blocks with 5-minute walks in between. "
                "Avoid context switching (like switching between social media and coding) which drains mental energy."
            )
        else:
            return (
                f"Your mood is high, averaging {avg_m:.1f}/10! You're in a great mental state. "
                "Leverage this phase to tackle your most complex engineering tasks or design issues."
            )

    return (
        "I'm here to support you! Tell me what you'd like to analyze: 'How is my sleep tracking?', "
        "'What do you think of my coding habits?', or 'Why was my energy low yesterday?' "
        f"Currently, you've logged {total_focus:.1f} focus hours and completed {len([h for h in habits if h.get('completed')])} habits."
    )

def coding_focus_hours(activities):
    return sum(a['duration'] for a in activities if a['type'] == 'Coding') / 60
