import React, { useState } from 'react';
import { BotState } from '../types';
import {
  GitBranch,
  Terminal,
  Copy,
  Check,
  Download,
  ExternalLink,
  Server,
  FileCode,
  ShieldCheck,
  FolderGit2,
  UploadCloud,
  KeyRound,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  botState: BotState;
  onUpdateState?: (newState: BotState) => void;
}

export const AmveraExportModal: React.FC<Props> = ({ botState, onUpdateState }) => {
  const [activeTab, setActiveTab] = useState<'git' | 'amvera_yml' | 'dockerfile' | 'python'>('git');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // GitHub Push State
  const [repoUrl, setRepoUrl] = useState('https://github.com/dimasikdunaev1/sratosta-bot.git');
  const [patToken, setPatToken] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string } | null>(null);

  // Bot Token state
  const [tokenInput, setTokenInput] = useState(botState.telegramToken || '');
  const [tokenSaved, setTokenSaved] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) return;
    try {
      const res = await fetch('/api/telegram/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      const data = await res.json();
      if (onUpdateState) {
        onUpdateState({
          ...botState,
          telegramToken: tokenInput.trim(),
          botUsername: data.botInfo?.username || botState.botUsername,
          isBotRunning: res.ok,
        });
      }
      setTokenSaved(true);
      setTimeout(() => setTokenSaved(false), 3000);
    } catch {
      // offline
    }
  };

  const handleDirectPush = async () => {
    if (!repoUrl.trim()) return;
    setIsPushing(true);
    setPushResult(null);

    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          personalAccessToken: patToken.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPushResult({
          success: false,
          message: data.error || 'Ошибка загрузки в репозиторий',
        });
      } else {
        setPushResult({
          success: true,
          message: data.message || 'Репозиторий успешно отправлен на GitHub!',
        });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        message: err.message || 'Сбой сети при отправке',
      });
    } finally {
      setIsPushing(false);
    }
  };

  const GIT_COMMANDS = `# 1. Локальный коммит уже создан (ветка main)!
# 2. Привяжите ваш удаленный репозиторий GitHub:
git remote add origin ${repoUrl || 'https://github.com/dimasikdunaev1/sratosta-bot.git'}

# 3. Отправьте код на GitHub:
git push -u origin main`;

  const AMVERA_YML = `meta:
  environment: node
  toolchain:
    name: npm
    version: 22

build:
  commands:
    - npm install
    - npm run build

run:
  command: npm start
  containerPort: 3000`;

  const DOCKERFILE = `FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]`;

  const PYTHON_SCRIPT = `import os
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "${botState.telegramToken || tokenInput || 'YOUR_BOT_TOKEN_HERE'}")

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📅 Пары сегодня", callback_data="today"),
         InlineKeyboardButton(text="📅 Пары завтра", callback_data="tomorrow")],
        [InlineKeyboardButton(text="📝 Домашка (ДЗ)", callback_data="dz"),
         InlineKeyboardButton(text="🧹 Кто дежурит?", callback_data="duty")],
        [InlineKeyboardButton(text="⚠️ Долги", callback_data="debt"),
         InlineKeyboardButton(text="🔥 Роаст", callback_data="roast")]
    ])
    await message.answer(
        f"👋 Привет! Я бот-Староста группы ${botState.groupName} 🎓\\n"
        f"Университет: ${botState.university}\\n\\n"
        "Выбери нужный раздел:",
        reply_markup=kb
    )

async def main():
    print("Бот Сратоста запущен!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-sky-950/80 border border-emerald-800/40 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-400/30 shrink-0">
            <FolderGit2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Загрузка на GitHub и деплой на Amvera
              </h2>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-500/30">
                Git Ready
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Локальный репозиторий инициализирован и закоммичен с веткой <code>main</code>. Вы можете загрузить код на GitHub прямо отсюда или скачать архив.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/api/export/archive"
            download="sratosta-bot-full.tar.gz"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Скачать архив (.tar.gz)</span>
          </a>

          <a
            href="https://amvera.ru"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950 transition-all"
          >
            <span>amvera.ru</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Direct GitHub Push Box */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-sky-400" />
            Залить репозиторий на GitHub
          </h3>
          <span className="text-[11px] text-slate-400">
            Ветка: <code className="text-emerald-400 font-bold">main</code>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">
              URL вашего репозитория на GitHub
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/dimasikdunaev1/sratosta-bot.git"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Создайте пустой репозиторий на{' '}
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 underline"
              >
                github.com/new
              </a>{' '}
              и вставьте ссылку сюда.
            </span>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1 flex items-center justify-between">
              <span>Personal Access Token (PAT) GitHub</span>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 underline text-[10px]"
              >
                Создать токен (с галочкой repo) ↗
              </a>
            </label>
            <input
              type="password"
              value={patToken}
              onChange={(e) => setPatToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              GitHub требует токен для записи (вместо пароля аккаунта).
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-slate-400">
            Файлы <code>amvera.yml</code>, <code>Dockerfile</code>, <code>README.md</code> и расписание РУК уже добавлены в коммит.
          </p>

          <button
            onClick={handleDirectPush}
            disabled={isPushing || !repoUrl.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-sky-950 transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isPushing ? 'animate-spin' : ''}`} />
            <span>{isPushing ? 'Отправка на GitHub...' : 'Залить всё на GitHub'}</span>
          </button>
        </div>

        {pushResult && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              pushResult.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {pushResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="font-medium leading-relaxed">{pushResult.message}</span>
          </div>
        )}
      </div>

      {/* Bot Token Configuration Box */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 text-xs">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          Поменять / Настроить Telegram Bot Token
        </h4>
        <p className="text-slate-400">
          Токен бота от{' '}
          <a
            href="https://t.me/BotFather"
            target="_blank"
            rel="noreferrer"
            className="text-sky-400 underline font-semibold"
          >
            @BotFather
          </a>
          . При сохранении он сразу запишется в конфигурацию и запустит опрос Telegram.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Вставьте токен: 712345678:AAH..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleSaveToken}
            disabled={!tokenInput.trim()}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
          >
            {tokenSaved ? 'Сохранено ✅' : 'Сохранить токен'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 flex flex-wrap gap-1 text-xs">
        <button
          onClick={() => setActiveTab('git')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
            activeTab === 'git'
              ? 'bg-sky-600 text-white font-semibold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Команды терминала</span>
        </button>

        <button
          onClick={() => setActiveTab('amvera_yml')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
            activeTab === 'amvera_yml'
              ? 'bg-emerald-600 text-white font-semibold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>amvera.yml</span>
        </button>

        <button
          onClick={() => setActiveTab('dockerfile')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
            activeTab === 'dockerfile'
              ? 'bg-indigo-600 text-white font-semibold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Dockerfile</span>
        </button>

        <button
          onClick={() => setActiveTab('python')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
            activeTab === 'python'
              ? 'bg-amber-600 text-white font-semibold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>bot.py (aiogram 3)</span>
        </button>
      </div>

      {/* Code / Terminal Viewer */}
      <div className="relative bg-[#0d1117] rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <span className="text-slate-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            {activeTab === 'git' && 'Команды git push'}
            {activeTab === 'amvera_yml' && 'amvera.yml'}
            {activeTab === 'dockerfile' && 'Dockerfile'}
            {activeTab === 'python' && 'bot.py'}
          </span>

          <button
            onClick={() => {
              const textMap: Record<string, string> = {
                git: GIT_COMMANDS,
                amvera_yml: AMVERA_YML,
                dockerfile: DOCKERFILE,
                python: PYTHON_SCRIPT,
              };
              handleCopy(textMap[activeTab], activeTab);
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded-lg transition-all"
          >
            {copiedKey === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Скопировать</span>
              </>
            )}
          </button>
        </div>

        <pre className="overflow-x-auto text-[11px] leading-relaxed max-h-80 text-slate-300">
          {activeTab === 'git' && GIT_COMMANDS}
          {activeTab === 'amvera_yml' && AMVERA_YML}
          {activeTab === 'dockerfile' && DOCKERFILE}
          {activeTab === 'python' && PYTHON_SCRIPT}
        </pre>
      </div>
    </div>
  );
};
