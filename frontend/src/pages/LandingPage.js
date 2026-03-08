import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Video, MessageSquare, Clock, Zap, TrendingUp } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Video className="w-6 h-6" />,
      title: "Instant Summaries",
      description: "Get comprehensive video summaries in seconds powered by GPT-5.2"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "AI Chat Q&A",
      description: "Ask questions about video content and get intelligent answers"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Key Timestamps",
      description: "Extract important moments and navigate directly to key points"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Processing",
      description: "Analyze videos instantly with our optimized AI pipeline"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-glow">
              <Sparkles className="w-6 h-6 text-background" strokeWidth={2.5} />
            </div>
            <h1 className="font-heading font-bold text-2xl tracking-tight text-text-primary">Lumina Stream</h1>
          </div>
          <button
            data-testid="launch-app-header-btn"
            onClick={() => navigate('/app')}
            className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-cyan-400 hover:shadow-glow-lg transition-all duration-300"
          >
            Launch App
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 mb-8">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm text-text-muted font-medium">Powered by OpenAI GPT-5.2</span>
          </div>
          
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6">
            <span className="text-text-primary">Transform YouTube Videos</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Into Intelligent Insights</span>
          </h1>
          
          <p className="text-lg text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
            Skip the watching. Get instant AI-powered summaries, chat with video content, 
            and extract key moments from any YouTube video.
          </p>
          
          <button
            data-testid="get-started-hero-btn"
            onClick={() => navigate('/app')}
            className="group relative px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:bg-cyan-400 hover:shadow-glow-lg transition-all duration-300 inline-flex items-center gap-3"
          >
            <span>Get Started Free</span>
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              data-testid={`feature-card-${index}`}
              className="group relative overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-800 p-8 hover:border-cyan-500/30 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3 text-text-primary">{feature.title}</h3>
                <p className="text-text-muted leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="glassmorphism rounded-3xl p-16 text-center shadow-2xl">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-6 text-text-primary">
            Ready to unlock video intelligence?
          </h2>
          <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
            Start analyzing YouTube videos with AI today. No signup required.
          </p>
          <button
            data-testid="cta-start-now-btn"
            onClick={() => navigate('/app')}
            className="px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:bg-cyan-400 hover:shadow-glow-lg transition-all duration-300"
          >
            Start Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-text-muted text-sm">
          <p>© 2026 Lumina Stream. Powered by AI to make video content accessible.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;