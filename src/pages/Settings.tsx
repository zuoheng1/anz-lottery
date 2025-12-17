import { useState } from 'react';
import { useLotteryStore } from '../stores/useLotteryStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Trash2, Plus, RefreshCw, CloudDownload } from 'lucide-react';
import { Prize, Participant } from '../types';
import { useToastStore } from '../store/toastStore';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export default function Settings() {
  const { 
    participants, 
    setParticipants, 
    prizes, 
    setPrizes, 
    resetLottery,
    clearWinners
  } = useLotteryStore();

  const { addToast } = useToastStore();
  const [newPrize, setNewPrize] = useState<Partial<Prize>>({ name: '', count: 1 });
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const handleFeishuImport = async () => {
      try {
          addToast('正在重新加载数据...', 'info');
          
          // 2. Load the updated static file
          // Add timestamp to bust cache
          const response = await fetch('/participants_from_feishu.json?t=' + Date.now()); 
          if (!response.ok) {
              throw new Error(`Failed to load Feishu data: ${response.status}`);
          }
          const data: Participant[] = await response.json();
          setParticipants(data);
          
          // Auto-generate prizes based on participant count (One per person)
          // Festive Bright Colors
          const prizeColors = [
            '#FF0000', '#FFD700', '#FFA500', '#FF69B4', '#00FFFF', 
            '#32CD32', '#9370DB', '#FF00FF', '#FF7F50', '#40E0D0'
          ];
          
          const defaultPrizes = Array.from({ length: data.length }).map((_, i) => ({
            id: crypto.randomUUID(),
            name: `${i + 1}`,
            count: 1,
            remaining: 1,
            color: prizeColors[i % prizeColors.length]
          }));
          
          setPrizes(defaultPrizes);
          // Clear previous winners to avoid conflicts with new prize IDs
          clearWinners(); 
          
          addToast(`成功加载 ${data.length} 位参与者，并已重置奖品配置`, 'success');
      } catch (error) {
          console.error('Import failed:', error);
          addToast('加载失败，请查看控制台', 'error');
      }
  };

  const handleAddPrize = () => {
    if (newPrize.name && newPrize.count) {
      const prize: Prize = {
        id: crypto.randomUUID(),
        name: newPrize.name,
        count: Number(newPrize.count),
        remaining: Number(newPrize.count),
      };
      setPrizes([...prizes, prize]);
      setNewPrize({ name: '', count: 1 });
      addToast('奖品添加成功', 'success');
    }
  };

  const handleRemovePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id));
    addToast('奖品已删除', 'info');
  };

  const handleReset = () => {
    setConfirmModal({
        isOpen: true,
        title: '重置抽奖状态',
        description: '确定要重置所有抽奖记录吗？参与者和奖品配置将保留。',
        onConfirm: () => {
            resetLottery();
            addToast('抽奖状态已重置', 'success');
        }
    });
  };

  return (
    <div className="container mx-auto p-8 space-y-8 pb-24 pt-24">
      <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        系统设置
      </h1>
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleReset} className="border-yellow-300 text-yellow-600 hover:bg-yellow-100">
          <RefreshCw className="mr-2 h-4 w-4" />
          重置抽奖状态
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* 参与者设置 */}
        <Card className="bg-white border-2 border-zinc-200 rounded-2xl shadow-md h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">参与者管理</h2>
            <span className="text-zinc-400 text-sm">当前: {participants.length} 人</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={handleFeishuImport} variant="secondary" className="w-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-black border border-zinc-300 shadow">
                <CloudDownload className="mr-2 h-4 w-4" />
                飞书同步
              </Button>
            </div>
            
            <div className="border-2 border-zinc-200 rounded-2xl p-3 space-y-2 bg-white">
              {participants.length === 0 ? (
                <div className="text-center text-zinc-500 py-8">暂无参与者数据</div>
              ) : (
                participants.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        {p.avatar && <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white border border-zinc-300 shadow" />}
                        <span className="font-medium text-black">{p.name}</span>
                    </div>
                    <span className="text-zinc-500 text-sm">{p.department}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* 奖品设置 */}
        <Card className="bg-white border-2 border-zinc-200 rounded-2xl shadow-md h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">奖品配置</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="奖品名称 (如: 1号奖品)" 
                value={newPrize.name}
                onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
              />
              <Input 
                type="number" 
                placeholder="数量" 
                className="w-24"
                value={newPrize.count}
                onChange={(e) => setNewPrize({ ...newPrize, count: Number(e.target.value) })}
              />
              <Button onClick={handleAddPrize} variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {prizes.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-zinc-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-black tracking-widest border border-zinc-300 bg-gradient-to-r from-[#FFD000] via-[#FF924C] to-[#FF4444] text-black">#{p.name}</span>
                    <span className="text-sm text-zinc-500">x {p.count} (剩 {p.remaining})</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemovePrize(p.id)}
                    className="text-red-600 hover:text-red-500 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      
      
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
      />
    </div>
  );
}
