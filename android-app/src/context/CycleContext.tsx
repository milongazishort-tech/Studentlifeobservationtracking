import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ActiveCycle, StartCyclePayload } from '@/types/cycle.types';
import { CycleService } from '@/services/cycle.service';
import { useAuth } from './AuthContext';

interface CycleContextType {
  activeCycle: ActiveCycle | null;
  hasActiveCycle: boolean;
  isCycleLoading: boolean;
  startCycle: (payload: StartCyclePayload) => Promise<ActiveCycle>;
  abandonCycle: (id: string) => Promise<void>;
  reloadCycle: () => Promise<void>;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export const CycleProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [activeCycle, setActiveCycle] = useState<ActiveCycle | null>(null);
  const [isCycleLoading, setIsCycleLoading] = useState<boolean>(true);

  const reloadCycle = useCallback(async () => {
    if (!isAuthenticated) {
      setActiveCycle(null);
      setIsCycleLoading(false);
      return;
    }

    try {
      setIsCycleLoading(true);
      const cycle = await CycleService.getActiveCycle();
      setActiveCycle(cycle);
    } catch (err) {
      console.warn('[CycleProvider] Failed to fetch active cycle:', err);
    } finally {
      setIsCycleLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    reloadCycle();
  }, [reloadCycle]);

  const startCycle = async (payload: StartCyclePayload): Promise<ActiveCycle> => {
    const newCycle = await CycleService.startCycle(payload);
    setActiveCycle(newCycle);
    return newCycle;
  };

  const abandonCycle = async (id: string): Promise<void> => {
    await CycleService.abandonCycle(id);
    setActiveCycle(null);
    await reloadCycle();
  };

  return (
    <CycleContext.Provider
      value={{
        activeCycle,
        hasActiveCycle: !!activeCycle && activeCycle.status === 'active',
        isCycleLoading,
        startCycle,
        abandonCycle,
        reloadCycle,
      }}>
      {children}
    </CycleContext.Provider>
  );
};

export const useCycle = (): CycleContextType => {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error('useCycle must be used within a CycleProvider');
  }
  return context;
};

export default CycleContext;
