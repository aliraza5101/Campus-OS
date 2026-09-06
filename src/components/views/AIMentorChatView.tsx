import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  Bot,
  Send,
  RotateCcw,
  User,
  Copy,
  Check,
  Lightbulb,
  Zap,
  ThumbsUp,
  ThumbsDown,
  ArrowUpRight,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Search,
  Clock,
  ChevronRight,
  ChevronDown,
  Brain,
  Mic,
  MicOff,
  AudioLines,
  ArrowUp,
  SquarePen,
  Share2,
  Compass,
  Code2,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  FolderGit2,
} from 'lucide-react';
import {
  StudentUser,
  NextActionItem,
  SkillProgressItem,
  ProjectItem,
  ExperienceItem,
  SemesterDetail,
  CareerReadinessBreakdown,
  CertificationItem,
  RecentActivityItem,
} from '../../types';
import { CampusOSLogo } from '../common/CampusOSLogo';
import { generateSmartMentorResponse } from '../../utils/aiMentorEngine';
import { getToken } from '../../services/api';

interface AIMentorChatViewProps {
  user: StudentUser;
  nextSteps?: NextActionItem[];
  skills?: SkillProgressItem[];
  projects?: ProjectItem[];
  experiences?: ExperienceItem[];
  certifications?: CertificationItem[];
  recentActivities?: RecentActivityItem[];
  semesters?: SemesterDetail[];
  careerReadiness?: CareerReadinessBreakdown;
  onNavigateTab?: (tab: string) => void;
  onAddProjectModal?: () => void;
  onUpdateSkillsModal?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  thoughtProcess?: string;
  isLiked?: boolean;
  isDisliked?: boolean;
  suggestions?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  timestamp: number;
  messages: ChatMessage[];
}

export const AIMentorChatView: React.FC<AIMentorChatViewProps> = ({
  user,
  nextSteps = [],
  skills = [],
  projects = [],
  experiences = [],
  certifications = [],
  recentActivities = [],
  careerReadiness,
  onNavigateTab,
  onAddProjectModal,
  onUpdateSkillsModal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [likedMessageIds, setLikedMessageIds] = useState<Record<string, boolean>>({});
  const [dislikedMessageIds, setDislikedMessageIds] = useState<Record<string, boolean>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [historySearch, setHistorySearch] = useState('');
  const [isThinkMode, setIsThinkMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedModel] = useState<string>('Groq LPU Engine');
  const [providerStatus, setProviderStatus] = useState<{
    activeProvider: string;
    providerName: string;
    model: string;
    hasGrokKey: boolean;
    hasGroqKey: boolean;
    hasGeminiKey: boolean;
    isReady: boolean;
  } | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/mentor/status')
      .then((r) => r.json())
      .then((data) => {
        setProviderStatus(data);
      })
      .catch(() => {});
  }, []);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const careerGoal = user.careerGoal || 'AI / Machine Learning Engineer';
  const studentName = user.name || 'Ali Raza';
  const currentGPA = user.gpa ? user.gpa.toFixed(2) : '3.42';
  const readinessScore = careerReadiness?.overall || user.careerReadiness || 68;
  const userId = user.id || user.email || user.name || 'default';

  // Real-time Chat Sessions Storage (Per Logged In User)
  const storageKey = `campusos_chat_sessions_${userId}`;

  const generateSessionId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const normalizeSessionMessages = (s: any): ChatSession => ({
    ...s,
    messages: (Array.isArray(s.messages) ? s.messages : []).map((m: any) => ({
      ...m,
      sender: (m.sender === 'user' || m.role === 'user') ? 'user' : 'ai',
      text: m.text || m.content || '',
    })),
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .map(normalizeSessionMessages)
            .filter((s: ChatSession) => Array.isArray(s.messages) && s.messages.length > 0);
          if (normalized.length > 0) {
            return normalized;
          }
        }
      }
    } catch (e) {
      console.warn('Could not read saved sessions:', e);
    }
    const freshId = generateSessionId();
    return [
      {
        id: freshId,
        title: 'New Chat',
        preview: 'Start a new conversation...',
        updatedAt: 'Just now',
        timestamp: Date.now(),
        messages: [],
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || generateSessionId();
  });

  // Persist sessions with messages to localStorage (no DB spamming on render)
  useEffect(() => {
    if (!sessions || sessions.length === 0) return;
    try {
      const validSessions = sessions
        .map(normalizeSessionMessages)
        .filter((s) => s.messages && s.messages.length > 0);
      localStorage.setItem(storageKey, JSON.stringify(validSessions));
    } catch (e) {
      console.warn('Could not save sessions to localStorage:', e);
    }
  }, [sessions, storageKey]);

  // Load from backend on user login or switch
  useEffect(() => {
    const token = getToken();
    fetch(`/api/chat/sessions?userId=${userId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.sessions && Array.isArray(data.sessions) && data.sessions.length > 0) {
          const validBackendSessions = data.sessions
            .map(normalizeSessionMessages)
            .filter((s: ChatSession) => s.messages && s.messages.length > 0);
          if (validBackendSessions.length > 0) {
            setSessions(validBackendSessions);
            setActiveSessionId((prev) => {
              if (validBackendSessions.some((s: ChatSession) => s.id === prev)) {
                return prev;
              }
              return validBackendSessions[0].id;
            });
          }
        }
      })
      .catch(() => {});
  }, [userId]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scrollToBottom();
  }, [messages, isTyping, activeSessionId]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleLike = (id: string) => {
    setLikedMessageIds((prev) => ({ ...prev, [id]: !prev[id] }));
    if (dislikedMessageIds[id]) {
      setDislikedMessageIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleToggleDislike = (id: string) => {
    setDislikedMessageIds((prev) => ({ ...prev, [id]: !prev[id] }));
    if (likedMessageIds[id]) {
      setLikedMessageIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const toggleThought = (id: string) => {
    setExpandedThoughts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Create a brand new chat session
  const handleCreateNewSession = () => {
    if (activeSession && (!activeSession.messages || activeSession.messages.length === 0)) {
      setInputQuery('');
      return;
    }
    const existingEmpty = sessions.find((s) => !s.messages || s.messages.length === 0);
    if (existingEmpty) {
      setActiveSessionId(existingEmpty.id);
      setInputQuery('');
      return;
    }
    const newSessionId = generateSessionId();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      preview: 'Start a new conversation...',
      updatedAt: 'Just now',
      timestamp: Date.now(),
      messages: [],
    };

    setSessions((prev) => [newSession, ...prev.filter((s) => s.messages && s.messages.length > 0)]);
    setActiveSessionId(newSessionId);
    setInputQuery('');
  };

  // Delete a session
  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fallback: ChatSession = {
          id: generateSessionId(),
          title: 'New Chat',
          preview: 'Start a new conversation...',
          updatedAt: 'Just now',
          timestamp: Date.now(),
          messages: [],
        };
        setActiveSessionId(fallback.id);
        return [fallback];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });

    const token = getToken();
    fetch(`/api/chat/sessions/${sessionId}?userId=${userId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).catch(() => {});
  };

  // Structured response generator
  const generateContextualResponse = (query: string): ChatMessage => {
    const replyText = generateSmartMentorResponse(query, {
      user,
      careerReadiness,
      skills,
    });

    const thoughtProcess = isThinkMode
      ? `Reasoned for 4.2 seconds using ${selectedModel}. Analyzed academic credentials, career trajectory, and industry market demands.`
      : undefined;

    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text: replyText,
      timestamp: 'Just now',
      thoughtProcess,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery.trim();
    if (!query || isTyping) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    const aiMsgId = `msg-ai-${Date.now()}`;
    const contextual = generateContextualResponse(query);

    // Update active session with user message and updated title if new
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const isFirstUserMsg = s.messages.filter((m) => m.sender === 'user').length === 0;
          const updatedTitle =
            isFirstUserMsg && (s.title === 'New Chat' || s.title === 'New Conversation' || s.title === 'Current Mentor Session')
              ? query.length > 28
                ? `${query.slice(0, 28)}...`
                : query
              : s.title;

          return {
            ...s,
            title: updatedTitle,
            preview: query,
            updatedAt: 'Just now',
            messages: [...s.messages, userMessage],
          };
        }
        return s;
      })
    );

    setInputQuery('');
    setIsTyping(true);

    try {
      const token = getToken();
      // 1. Attempt ultra-fast SSE Streaming for real-time word-by-word typing (<300ms latency)
      const response = await fetch('/api/mentor-chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sessionId: activeSessionId,
          userId,
          message: query,
          history: activeSession ? activeSession.messages : [],
          isThinkMode,
          model:
            selectedModel === 'Grok Beta (Fast)'
              ? 'grok-beta'
              : selectedModel === 'Groq LPU Engine'
              ? 'qwen/qwen3.8-27b'
              : selectedModel === 'Gemini 3.7 Flash'
              ? 'gemini-3.7-flash'
              : 'qwen/qwen3.8-27b',
          studentContext: {
            name: studentName,
            degree: user.degree,
            semester: user.semester,
            gpa: currentGPA,
            careerGoal,
            careerReadiness: readinessScore,
            skills: skills.map((s) => `${s.name} (${s.level}, ${s.percentage}%)`),
            projects: projects.map((p) => `${p.title} (${p.category}, ${p.status})`),
            experiences: experiences.map((e) => `${e.title} at ${e.company} (${e.employmentType || 'Role'})`),
            certifications: certifications.map((c) => `${c.title} (${c.organization})`),
            recentActivities: recentActivities.slice(0, 5).map((a) => `${a.title} ${a.target}`),
            completedMilestones: nextSteps.filter((s) => s.status === 'completed').map((s) => s.title),
          },
        }),
      });

      if (response.ok && response.body) {
        // Insert empty AI message to stream into
        const initialAiMsg: ChatMessage = {
          id: aiMsgId,
          sender: 'ai',
          text: '',
          timestamp: 'Just now',
          thoughtProcess: isThinkMode
            ? `Reasoned for ${studentName} (Semester ${user.semester}, ${careerGoal}) with ${selectedModel}.`
            : undefined,
        };

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                updatedAt: 'Just now',
                timestamp: Date.now(),
                messages: [...s.messages, initialAiMsg],
              };
            }
            return s;
          })
        );
        setIsTyping(false);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
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
                  accumulatedText += data.chunk;
                  const currentText = accumulatedText;
                  setSessions((prev) =>
                    prev.map((s) => {
                      if (s.id === activeSessionId) {
                        return {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === aiMsgId ? { ...m, text: currentText } : m
                          ),
                        };
                      }
                      return s;
                    })
                  );
                } else if (data.error) {
                  if (!accumulatedText.trim()) {
                    accumulatedText = contextual.text;
                    const fallbackText = contextual.text;
                    setSessions((prev) =>
                      prev.map((s) => {
                        if (s.id === activeSessionId) {
                          return {
                            ...s,
                            messages: s.messages.map((m) =>
                              m.id === aiMsgId ? { ...m, text: fallbackText } : m
                            ),
                          };
                        }
                        return s;
                      })
                    );
                  }
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }

        if (!accumulatedText || !accumulatedText.trim()) {
          // If stream ended with no content, supply rich contextual reply
          const fallbackText = contextual.text;
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === activeSessionId) {
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === aiMsgId ? { ...m, text: fallbackText } : m
                  ),
                };
              }
              return s;
            })
          );
        }
      } else {
        // Non-streaming fallback
        const token = getToken();
        const fallbackRes = await fetch('/api/mentor-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            sessionId: activeSessionId,
            userId,
            message: query,
            history: activeSession ? activeSession.messages : [],
            isThinkMode,
            studentContext: {
              name: studentName,
              degree: user.degree,
              semester: user.semester,
              gpa: currentGPA,
              careerGoal,
              careerReadiness: readinessScore,
              skills: skills.map((s) => `${s.name} (${s.level})`),
              projects: projects.map((p) => `${p.title} (${p.category})`),
              experiences: experiences.map((e) => `${e.title} at ${e.company}`),
              certifications: certifications.map((c) => `${c.title} (${c.organization})`),
              recentActivities: recentActivities.slice(0, 5).map((a) => `${a.title} ${a.target}`),
              completedMilestones: nextSteps.filter((s) => s.status === 'completed').map((s) => s.title),
            },
          }),
        });

        let replyText = contextual.text;
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          if (data.text) replyText = data.text;
        }

        const aiReply: ChatMessage = {
          id: aiMsgId,
          sender: 'ai',
          text: replyText,
          timestamp: 'Just now',
          suggestions: contextual.suggestions,
        };

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                preview: replyText.slice(0, 50),
                updatedAt: 'Just now',
                timestamp: Date.now(),
                messages: [...s.messages, aiReply],
              };
            }
            return s;
          })
        );
      }
    } catch (err) {
      console.error('Error in chat streaming, using fallback:', err);
      const fallbackReply: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: contextual.text,
        timestamp: 'Just now',
        suggestions: contextual.suggestions,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            // Check if aiMsgId was already appended
            const exists = s.messages.some((m) => m.id === aiMsgId);
            return {
              ...s,
              preview: contextual.text.slice(0, 50),
              updatedAt: 'Just now',
              timestamp: Date.now(),
              messages: exists
                ? s.messages.map((m) => (m.id === aiMsgId ? { ...m, text: contextual.text } : m))
                : [...s.messages, fallbackReply],
            };
          }
          return s;
        })
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Dynamically calculate grouping based on actual session timestamp
  const getSessionGroup = (ts: number): 'Today' | 'Yesterday' | 'Previous 7 Days' | 'Older' => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOf7Days = startOfToday - 7 * 86400000;

    if (ts >= startOfToday) return 'Today';
    if (ts >= startOfYesterday) return 'Yesterday';
    if (ts >= startOf7Days) return 'Previous 7 Days';
    return 'Older';
  };

  // Filtered sessions for sidebar (only sessions that have at least one message)
  const filteredSessions = sessions
    .filter((s) => s.messages && s.messages.length > 0)
    .filter(
      (s) =>
        s.title.toLowerCase().includes(historySearch.toLowerCase()) ||
        s.preview.toLowerCase().includes(historySearch.toLowerCase())
    );

  const groupedSessions: Record<string, ChatSession[]> = {
    Today: filteredSessions.filter((s) => getSessionGroup(s.timestamp || Date.now()) === 'Today'),
    Yesterday: filteredSessions.filter((s) => getSessionGroup(s.timestamp || 0) === 'Yesterday'),
    'Previous 7 Days': filteredSessions.filter((s) => getSessionGroup(s.timestamp || 0) === 'Previous 7 Days'),
    Older: filteredSessions.filter((s) => getSessionGroup(s.timestamp || 0) === 'Older'),
  };

  // Starter prompt cards
  const starterCards = [
    {
      icon: <FolderGit2 className="h-4 w-4 text-emerald-600" />,
      title: 'Flagship AI Projects',
      subtitle: `Recommended for Semester ${user.semester}`,
      query: `What flagship projects should I build for ${careerGoal}?`,
    },
    {
      icon: <Code2 className="h-4 w-4 text-blue-600" />,
      title: 'Analyze Skill Gaps',
      subtitle: 'Identify priority frameworks',
      query: 'Analyze my skill gaps for ML Engineer',
    },
    {
      icon: <Briefcase className="h-4 w-4 text-amber-600" />,
      title: 'Summer 2026 Internships',
      subtitle: 'Preparation checklist & resume',
      query: 'How can I prepare for summer AI internships?',
    },
    {
      icon: <GraduationCap className="h-4 w-4 text-purple-600" />,
      title: 'Lift Career Readiness',
      subtitle: `Target: ${readinessScore}% → 85%+`,
      query: 'How do I boost my career readiness score to 85%+?',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      id="view-ai-mentor-full"
      className="flex h-[calc(100vh-130px)] min-h-[540px] w-full bg-white rounded-2xl border border-[#8F9CFE]/80 shadow-xs transition-all duration-300 hover:border-[#283593] hover:shadow-[0_12px_28px_rgba(40,53,147,0.12)] hover:bg-white/95 hover:backdrop-blur-md overflow-hidden text-slate-800 font-sans"
    >
      {/* ChatGPT-Style Left Sidebar (Collapsible) */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <>
            {/* Mobile Backdrop */}
            <div
              className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30"
              onClick={() => setIsSidebarOpen(false)}
            />

            <motion.aside
              key="chat-sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 272, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              id="sidebar-chat-history"
              className="absolute inset-y-0 left-0 z-40 md:relative w-64 sm:w-68 shrink-0 bg-[#F9F9FB] border-r border-slate-200/90 flex flex-col min-h-0 overflow-hidden shadow-2xl md:shadow-none"
            >
            {/* Sidebar Top: Campus GPT Header + Collapse & New Chat icons */}
            <div className="p-3 pb-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 px-1">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Campus GPT
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleCreateNewSession}
                  title="New chat"
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition cursor-pointer active:scale-95"
                >
                  <SquarePen className="h-4.5 w-4.5" />
                </button>

                <button
                  onClick={() => setIsSidebarOpen(false)}
                  title="Close sidebar"
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition cursor-pointer active:scale-95"
                >
                  <PanelLeftClose className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-2.5 pb-2 shrink-0">
              <div className="relative flex items-center">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:border-[#283593] focus:ring-1 focus:ring-[#283593] transition"
                />
              </div>
            </div>

            {/* Chat History Group List */}
            <div className="flex-1 overflow-y-auto px-2 space-y-3 pt-1">
              {(Object.keys(groupedSessions) as (keyof typeof groupedSessions)[]).map((groupKey) => {
                const groupList = groupedSessions[groupKey];
                if (groupList.length === 0) return null;

                return (
                  <div key={groupKey} className="space-y-0.5">
                    <span className="px-2 py-1 text-[10px] font-bold text-slate-400 tracking-wider block uppercase">
                      {groupKey}
                    </span>
                    {groupList.map((session) => {
                      const isActive = session.id === activeSessionId;
                      return (
                        <div
                          key={session.id}
                          onClick={() => setActiveSessionId(session.id)}
                          className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 cursor-pointer transition-all duration-200 text-left ${
                            isActive
                              ? 'bg-[#EEF2FF] text-[#283593] font-bold border border-[#C7D2FE]/80 shadow-2xs'
                              : 'text-slate-700 hover:bg-[#F6F8FF] hover:text-[#283593] border border-transparent hover:border-slate-200/80'
                          }`}
                        >
                          <span className="text-xs truncate block leading-tight flex-1 pr-1">
                            {session.title}
                          </span>

                          {/* Delete Session Icon */}
                          <button
                            type="button"
                            title="Delete chat"
                            onClick={(e) => handleDeleteSession(e, session.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 rounded-md hover:bg-slate-200/80 transition shrink-0 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3 text-slate-500 hover:text-rose-600" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {filteredSessions.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">
                  No chats found
                </div>
              )}
            </div>

            {/* Sidebar Footer: User Profile pill */}
            <div className="p-2 border-t border-slate-200/80 shrink-0 bg-[#F9F9FB]">
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-200/50 transition cursor-pointer">
                <div className="h-7 w-7 rounded-full bg-[#1A237E] text-white flex items-center justify-center font-bold text-xs">
                  {studentName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate leading-none">
                    {studentName}
                  </p>
                  <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                    Semester {user.semester} • GPA {currentGPA}
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Campus GPT Main Workspace */}
      <main className="flex-1 flex flex-col min-h-0 bg-white relative">
        {/* Floating Sidebar Toggle (Shown only when sidebar is collapsed) */}
        <AnimatePresence>
          {!isSidebarOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsSidebarOpen(true)}
              title="Open chat sidebar"
              className="absolute top-3.5 left-3.5 z-30 h-8 w-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-xs hover:bg-slate-50 transition cursor-pointer active:scale-95"
            >
              <PanelLeft className="h-4.5 w-4.5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Message Stream Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
        >
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {/* If empty chat, show the clean Welcome Landing Screen */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="text-center py-6 sm:py-8 space-y-4"
              >
                <div className="inline-flex items-center justify-center mb-1">
                  <CampusOSLogo className="w-20 h-20 sm:w-24 sm:h-24" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    What can I help with today, {studentName.split(' ')[0]}?
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Campus GPT • Tailored for {careerGoal}
                  </p>
                </div>

                {/* 4 ChatGPT Prompt Cards (Hidden on Mobile) */}
                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 text-left max-w-2xl mx-auto">
                  {starterCards.map((card, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.05 }}
                      onClick={() => handleSendMessage(card.query)}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition cursor-pointer text-left shadow-2xs group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {card.icon}
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-[#1A237E] transition">
                          {card.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {card.subtitle}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Render Conversation Messages (ChatGPT Style) */}
            {messages.map((msg) => {
              const isAI =
                msg.sender === 'ai' ||
                (msg.sender as string) === 'assistant' ||
                (msg.sender as string) === 'bot' ||
                (msg.sender as string) === 'model' ||
                (msg as any).role === 'assistant' ||
                (msg as any).role === 'model';
              const isLiked = likedMessageIds[msg.id];
              const isDisliked = dislikedMessageIds[msg.id];
              const isThoughtExpanded = expandedThoughts[msg.id];

              if (!isAI) {
                // User Message: Sleek Dark Bubble aligned Right
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex justify-end pt-2"
                  >
                    <div className="bg-[#283593] text-white rounded-2xl px-4 py-2.5 text-xs sm:text-sm max-w-[85%] sm:max-w-xl font-medium leading-relaxed shadow-2xs transition-all duration-200 hover:bg-[#1F297E] hover:shadow-xs hover:-translate-y-0.5">
                      {msg.text}
                    </div>
                  </motion.div>
                );
              }

              // Assistant Message: Clean Markdown Left-aligned
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="flex gap-3 pt-2 text-left group"
                >
                  {/* ChatGPT Sparkle Icon */}
                  <div className="h-7 w-7 rounded-full bg-[#EEF2FF] text-[#283593] border border-[#C7D2FE] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Sparkles className="h-3.5 w-3.5 text-[#283593]" />
                  </div>

                  {/* Body */}
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Collapsible Reasoning Block (ChatGPT o1/o3 style) */}
                    {msg.thoughtProcess && (
                      <div className="pb-1">
                        <button
                          onClick={() => toggleThought(msg.id)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 hover:text-[#283593] bg-[#EEF2FF]/80 hover:bg-[#EEF2FF] border border-[#C7D2FE]/60 rounded-full px-2.5 py-0.5 transition-all duration-200 cursor-pointer"
                        >
                          <Brain className="h-3 w-3 text-[#283593]" />
                          <span>Thought process</span>
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${isThoughtExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>

                        <AnimatePresence>
                          {isThoughtExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 italic leading-relaxed overflow-hidden"
                            >
                              {msg.thoughtProcess}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Markdown Message Text */}
                    <div className="text-xs sm:text-[13.5px] leading-relaxed text-slate-800 space-y-2">
                      <Markdown
                        components={{
                          strong: ({ children }) => (
                            <strong className="font-bold text-slate-900">{children}</strong>
                          ),
                          h1: ({ children }) => (
                            <h3 className="font-bold text-base sm:text-lg text-slate-900 mt-2 mb-1">{children}</h3>
                          ),
                          h2: ({ children }) => (
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 mt-2 mb-1">{children}</h4>
                          ),
                          h3: ({ children }) => (
                            <h5 className="font-bold text-xs sm:text-sm text-slate-900 mt-1.5 mb-0.5">{children}</h5>
                          ),
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="space-y-1 my-1.5 list-disc list-outside pl-4">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="space-y-1 my-1.5 list-decimal list-outside pl-4">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-relaxed pl-0.5">{children}</li>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-[#1A237E] pl-3 py-1 my-2 italic text-xs text-slate-600 bg-slate-50 rounded-r-lg">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children }) => (
                            <code className="bg-slate-100 text-[#1A237E] font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {msg.text}
                      </Markdown>
                    </div>

                    {/* ChatGPT Bottom Action Toolbar: Copy, Like, Dislike, Regenerate */}
                    <div className="flex items-center gap-1 pt-1.5 text-slate-400">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleToggleLike(msg.id)}
                        className={`p-1 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer ${
                          isLiked ? 'text-indigo-600' : ''
                        }`}
                        title="Good response"
                      >
                        <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleToggleDislike(msg.id)}
                        className={`p-1 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer ${
                          isDisliked ? 'text-rose-600' : ''
                        }`}
                        title="Bad response"
                      >
                        <ThumbsDown className={`h-3.5 w-3.5 ${isDisliked ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleSendMessage(messages[messages.length - 2]?.text || 'Regenerate')}
                        className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer"
                        title="Regenerate response"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="flex gap-3 pt-2 text-left"
                >
                  <div className="h-7 w-7 rounded-full bg-[#EEF2FF] text-[#283593] border border-[#C7D2FE] flex items-center justify-center shrink-0 shadow-2xs">
                    <Sparkles className="h-3.5 w-3.5 text-[#283593]" />
                  </div>
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ChatGPT Bottom Pill Input Bar */}
        <div className="shrink-0 px-4 pt-2 pb-3 bg-white border-t border-slate-100 flex flex-col items-center">
          <div className="w-full max-w-3xl">
            <div className="relative flex items-center gap-2 rounded-full border border-slate-300/90 bg-[#FAFBFD] focus-within:bg-white focus-within:border-[#283593] focus-within:ring-2 focus-within:ring-[#EEF2FF] transition-all duration-300 p-1.5 sm:p-2 shadow-2xs hover:border-[#283593] hover:shadow-xs">
              {/* Left Plus/Attachment Button */}
              <button
                type="button"
                onClick={() => setInputQuery((prev) => (prev ? `${prev} ` : 'Analyze my current semester roadmap and '))}
                title="Add context or attachment"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 active:scale-95 transition cursor-pointer shrink-0"
              >
                <Plus className="h-5 w-5" />
              </button>

              {/* Input field */}
              <input
                id="input-ai-mentor-query"
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask anything"
                className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-hidden focus:ring-0 px-1 py-1"
              />

              {/* Right Action Controls: Mic + Blue Action Button */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pr-0.5">
                {/* Mic Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsRecording(!isRecording);
                    if (!isRecording && !inputQuery) {
                      setInputQuery('What flagship projects should I build for AI / ML?');
                    }
                  }}
                  title={isRecording ? 'Listening...' : 'Dictate with voice'}
                  className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center transition cursor-pointer active:scale-95 ${
                    isRecording
                      ? 'bg-rose-100 text-rose-600 animate-pulse ring-2 ring-rose-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  <Mic className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </button>

                {/* Circular Blue Send Button */}
                <button
                  id="btn-submit-ai-query"
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isTyping}
                  title={inputQuery.trim() ? 'Send query' : 'Start voice mode'}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#283593] hover:bg-[#1F297E] active:scale-95 text-white flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer hover:shadow-md"
                >
                  {inputQuery.trim() ? (
                    <ArrowUp className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2.5]" />
                  ) : (
                    <AudioLines className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2.2]" />
                  )}
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-[10.5px] text-slate-400 mt-2 font-normal">
              Campus GPT can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </main>
    </motion.div>
  );
};
