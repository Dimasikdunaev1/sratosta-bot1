import React, { useState } from 'react';
import { BotState, HomeworkItem } from '../types';
import { Plus, Trash2, CheckCircle2, Circle, Clock, ExternalLink, BookOpen, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  botState: BotState;
  onUpdateState: (newState: BotState) => void;
}

export const HomeworkManager: React.FC<Props> = ({ botState, onUpdateState }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10)
  );
  const [link, setLink] = useState('');
  const [assignedBy, setAssignedBy] = useState('');

  const filteredHw = botState.homeworks.filter((item) => {
    if (filter === 'active') return !item.isCompleted;
    if (filter === 'completed') return item.isCompleted;
    return true;
  });

  const handleToggleDone = (id: string) => {
    const updated = botState.homeworks.map((hw) => {
      if (hw.id === id) {
        const nextState = !hw.isCompleted;
        if (nextState) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
          });
        }
        return { ...hw, isCompleted: nextState };
      }
      return hw;
    });
    onUpdateState({ ...botState, homeworks: updated });
  };

  const handleDelete = (id: string) => {
    const updated = botState.homeworks.filter((hw) => hw.id !== id);
    onUpdateState({ ...botState, homeworks: updated });
  };

  const handleCreate = () => {
    if (!title.trim() || !subject.trim()) return;

    const newHw: HomeworkItem = {
      id: `hw-${Date.now()}`,
      subject,
      title,
      description,
      deadline,
      link: link.trim() || undefined,
      assignedBy: assignedBy.trim() || undefined,
      isCompleted: false,
    };

    onUpdateState({ ...botState, homeworks: [newHw, ...botState.homeworks] });
    setIsModalOpen(false);

    // Reset form
    setTitle('');
    setDescription('');
    setLink('');
  };

  // Distinct subjects for suggestion
  const uniqueSubjects = Array.from(
    new Set([
      ...botState.schedule.map((s) => s.subject),
      ...botState.homeworks.map((h) => h.subject),
    ])
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Домашние задания и Дедлайны
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Студенты видят этот список в Telegram по команде /dz
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Все ({botState.homeworks.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'active' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Активные ({botState.homeworks.filter((h) => !h.isCompleted).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'completed' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Сданные ({botState.homeworks.filter((h) => h.isCompleted).length})
            </button>
          </div>

          <button
            onClick={() => {
              if (uniqueSubjects.length > 0 && !subject) setSubject(uniqueSubjects[0]);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" /> Добавить ДЗ
          </button>
        </div>
      </div>

      {/* Homework Grid */}
      {filteredHw.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/30 rounded-2xl border border-slate-800">
          <Sparkles className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">
            {filter === 'completed' ? 'Пока нет сданных заданий' : 'Все домашние задания выполнены!'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {filter === 'completed'
              ? 'Отмечайте выполненные задания галочкой.'
              : 'Отличная работа! Отдыхайте или добавьте новое задание старосты.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHw.map((item) => {
            const isOverdue =
              !item.isCompleted && new Date(item.deadline).getTime() < Date.now();

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all relative ${
                  item.isCompleted
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleDone(item.id)}
                      className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
                      title={item.isCompleted ? 'Отметить как несданное' : 'Отметить как сданное'}
                    >
                      {item.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 hover:scale-105 transition-transform" />
                      )}
                    </button>

                    <div>
                      <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
                        {item.subject}
                      </span>
                      <h4
                        className={`text-base font-bold mt-0.5 ${
                          item.isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                    {item.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock
                      className={`w-3.5 h-3.5 ${
                        isOverdue ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        isOverdue ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      Дедлайн: {item.deadline} {isOverdue && '(Просрочено!)'}
                    </span>
                  </div>

                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 text-[11px] font-medium underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Материалы / Диск
                    </a>
                  )}

                  {item.assignedBy && (
                    <span className="text-slate-500 text-[11px]">
                      Препод: {item.assignedBy}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Добавить домашнее задание (ДЗ)
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Предмет / Дисциплина
                </label>
                <input
                  type="text"
                  list="subjects-list"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Например: Базы данных"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <datalist id="subjects-list">
                  {uniqueSubjects.map((s, i) => (
                    <option key={i} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Название задания
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Лабораторная работа №3: Индексы"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Подробное описание / Варианты
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Что нужно сделать, какие требования, формулы, номера из задачника..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Дедлайн</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Преподаватель
                  </label>
                  <input
                    type="text"
                    value={assignedBy}
                    onChange={(e) => setAssignedBy(e.target.value)}
                    placeholder="доц. Смирнов А.В."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Ссылка на материалы (Google Drive, Яндекс.Диск, GitHub)
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://yadi.sk/d/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || !subject.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
              >
                Сохранить задание
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
