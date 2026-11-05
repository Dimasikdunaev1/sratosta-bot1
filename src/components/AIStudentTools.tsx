import React, { useState } from 'react';
import { BotState } from '../types';
import {
  Flame,
  Brain,
  Sparkles,
  Copy,
  Check,
  Send,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface Props {
  botState: BotState;
  onSendToChat?: (text: string) => void;
}

export const AIStudentTools: React.FC<Props> = ({ botState, onSendToChat }) => {
  const [activeTab, setActiveTab] = useState<'roast' | 'excuse'>('roast');

  // Roast state
  const [roastStudent, setRoastStudent] = useState(
    botState.students[1]?.name || 'Дмитрий'
  );
  const [roastReason, setRoastReason] = useState('Проспал первую пару и не сдал отчет');
  const [roastNotes, setRoastNotes] = useState('Обещал вчера прийти вовремя');
  const [isGeneratingRoast, setIsGeneratingRoast] = useState(false);
  const [generatedRoast, setGeneratedRoast] = useState<string | null>(null);

  // Excuse state
  const [excuseSubject, setExcuseSubject] = useState(
    botState.schedule[0]?.subject || 'Математический анализ'
  );
  const [excuseTeacher, setExcuseTeacher] = useState('проф. Архипов В.Н.');
  const [excuseSituation, setExcuseSituation] = useState('Не успел сделать типовой расчет вовремя');
  const [isGeneratingExcuse, setIsGeneratingExcuse] = useState(false);
  const [generatedExcuse, setGeneratedExcuse] = useState<{ official: string; funny: string } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateRoast = async () => {
    setIsGeneratingRoast(true);
    setGeneratedRoast(null);
    try {
      const res = await fetch('/api/gemini/generate-roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: roastStudent,
          issue: roastReason,
          customNotes: roastNotes,
        }),
      });
      const data = await res.json();
      setGeneratedRoast(data.roast || 'Бегом на пару, староста ждет с журналом!');
    } catch {
      setGeneratedRoast('⚡ Слышь, ты время видел? Деканат уже точит карандаш на твое отчисление! Бегом на пару!');
    } finally {
      setIsGeneratingRoast(false);
    }
  };

  const handleGenerateExcuse = async () => {
    setIsGeneratingExcuse(true);
    setGeneratedExcuse(null);
    try {
      const res = await fetch('/api/gemini/generate-excuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: excuseSubject,
          teacher: excuseTeacher,
          situation: excuseSituation,
        }),
      });
      const data = await res.json();
      setGeneratedExcuse({
        official:
          data.official ||
          `«Уважаемый ${excuseTeacher}, в связи с непредвиденным транспортным коллапсом и сбоем сети я не успел сдать работу в срок. Материал полностью усвоен, готов защитить сегодня!»`,
        funny:
          data.funny ||
          `«Кот лег на методичку и угрожающе мурчал при попытке забрать. Рисковать жизнью не стал!»`,
      });
    } catch {
      setGeneratedExcuse({
        official: `«Уважаемый преподаватель, по техническим причинам задержался, работу доделал и готов защитить!»`,
        funny: `«Обновлял Windows и случайно пересобрал ядро не в ту сторону!»`,
      });
    } finally {
      setIsGeneratingExcuse(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-800/40 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-400/30 shrink-0">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">AI-Ассистент Старосты</h2>
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-purple-500/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Генерация едких студенческих роастов за прогулы и спасительных объяснительных записок для преподавателей.
            </p>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('roast')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'roast'
                ? 'bg-purple-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Роаст студента</span>
          </button>
          <button
            onClick={() => setActiveTab('excuse')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'excuse'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-sky-400" />
            <span>Генератор отмазок</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Roast */}
      {activeTab === 'roast' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Настроить параметры отчитывания
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Кого отчитать?</label>
                <select
                  value={roastStudent}
                  onChange={(e) => setRoastStudent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  {botState.students.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Причина негодования старосты</label>
                <select
                  value={roastReason}
                  onChange={(e) => setRoastReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 mb-2"
                >
                  <option value="Проспал первую пару и не сдал отчет">Проспал первую пару и не сдал отчет</option>
                  <option value="Не сдает лабораторную уже третью неделю">Не сдает лабу третью неделю</option>
                  <option value="Не скинул 200 рублей на подарок куратору">Не скинул на подарок куратору</option>
                  <option value="Ушел с лекции в буфет и пропал">Ушел в буфет и пропал без вести</option>
                  <option value="Сказал что сделает к зачету">«Я выучу в ночь перед зачетом»</option>
                </select>
                <input
                  type="text"
                  value={roastReason}
                  onChange={(e) => setRoastReason(e.target.value)}
                  placeholder="Или введите свою причину..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Дополнительный контекст</label>
                <input
                  type="text"
                  value={roastNotes}
                  onChange={(e) => setRoastNotes(e.target.value)}
                  placeholder="Например: обещал вчера прийти вовремя, сидит онлайн в Доте"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleGenerateRoast}
                disabled={isGeneratingRoast}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-950 transition-all active:scale-98"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingRoast ? 'animate-spin' : ''}`} />
                <span>{isGeneratingRoast ? 'Генерация роаста...' : 'Сгенерировать отчитывание'}</span>
              </button>
            </div>
          </div>

          {/* Generated Result Box */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> Сообщение от Сратосты:
                </span>
                {generatedRoast && (
                  <button
                    onClick={() => handleCopy(generatedRoast, 'roast')}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    {copiedKey === 'roast' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Скопировать</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 min-h-[140px] flex items-center justify-center text-center">
                {isGeneratingRoast ? (
                  <div className="text-xs text-purple-400 flex items-center gap-2 animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Староста формулирует душевную речь...</span>
                  </div>
                ) : generatedRoast ? (
                  <p className="text-sm text-slate-100 font-medium leading-relaxed italic text-left">
                    {generatedRoast}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Нажмите кнопку «Сгенерировать отчитывание», чтобы создать персональный роаст от лица бота Сратосты.
                  </p>
                )}
              </div>
            </div>

            {generatedRoast && onSendToChat && (
              <button
                onClick={() => onSendToChat(generatedRoast)}
                className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-md active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Отправить в чат симулятора</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Excuse */}
      {activeTab === 'excuse' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-sky-400" /> Параметры объяснительной
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Предмет</label>
                <input
                  type="text"
                  value={excuseSubject}
                  onChange={(e) => setExcuseSubject(e.target.value)}
                  placeholder="Математический анализ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Преподаватель</label>
                <input
                  type="text"
                  value={excuseTeacher}
                  onChange={(e) => setExcuseTeacher(e.target.value)}
                  placeholder="проф. Архипов В.Н."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Что случилось?</label>
                <input
                  type="text"
                  value={excuseSituation}
                  onChange={(e) => setExcuseSituation(e.target.value)}
                  placeholder="Проспал, сломался ноутбук, застрял в лифте..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleGenerateExcuse}
                disabled={isGeneratingExcuse}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-950 transition-all active:scale-98"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingExcuse ? 'animate-spin' : ''}`} />
                <span>{isGeneratingExcuse ? 'Придумываем алиби...' : 'Сгенерировать варианты'}</span>
              </button>
            </div>
          </div>

          {/* Excuse Results */}
          <div className="space-y-4">
            {/* Option 1: Official */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400">
                  Вариант 1: Официальный (для препода / деканата)
                </span>
                {generatedExcuse && (
                  <button
                    onClick={() => handleCopy(generatedExcuse.official, 'excuse_off')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'excuse_off' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                {generatedExcuse ? generatedExcuse.official : 'Здесь появится официальная вежливая отмазка...'}
              </p>
            </div>

            {/* Option 2: Funny */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">
                  Вариант 2: Мемный (для чата группы)
                </span>
                {generatedExcuse && (
                  <button
                    onClick={() => handleCopy(generatedExcuse.funny, 'excuse_fun')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'excuse_fun' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                {generatedExcuse ? generatedExcuse.funny : 'Здесь появится забавная мемная отмазка...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
