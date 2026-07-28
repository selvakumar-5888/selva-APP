from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from openai import OpenAI

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class GenerateFlashcardsRequest(BaseModel):
    content: str
    deckTitle: Optional[str] = None
    count: int = 10


class Flashcard(BaseModel):
    front: str
    back: str
    difficulty: str  # EASY, MEDIUM, HARD


class GenerateFlashcardsResponse(BaseModel):
    flashcards: List[Flashcard]
    deckTitle: str


@router.post("/generate-flashcards", response_model=GenerateFlashcardsResponse)
async def generate_flashcards(request: GenerateFlashcardsRequest):
    prompt = f"""You are an expert educator creating study flashcards.

Content to convert into flashcards:
---
{request.content[:3000]}
---

Create exactly {min(request.count, 20)} flashcards from this content.
Each flashcard should:
- Have a clear, specific question on the FRONT
- Have a concise, accurate answer on the BACK
- Include the difficulty: EASY (basic recall), MEDIUM (understanding), or HARD (application/analysis)

Respond ONLY with valid JSON:
{{
  "flashcards": [
    {{
      "front": "What is...",
      "back": "The answer is...",
      "difficulty": "MEDIUM"
    }}
  ],
  "deckTitle": "{request.deckTitle or 'Auto-generated Deck'}"
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.5,
        )
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
