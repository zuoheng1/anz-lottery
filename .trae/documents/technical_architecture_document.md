# ANZ 年会扭蛋抽奖系统 - 技术架构文档

## 1. 技术栈选型

- **核心框架**: React 18 + TypeScript + Vite
- **3D 渲染**:
  - `three`: 核心 3D 库
  - `@react-three/fiber`: React 渲染器
  - `@react-three/drei`: 实用组件库 (Environment, OrbitControls, etc.)
  - `@react-three/cannon`: 物理引擎 (用于扭蛋球碰撞模拟)
- **UI & 样式**:
  - `tailwindcss`: 原子化 CSS
  - `framer-motion`: 高级 UI 交互动画
  - `lucide-react`: 图标库
  - `clsx` & `tailwind-merge`: 类名合并
- **状态管理**: `zustand` (轻量级，适合管理抽奖状态和设置)
- **数据处理**: `xlsx` (Excel 文件解析与生成)
- **路由**: `react-router-dom`

## 2. 目录结构

```
src/
├── assets/         # 静态资源 (图片, 音效)
├── components/     # 公共组件
│   ├── ui/         # 基础 UI 组件 (Button, Card, Input)
│   ├── 3d/         # 3D 场景组件 (GashaponMachine, Capsule)
│   └── layout/     # 布局组件
├── hooks/          # 自定义 Hooks
├── pages/          # 页面视图 (Home, Lottery, Settings, Result)
├── stores/         # Zustand 状态存储 (useLotteryStore)
├── types/          # TypeScript 类型定义
├── utils/          # 工具函数 (Excel 导入导出, 随机算法)
└── App.tsx         # 根组件
```

## 3. 核心模块设计

### 3.1 3D 扭蛋机 (Gashapon Machine)
- **物理世界**: 使用 `@react-three/cannon` 创建物理世界。
- **容器**: 透明球体或胶囊状容器，具有静态物理体 (Static Body)。
- **扭蛋球**: 动态物理体 (Dynamic Body)，带有弹性和摩擦力。
- **交互**: 点击手柄 -> 触发物理冲量 (Impulse) 搅动扭蛋球 -> 随机选择一个球体掉落 -> 触发开奖动画。

### 3.2 数据流
- **Store**:
  - `participants`: 参与者列表 [{ id, name, ... }]
  - `prizes`: 奖品列表 (序号 1-N)
  - `winners`: 中奖记录 [{ participantId, prizeId, timestamp }]
  - `isSpinning`: 抽奖状态
- **持久化**: 使用 `zustand/middleware` 的 `persist` 将数据保存到 `localStorage`。

### 3.3 UI 交互
- 使用 `framer-motion` 实现页面进出场动画。
- 按钮 Hover 效果：使用 `whileHover` 和 `whileTap` 属性实现缩放和发光。
- 弹窗动画：中奖结果从屏幕中心弹出，伴随粒子爆发效果。

## 4. 部署方案
- 纯前端静态构建 (`npm run build`)。
- 可部署至 Vercel, Netlify 或任意静态服务器。
