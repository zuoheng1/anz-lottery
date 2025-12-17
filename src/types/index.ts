export interface Participant {
  id: string;
  name: string;
  department?: string;
  avatar?: string;
}

export interface Prize {
  id: string;
  name: string;
  count: number; // 总数量
  remaining: number; // 剩余数量
  image?: string;
  description?: string;
  color?: string; // 扭蛋球颜色
}

export interface Winner {
  id: string;
  participantId: string;
  participantName: string;
  prizeId: string;
  prizeName: string;
  timestamp: number;
}

export type AppState = {
  participants: Participant[];
  prizes: Prize[];
  winners: Winner[];
  isSpinning: boolean;
  currentWinner: Winner | null;
  currentDrawer: Participant | null; // The person currently selected to draw a prize
  
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  clearParticipants: () => void;
  
  setPrizes: (prizes: Prize[]) => void;
  updatePrize: (id: string, updates: Partial<Prize>) => void;
  
  addWinner: (winner: Winner) => void;
  clearWinners: () => void;
  
  setIsSpinning: (isSpinning: boolean) => void;
  setCurrentWinner: (winner: Winner | null) => void;
  setCurrentDrawer: (drawer: Participant | null) => void;
  
  resetLottery: () => void;
};
