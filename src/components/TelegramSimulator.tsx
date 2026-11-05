import React, { useState, useRef, useEffect } from 'react';
import { BotState, TelegramMessage, InlineKeyboardButton } from '../types';
import { handleBotInput } from '../botEngine';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Menu,
  Clock,
  Check,
  CheckCheck,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  Calendar,
  BookOpen,
  AlertTriangle,
  Smile,
  ChevronDown,
} from 'lucide-react';

interface Props {
  botState: BotState;
  onUpdateState: (newState: BotState) => void;
  onOpenConnectModal: () => void;
}

export const TelegramSimulator: React.FC<Props> = ({ botState, onUpdateState, onOpenConnectModal }) => {
  const [chatType, setChatType] = useState<'private' | 'group'>('private');
  const [messages, setMessages] = useState<TelegramMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: `👋 *Привет! Я твой Telegram-бот Сратоста группы ${botState.groupName}* 🎓\n\nЯ слежу за расписанием, дедлайнами домашки, дежурствами и долгами.\n\nНажми любую кнопку на клавиатуре ниже или введи команду (например, /today, /dz, /roast):`,
      timestamp: '09:00',
      replyMarkup: {
        inline_keyboard: [
          [
            { text: '📅 Пары сегодня', callback_data: 'cmd_today' },
            { text: '📅 Пары завтра', callback_data: 'cmd_tomorrow' },
          ],
          [
            { text: '📝 Домашка (ДЗ)', callback_data: 'cmd_dz' },
            { text: '🧹 Кто дежурит?', callback_data: 'cmd_duty' },
          ],
          [
            { text: '⚠️ Список долгов', callback_data: 'cmd_debt' },
            { text: '🔥 Роаст от старосты', callback_data: 'cmd_roast' },
          ],
        ],
        keyboard: [
          ['📅 Сегодня', '📅 Завтра', '📝 Домашка'],
          ['🧹 Дежурные', '⚠️ Долги', '💰 Фонд'],
          ['🔥 Роаст', '🧠 Отмазка', 'ℹ️ Помощь'],
        ],
        resize_keyboard: true,
      },
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCommandsDropdown, setShowCommandsDropdown] = useState(false);
  const [showReplyKeyboard, setShowReplyKeyboard] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // AudioContext may be restricted by autoplay policy
    }
  };

  // Send message
  const handleSend = (textToSend?: string) => {
    const raw = (textToSend !== undefined ? textToSend : inputValue).trim();
    if (!raw) return;

    const userMsg: TelegramMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      senderName: chatType === 'group' ? 'Дмитрий (Студент)' : 'Вы',
      text: raw,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setShowCommandsDropdown(false);
    setIsTyping(true);

    // Simulate realistic bot thinking & typing delay
    setTimeout(() => {
      setIsTyping(false);
      const botResponse = handleBotInput(raw, botState, chatType, 'Дмитрий');
      const newBotMsg: TelegramMessage = {
        ...botResponse,
        id: `b-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newBotMsg]);
      playChime();
    }, 450);
  };

  // Handle Inline Button clicks
  const handleInlineClick = (button: InlineKeyboardButton) => {
    if (button.callback_data) {
      if (button.callback_data === 'toggle_week') {
        const nextWeek = botState.currentWeekType === 'numerator' ? 'denominator' : 'numerator';
        onUpdateState({ ...botState, currentWeekType: nextWeek });
        handleSend(`/week`);
        return;
      }
      if (button.callback_data === 'swap_duty') {
        handleSend('Кто теперь дежурный?');
        return;
      }
      if (button.callback_data.startsWith('poll_vote_')) {
        handleSend('Я проголосовал в опросе!');
        return;
      }

      const command = button.callback_data.replace('cmd_', '/');
      handleSend(command);
    } else if (button.url) {
      window.open(button.url, '_blank');
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'm-init',
        sender: 'bot',
        senderName: 'Сратоста Бот',
        text: 'Чат очищен. Нажмите /start для открытия меню.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Formatting helper for telegram markdown (*bold*, _italic_, `code`)
  const formatTelegramText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      // Parse markdown-like tokens in line
      const parts = line.split(/(\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);

      return (
        <div key={lineIdx} className={line === '' ? 'h-2' : 'min-h-[1.25rem]'}>
          {parts.map((part, partIdx) => {
            if (part.startsWith('*') && part.endsWith('*')) {
              return <strong key={partIdx} className="font-semibold">{part.slice(1, -1)}</strong>;
            }
            if (part.startsWith('_') && part.endsWith('_')) {
              return <em key={partIdx} className="italic text-sky-200">{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={partIdx} className="bg-black/30 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-300">
                  {part.slice(1, -1)}
                </code>
              );
            }
            // Link [text](url)
            const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (linkMatch) {
              return (
                <a
                  key={partIdx}
                  href={linkMatch[2]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 underline hover:text-sky-300 inline-flex items-center gap-1"
                >
                  {linkMatch[1]}
                </a>
              );
            }
            return <span key={partIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  // Get active reply keyboard
  const lastBotWithKeyboard = [...messages]
    .reverse()
    .find((m) => m.sender === 'bot' && m.replyMarkup?.keyboard);
  const activeKeyboard = lastBotWithKeyboard?.replyMarkup?.keyboard;

  return (
    <div className="flex flex-col h-[780px] max-h-[85vh] bg-[#0e1621] text-white rounded-2xl shadow-2xl border border-sky-950/60 overflow-hidden">
      {/* Telegram Header */}
      <div className="bg-[#17212b] px-4 py-3 border-b border-sky-900/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg border border-sky-400/30">
              {chatType === 'private' ? (
                <Bot className="w-6 h-6 text-white" />
              ) : (
                <span className="font-bold text-sm tracking-wider">🎓 21</span>
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#17212b] rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-sky-50 flex items-center gap-1.5">
                {chatType === 'private' ? 'Сратоста Бот' : `Группа ${botState.groupName} | Чат`}
                <span className="bg-sky-500/20 text-sky-300 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-sky-400/30">
                  БОТ
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              {chatType === 'private' ? (
                <>
                  <span>@sratosta_bot</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">онлайн</span>
                </>
              ) : (
                <span>28 участников, 4 онлайн • бот на страже</span>
              )}
            </p>
          </div>
        </div>

        {/* Chat Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Switch Chat Type */}
          <div className="bg-[#0e1621] p-0.5 rounded-lg border border-sky-900/50 flex text-xs">
            <button
              onClick={() => setChatType('private')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                chatType === 'private'
                  ? 'bg-sky-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Личка
            </button>
            <button
              onClick={() => setChatType('group')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                chatType === 'group'
                  ? 'bg-sky-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Чат группы
            </button>
          </div>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            className="p-2 text-slate-400 hover:text-white hover:bg-sky-900/30 rounded-lg transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Clear Chat */}
          <button
            onClick={clearChat}
            title="Очистить чат"
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-sky-900/30 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Connect real bot button */}
          <button
            onClick={onOpenConnectModal}
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>В Telegram</span>
          </button>
        </div>
      </div>

      {/* Telegram Chat Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0e1621] via-[#111c27] to-[#0e1621] relative scrollbar-thin scrollbar-thumb-sky-900 scrollbar-track-transparent"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(30, 58, 95, 0.15) 0%, transparent 80%)',
        }}
      >
        {/* Date Divider */}
        <div className="flex justify-center my-2">
          <span className="bg-[#17212b]/80 border border-sky-900/40 text-slate-400 text-xs px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
            Сегодня, {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </span>
        </div>

        {/* Messages List */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              {/* Sender Name in group mode */}
              {!isUser && chatType === 'group' && (
                <span className="text-[11px] font-semibold text-sky-400 ml-2 mb-1 flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  {msg.senderName}
                </span>
              )}
              {isUser && chatType === 'group' && (
                <span className="text-[11px] font-semibold text-amber-400 mr-2 mb-1">
                  {msg.senderName}
                </span>
              )}

              {/* Message Bubble */}
              <div
                className={`relative px-4 py-2.5 rounded-2xl max-w-[88%] sm:max-w-[78%] shadow-md text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#2b5278] text-white rounded-br-sm'
                    : 'bg-[#182533] text-slate-100 rounded-bl-sm border border-sky-900/30'
                }`}
              >
                <div className="space-y-1">{formatTelegramText(msg.text)}</div>

                {/* Timestamp & status */}
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-1 select-none">
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-sky-300 inline" />}
                </div>
              </div>

              {/* Inline Keyboard Buttons */}
              {msg.replyMarkup?.inline_keyboard && (
                <div className="mt-2 space-y-1.5 w-full max-w-[88%] sm:max-w-[78%]">
                  {msg.replyMarkup.inline_keyboard.map((row, rIdx) => (
                    <div key={rIdx} className="flex flex-wrap gap-1.5">
                      {row.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          onClick={() => handleInlineClick(btn)}
                          className="flex-1 min-w-[120px] bg-[#213040] hover:bg-sky-800 text-sky-200 hover:text-white px-3 py-2 rounded-xl text-xs font-medium text-center border border-sky-700/40 hover:border-sky-500 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <span>{btn.text}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-1 px-3 bg-[#182533]/80 rounded-full w-max border border-sky-900/30 animate-pulse">
            <Bot className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            <span>Сратоста печатает...</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Keyboard (Buttons above input) */}
      {showReplyKeyboard && activeKeyboard && activeKeyboard.length > 0 && (
        <div className="bg-[#17212b] px-3 py-2 border-t border-sky-900/40 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Menu className="w-3 h-3 text-sky-400" /> Меню быстрых команд
            </span>
            <button
              onClick={() => setShowReplyKeyboard(false)}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5"
            >
              Свернуть <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5">
            {activeKeyboard.map((row, rIdx) => (
              <div key={rIdx} className="grid grid-flow-col auto-cols-fr gap-1.5">
                {row.map((btnText, bIdx) => (
                  <button
                    key={bIdx}
                    onClick={() => handleSend(btnText)}
                    className="bg-[#242f3d] hover:bg-[#2b5278] active:scale-98 text-slate-200 hover:text-white py-2 px-2 rounded-xl text-xs font-medium text-center border border-sky-900/40 shadow-sm transition-all truncate"
                  >
                    {btnText}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* If keyboard collapsed, show quick toggle bar */}
      {!showReplyKeyboard && (
        <div className="bg-[#17212b] px-4 py-1 border-t border-sky-900/30 flex justify-end">
          <button
            onClick={() => setShowReplyKeyboard(true)}
            className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
          >
            <Menu className="w-3.5 h-3.5" /> Показать кнопки меню
          </button>
        </div>
      )}

      {/* Slash Commands Dropdown Menu */}
      {showCommandsDropdown && (
        <div className="bg-[#17212b] border-t border-sky-900/50 max-h-56 overflow-y-auto p-2 space-y-1 shadow-2xl">
          <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
            Команды бота
          </div>
          {[
            { cmd: '/start', desc: 'Главное меню бота' },
            { cmd: '/today', desc: 'Пары на сегодня с аудиториями и звонками' },
            { cmd: '/tomorrow', desc: 'Расписание на завтра' },
            { cmd: '/week', desc: 'Вся неделя (Числитель / Знаменатель)' },
            { cmd: '/dz', desc: 'Домашние задания и дедлайны' },
            { cmd: '/duty', desc: 'Кто дежурный сегодня' },
            { cmd: '/debt', desc: 'Список долгов и несданных лаб' },
            { cmd: '/fund', desc: 'Фонд группы и сборы' },
            { cmd: '/roast', desc: '🔥 Остроумный роаст от старосты за прогулы' },
            { cmd: '/excuse', desc: '🧠 Генератор отмазок для деканата' },
            { cmd: '/quote', desc: 'Перлы преподавателей и группы' },
            { cmd: '/poll', desc: 'Опрос на явку' },
            { cmd: '/help', desc: 'Справка по всем командам' },
          ].map((item) => (
            <button
              key={item.cmd}
              onClick={() => handleSend(item.cmd)}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#242f3d] flex items-center justify-between text-xs transition-colors group"
            >
              <span className="font-mono font-bold text-sky-400 group-hover:text-sky-300">
                {item.cmd}
              </span>
              <span className="text-slate-400 text-[11px]">{item.desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* Telegram Input Bar */}
      <div className="bg-[#17212b] p-3 border-t border-sky-900/40 flex items-center gap-2 shrink-0">
        <button
          onClick={() => setShowCommandsDropdown(!showCommandsDropdown)}
          className={`p-2 rounded-xl transition-all ${
            showCommandsDropdown
              ? 'bg-sky-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-[#242f3d]'
          }`}
          title="Открыть список команд (/)"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (e.target.value.startsWith('/')) {
                setShowCommandsDropdown(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Напишите команду (/today, /dz, /roast) или сообщение..."
            className="w-full bg-[#242f3d] text-white text-sm px-4 py-2.5 rounded-xl border border-sky-900/40 focus:outline-none focus:border-sky-500 placeholder-slate-500"
          />
        </div>

        <button
          onClick={() => handleSend()}
          disabled={!inputValue.trim()}
          className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
