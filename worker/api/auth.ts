import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DB } from '../db/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: number;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

// 注册用户
export async function register(db: DB, data: RegisterRequest): Promise<AuthResponse> {
  const { username, password } = data;

  // 验证输入
  if (!username || username.length < 3) {
    return { success: false, message: '用户名至少需要 3 个字符' };
  }

  if (!password || password.length < 6) {
    return { success: false, message: '密码至少需要 6 个字符' };
  }

  // 检查用户名是否已存在
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').bind(username).get();
  
  if (existingUser) {
    return { success: false, message: '用户名已被使用' };
  }

  // 加密密码
  const passwordHash = await bcrypt.hash(password, 10);

  // 创建用户
  const result = db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)'
  ).bind(username, passwordHash).run();

  if (!result.success) {
    return { success: false, message: '注册失败，请稍后重试' };
  }

  const userId = result.meta!.last_row_id;

  // 创建用户画像
  db.prepare(
    'INSERT INTO user_profiles (user_id, profile_completion) VALUES (?, 0)'
  ).bind(userId).run();

  // 获取用户信息
  const user = db.prepare(
    'SELECT id, username, avatar_url, created_at FROM users WHERE id = ?'
  ).bind(userId).get() as User;

  // 生成 JWT token
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    success: true,
    token,
    user,
  };
}

// 登录用户
export async function login(db: DB, data: LoginRequest): Promise<AuthResponse> {
  const { username, password } = data;

  // 验证输入
  if (!username || !password) {
    return { success: false, message: '请输入用户名和密码' };
  }

  // 查找用户
  const userWithPassword = db.prepare(
    'SELECT id, username, password_hash, avatar_url, created_at FROM users WHERE username = ?'
  ).bind(username).get() as any;

  if (!userWithPassword) {
    return { success: false, message: '用户名或密码错误' };
  }

  // 验证密码
  const isValidPassword = await bcrypt.compare(password, userWithPassword.password_hash);

  if (!isValidPassword) {
    return { success: false, message: '用户名或密码错误' };
  }

  // 移除密码哈希
  const { password_hash, ...user } = userWithPassword;

  // 生成 JWT token
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    success: true,
    token,
    user,
  };
}

// 验证 token
export function verifyToken(token: string): { userId: number; username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { userId: decoded.userId, username: decoded.username };
  } catch (error) {
    return null;
  }
}

// 获取当前用户信息
export function getCurrentUser(db: DB, userId: number): User | null {
  const user = db.prepare(
    'SELECT id, username, avatar_url, created_at FROM users WHERE id = ?'
  ).bind(userId).get() as User | undefined;

  return user || null;
}
