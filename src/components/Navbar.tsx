import React from 'react';
import { BotState } from '../types';
import {
  MessageSquare,
  Calendar,
  BookOpen,
  Users,
  Coins,
  School,
  Brain,
  FolderGit2,
  Share2,
  Bot,
  Zap,
} from 'lucide-react';

export type NavTab =
  | 'simulator'
  | 'schedule'
  | 'homework'
  | 'duty_debt'
  | 'fund_quotes'
  | 'ruc_sync'
  | 'ai_tools'
  | 'amvera';

interface TabItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: string;
}

interface Props {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  botState: BotState;
  onOpenConnectModal: () => void;
  onToggleWeek: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  botState,
  onOpenConnectModal,
  onToggleWeek,
}) => {
  const tabs: TabItem[] = [
    { id: 'simulator', label: 'TG Симулятор', icon: MessageSquare },
    { id: 'schedule', label: 'Расписание', icon: Calendar },
    { id: 'homework', label: 'Домашка', icon: BookOpen },
    { id: 'duty_debt', label: 'Дежурные & Долги', icon: Users },
    { id: 'fund_quotes', label: 'Фонд & Цитаты', icon: Coins },
    { id: 'ruc_sync', label: 'Синхронизация РУК', icon: School, highlight: true },
    { id: 'ai_tools', label: 'AI Староста', icon: Brain },
    { id: 'amvera', label: 'GitHub & Amvera', icon: FolderGit2, badge: 'Деплой' },
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top row */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Group */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-sky-950/60 border border-sky-400/30 shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5">
                  Сратоста <span className="text-sky-400">Бот</span>
                </h1>
                <span className="bg-sky-500/20 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-400/30">
                  {botState.groupName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-sm">
                {botState.university}
              </p>
            </div>
          </div>

          {/* Quick status controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Week Toggle */}
            <button
              onClick={onToggleWeek}
              title="Нажмите для переключения недели"
              className="hidden sm:flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300 transition-all font-medium"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {botState.currentWeekType === 'numerator' ? 'Числитель (нечет)' : 'Знаменатель (чет)'}
              </span>
            </button>

            {/* Telegram Connection Button */}
            <button
              onClick={onOpenConnectModal}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 border ${
                botState.isBotRunning
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                  : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-500'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{botState.isBotRunning ? 'Telegram: Online' : 'Подключить TG'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Scrollable on mobile) */}
        <nav className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as NavTab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  isActive
                    ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800/80'
                } ${tab.highlight ? 'ring-1 ring-emerald-500/30' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
