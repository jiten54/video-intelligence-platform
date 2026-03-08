import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';

export const SummaryPanel = ({ summary, keyPoints, transcript }) => {
  const [expandedTranscript, setExpandedTranscript] = useState(false);

  return (
    <div className="glassmorphism rounded-2xl shadow-2xl h-full" data-testid="summary-panel-container">
      <Tabs defaultValue="summary" className="h-full flex flex-col">
        <div className="border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-semibold text-xl text-text-primary">Analysis</h2>
          </div>
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="summary" data-testid="summary-tab">Summary</TabsTrigger>
            <TabsTrigger value="keypoints" data-testid="keypoints-tab">Key Points</TabsTrigger>
            <TabsTrigger value="transcript" data-testid="transcript-tab">Transcript</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="summary" className="h-full m-0" data-testid="summary-content">
            <ScrollArea className="h-[400px] px-6 py-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">AI-Generated Summary</h3>
                  <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{summary}</p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="keypoints" className="h-full m-0" data-testid="keypoints-content">
            <ScrollArea className="h-[400px] px-6 py-6">
              <div className="space-y-4">
                {keyPoints && keyPoints.length > 0 ? (
                  keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3" data-testid={`keypoint-${index}`}>
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-text-muted leading-relaxed">{point}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-text-muted">No key points available.</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="transcript" className="h-full m-0" data-testid="transcript-content">
            <ScrollArea className="h-[400px] px-6 py-6">
              <div className="font-mono text-sm text-text-muted leading-relaxed">
                <div className={!expandedTranscript ? 'line-clamp-[20]' : ''}>
                  {transcript}
                </div>
                {transcript && transcript.length > 500 && (
                  <button
                    data-testid="toggle-transcript-btn"
                    onClick={() => setExpandedTranscript(!expandedTranscript)}
                    className="mt-4 text-primary hover:text-cyan-400 flex items-center gap-2 transition-colors"
                  >
                    {expandedTranscript ? (
                      <><ChevronUp className="w-4 h-4" /> Show Less</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" /> Show More</>
                    )}
                  </button>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SummaryPanel;