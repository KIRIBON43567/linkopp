import React from 'react';
import { AIDashboardData } from '../types/dashboard';

interface AIDashboardProps {
  data: AIDashboardData;
}

export const AIDashboard: React.FC<AIDashboardProps> = ({ data }) => {
  const { stats, insights } = data;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      {/* 标题 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <span style={{ fontSize: '24px', marginRight: '12px' }}>🤖</span>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#ffffff',
          margin: 0
        }}>
          你的 AI 商务团队今天的工作
        </h2>
      </div>

      {/* 统计数据 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <StatCard
          icon="📊"
          label="探索了"
          value={stats.opportunitiesExplored}
          unit="个潜在机会"
        />
        <StatCard
          icon="💬"
          label="代表你进行了"
          value={stats.conversationsHeld}
          unit="次对话"
        />
        <StatCard
          icon="✅"
          label="发现"
          value={stats.highPriorityMatches}
          unit="个高优先级匹配"
        />
        <StatCard
          icon="📅"
          label="为你安排了"
          value={stats.meetingsScheduled}
          unit="个会议"
        />
      </div>

      {/* AI 洞察 */}
      {insights.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>💡</span>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              margin: 0
            }}>
              AI 洞察
            </h3>
          </div>
          {insights.slice(0, 2).map((insight) => (
            <div
              key={insight.id}
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '8px',
                lineHeight: '1.6'
              }}
            >
              "{insight.description}"
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 统计卡片组件
interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  unit: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, unit }) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <span style={{ fontSize: '24px', marginRight: '12px' }}>{icon}</span>
      <div>
        <div style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '4px'
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#ffffff',
          lineHeight: '1'
        }}>
          {value}
          <span style={{
            fontSize: '14px',
            fontWeight: '400',
            marginLeft: '4px'
          }}>
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
