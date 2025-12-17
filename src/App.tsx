import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Home from './pages/Home';
import Lottery from './pages/Lottery';
import Result from './pages/Result';
import Settings from './pages/Settings';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { useLotteryStore } from './stores/useLotteryStore';
import { useToastStore } from './store/toastStore';
import { Participant } from './types';

// Component to handle auto-loading of Feishu data
const AutoDataLoader = () => {
  const { setParticipants, setPrizes, clearWinners } = useLotteryStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    const loadFeishuData = async () => {
      try {
        // Always try to fetch the latest data from the static JSON file
        // Ensure path handles BASE_URL correctly if needed, but usually public files are at root relative
        const basePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
        // Remove trailing slash from basePath if present to avoid double slash
        const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
        
        const response = await fetch(`${cleanBasePath}/participants_from_feishu.json?t=` + Date.now());
        if (response.ok) {
          const data: Participant[] = await response.json();
          // Force update if we have data, regardless of current state to ensure sync
          if (data.length > 0) {
            // Force absolute URLs for avatars to ensure they work regardless of deployment path
            const processedData = data.map(p => {
              if (p.avatar && p.avatar.startsWith('/')) {
                  // If it's a relative path starting with /, construct a full URL
                  // Using window.location.origin + cleanBasePath
                  return { ...p, avatar: `${window.location.origin}${cleanBasePath}${p.avatar}` };
              }
              return p;
            });

            setParticipants(processedData);
            
            // Auto-generate default prizes based on participants count
            // This ensures we have a default prize setup even on fresh load
            const prizeColors = [
              '#FF0000', '#FFD700', '#FFA500', '#FF69B4', '#00FFFF', 
              '#32CD32', '#9370DB', '#FF00FF', '#FF7F50', '#40E0D0'
            ];
            const defaultPrizes = Array.from({ length: processedData.length }).map((_, i) => ({
              id: crypto.randomUUID(),
              name: `${i + 1}`,
              count: 1,
              remaining: 1,
              color: prizeColors[i % prizeColors.length]
            }));
            // We set default prizes and clear winners to ensure clean state on auto-load
            setPrizes(defaultPrizes);
            clearWinners();
            
            console.log(`Auto-loaded ${processedData.length} participants from Feishu data source`);
          }
        } else {
             console.warn(`Feishu data file not found (Status: ${response.status}). This is normal on first load if script is still running.`);
        }
      } catch (error) {
        console.error('Failed to auto-load Feishu data:', error);
        // Only show toast if it's a critical error preventing usage, otherwise silent fail or console only
        // addToast('自动加载飞书数据失败，请检查设置', 'error');
      }
    };

    loadFeishuData();
  }, [setParticipants, setPrizes, clearWinners, addToast]); // Run once on mount

  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          } 
        />
        <Route 
          path="/lottery" 
          element={
            <PageTransition>
              <Lottery />
            </PageTransition>
          } 
        />
        <Route 
          path="/result" 
          element={
            <PageTransition>
              <Result />
            </PageTransition>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PageTransition>
              <Settings />
            </PageTransition>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, filter: 'blur(10px)' }}
    animate={{ opacity: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, filter: 'blur(10px)' }}
    transition={{ duration: 0.3 }}
    className="h-full"
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AutoDataLoader />
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
