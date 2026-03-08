import React, { useState } from 'react';
import { Search, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export const VideoSearch = ({ onVideoSelect, loading }) => {
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onVideoSelect(url.trim());
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/youtube/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 6 })
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.videos || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="glassmorphism rounded-2xl p-6 shadow-2xl">
      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 mb-6">
          <TabsTrigger value="url" data-testid="url-tab">Paste URL</TabsTrigger>
          <TabsTrigger value="search" data-testid="search-tab">Search Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="url" data-testid="url-tab-content">
          <form onSubmit={handleUrlSubmit} className="flex gap-3">
            <div className="flex-1">
              <Input
                data-testid="url-input"
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-slate-900/50 border-2 border-slate-800 focus:border-cyan-400 rounded-xl text-base px-6 py-6 text-text-primary placeholder:text-slate-500"
                disabled={loading}
              />
            </div>
            <Button
              data-testid="analyze-url-btn"
              type="submit"
              disabled={loading || !url.trim()}
              className="px-8 py-6 bg-primary text-primary-foreground hover:bg-cyan-400 hover:shadow-glow-lg transition-all duration-300 font-semibold rounded-xl"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Analyzing...</>
              ) : (
                <><LinkIcon className="w-5 h-5 mr-2" /> Analyze</>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="search" data-testid="search-tab-content">
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="flex-1">
              <Input
                data-testid="search-input"
                type="text"
                placeholder="Search for videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900/50 border-2 border-slate-800 focus:border-cyan-400 rounded-xl text-base px-6 py-6 text-text-primary placeholder:text-slate-500"
                disabled={searching}
              />
            </div>
            <Button
              data-testid="search-btn"
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="px-8 py-6 bg-primary text-primary-foreground hover:bg-cyan-400 hover:shadow-glow-lg transition-all duration-300 font-semibold rounded-xl"
            >
              {searching ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Searching...</>
              ) : (
                <><Search className="w-5 h-5 mr-2" /> Search</>
              )}
            </Button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="search-results">
              {searchResults.map((video, index) => (
                <div
                  key={video.video_id}
                  data-testid={`search-result-${index}`}
                  onClick={() => !loading && onVideoSelect(video.video_id)}
                  className="group cursor-pointer bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
                >
                  <div className="relative aspect-video bg-slate-800">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-mono">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-text-primary line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span className="truncate">{video.channel}</span>
                      <span>{video.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoSearch;