import { Link, useLocation } from 'react-router-dom';
import { Settings, Gift, Trophy, Home } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import React from 'react';
import { ToastContainer } from '../ui/ToastContainer';
import { useLotteryStore } from '../../stores/useLotteryStore';
import { useToastStore } from '../../store/toastStore';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { isSpinning, currentDrawer } = useLotteryStore();
  const { addToast } = useToastStore();
  
  // Define when navigation should be locked
  // Lock when spinning OR when a drawer is selected (Phase 2 active)
  const isLocked = isSpinning || (location.pathname === '/lottery' && !!currentDrawer);

  const handleNavClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      addToast('抽奖进行中，请勿离开！', 'warning');
    }
  };
  
  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/lottery', icon: Gift, label: '抽奖' },
    { path: '/result', icon: Trophy, label: '结果' },
    { path: '/settings', icon: Settings, label: '设置' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-zinc-900 relative overflow-hidden font-sans selection:bg-[#FFD000] selection:text-black">
      <ToastContainer />
      
      {/* Pop Mart Style Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          {/* Decorative Circle */}
          <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#FFD000]/10 blur-[80px]" />
          <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] rounded-full bg-[#FF4444]/5 blur-[60px]" />
          
          {/* Grid Pattern (Subtle) */}
          <div className="absolute inset-0 opacity-[0.03]" 
               style={{ 
                   backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
                   backgroundSize: '30px 30px' 
               }} 
          />
      </div>
      
      {/* 导航栏 - Pop Mart Style (Floating Pill - Vertical Right) */}
      <nav className={`fixed right-8 top-1/2 -translate-y-1/2 z-50 bg-white/80 backdrop-blur-md border border-black/5 rounded-full px-3 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 ${isLocked ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100 hover:scale-105'}`}>
        <ul className="flex flex-col items-center gap-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  onClick={handleNavClick}
                  className={cn(
                    "relative group flex flex-col items-center gap-1",
                    isLocked && !isActive ? "cursor-not-allowed" : ""
                  )}
                >
                  <div className={cn(
                    "p-2 transition-all duration-300 relative z-10",
                    isActive ? "text-black transform -translate-x-1" : "text-zinc-400 group-hover:text-black"
                  )}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  
                  {/* Indicator Dot */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FFD000]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <main className="relative z-10 w-full h-screen overflow-y-auto overflow-x-hidden pb-6 md:pb-8 pb-[env(safe-area-inset-bottom)] overscroll-y-contain scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
        {children}
      </main>
    </div>
  );
};
