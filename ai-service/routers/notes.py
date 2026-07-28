from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import os
import json
from openai import OpenAI

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class SummarizeRequest(BaseModel):
    content: str


class SummarizeResponse(BaseModel):
    summary: str
    key_points: List[str]
    suggested_topics: List[str]


@router.post("/summarize-notes", response_model=SummarizeResponse)
async def summarize_notes(request: SummarizeRequest):
    prompt = f"""You are an expert study assistant. Analyze these notes and provide:
1. A concise summary (2-3 sentences)
2. 5-7 key points as bullet items
3. 3-5 suggested related topics to study next

Notes:
---
{request.content[:4000]}
---

Respond ONLY with valid JSON:
{{
  "summary": "Brief 2-3 sentence summary...",
  "key_points": ["Key point 1", "Key point 2", ...],
  "suggested_topics": ["Topic 1", "Topic 2", ...]
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI summarization failed: {str(e)}")
