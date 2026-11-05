import React, { useState } from 'react';
import { BotState, FundItem, QuoteItem } from '../types';
import {
  Coins,
  MessageSquareQuote,
  Plus,
  Trash2,
  Gift,
  Heart,
  TrendingUp,
  Sparkles,
  Calendar,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  botState: BotState;
  onUpdateState: (newState: BotState) => void;
}

export const FundQuotesManager: React.FC<Props> = ({ botState, onUpdateState }) => {
  const [activeTab, setActiveTab] = useState<'fund' | 'quotes'>('fund');

  // New Donation Modal
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [selectedFundId, setSelectedFundId] = useState<string>('');
  const [donorName, setDonorName] = useState('');
  const [donorAmount, setDonorAmount] = useState(200);

  // New Fund Modal
  const [isNewFundModalOpen, setIsNewFundModalOpen] = useState(false);
  const [fundTitle, setFundTitle] = useState('');
  const [fundTarget, setFundTarget] = useState(3000);
  const [fundDeadline, setFundDeadline] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10)
  );

  // New Quote Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [quoteRole, setQuoteRole] = useState<'Преподаватель' | 'Студент' | 'Староста'>('Преподаватель');
  const [quoteSubject, setQuoteSubject] = useState('');
  const [quoteText, setQuoteText] = useState('');

  // Handle donation
  const handleAddDonation = () => {
    if (!donorName.trim() || donorAmount <= 0 || !selectedFundId) return;

    const updated = botState.funds.map((f) => {
      if (f.id === selectedFundId) {
        const nextAmt = f.currentAmount + donorAmount;
        if (nextAmt >= f.targetAmount) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        return {
          ...f,
          currentAmount: nextAmt,
          donors: [
            ...f.donors,
            {
              name: donorName.trim(),
              amount: donorAmount,
              date: new Date().toISOString().slice(0, 10),
            },
          ],
        };
      }
      return f;
    });

    onUpdateState({ ...botState, funds: updated });
    setIsDonateModalOpen(false);
    setDonorName('');
    setDonorAmount(200);
  };

  const handleCreateFund = () => {
    if (!fundTitle.trim() || fundTarget <= 0) return;
    const newFund: FundItem = {
      id: `fund-${Date.now()}`,
      title: fundTitle.trim(),
      targetAmount: fundTarget,
      currentAmount: 0,
      deadline: fundDeadline,
      donors: [],
    };
    onUpdateState({ ...botState, funds: [newFund, ...botState.funds] });
    setIsNewFundModalOpen(false);
    setFundTitle('');
  };

  const handleDeleteFund = (id: string) => {
    onUpdateState({
      ...botState,
      funds: botState.funds.filter((f) => f.id !== id),
    });
  };

  const handleCreateQuote = () => {
    if (!quoteText.trim() || !quoteAuthor.trim()) return;
    const newQuote: QuoteItem = {
      id: `q-${Date.now()}`,
      author: quoteAuthor.trim(),
      role: quoteRole,
      subject: quoteSubject.trim() || undefined,
      text: quoteText.trim(),
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
    onUpdateState({ ...botState, quotes: [newQuote, ...botState.quotes] });
    setIsQuoteModalOpen(false);
    setQuoteText('');
    setQuoteAuthor('');
  };

  const handleDeleteQuote = (id: string) => {
    onUpdateState({
      ...botState,
      quotes: botState.quotes.filter((q) => q.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {activeTab === 'fund' ? (
              <>
                <Coins className="w-5 h-5 text-amber-400" /> Фонд группы и Сборы
              </>
            ) : (
              <>
                <MessageSquareQuote className="w-5 h-5 text-indigo-400" /> Цитатник группы и преподов
              </>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Сборы на день рождения куратора, распечатки и золотые цитаты
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('fund')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'fund'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Сборы ({botState.funds.length})
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'quotes'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Цитаты ({botState.quotes.length})
            </button>
          </div>

          {activeTab === 'fund' ? (
            <button
              onClick={() => setIsNewFundModalOpen(true)}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Новый сбор
            </button>
          ) : (
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Добавить цитату
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Fund */}
      {activeTab === 'fund' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {botState.funds.map((fund) => {
              const percent = Math.min(100, Math.round((fund.currentAmount / fund.targetAmount) * 100));
              const isGoalReached = fund.currentAmount >= fund.targetAmount;

              return (
                <div
                  key={fund.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-md space-y-4 transition-all relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-snug">
                          {fund.title}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          Дедлайн сбора: {fund.deadline}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteFund(fund.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Удалить сбор"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold">
                        {fund.currentAmount} ₽ <span className="text-slate-500 font-normal">/ {fund.targetAmount} ₽</span>
                      </span>
                      <span className={`font-bold ${isGoalReached ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {percent}% {isGoalReached && '🎉 Цель достигнута!'}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isGoalReached
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-amber-500 to-orange-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Donors list preview */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate max-w-[220px]">
                      Сдали ({fund.donors.length}): {fund.donors.map((d) => d.name).slice(0, 3).join(', ')}
                      {fund.donors.length > 3 ? '...' : ''}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedFundId(fund.id);
                        if (botState.students.length > 0) {
                          setDonorName(botState.students[0].name);
                        }
                        setIsDonateModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold text-xs transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Внести взнос
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Quotes */}
      {activeTab === 'quotes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {botState.quotes.map((quote) => {
            const roleBadgeColor =
              quote.role === 'Преподаватель'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : quote.role === 'Староста'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

            return (
              <div
                key={quote.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-md flex flex-col justify-between gap-4 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}
                    >
                      {quote.role} {quote.subject ? `• ${quote.subject}` : ''}
                    </span>

                    <button
                      onClick={() => handleDeleteQuote(quote.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-slate-100 text-sm font-medium italic leading-relaxed">
                    «{quote.text}»
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-slate-300">{quote.author}</span>
                  <span className="text-[11px] text-slate-500">{quote.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Donation Modal */}
      {isDonateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" /> Зафиксировать взнос студента
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Кто сдал</label>
                <input
                  type="text"
                  list="donors-list"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Имя студента"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
                <datalist id="donors-list">
                  {botState.students.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Сумма (₽)</label>
                <input
                  type="number"
                  step="50"
                  value={donorAmount}
                  onChange={(e) => setDonorAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsDonateModalOpen(false)}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
              >
                Отмена
              </button>
              <button
                onClick={handleAddDonation}
                disabled={!donorName.trim() || donorAmount <= 0}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
              >
                Записать взнос
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Fund Modal */}
      {isNewFundModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" /> Создать новый сбор средств
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Название сбора</label>
                <input
                  type="text"
                  value={fundTitle}
                  onChange={(e) => setFundTitle(e.target.value)}
                  placeholder="Подарок на ДР старосте / Бумага"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Целевая сумма (₽)</label>
                  <input
                    type="number"
                    step="500"
                    value={fundTarget}
                    onChange={(e) => setFundTarget(parseInt(e.target.value, 10) || 1000)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Дедлайн</label>
                  <input
                    type="date"
                    value={fundDeadline}
                    onChange={(e) => setFundDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsNewFundModalOpen(false)}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateFund}
                disabled={!fundTitle.trim() || fundTarget <= 0}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
              >
                Создать сбор
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Quote Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5 text-indigo-400" /> Добавить цитату
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Текст цитаты</label>
                <textarea
                  rows={3}
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder="«Кто не сдал отчет до пятницы — тот добровольно моет полы в деканате»"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Автор</label>
                  <input
                    type="text"
                    value={quoteAuthor}
                    onChange={(e) => setQuoteAuthor(e.target.value)}
                    placeholder="доц. Смирнов А.В."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Роль</label>
                  <select
                    value={quoteRole}
                    onChange={(e) => setQuoteRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Преподаватель">Преподаватель</option>
                    <option value="Староста">Староста</option>
                    <option value="Студент">Студент</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Предмет (необязательно)</label>
                <input
                  type="text"
                  value={quoteSubject}
                  onChange={(e) => setQuoteSubject(e.target.value)}
                  placeholder="Базы данных"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateQuote}
                disabled={!quoteText.trim() || !quoteAuthor.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
              >
                Сохранить цитату
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
