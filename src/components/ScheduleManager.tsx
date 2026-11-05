import React, { useState } from 'react';
import { BotState, ScheduleItem } from '../types';
import { Plus, Trash2, Edit3, Calendar, Clock, MapPin, User, BookOpen, Check } from 'lucide-react';

interface Props {
  botState: BotState;
  onUpdateState: (newState: BotState) => void;
}

const DAYS = [
  { id: 1, name: 'Понедельник', short: 'ПН' },
  { id: 2, name: 'Вторник', short: 'ВТ' },
  { id: 3, name: 'Среда', short: 'СР' },
  { id: 4, name: 'Четверг', short: 'ЧТ' },
  { id: 5, name: 'Пятница', short: 'ПТ' },
  { id: 6, name: 'Суббота', short: 'СБ' },
];

const PAIR_TIMES: Record<number, string> = {
  1: '09:00 - 10:35',
  2: '10:50 - 12:25',
  3: '13:00 - 14:35',
  4: '14:50 - 16:25',
  5: '16:40 - 18:15',
};

const PAIR_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Лекция': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Семинар': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Лабораторная': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  'Зачет': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Консультация': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
};

export const ScheduleManager: React.FC<Props> = ({ botState, onUpdateState }) => {
  const [selectedDay, setSelectedDay] = useState<number>(4); // Default Thursday
  const [filterWeek, setFilterWeek] = useState<'all' | 'numerator' | 'denominator'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Form State
  const [pairNumber, setPairNumber] = useState(1);
  const [subject, setSubject] = useState('');
  const [type, setType] = useState<ScheduleItem['type']>('Лекция');
  const [room, setRoom] = useState('');
  const [teacher, setTeacher] = useState('');
  const [weekType, setWeekType] = useState<ScheduleItem['weekType']>('all');

  const filteredSchedule = botState.schedule.filter((item) => {
    if (item.dayOfWeek !== selectedDay) return false;
    if (filterWeek !== 'all' && item.weekType !== 'all' && item.weekType !== filterWeek) return false;
    return true;
  }).sort((a, b) => a.pairNumber - b.pairNumber);

  const handleOpenAddModal = (itemToEdit?: ScheduleItem) => {
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setPairNumber(itemToEdit.pairNumber);
      setSubject(itemToEdit.subject);
      setType(itemToEdit.type);
      setRoom(itemToEdit.room);
      setTeacher(itemToEdit.teacher);
      setWeekType(itemToEdit.weekType);
    } else {
      setEditingItem(null);
      // Auto pick next pair number
      const existingNumbers = filteredSchedule.map((s) => s.pairNumber);
      const nextNum = [1, 2, 3, 4, 5].find((n) => !existingNumbers.includes(n)) || 1;
      setPairNumber(nextNum);
      setSubject('');
      setType('Лекция');
      setRoom('ауд. 301-ГК');
      setTeacher('');
      setWeekType('all');
    }
    setIsAddModalOpen(true);
  };

  const handleSave = () => {
    if (!subject.trim()) return;

    const time = PAIR_TIMES[pairNumber] || '09:00 - 10:35';

    if (editingItem) {
      const updated = botState.schedule.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              pairNumber,
              time,
              subject,
              type,
              room,
              teacher,
              weekType,
            }
          : item
      );
      onUpdateState({ ...botState, schedule: updated });
    } else {
      const newItem: ScheduleItem = {
        id: `sch-${Date.now()}`,
        dayOfWeek: selectedDay,
        pairNumber,
        time,
        subject,
        type,
        room,
        teacher,
        weekType,
      };
      onUpdateState({ ...botState, schedule: [...botState.schedule, newItem] });
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = botState.schedule.filter((s) => s.id !== id);
    onUpdateState({ ...botState, schedule: updated });
  };

  const toggleCurrentWeekType = () => {
    const next = botState.currentWeekType === 'numerator' ? 'denominator' : 'numerator';
    onUpdateState({ ...botState, currentWeekType: next });
  };

  return (
    <div className="space-y-6">
      {/* Header & Week Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            Расписание занятий группы {botState.groupName}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Все изменения мгновенно синхронизируются с ботом и Telegram
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Текущая неделя:</span>
            <button
              onClick={toggleCurrentWeekType}
              className={`font-semibold px-2 py-0.5 rounded-md transition-all ${
                botState.currentWeekType === 'numerator'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}
            >
              {botState.currentWeekType === 'numerator' ? 'Числитель (нечет)' : 'Знаменатель (чет)'} 🔄
            </button>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" /> Добавить пару
          </button>
        </div>
      </div>

      {/* Days Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {DAYS.map((d) => {
          const isSelected = selectedDay === d.id;
          const count = botState.schedule.filter((s) => s.dayOfWeek === d.id).length;

          return (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`py-3 px-2 rounded-xl text-center border transition-all ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-950 font-bold'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <div className="text-sm font-semibold">{d.short}</div>
              <div className="text-[11px] opacity-80 truncate">{d.name}</div>
              <div className="text-[10px] mt-1 font-mono opacity-60">
                {count} {count === 1 ? 'пара' : count > 4 ? 'пар' : 'пары'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Week Filter Filter Buttons */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="font-medium">
          {DAYS.find((d) => d.id === selectedDay)?.name}: {filteredSchedule.length} занятий
        </span>
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterWeek('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterWeek === 'all' ? 'bg-slate-800 text-white font-medium' : 'hover:text-white'
            }`}
          >
            Все недели
          </button>
          <button
            onClick={() => setFilterWeek('numerator')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterWeek === 'numerator' ? 'bg-indigo-600 text-white font-medium' : 'hover:text-white'
            }`}
          >
            Числитель
          </button>
          <button
            onClick={() => setFilterWeek('denominator')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterWeek === 'denominator' ? 'bg-purple-600 text-white font-medium' : 'hover:text-white'
            }`}
          >
            Знаменатель
          </button>
        </div>
      </div>

      {/* Schedule Cards List */}
      {filteredSchedule.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/30 rounded-2xl border border-slate-800/80">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Пар в этот день нет</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Студенты могут отдыхать или готовиться к лабораторным. Нажмите кнопку «Добавить пару», если появилось расписание.
          </p>
          <button
            onClick={() => handleOpenAddModal()}
            className="mt-4 inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> Добавить пару
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchedule.map((item) => {
            const color = PAIR_TYPE_COLORS[item.type] || PAIR_TYPE_COLORS['Лекция'];

            return (
              <div
                key={item.id}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl shadow-sm transition-all group relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold text-sm flex items-center justify-center font-mono">
                      {item.pairNumber}
                    </span>
                    <div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${color.bg} ${color.text} ${color.border}`}
                    >
                      {item.type}
                    </span>

                    {item.weekType !== 'all' && (
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                        {item.weekType === 'numerator' ? 'Числ' : 'Знам'}
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenAddModal(item)}
                      className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
                      title="Редактировать"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="font-bold text-white text-base group-hover:text-sky-300 transition-colors">
                    {item.subject}
                  </h4>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-medium text-slate-300">{item.room || 'Аудитория уточняется'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{item.teacher || 'Преподаватель'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {editingItem ? 'Редактировать пару' : 'Добавить пару в расписание'}
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Предмет / Дисциплина
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Например: Операционные системы"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Номер пары</label>
                  <select
                    value={pairNumber}
                    onChange={(e) => setPairNumber(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} пара ({PAIR_TIMES[n]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Тип занятия</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Лекция">Лекция</option>
                    <option value="Семинар">Семинар / Практика</option>
                    <option value="Лабораторная">Лабораторная</option>
                    <option value="Зачет">Зачет / Экзамен</option>
                    <option value="Консультация">Консультация</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Аудитория</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="ауд. 418-ВЦ"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Неделя</label>
                  <select
                    value={weekType}
                    onChange={(e) => setWeekType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="all">Каждую неделю</option>
                    <option value="numerator">Только Числитель (нечет)</option>
                    <option value="denominator">Только Знаменатель (чет)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Преподаватель</label>
                <input
                  type="text"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="доц. Иванов И.И."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={!subject.trim()}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
