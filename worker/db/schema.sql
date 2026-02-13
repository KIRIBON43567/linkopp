-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户画像表
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  company_name TEXT,
  role TEXT,
  industry TEXT,
  location TEXT,
  skills TEXT, -- JSON array
  resources TEXT, -- JSON array
  needs TEXT, -- JSON array
  bio TEXT,
  profile_completion INTEGER DEFAULT 0, -- 0-100
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI 对话记录表
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  conversation_type TEXT NOT NULL, -- 'onboarding', 'matching', 'general'
  agent_name TEXT DEFAULT 'AI经纪人',
  messages TEXT NOT NULL, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 匹配请求表
CREATE TABLE IF NOT EXISTS match_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL,
  target_id INTEGER NOT NULL,
  match_score INTEGER, -- 0-100
  agent_conversation TEXT, -- JSON: 双 Agent 对话记录
  ai_insights TEXT, -- JSON: AI 分析结果
  collaboration_analysis TEXT, -- JSON: 协作分析（需求满足度、技能互补性、合作意愿）
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_requester ON match_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_target ON match_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON match_requests(status);

-- Agent 设置表
CREATE TABLE IF NOT EXISTS agent_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  auto_social_enabled INTEGER DEFAULT 0, -- 0=关闭, 1=开启
  daily_limit INTEGER DEFAULT 5, -- 每日自动社交次数上限 (1-10)
  preferences TEXT, -- JSON: 社交偏好（行业、地区、技能等）
  agent_personality TEXT, -- JSON: Agent 个性化设置
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 用户与 Agent 对话记录表
CREATE TABLE IF NOT EXISTS agent_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  messages TEXT NOT NULL, -- JSON array: 对话历史
  context TEXT, -- JSON: 对话上下文（当前状态、意图等）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 自动社交历史记录表
CREATE TABLE IF NOT EXISTS auto_match_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  target_id INTEGER NOT NULL,
  match_request_id INTEGER, -- 关联到 match_requests 表
  match_date DATE NOT NULL, -- 匹配日期（用于统计每日次数）
  success INTEGER DEFAULT 0, -- 0=失败, 1=成功
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (match_request_id) REFERENCES match_requests(id) ON DELETE SET NULL
);

-- 每日社交配额表（用于追踪每日使用情况）
CREATE TABLE IF NOT EXISTS daily_social_quota (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  quota_date DATE NOT NULL, -- 配额日期
  used_count INTEGER DEFAULT 0, -- 已使用次数
  limit_count INTEGER DEFAULT 5, -- 当日限制次数
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, quota_date) -- 每个用户每天只有一条记录
);

-- 创建新索引
CREATE INDEX IF NOT EXISTS idx_agent_settings_user_id ON agent_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id ON agent_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_match_history_user_id ON auto_match_history(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_match_history_date ON auto_match_history(match_date);
CREATE INDEX IF NOT EXISTS idx_daily_social_quota_user_date ON daily_social_quota(user_id, quota_date);
