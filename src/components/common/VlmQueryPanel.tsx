import React, { useState } from 'react';
import { Sparkles, Send, Bot, CornerDownLeft, RefreshCw, HelpCircle } from 'lucide-react';
import { useRobot } from '../../context/RobotContext';

export const VlmQueryPanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { askVisionVLM, detectedObjects, position, heading } = useRobot();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLog, setChatLog] = useState<{ query: string; answer: string; time: string }[]>([
    {
      query: 'What is in front of the robot?',
      answer: 'Visual Perception Analysis:\nThere is a person (Inspector Sharma #P102) approximately 2.4 meters in front of the robot bearing +12° and a static obstacle on the right side. Path corridor is monitored by Nav2 planner.',
      time: '14:32:05'
    }
  ]);

  const presetQueries = [
    'What is in front of the robot?',
    'Is there any person nearby?',
    'Check exit paths and obstructions',
    'Assess battery and hardware thermals'
  ];

  const handleSubmit = async (qText?: string) => {
    const textToSend = qText || query;
    if (!textToSend.trim() || loading) return;

    setLoading(true);
    const userQuery = textToSend;
    setQuery('');

    try {
      const response = await askVisionVLM(userQuery);
      setChatLog(prev => [
        {
          query: userQuery,
          answer: response,
          time: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <span>Vision-Language Model (VLM)</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                Gemini Multi-Modal
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Natural-language scene reasoning & spatial grounding</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Ready
        </span>
      </div>

      {/* Preset Suggestions */}
      <div className="flex flex-wrap gap-1.5 my-3">
        {presetQueries.map((pq, idx) => (
          <button
            key={idx}
            onClick={() => handleSubmit(pq)}
            className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            "{pq}"
          </button>
        ))}
      </div>

      {/* Chat / Reasoning Feed */}
      <div className="flex-1 overflow-y-auto max-h-64 space-y-3 pr-1 mb-3">
        {chatLog.map((item, index) => (
          <div key={index} className="space-y-1.5 text-xs font-mono">
            {/* User Query */}
            <div className="flex items-start gap-2 justify-end">
              <div className="bg-indigo-600/30 border border-indigo-500/40 text-indigo-100 px-3 py-1.5 rounded-lg max-w-[85%]">
                <span className="text-[9px] text-indigo-300 block mb-0.5">Operator Query &bull; {item.time}</span>
                <p>{item.query}</p>
              </div>
            </div>

            {/* AI Response */}
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-700 text-cyan-400 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg max-w-[90%] whitespace-pre-wrap leading-relaxed text-[11px]">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex items-center gap-2 pt-2 border-t border-slate-800"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask robot: 'What is blocking the aisle?', 'Locate Inspector'..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Query</span>
        </button>
      </form>
    </div>
  );
};
