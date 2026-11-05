import React, { useState, useEffect } from 'react';
import { BotState } from '../types';
import {
  Share2,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Play,
  Square,
  Send,
  Sparkles,
  Bot,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

interface Props {
  botState: BotState;
  isOpen: boolean;
  onClose: () => void;
  onUpdateState: (newState: BotState) => void;
}

interface TelegramServerStatus {
  isActive: boolean;
  botInfo: { id: number; first_name: string; username?: string } | null;
  lastError: string | null;
  messageCount: number;
  lastActiveTime: string | null;
}

export const TelegramConnectModal: React.FC<Props> = ({
  botState,
  isOpen,
  onClose,
  onUpdateState,
}) => {
  const [tokenInput, setTokenInput] = useState(botState.telegramToken || '');
  const [status, setStatus] = useState<TelegramServerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Test message
  const [testChatId, setTestChatId] = useState('');
  const [testMessage, setTestMessage] = useState(
    '👋 Привет из панели управления Сратоста Бота!'
  );
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Poll status when modal is open
  useEffect(() => {
    if (isOpen) {
      checkStatus();
      const interval = setInterval(checkStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status');
      const data = await res.json();
      setStatus(data);
    } catch {
      // offline
    }
  };

  const handleStartBot = async () => {
    if (!tokenInput.trim()) return;

    setIsLoading(true);
    setStatusError(null);
    try {
      const res = await fetch('/api/telegram/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusError(data.error || 'Ошибка запуска бота');
      } else {
        onUpdateState({
          ...botState,
          telegramToken: tokenInput.trim(),
          botUsername: data.botInfo?.username || botState.botUsername,
          isBotRunning: true,
        });
        checkStatus();
      }
    } catch (err: any) {
      setStatusError(err.message || 'Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopBot = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/telegram/stop', { method: 'POST' });
      onUpdateState({ ...botState, isBotRunning: false });
      checkStatus();
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testChatId.trim()) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/telegram/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: testChatId.trim(),
          text: testMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTestResult(`❌ Ошибка: ${data.error}`);
      } else {
        setTestResult('✅ Сообщение успешно доставлено в Telegram!');
      }
    } catch (err: any) {
      setTestResult(`❌ Ошибка: ${err.message}`);
    } finally {
      setTestSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-400/30">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Подключение к реальному Telegram
              {status?.isActive && (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ONLINE В TELEGRAM
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Подключите токен бота от @BotFather, чтобы бот отвечал в реальных чатах Telegram
            </p>
          </div>
        </div>

        {/* Step Guide */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <h4 className="font-bold text-slate-200">Как получить токен за 1 минуту:</h4>
          <ol className="list-decimal list-inside text-slate-400 space-y-1 leading-relaxed">
            <li>
              Откройте официального бота{' '}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 underline font-semibold inline-flex items-center gap-0.5"
              >
                @BotFather <ExternalLink className="w-3 h-3" />
              </a>{' '}
              в Telegram.
            </li>
            <li>Отправьте команду <code className="text-sky-300 font-mono">/newbot</code>.</li>
            <li>Введите имя бота (например, <i>Сратоста ИВТ-21</i>) и юзернейм (например, <i>sratosta_group_bot</i>).</li>
            <li>Скопируйте выданный HTTP API Token и вставьте в поле ниже.</li>
          </ol>
        </div>

        {/* Token Input & Launch */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            Telegram Bot Token
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
            />

            {status?.isActive ? (
              <button
                onClick={handleStopBot}
                disabled={isLoading}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Остановить</span>
              </button>
            ) : (
              <button
                onClick={handleStartBot}
                disabled={isLoading || !tokenInput.trim()}
                className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Запустить</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Error Display */}
        {statusError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusError}</span>
          </div>
        )}

        {/* Live Bot Card if Active */}
        {status?.isActive && status.botInfo && (
          <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  {status.botInfo.first_name}
                </h4>
                <a
                  href={`https://t.me/${status.botInfo.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 underline font-mono text-xs inline-flex items-center gap-1"
                >
                  @{status.botInfo.username} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="text-right">
              <span className="text-emerald-400 font-bold block">
                Обработано сообщений: {status.messageCount}
              </span>
              <span className="text-[10px] text-slate-400">
                Long Polling активен
              </span>
            </div>
          </div>
        )}

        {/* Test Message Form */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300">
            Отправить тестовое сообщение в Telegram
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
              placeholder="Ваш Chat ID (напр. 12345678)"
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
            />
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Текст сообщения..."
              className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Узнать свой Chat ID можно у бота <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-sky-400 underline">@userinfobot</a>
            </span>
            <button
              onClick={handleSendTestMessage}
              disabled={testSending || !testChatId.trim() || !status?.isActive}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-sky-400 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testSending ? 'Отправка...' : 'Отправить тест'}</span>
            </button>
          </div>

          {testResult && (
            <div className="text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
