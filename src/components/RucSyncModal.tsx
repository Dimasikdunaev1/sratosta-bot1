import React, { useState, useEffect } from 'react';
import { BotState, ScheduleItem } from '../types';
import { RucBranch, RucYear, RucGroup } from '../rucParser';
import {
  RefreshCw,
  School,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Users,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  botState: BotState;
  onUpdateState: (newState: BotState) => void;
}

export const RucSyncModal: React.FC<Props> = ({ botState, onUpdateState }) => {
  const [branches, setBranches] = useState<RucBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  const [years, setYears] = useState<RucYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');

  const [groups, setGroups] = useState<RucGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  const [parsedSchedule, setParsedSchedule] = useState<ScheduleItem[]>([]);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load branches on mount
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setIsLoadingBranches(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ruc/branches');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setBranches(data);
        // Default to Головной вуз if found
        const main = data.find((b) => b.name.includes('Головной') || b.name.includes('вуз')) || data[0];
        setSelectedBranch(main.id);
        loadYears(main.id);
      }
    } catch (err: any) {
      setErrorMsg('Не удалось связаться с сервером schedule.ruc.su. Проверьте интернет или повторите попытку.');
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const loadYears = async (branchId: string) => {
    setIsLoadingYears(true);
    setErrorMsg(null);
    setYears([]);
    setGroups([]);
    setParsedSchedule([]);
    try {
      const res = await fetch('/api/ruc/years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId }),
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setYears(data);
        // Pick latest year
        const latest = data[data.length - 1];
        setSelectedYear(latest.id);
        loadGroups(branchId, latest.id);
      }
    } catch (err: any) {
      setErrorMsg('Ошибка получения годов набора с schedule.ruc.su');
    } finally {
      setIsLoadingYears(false);
    }
  };

  const loadGroups = async (branchId: string, yearId: string) => {
    setIsLoadingGroups(true);
    setErrorMsg(null);
    setGroups([]);
    setParsedSchedule([]);
    try {
      const res = await fetch('/api/ruc/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId, yearId }),
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setGroups(data);
        setSelectedGroup(data[0].id);
      }
    } catch (err: any) {
      setErrorMsg('Ошибка получения групп с schedule.ruc.su');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const fetchSchedulePreview = async () => {
    if (!selectedBranch || !selectedYear || !selectedGroup) return;

    setIsLoadingSchedule(true);
    setErrorMsg(null);
    setSyncSuccess(null);
    try {
      const groupName = groups.find((g) => g.id === selectedGroup)?.name || '';
      const res = await fetch('/api/ruc/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranch,
          yearId: selectedYear,
          groupId: selectedGroup,
          groupName,
          syncNow: false,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.schedule)) {
        setParsedSchedule(data.schedule);
        if (data.schedule.length === 0) {
          setErrorMsg('На сайте schedule.ruc.su для этой группы пар на текущую неделю не обнаружено.');
        }
      } else {
        setErrorMsg(data.error || 'Не удалось распарсить расписание');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка соединения');
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const handleApplySync = () => {
    if (parsedSchedule.length === 0) return;

    const groupObj = groups.find((g) => g.id === selectedGroup);
    const branchObj = branches.find((b) => b.id === selectedBranch);

    const updatedState: BotState = {
      ...botState,
      schedule: parsedSchedule,
      groupName: groupObj ? groupObj.name : botState.groupName,
      university: `Российский университет кооперации (${branchObj ? branchObj.name : 'РУК'})`,
    };

    onUpdateState(updatedState);
    setSyncSuccess(`Расписание (${parsedSchedule.length} пар) успешно импортировано в Telegram-бота!`);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-950/80 via-indigo-950/80 to-slate-900 border border-sky-800/40 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-400/30 shrink-0">
            <School className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Синхронизация с расписанием РУК
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Официальный источник
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Прямая выгрузка данных из системы Российского университета кооперации (
              <a
                href="https://schedule.ruc.su/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 underline hover:text-sky-300 inline-flex items-center gap-0.5"
              >
                schedule.ruc.su <ExternalLink className="w-3 h-3" />
              </a>
              ). Бот автоматически получит звонки, аудитории, преподавателей и предметы для вашей группы.
            </p>
          </div>
        </div>

        <button
          onClick={loadBranches}
          disabled={isLoadingBranches}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-all shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBranches ? 'animate-spin' : ''}`} />
          Обновить список филиалов
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {syncSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-medium">{syncSuccess}</span>
          </div>
          <span className="text-[11px] text-emerald-400/80">Проверьте в симуляторе командой /today</span>
        </div>
      )}

      {/* Selectors Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        {/* Branch */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
            <span>1. Филиал РУК</span>
            {isLoadingBranches && <span className="text-[10px] text-sky-400 animate-pulse">Загрузка...</span>}
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              loadYears(e.target.value);
            }}
            disabled={isLoadingBranches || branches.length === 0}
            className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 disabled:opacity-50"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
            <span>2. Год набора</span>
            {isLoadingYears && <span className="text-[10px] text-sky-400 animate-pulse">Загрузка...</span>}
          </label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              loadGroups(selectedBranch, e.target.value);
            }}
            disabled={isLoadingYears || years.length === 0}
            className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 disabled:opacity-50"
          >
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </div>

        {/* Group */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
            <span>3. Учебная группа</span>
            {isLoadingGroups && <span className="text-[10px] text-sky-400 animate-pulse">Загрузка...</span>}
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            disabled={isLoadingGroups || groups.length === 0}
            className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 disabled:opacity-50 font-medium"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={fetchSchedulePreview}
          disabled={isLoadingSchedule || !selectedGroup}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-sky-950 transition-all active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingSchedule ? 'animate-spin' : ''}`} />
          <span>{isLoadingSchedule ? 'Парсинг с schedule.ruc.su...' : 'Загрузить и просмотреть расписание'}</span>
        </button>

        {parsedSchedule.length > 0 && (
          <button
            onClick={handleApplySync}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Применить в бота ({parsedSchedule.length} пар)</span>
          </button>
        )}
      </div>

      {/* Schedule Preview Grid */}
      {parsedSchedule.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">
              Предпросмотр полученных занятий с schedule.ruc.su ({parsedSchedule.length}):
            </span>
            <span>Группа: {groups.find((g) => g.id === selectedGroup)?.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {parsedSchedule.map((p) => {
              const dayNames = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
              return (
                <div
                  key={p.id}
                  className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sky-400">
                      {dayNames[p.dayOfWeek] || 'День'} • {p.pairNumber} пара
                    </span>
                    <span className="bg-sky-500/10 text-sky-300 text-[10px] px-2 py-0.5 rounded-full border border-sky-500/20">
                      {p.type}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm line-clamp-2">{p.subject}</h4>

                  <div className="text-slate-400 space-y-1 text-[11px] pt-1 border-t border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{p.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{p.room}</span>
                    </div>
                    {p.teacher && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>{p.teacher}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
