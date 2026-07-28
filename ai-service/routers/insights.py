from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from openai import OpenAI
from datetime import datetime

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class Insight(BaseModel):
    type: str          # productivity, streak, subject, recommendation
    title: str
    message: str
    action: Optional[str] = None
    priority: str = "medium"  # low, medium, high


class InsightsResponse(BaseModel):
    insights: List[Insight]
    generatedAt: str


@router.get("/insights", response_model=InsightsResponse)
async def get_insights(user_id: str):
    # In production, fetch real user data from the database
    # Here we generate smart AI insights based on typical patterns
    prompt = f"""You are an AI study coach providing personalized insights to a student.

Based on typical student study patterns, generate 5 actionable, encouraging insights.
Include a mix of:
- Productivity tips based on time-of-day patterns
- Streak maintenance encouragement
- Subject-specific advice
- Study technique recommendations
- Upcoming exam preparation reminders

Each insight should be:
- Specific and actionable (not generic)
- Encouraging and positive
- 1-2 sentences max for message

Respond ONLY with valid JSON:
{{
  "insights": [
    {{
      "type": "productivity",
      "title": "Peak Performance Window",
      "message": "Your focus scores are highest between 9-11 AM. Schedule your hardest subjects during this time.",
      "action": "Schedule Math for tomorrow morning",
      "priority": "high"
    }}
  ]
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.8,
        )
        result = json.loads(response.choices[0].message.content)
        result["generatedAt"] = datetime.utcnow().isoformat()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI insights failed: {str(e)}")
