import React, { useState } from 'react';
import { BotState, Student, DebtItem } from '../types';
import {
  Users,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle,
  RotateCw,
  Award,
  Sparkles,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  botState: BotState;
  onUpdateState: (newState: BotState) => void;
}

export const DutyDebtManager: React.FC<Props> = ({ botState, onUpdateState }) => {
  const [activeTab, setActiveTab] = useState<'duty' | 'debts'>('duty');

  // New Student modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentTg, setNewStudentTg] = useState('');

  // New Debt modal
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtStudent, setDebtStudent] = useState('');
  const [debtSubject, setDebtSubject] = useState('');
  const [debtTask, setDebtTask] = useState('');
  const [debtDeadline, setDebtDeadline] = useState(
    new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10)
  );

  // Rotate Duty
  const handleRotateDuty = () => {
    // Pick the two students with the least dutyCount
    const sorted = [...botState.students].sort((a, b) => a.dutyCount - b.dutyCount);
    if (sorted.length < 2) return;

    const nextPair = [sorted[0].id, sorted[1].id];
    const todayStr = new Date().toISOString().slice(0, 10);

    const updatedStudents = botState.students.map((s) => {
      if (nextPair.includes(s.id)) {
        return { ...s, dutyCount: s.dutyCount + 1 };
      }
      return s;
    });

    const updatedRoster = [
      { date: todayStr, studentIds: nextPair },
      ...botState.dutyRoster.filter((d) => d.date !== todayStr),
    ];

    onUpdateState({
      ...botState,
      students: updatedStudents,
      dutyRoster: updatedRoster,
    });

    confetti({
      particleCount: 50,
      spread: 40,
      origin: { y: 0.6 },
    });
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const newStudent: Student = {
      id: `stud-${Date.now()}`,
      name: newStudentName.trim(),
      telegramUsername: newStudentTg.trim() || undefined,
      dutyCount: 0,
    };
    onUpdateState({ ...botState, students: [...botState.students, newStudent] });
    setNewStudentName('');
    setNewStudentTg('');
    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = (id: string) => {
    onUpdateState({
      ...botState,
      students: botState.students.filter((s) => s.id !== id),
    });
  };

  const handleApproveDebt = (id: string) => {
    const updated = botState.debts.map((d) =>
      d.id === id ? { ...d, status: 'approved' as const } : d
    );
    onUpdateState({ ...botState, debts: updated });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleDeleteDebt = (id: string) => {
    onUpdateState({
      ...botState,
      debts: botState.debts.filter((d) => d.id !== id),
    });
  };

  const handleCreateDebt = () => {
    if (!debtStudent || !debtSubject || !debtTask) return;
    const newDebt: DebtItem = {
      id: `debt-${Date.now()}`,
      studentName: debtStudent,
      subject: debtSubject,
      taskTitle: debtTask,
      deadline: debtDeadline,
      status: 'pending',
    };
    onUpdateState({ ...botState, debts: [newDebt, ...botState.debts] });
    setIsDebtModalOpen(false);
    setDebtTask('');
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentDuty = botState.dutyRoster.find((d) => d.date === todayStr) || botState.dutyRoster[0];
  const dutyStudentNames = currentDuty
    ? currentDuty.studentIds
        .map((id) => botState.students.find((s) => s.id === id)?.name)
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      {/* Header with Tab switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {activeTab === 'duty' ? (
              <>
                <Users className="w-5 h-5 text-sky-400" /> Дежурства и Список группы
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5 text-rose-400" /> Долги и Хвостовки
              </>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Управление составом группы, графиком мытья доски и несданными лабами
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('duty')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'duty'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Дежурные ({dutyStudentNames.length})
            </button>
            <button
              onClick={() => setActiveTab('debts')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'debts'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Долги ({botState.debts.filter((d) => d.status !== 'approved').length})
            </button>
          </div>

          {activeTab === 'duty' ? (
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" /> Добавить студента
            </button>
          ) : (
            <button
              onClick={() => {
                if (botState.students.length > 0 && !debtStudent) {
                  setDebtStudent(botState.students[0].name);
                }
                if (botState.schedule.length > 0 && !debtSubject) {
                  setDebtSubject(botState.schedule[0].subject);
                }
                setIsDebtModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Записать долг
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Duty & Students */}
      {activeTab === 'duty' && (
        <div className="space-y-6">
          {/* Active Duty Spotlight Banner */}
          <div className="bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-sky-800/40 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Назначены на сегодня:
              </span>
              <h3 className="text-lg font-bold text-white">
                {dutyStudentNames.length > 0 ? dutyStudentNames.join(' и ') : 'Никто не назначен'}
              </h3>
              <p className="text-xs text-slate-400">
                Обязанности: помыть доску перед парой, принести маркеры, проветрить кабинет.
              </p>
            </div>

            <button
              onClick={handleRotateDuty}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-sky-950 shrink-0"
            >
              <RotateCw className="w-4 h-4" /> Назначить следующую пару
            </button>
          </div>

          {/* Student Roster Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Список студентов группы ({botState.students.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Сортировка по количеству дежурств
              </span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {botState.students.map((student, idx) => {
                const isCurrentDuty = currentDuty?.studentIds.includes(student.id);

                return (
                  <div
                    key={student.id}
                    className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                      isCurrentDuty ? 'bg-sky-950/30' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs text-slate-500 font-mono">
                        {idx + 1}.
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">
                            {student.name}
                          </span>
                          {isCurrentDuty && (
                            <span className="bg-sky-500/20 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-sky-400/30">
                              ДЕЖУРИТ СЕГОДНЯ
                            </span>
                          )}
                        </div>
                        {student.telegramUsername && (
                          <span className="text-xs text-sky-400 font-mono">
                            {student.telegramUsername}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-200 block">
                          {student.dutyCount} {student.dutyCount === 1 ? 'раз' : 'раза'}
                        </span>
                        <span className="text-[10px] text-slate-500">дежурил</span>
                      </div>

                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Удалить студента"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Debts & Labs */}
      {activeTab === 'debts' && (
        <div className="space-y-4">
          {botState.debts.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/30 rounded-2xl border border-slate-800">
              <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-200">Долгов нет!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Вся группа сдала работы вовремя. Деканат гордится вами!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {botState.debts.map((debt) => {
                const isApproved = debt.status === 'approved';
                const isSubmitted = debt.status === 'submitted';

                return (
                  <div
                    key={debt.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isApproved
                        ? 'bg-slate-900/40 border-slate-800 opacity-60'
                        : isSubmitted
                        ? 'bg-amber-950/20 border-amber-800/40'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {debt.studentName}
                        </span>
                        <span className="text-[11px] text-sky-400 font-semibold uppercase tracking-wider">
                          {debt.subject}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleApproveDebt(debt.id)}
                          disabled={isApproved}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isApproved
                              ? 'text-emerald-500'
                              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                          }`}
                          title={isApproved ? 'Сдано и проверено' : 'Зачесть долг'}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDeleteDebt(debt.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 font-medium">
                      📌 {debt.taskTitle}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>Дедлайн: {debt.deadline}</span>
                      <span
                        className={`font-semibold text-[11px] px-2 py-0.5 rounded-md ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isSubmitted
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isApproved ? 'Сдано ✅' : isSubmitted ? 'На проверке ⏳' : 'Хвост ❌'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Добавить студента в группу</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Фамилия и Имя
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Telegram Username (необязательно)
                </label>
                <input
                  type="text"
                  value={newStudentTg}
                  onChange={(e) => setNewStudentTg(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
              >
                Отмена
              </button>
              <button
                onClick={handleAddStudent}
                disabled={!newStudentName.trim()}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> Записать академический долг
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Студент</label>
                <select
                  value={debtStudent}
                  onChange={(e) => setDebtStudent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  {botState.students.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Предмет</label>
                <input
                  type="text"
                  value={debtSubject}
                  onChange={(e) => setDebtSubject(e.target.value)}
                  placeholder="Математический анализ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Задание / Лаба</label>
                <input
                  type="text"
                  value={debtTask}
                  onChange={(e) => setDebtTask(e.target.value)}
                  placeholder="Лабораторная №2: Бинарные деревья"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Дедлайн сдачи</label>
                <input
                  type="date"
                  value={debtDeadline}
                  onChange={(e) => setDebtDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsDebtModalOpen(false)}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateDebt}
                disabled={!debtTask.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
              >
                Записать долг
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
