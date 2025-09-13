import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { 
  Bot, 
  MessageSquare, 
  Plus, 
  Search, 
  Send, 
  Mic, 
  Globe, 
  Bell,
  User,
  LogOut,
  Home,
  FileText,
  Settings
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useAction } from "convex/react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Convex queries and mutations
  const conversations = useQuery(api.conversations.getUserConversations);
  const activeConversation = useQuery(api.conversations.getActiveConversation);
  const messages = useQuery(
    api.messages.getConversationMessages,
    activeConversation ? { conversationId: activeConversation._id } : "skip"
  );
  const schemes = useQuery(api.schemes.getAllSchemes);
  
  const createConversation = useMutation(api.conversations.createConversation);
  const sendMessage = useMutation(api.messages.sendMessage);
  const addAssistantMessage = useMutation(api.messages.addAssistantMessage);
  const setActiveConversation = useMutation(api.conversations.setActiveConversation);
  const aiChat = useAction(api.ai.chatCompletion);

  // Format AI content into clean, safe HTML (no # or * shown, bold labels, bullets)
  function formatAiContentToHtml(raw: string): string {
    if (!raw) return "";

    // 1) Escape HTML
    const escape = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    let s = escape(raw);

    // 2) Remove markdown horizontal rules and excess markers
    s = s.replace(/^\s*[-*_]{3,}\s*$/gm, "");
    s = s.replace(/^\s*#+\s*/gm, ""); // remove headings like ###

    // 3) Bold any existing **text** markers (after escaping, so only visual)
    s = s.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // 4) Convert common bullets to •
    s = s.replace(/^\s*[-*]\s+/gm, "• ");

    // 5) Bold leading labels like "Overview:", "Eligibility:", "Benefits:", "How to Apply:", etc.
    s = s.replace(
      /^(overview|eligibility|benefits|required documents|documents required|how to apply|official links|state-specific notes|tips|disclaimers|coverage|contact|application process)\s*:/gim,
      (m) => `<strong>${m.replace(/:$/i, "")}:</strong>`
    );

    // 6) Also bold numeric section headers like "1) Overview" or "3. Benefits"
    s = s.replace(
      /^(\d+[\).]?\s*)([A-Za-z][^\n:]*)(:)?/gm,
      (_m, num, title, colon) => {
        const label = `${num}<strong>${title.trim()}</strong>${colon ? ":" : ""}`;
        return label;
      }
    );

    // 7) Normalize multiple blank lines
    s = s.replace(/\n{3,}/g, "\n\n");

    // 8) Convert newlines to <br/>
    s = s.replace(/\n/g, "<br/>");

    return s.trim();
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleNewChat = async () => {
    try {
      const conversationId = await createConversation({
        title: "New Conversation"
      });
      toast.success("New conversation started");
    } catch (error) {
      toast.error("Failed to create new conversation");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return;
    if (isSending) return;
    setIsSending(true);
    try {
      await sendMessage({
        conversationId: activeConversation._id,
        content: message,
        language: selectedLanguage
      });

      // Build short context from recent messages + current user message
      const recent: Array<{ role: "system" | "user" | "assistant"; content: string }> =
        (messages ?? []).slice(-12).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })) as Array<{ role: "user" | "assistant"; content: string }>;

      const contextMessages = [
        ...recent,
        { role: "user" as const, content: message.trim() },
      ];

      const result = await aiChat({
        messages: contextMessages,
        language: selectedLanguage,
      });

      if ((result as any)?.success) {
        await addAssistantMessage({
          conversationId: activeConversation._id,
          content: (result as any).content,
          language: selectedLanguage
        });
      } else {
        await addAssistantMessage({
          conversationId: activeConversation._id,
          content:
            "I'm having trouble connecting to the AI right now. Please try again shortly or add an OpenRouter key in Integrations.",
          language: selectedLanguage
        });
      }

      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleVoiceInput = () => {
    if (isSending) return;
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = selectedLanguage === 'te' ? 'te-IN' : 'en-IN';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
      };
      recognition.start();
    } else {
      toast.error("Voice recognition not supported in this browser");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
              <h1 className="font-bold text-lg">Bharat Schemes Assistant</h1>
            </div>
            <Button onClick={handleNewChat} className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {conversations?.map((conv) => (
                <Button
                  key={conv._id}
                  variant={activeConversation?._id === conv._id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => setActiveConversation({ conversationId: conv._id })}
                >
                  <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* User Menu */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.name || user?.email || "User"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <Home className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="font-semibold text-lg">Bharat Schemes Assistant</h2>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="en">English</option>
                    <option value="te">తెలుగు</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {messages?.map((msg) => (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-green-500 text-white'
                          }`}>
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>
                          <div className={`rounded-lg p-3 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-white dark:bg-gray-800 border'
                          }`}>
                            {msg.role === 'assistant' ? (
                              <div
                                className="text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: formatAiContentToHtml(msg.content) }}
                              />
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={selectedLanguage === 'te' ? 'మీ ప్రశ్న టైప్ చేయండి...' : 'Type your question about government schemes...'}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (!isSending) handleSendMessage();
                            }
                          }}
                          className="pr-12"
                          disabled={isSending}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={handleVoiceInput}
                          disabled={isSending}
                        >
                          <Mic className={`w-4 h-4 ${isListening ? 'text-red-500' : ''}`} />
                        </Button>
                      </div>
                      <Button onClick={handleSendMessage} disabled={!message.trim() || isSending}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Welcome Screen */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-2xl">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Bot className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-4">Welcome to Bharat Schemes Assistant</h2>
                  <p className="text-muted-foreground mb-6">
                    Your AI-powered companion for navigating Indian government schemes. 
                    Ask questions in English or Telugu and get personalized recommendations.
                  </p>
                  <Button onClick={handleNewChat} size="lg">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Start Chatting
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}