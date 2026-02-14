export interface UserProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  tags: string[];
  progress: number;
}

export interface MatchProfile {
  id: string;
  agentId?: string; // Agent ID for dispatching
  name: string;
  role: string;
  company: string;
  avatar: string;
  matchScore: number;
  insight: string;
  status: 'new' | 'viewed' | 'connected';
  commonConnections?: number;
  // Details for simulation
  skills?: string[];
  bio?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'agent-a' | 'agent-b';
  text: string;
  timestamp: Date;
  isInsight?: boolean; // Special type for system/insight messages
}

export interface AgentAnalysis {
  satisfaction: number;
  complementary: number;
  willingness: number;
  reason: string;
}

export interface QuickReply {
  id: string;
  text: string;
}
