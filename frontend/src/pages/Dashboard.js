import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import VideoSearch from '../components/VideoSearch';
import VideoPlayer from '../components/VideoPlayer';
import SummaryPanel from '../components/SummaryPanel';
import ChatPanel from '../components/ChatPanel';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVideoSelect = async (videoId) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/youtube/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: videoId })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze video');
      }

      const data = await response.json();
      setVideoData(data);
      toast.success('Video analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing video:', error);
      toast.error('Failed to analyze video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-to-home-btn"
              onClick={() => navigate('/')}
              className="text-text-muted hover:text-text-primary transition-colors p-2 hover:bg-slate-800 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-background" strokeWidth={2.5} />
              </div>
              <h1 className="font-heading font-bold text-xl tracking-tight text-text-primary">Lumina Stream</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <VideoSearch onVideoSelect={handleVideoSelect} loading={loading} />
        </div>

        {/* Dashboard Grid - Bento Layout */}
        {videoData ? (
          <div className="grid grid-cols-12 gap-6">
            {/* Video Player - Large */}
            <div className="col-span-12 lg:col-span-8" data-testid="video-player-section">
              <VideoPlayer videoId={videoData.video_id} title={videoData.title} />
            </div>

            {/* Chat Panel - Right Side */}
            <div className="col-span-12 lg:col-span-4 lg:row-span-2" data-testid="chat-panel-section">
              <ChatPanel videoId={videoData.video_id} videoTitle={videoData.title} />
            </div>

            {/* Summary Panel - Bottom Left */}
            <div className="col-span-12 lg:col-span-8" data-testid="summary-panel-section">
              <SummaryPanel 
                summary={videoData.summary} 
                keyPoints={videoData.key_points}
                transcript={videoData.transcript}
              />
            </div>
          </div>
        ) : (
          <div className="glassmorphism rounded-3xl p-16 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-primary mx-auto mb-6">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="font-heading font-bold text-2xl mb-4 text-text-primary">
              Enter a YouTube URL or Search
            </h2>
            <p className="text-text-muted max-w-md mx-auto">
              Paste any YouTube video link or search for videos to start analyzing with AI.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;