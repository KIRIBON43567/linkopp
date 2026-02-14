# LINKOPP 设计系统规范

## 颜色系统

### 主色调
```css
--primary-blue: #2196F3;
--primary-blue-light: #42A5F5;
--primary-blue-dark: #1976D2;
--primary-gradient: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
```

### 辅助色
```css
--secondary-purple: #9C27B0;
--accent-green: #4CAF50;
--accent-orange: #FF9800;
```

### 背景色
```css
/* 浅色模式 */
--bg-primary-light: #FFFFFF;
--bg-secondary-light: #F5F7FA;
--bg-tertiary-light: #E8EEF3;

/* 深色模式 */
--bg-primary-dark: #0A1929;
--bg-secondary-dark: #1A2332;
--bg-tertiary-dark: #2A3441;
```

### 文字色
```css
/* 浅色模式 */
--text-primary-light: #1A1A1A;
--text-secondary-light: #666666;
--text-tertiary-light: #999999;

/* 深色模式 */
--text-primary-dark: #FFFFFF;
--text-secondary-dark: #B0B8C1;
--text-tertiary-dark: #7A8290;
```

### 状态色
```css
--status-online: #4CAF50;
--status-offline: #9E9E9E;
--status-away: #FFC107;
```

## 圆角规范

```css
--radius-sm: 8px;    /* 小按钮、标签 */
--radius-md: 12px;   /* 输入框、小卡片 */
--radius-lg: 16px;   /* 大卡片 */
--radius-xl: 20px;   /* 特大卡片 */
--radius-full: 9999px; /* 圆形元素 */
```

## 间距规范

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
--spacing-2xl: 24px;
--spacing-3xl: 32px;
```

## 字体规范

### 字体家族
```css
--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
```

### 字体大小
```css
--text-xs: 10px;     /* 辅助文字 */
--text-sm: 12px;     /* 次要文字 */
--text-base: 14px;   /* 正文 */
--text-md: 16px;     /* 强调文字 */
--text-lg: 18px;     /* 小标题 */
--text-xl: 20px;     /* 标题 */
--text-2xl: 24px;    /* 大标题 */
--text-3xl: 28px;    /* 特大标题 */
```

### 字重
```css
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 阴影规范

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
--shadow-glow: 0 0 20px rgba(33, 150, 243, 0.4);
```

## 组件规范

### 按钮

#### 主按钮
- 背景：蓝色渐变
- 文字：白色，14-16px，粗体
- 圆角：12px
- 内边距：12px 24px
- 阴影：shadow-md

#### 次按钮
- 背景：白色
- 边框：1px 灰色
- 文字：深色，14-16px，中粗体
- 圆角：12px
- 内边距：12px 24px

### 输入框
- 背景：浅灰色 (#F5F7FA)
- 边框：无或 1px 透明
- 圆角：12px
- 内边距：12px 16px
- 字体：14px，常规

### 卡片
- 背景：白色（浅色模式）/ 深灰蓝（深色模式）
- 圆角：16px
- 内边距：16-20px
- 阴影：shadow-md

### 头像
- 尺寸：48px, 56px, 64px
- 圆角：full (圆形)
- 边框：2px，颜色根据状态

### 标签
- 背景：浅色
- 文字：深色，12px
- 圆角：8px
- 内边距：6px 12px

## 动画规范

```css
--transition-fast: 150ms ease-in-out;
--transition-base: 250ms ease-in-out;
--transition-slow: 350ms ease-in-out;
```

### 常用动画
- 悬停效果：transform scale(1.02)
- 点击效果：transform scale(0.98)
- 淡入淡出：opacity transition
- 滑动：transform translateY/X

## 图标规范

- 风格：线性图标
- 尺寸：16px, 20px, 24px
- 粗细：2px
- 颜色：继承文字色或主色

## 响应式断点

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

## Z-index 层级

```css
--z-base: 0;
--z-dropdown: 10;
--z-sticky: 20;
--z-fixed: 30;
--z-modal-backdrop: 40;
--z-modal: 50;
--z-popover: 60;
--z-tooltip: 70;
```
