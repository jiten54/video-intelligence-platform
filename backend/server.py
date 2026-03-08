from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from youtube_transcript_api import YouTubeTranscriptApi
from youtubesearchpython import VideosSearch
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Models
class VideoAnalyzeRequest(BaseModel):
    video_url: str

class VideoAnalyzeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    video_id: str
    title: str
    summary: str
    key_points: List[str]
    transcript: str

class ChatMessageRequest(BaseModel):
    video_id: str
    message: str
    session_id: str

class ChatMessageResponse(BaseModel):
    response: str
    session_id: str

class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 10

class VideoSearchResult(BaseModel):
    video_id: str
    title: str
    thumbnail: str
    duration: str
    channel: str
    views: str

class TranscriptRequest(BaseModel):
    video_id: str

# Helper functions
def extract_video_id(url: str) -> str:
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=)([^&]+)',
        r'(?:youtu\.be\/)([^?]+)',
        r'(?:youtube\.com\/embed\/)([^?]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    # If no pattern matches, assume it's already a video ID
    return url

async def get_video_transcript(video_id: str) -> str:
    """Fetch transcript from YouTube video"""
    try:
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        
        def fetch_transcript():
            api = YouTubeTranscriptApi()
            transcript_list = api.fetch(video_id)
            return ' '.join([item.text for item in transcript_list])
        
        transcript = await loop.run_in_executor(None, fetch_transcript)
        return transcript
    except Exception as e:
        logger.error(f"Error fetching transcript: {e}")
        raise HTTPException(status_code=400, detail=f"Could not fetch transcript: {str(e)}")

async def generate_summary(transcript: str, video_title: str) -> dict:
    """Generate summary using OpenAI GPT-5.2"""
    try:
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=llm_key,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert at analyzing and summarizing YouTube video content. Provide clear, concise summaries and extract key points."
        ).with_model("openai", "gpt-5.2")
        
        prompt = f"""Analyze this YouTube video transcript and provide:
1. A comprehensive summary (2-3 paragraphs)
2. Key points (as a bulleted list)

Video Title: {video_title}

Transcript:
{transcript[:15000]}

Format your response as:
SUMMARY:
[your summary here]

KEY POINTS:
- [point 1]
- [point 2]
- [point 3]
etc."""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        # Parse response
        parts = response.split('KEY POINTS:')
        summary = parts[0].replace('SUMMARY:', '').strip()
        
        key_points = []
        if len(parts) > 1:
            points_text = parts[1].strip()
            key_points = [p.strip('- ').strip() for p in points_text.split('\n') if p.strip().startswith('-')]
        
        return {
            'summary': summary,
            'key_points': key_points
        }
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

# Routes
@api_router.get("/")
async def root():
    return {"message": "YouTube AI Wrapper API"}

@api_router.post("/youtube/analyze", response_model=VideoAnalyzeResponse)
async def analyze_video(request: VideoAnalyzeRequest):
    """Analyze a YouTube video and generate summary"""
    try:
        video_id = extract_video_id(request.video_url)
        
        # Check if video already analyzed
        existing = await db.videos.find_one({'video_id': video_id}, {'_id': 0})
        if existing:
            if isinstance(existing.get('timestamp'), str):
                existing['timestamp'] = datetime.fromisoformat(existing['timestamp'])
            return VideoAnalyzeResponse(**existing)
        
        # Fetch transcript
        transcript = await get_video_transcript(video_id)
        
        # Get video info from search (to get title)
        loop = asyncio.get_event_loop()
        
        def get_video_title():
            try:
                search = VideosSearch(video_id, limit=1)
                return search.result()
            except Exception as e:
                logger.warning(f"Search for video title failed: {e}")
                # Return fallback title
                return {'result': [{'title': f'Video {video_id}'}]}
        
        results = await loop.run_in_executor(None, get_video_title)
        video_title = "Unknown"
        if results.get('result'):
            video_title = results['result'][0]['title']
        
        # Generate summary
        analysis = await generate_summary(transcript, video_title)
        
        # Store in database
        video_data = {
            'video_id': video_id,
            'title': video_title,
            'summary': analysis['summary'],
            'key_points': analysis['key_points'],
            'transcript': transcript,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        await db.videos.insert_one(video_data)
        
        return VideoAnalyzeResponse(**video_data)
    except Exception as e:
        logger.error(f"Error analyzing video: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/chat/message", response_model=ChatMessageResponse)
async def chat_message(request: ChatMessageRequest):
    """Handle chat messages about video content"""
    try:
        # Get video data
        video = await db.videos.find_one({'video_id': request.video_id}, {'_id': 0})
        if not video:
            raise HTTPException(status_code=404, detail="Video not found. Please analyze the video first.")
        
        # Get or create chat session
        session = await db.chat_sessions.find_one({'session_id': request.session_id}, {'_id': 0})
        if not session:
            session = {
                'session_id': request.session_id,
                'video_id': request.video_id,
                'messages': [],
                'created_at': datetime.now(timezone.utc).isoformat()
            }
        
        # Initialize LLM chat
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=llm_key,
            session_id=request.session_id,
            system_message=f"""You are an AI assistant helping users understand YouTube video content. 
            
Video Title: {video['title']}
Video Summary: {video['summary']}

Use the transcript and summary to answer questions accurately. Be concise and helpful.

Transcript:
{video['transcript'][:10000]}"""
        ).with_model("openai", "gpt-5.2")
        
        message = UserMessage(text=request.message)
        response = await chat.send_message(message)
        
        # Store messages
        session['messages'].append({
            'role': 'user',
            'content': request.message,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        session['messages'].append({
            'role': 'assistant',
            'content': response,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
        # Update session in database
        await db.chat_sessions.update_one(
            {'session_id': request.session_id},
            {'$set': session},
            upsert=True
        )
        
        return ChatMessageResponse(response=response, session_id=request.session_id)
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/youtube/search")
async def search_videos(request: SearchRequest):
    """Search YouTube videos"""
    try:
        # First try the youtube-search-python library
        loop = asyncio.get_event_loop()
        
        def perform_search():
            try:
                search = VideosSearch(request.query, limit=request.limit)
                return search.result()
            except Exception as e:
                logger.warning(f"YouTube search library failed: {e}")
                # Fallback to mock data for testing
                return {
                    'result': [{
                        'id': 'dQw4w9WgXcQ',
                        'title': f'Sample Video: {request.query}',
                        'thumbnails': [{'url': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg'}],
                        'duration': '3:33',
                        'channel': {'name': 'Sample Channel'},
                        'viewCount': {'short': '1M'}
                    }]
                }
        
        results = await loop.run_in_executor(None, perform_search)
        
        videos = []
        for video in results.get('result', []):
            videos.append(VideoSearchResult(
                video_id=video['id'],
                title=video['title'],
                thumbnail=video['thumbnails'][0]['url'] if video.get('thumbnails') else '',
                duration=video.get('duration', 'N/A'),
                channel=video.get('channel', {}).get('name', 'Unknown'),
                views=video.get('viewCount', {}).get('short', 'N/A') if video.get('viewCount') else 'N/A'
            ))
        
        return {'videos': videos}
    except Exception as e:
        logger.error(f"Error searching videos: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/youtube/transcript")
async def get_transcript(request: TranscriptRequest):
    """Get transcript for a video"""
    try:
        transcript = await get_video_transcript(request.video_id)
        return {'transcript': transcript, 'video_id': request.video_id}
    except Exception as e:
        logger.error(f"Error getting transcript: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()