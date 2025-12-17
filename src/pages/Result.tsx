import { useLotteryStore } from '../stores/useLotteryStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Download, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToastStore } from '../store/toastStore';

export default function Result() {
  const { winners, participants } = useLotteryStore();
  const { addToast } = useToastStore();

  const handleExport = () => {
    if (winners.length > 0) {
      // Create CSV content
      const headers = ['中奖时间', '姓名', '部门', '奖品'];
      const csvContent = [
        headers.join(','),
        ...winners.map(w => {
            const dept = participants.find(p => p.id === w.participantId)?.department || '';
            return [
                new Date(w.timestamp).toLocaleString(),
                w.participantName,
                dept,
                w.prizeName
            ].map(field => `"${field}"`).join(',');
        })
      ].join('\n');

      // Create download link
      const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ANZ_Lottery_Winners_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('导出成功', 'success');
    } else {
      addToast('暂无中奖数据', 'warning');
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8 pb-24 pt-24">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
          中奖名单
        </h1>
        <Button onClick={handleExport} disabled={winners.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          导出结果
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {winners.map((winner, index) => (
          <motion.div
            key={winner.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative bg-white border-2 border-zinc-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black tracking-widest border border-zinc-300 shadow bg-gradient-to-r from-[#FFD000] via-[#FF924C] to-[#FF4444] text-black">
                #{String(winner.prizeName)}
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white ring-4 ring-white border border-zinc-300 shadow overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {participants.find(p => p.id === winner.participantId)?.avatar ? (
                        <img 
                            src={participants.find(p => p.id === winner.participantId)?.avatar} 
                            alt="avatar" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-2xl font-black text-black">{index + 1}</span>
                    )}
                </div>
                <div className="flex-1">
                  <div className="text-2xl font黑?? leading-tight">{winner.participantName}</div>
                  <div className="text-xs text-zinc-500 mb-1">
                      {participants.find(p => p.id === winner.participantId)?.department || 'Unknown'}
                  </div>
                  <div className="flex items-center gap-2 font-black text-[#FF4444]">
                    <Trophy size={14} />
                    {winner.prizeName}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-zinc-500 text-right">
                {new Date(winner.timestamp).toLocaleTimeString()}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {winners.length === 0 && (
        <div className="text-center py-24 text-zinc-500">
          <Trophy size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-xl">虚位以待，好运即将降临...</p>
        </div>
      )}
    </div>
  );
}
