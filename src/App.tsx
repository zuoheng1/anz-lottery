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
  const { setParticipants } = useLotteryStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    const loadFeishuData = async () => {
      try {
        // Always try to fetch the latest data from the static JSON file
        const response = await fetch('/participants_from_feishu.json?t=' + Date.now());
        if (response.ok) {
          const data: Participant[] = await response.json();
          // Only update if data is different or empty
          if (data.length > 0) {
            setParticipants(data);
            console.log(`Auto-loaded ${data.length} participants from Feishu data source`);
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
  }, [setParticipants, addToast]); // Run once on mount

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
