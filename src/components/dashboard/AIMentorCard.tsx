import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Bot,
  ArrowUpRight,
  Send,
  Loader2,
  User as UserIcon,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { CampusOSLogo } from '../common/CampusOSLogo';
import {
  StudentUser,
  CareerReadinessBreakdown,
  SkillProgressItem,
  ProjectItem,
  CertificationItem,
  RecentActivityItem,
} from '../../types';
import { generateSmartMentorResponse } from '../../utils/aiMentorEngine';
import { getToken } from '../../services/api';

interface AIMentorCardProps {
  user: StudentUser;
  careerReadiness?: CareerReadinessBreakdown;
  skills?: SkillProgressItem[];
  projects?: ProjectItem[];
  certifications?: CertificationItem[];
  recentActivities?: RecentActivityItem[];
  onOpenFullChat: (initialPrompt?: string) => void;
}

interface MiniMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const AIMentorCard: React.FC<AIMentorCardProps> = ({
  user,
  careerReadiness,
  skills = [],
  projects = [],
  certifications = [],
  recentActivities = [],
  onOpenFullChat,
}) => {
  const careerGoal = user.careerGoal || 'AI / Machine Learning Engineer';
  const studentName = user.name || 'Ali Raza';
  const semester = user.semester || 5;
  const currentGPA = user.gpa ? user.gpa.toFixed(2) : '3.42';
  const readinessScore = careerReadiness?.overall || user.careerReadiness || 68;

  const [messages, setMessages] = useState<MiniMessage[]>([
    {
      id: 'msg-init',
      sender: 'bot',
      text: `Hello **${studentName}**! 👋 I'm **Campus GPT**. How can I help you today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: `Hello **${studentName}**! 👋 I'm **Campus GPT**. How can I help you today?`,
        timestamp: 'Just now',
      },
    ]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query || isTyping) return;

    const userMsg: MiniMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    const botMsgId = `bot-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Pre-calculate instant, concise ChatGPT-style response using the exact same engine
    const contextualReply = generateSmartMentorResponse(
      query,
      {
        user,
        careerReadiness,
        skills,
      },
      { concise: true }
    );

    try {
      const token = getToken();
      // 1. Attempt streaming from /api/chat/stream or fallback to non-streaming /api/mentor-chat
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: query,
          model: 'qwen/qwen3.8-27b',
          isConcise: true,
          isMiniCard: true,
          studentContext: {
            name: studentName,
            degree: user.degree,
            semester: user.semester,
            gpa: currentGPA,
            careerGoal,
            careerReadiness: readinessScore,
            skills: skills.map((s) => `${s.name} (${s.level}, ${s.percentage}%)`),
            projects: projects.map((p) => `${p.title} (${p.category}, ${p.status})`),
            certifications: certifications.map((c) => `${c.title} (${c.organization})`),
            recentActivities: recentActivities.slice(0, 4).map((a) => `${a.title} ${a.target}`),
          },
        }),
      });

      if (response.ok && response.body) {
        // Initial bot placeholder
        setMessages((prev) => [
          ...prev,
          {
            id: botMsgId,
            sender: 'bot',
            text: '',
            timestamp: 'Just now',
          },
        ]);
        setIsTyping(false);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                if (data.chunk) {
                  accumulated += data.chunk;
                  const currentText = accumulated;
                  setMessages((prev) =>
                    prev.map((m) => (m.id === botMsgId ? { ...m, text: currentText } : m))
                  );
                } else if (data.error && !accumulated.trim()) {
                  accumulated = contextualReply;
                  setMessages((prev) =>
                    prev.map((m) => (m.id === botMsgId ? { ...m, text: contextualReply } : m))
                  );
                }
              } catch {
                // Ignore parse errors on chunks
              }
            }
          }
        }

        if (!accumulated.trim()) {
          setMessages((prev) =>
            prev.map((m) => (m.id === botMsgId ? { ...m, text: contextualReply } : m))
          );
        }
      } else {
        // Fallback non-streaming POST
        const token = getToken();
        const res = await fetch('/api/mentor-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            message: query,
            isConcise: true,
            isMiniCard: true,
            history: messages.slice(-4),
            studentContext: {
              name: studentName,
              degree: user.degree,
              semester: user.semester,
              careerGoal,
              careerReadiness: readinessScore,
              skills: skills.map((s) => `${s.name} (${s.level})`),
              projects: projects.map((p) => `${p.title} (${p.category})`),
              certifications: certifications.map((c) => `${c.title} (${c.organization})`),
              recentActivities: recentActivities.slice(0, 4).map((a) => `${a.title} ${a.target}`),
            },
          }),
        });

        let botResponse = contextualReply;
        if (res.ok) {
          const data = await res.json();
          if (data.text) {
            botResponse = data.text;
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: botMsgId,
            sender: 'bot',
            text: botResponse,
            timestamp: 'Just now',
          },
        ]);
      }
    } catch {
      // Offline / Network fallback to smart structured response
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bot',
          text: contextualReply,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      id="card-ai-mentor-mini"
      className="overflow-hidden rounded-2xl border border-[#8F9CFE]/80 bg-white shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:bg-white/95 hover:backdrop-blur-md hover:-translate-y-0.5 flex flex-col"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-[#283593] text-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#283593] border border-[#C7D2FE] shadow-xs">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white tracking-tight truncate">
              Campus GPT
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleResetChat}
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            id="btn-open-full-ai-mentor"
            onClick={() => onOpenFullChat()}
            className="inline-flex items-center gap-1 rounded-lg bg-[#EEF2FF] hover:bg-white active:bg-slate-100 border border-[#C7D2FE] px-2.5 py-1 text-xs font-bold text-[#283593] transition active:scale-95 shadow-xs cursor-pointer"
            title="Open complete Campus GPT chat"
          >
            <span>Full Chat</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#283593]" />
          </button>
        </div>
      </div>

      {/* Chat Conversation Body */}
      <div
        ref={chatContainerRef}
        className="p-3.5 bg-white space-y-3 h-[320px] min-h-[290px] max-h-[360px] overflow-y-auto no-scrollbar flex flex-col text-slate-800"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'bot' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#283593] border border-[#C7D2FE] mt-0.5 shadow-2xs">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#283593] text-white rounded-br-none shadow-xs font-medium'
                  : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
              }`}
            >
              {msg.sender === 'bot' ? (
                <div className="space-y-1.5 text-slate-800">
                  <Markdown
                    components={{
                      strong: ({ children }) => (
                        <strong className="font-bold text-slate-900">{children}</strong>
                      ),
                      h1: ({ children }) => (
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1 mb-0.5">{children}</h4>
                      ),
                      h2: ({ children }) => (
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1 mb-0.5">{children}</h4>
                      ),
                      h3: ({ children }) => (
                        <h5 className="font-bold text-xs text-slate-900 mt-1 mb-0.5">{children}</h5>
                      ),
                      p: ({ children }) => (
                        <p className="mb-1.5 last:mb-0 leading-relaxed text-xs">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-1 my-1 list-disc list-outside pl-3.5 text-xs">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="space-y-1 my-1 list-decimal list-outside pl-3.5 text-xs">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed pl-0.5">{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-[#1A237E] pl-2 py-0.5 my-1 italic text-[11px] text-slate-600 bg-white rounded-r">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-slate-200/80 text-[#1A237E] font-mono text-[10.5px] px-1 py-0.5 rounded font-semibold">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {msg.text}
                  </Markdown>

                  {/* Copy Button for Bot Messages */}
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                msg.text
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#283593] text-white mt-0.5 shadow-2xs">
                <UserIcon className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#283593] border border-[#C7D2FE]">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2 text-xs text-slate-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#283593]" />
              <span className="text-[11px]">Thinking & generating response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Message Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-2.5 bg-slate-50 border-t border-slate-200"
      >
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 placeholder:font-light focus:border-[#283593] focus:outline-hidden focus:ring-1 focus:ring-[#283593] shadow-2xs"
          />
          <button
            type="submit"
            disabled={isTyping}
            className="flex h-8 px-3.5 items-center justify-center gap-1.5 rounded-xl font-bold text-xs bg-[#283593] hover:bg-[#1A237E] active:scale-95 text-white transition shadow-xs shrink-0 cursor-pointer"
            title="Send Message"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
