import React, { useState, useEffect } from 'react';
import { BotState } from './types';
import { INITIAL_BOT_STATE } from './mockData';
import { Navbar, NavTab } from './components/Navbar';
import { TelegramSimulator } from './components/TelegramSimulator';
import { ScheduleManager } from './components/ScheduleManager';
import { HomeworkManager } from './components/HomeworkManager';
import { DutyDebtManager } from './components/DutyDebtManager';
import { FundQuotesManager } from './components/FundQuotesManager';
import { RucSyncModal } from './components/RucSyncModal';
import { AIStudentTools } from './components/AIStudentTools';
import { AmveraExportModal } from './components/AmveraExportModal';
import { TelegramConnectModal } from './components/TelegramConnectModal';

export default function App() {
  const [botState, setBotState] = useState<BotState>(INITIAL_BOT_STATE);
  const [activeTab, setActiveTab] = useState<NavTab>('simulator');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Load state from backend on mount
  useEffect(() => {
    fetch('/api/bot/state')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setBotState(data);
        }
      })
      .catch(() => {
        // use local initial state
      });
  }, []);

  // Sync state changes with backend
  const handleUpdateState = (newState: BotState) => {
    setBotState(newState);
    fetch('/api/bot/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newState),
    }).catch(() => {
      // offline / fallback
    });
  };

  const handleToggleWeek = () => {
    const nextWeek = botState.currentWeekType === 'numerator' ? 'denominator' : 'numerator';
    handleUpdateState({ ...botState, currentWeekType: nextWeek });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        botState={botState}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onToggleWeek={handleToggleWeek}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'simulator' && (
          <div className="max-w-4xl mx-auto">
            <TelegramSimulator
              botState={botState}
              onUpdateState={handleUpdateState}
              onOpenConnectModal={() => setIsConnectModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'schedule' && (
          <ScheduleManager botState={botState} onUpdateState={handleUpdateState} />
        )}

        {activeTab === 'homework' && (
          <HomeworkManager botState={botState} onUpdateState={handleUpdateState} />
        )}

        {activeTab === 'duty_debt' && (
          <DutyDebtManager botState={botState} onUpdateState={handleUpdateState} />
        )}

        {activeTab === 'fund_quotes' && (
          <FundQuotesManager botState={botState} onUpdateState={handleUpdateState} />
        )}

        {activeTab === 'ruc_sync' && (
          <RucSyncModal botState={botState} onUpdateState={handleUpdateState} />
        )}

        {activeTab === 'ai_tools' && (
          <AIStudentTools
            botState={botState}
            onSendToChat={(text) => {
              setActiveTab('simulator');
            }}
          />
        )}

        {activeTab === 'amvera' && <AmveraExportModal botState={botState} />}
      </main>

      {/* Telegram Connection Modal */}
      <TelegramConnectModal
        botState={botState}
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onUpdateState={handleUpdateState}
      />

      {/* Footer */}
      <footer className="bg-slate-950/80 border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Сратоста Бот • Telegram-бот старосты группы {botState.groupName} (
            {botState.university})
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://schedule.ruc.su/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-sky-400 transition-colors"
            >
              Официальный сайт schedule.ruc.su
            </a>
            <span>•</span>
            <button
              onClick={() => setActiveTab('amvera')}
              className="hover:text-emerald-400 transition-colors"
            >
              Деплой на Amvera
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
