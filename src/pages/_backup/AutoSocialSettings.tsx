import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function AutoSocialSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState({
    auto_social_enabled: false,
    daily_limit: 5,
    preferences: {
      target_industry: '',
      target_location: ''
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, statusRes] = await Promise.all([
        api.get('/api/auto-social/stats'),
        api.get('/api/agent/status')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (statusRes.data.success && statusRes.data.status.settings) {
        const s = statusRes.data.status.settings;
        setSettings({
          auto_social_enabled: s.auto_social_enabled === 1,
          daily_limit: s.daily_limit || 5,
          preferences: s.preferences ? JSON.parse(s.preferences) : {}
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await api.put('/api/auto-social/settings', settings);
      
      if (response.data.success) {
        alert('设置保存成功！');
        loadData();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const executeNow = async () => {
    if (!confirm('确定要立即执行自动社交吗？')) return;

    try {
      setSaving(true);
      const response = await api.post('/api/auto-social/execute');
      
      if (response.data.success) {
        alert(`成功匹配 ${response.data.matchedCount} 位候选人！`);
        loadData();
      } else {
        alert(response.data.message || '执行失败');
      }
    } catch (error) {
      console.error('Failed to execute auto social:', error);
      alert('执行失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">自动社交设置</h1>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-2xl p-4 border border-blue-500/30">
              <p className="text-sm text-gray-400 mb-1">今日已用</p>
              <p className="text-3xl font-bold text-white">{stats.todayUsed}</p>
              <p className="text-xs text-gray-500 mt-1">/ {stats.todayLimit} 次</p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl p-4 border border-purple-500/30">
              <p className="text-sm text-gray-400 mb-1">总匹配数</p>
              <p className="text-3xl font-bold text-white">{stats.totalMatches}</p>
              <p className="text-xs text-gray-500 mt-1">成功率 {stats.successRate}%</p>
            </div>
          </div>
        )}

        {/* Enable/Disable */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">启用自动社交</h3>
              <p className="text-sm text-gray-400 mt-1">让 Agent 每天自动为你匹配合适的人选</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, auto_social_enabled: !settings.auto_social_enabled })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.auto_social_enabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.auto_social_enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Daily Limit */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">每日匹配次数</h3>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="10"
              value={settings.daily_limit}
              onChange={(e) => setSettings({ ...settings, daily_limit: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-2xl font-bold text-white w-12 text-center">{settings.daily_limit}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">建议设置 3-5 次，保证匹配质量</p>
        </div>

        {/* Preferences */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">匹配偏好</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">目标行业</label>
              <input
                type="text"
                value={settings.preferences.target_industry || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, target_industry: e.target.value }
                })}
                placeholder="例如：投资、科技、教育"
                className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">目标地区</label>
              <input
                type="text"
                value={settings.preferences.target_location || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, target_location: e.target.value }
                })}
                placeholder="例如：北京、上海、深圳"
                className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        {stats?.recentMatches && stats.recentMatches.length > 0 && (
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">最近匹配</h3>
            <div className="space-y-3">
              {stats.recentMatches.slice(0, 5).map((match: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-gray-900/50 rounded-xl p-3">
                  <div>
                    <p className="text-white font-medium">{match.target_username}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(match.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {match.match_score && (
                    <div className="text-right">
                      <p className="text-blue-400 font-bold">{match.match_score}%</p>
                      <p className="text-xs text-gray-500">匹配度</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pb-6">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold rounded-xl py-4 transition-colors"
          >
            {saving ? '保存中...' : '保存设置'}
          </button>

          {settings.auto_social_enabled && (
            <button
              onClick={executeNow}
              disabled={saving || (stats && stats.todayUsed >= stats.todayLimit)}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-semibold rounded-xl py-4 transition-colors"
            >
              {stats && stats.todayUsed >= stats.todayLimit ? '今日配额已用完' : '立即执行匹配'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
