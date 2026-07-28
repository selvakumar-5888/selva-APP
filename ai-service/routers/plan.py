from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
from openai import OpenAI

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class Topic(BaseModel):
    name: str
    completed: bool = False


class Subject(BaseModel):
    name: str
    topics: List[Topic] = []


class Goals(BaseModel):
    dailyMinutes: int = 120


class GeneratePlanRequest(BaseModel):
    subjects: List[Subject]
    weeklyHours: int = 10
    studyStyle: str = "VISUAL"
    goals: Optional[Goals] = None
    existingSchedule: Optional[List[Dict[str, Any]]] = None


class StudySession(BaseModel):
    day: str
    startTime: str
    endTime: str
    subject: str
    topic: str
    sessionType: str
    durationMinutes: int


class GeneratePlanResponse(BaseModel):
    weeklyPlan: List[StudySession]
    tips: List[str]
    estimatedCompletionWeeks: int


@router.post("/generate-plan", response_model=GeneratePlanResponse)
async def generate_plan(request: GeneratePlanRequest):
    subjects_text = "\n".join(
        f"- {s.name}: {', '.join(t.name for t in s.topics if not t.completed) or 'All topics covered'}"
        for s in request.subjects
    )

    prompt = f"""You are an expert study planner. Create a detailed weekly study schedule.

Student profile:
- Available study hours per week: {request.weeklyHours}
- Learning style: {request.studyStyle}
- Daily goal: {request.goals.dailyMinutes if request.goals else 120} minutes

Subjects and pending topics:
{subjects_text}

Create a realistic weekly study plan (Monday to Sunday). Distribute sessions across days.
For each session include: day, startTime (HH:MM), endTime (HH:MM), subject name, specific topic,
sessionType (study/review/practice/quiz), durationMinutes.

Also provide 3 personalized study tips based on their learning style.
Estimate how many weeks to cover all pending topics.

Respond ONLY with valid JSON matching this exact structure:
{{
  "weeklyPlan": [
    {{
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "10:30",
      "subject": "Mathematics",
      "topic": "Linear Algebra",
      "sessionType": "study",
      "durationMinutes": 90
    }}
  ],
  "tips": ["tip1", "tip2", "tip3"],
  "estimatedCompletionWeeks": 8
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
