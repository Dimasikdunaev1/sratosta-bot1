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
  HelpCircle,
  FolderGit2,
} from 'lucide-react';

interface Props {
  botState: BotState;
}

export const AmveraExportModal: React.FC<Props> = ({ botState }) => {
  const [activeTab, setActiveTab] = useState<'git' | 'amvera_yml' | 'dockerfile' | 'readme' | 'python'>('git');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const GIT_COMMANDS = `# 1. Инициализируем репозиторий в папке проекта
git init

# 2. Добавляем все файлы проекта (включая amvera.yml и Dockerfile)
git add .

# 3. Делаем первый коммит
git commit -m "feat: Sratosta Telegram Bot with schedule.ruc.su integration"

# 4. Переименовываем ветку в main
git branch -M main

# 5. Привязываем ваш GitHub репозиторий (замените на свой URL)
git remote add origin https://github.com/ВАШ_АККАУНТ/sratosta-bot.git

# 6. Отправляем код на GitHub
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

# Копируем зависимости
COPY package*.json ./
RUN npm install

# Копируем код приложения
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

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "${botState.telegramToken || 'YOUR_BOT_TOKEN_HERE'}")

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

@dp.callback_query()
async def callbacks(callback: types.CallbackQuery):
    data = callback.data
    if data == "today":
        await callback.message.answer("📅 Расписание на сегодня:\\n1 пара (09:00): Сети и телекоммуникации (ауд. 210-ГК)\\n2 пара (10:50): Cisco Packet Tracer\\n3 пара (13:00): Веб-разработка")
    elif data == "dz":
        await callback.message.answer("📝 Актуальные ДЗ:\\n1. Базы данных: Лаба №3 (дедлайн 10.11)\\n2. Сети: OSPF в Packet Tracer (дедлайн 08.11)")
    elif data == "roast":
        await callback.message.answer("⚡ Слышь, ты время видел? Деканат уже точит карандаш на твое отчисление! Бегом на пару!")
    await callback.answer()

async def main():
    print("Бот Сратоста запущен!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-sky-950/80 border border-emerald-800/40 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-400/30 shrink-0">
            <FolderGit2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Подготовка репозитория для GitHub и деплой на Amvera
              </h2>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-500/30">
                Amvera Cloud Ready
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Все необходимые файлы деплоя (<code>amvera.yml</code>, <code>Dockerfile</code>, <code>package.json</code>, <code>README.md</code>) уже сгенерированы и лежат в корне проекта!
            </p>
          </div>
        </div>

        <a
          href="https://amvera.ru"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950 transition-all shrink-0"
        >
          <span>Перейти на amvera.ru</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Step by Step Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center">
            1
          </div>
          <h3 className="font-bold text-white text-sm">Создайте репо на GitHub</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Зайдите на <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-sky-400 underline">github.com/new</a> и создайте репозиторий с именем, например, <code>sratosta-bot</code>.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
            2
          </div>
          <h3 className="font-bold text-white text-sm">Загрузите код через Git</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Скопируйте команды из вкладки «Команды Git» и выполните их в терминале вашего компьютера.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
            3
          </div>
          <h3 className="font-bold text-white text-sm">Запустите в Amvera</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            В Amvera выберите «Создать проект» → «GitHub» → укажите ваш репозиторий. Amvera автоматически подхватит <code>amvera.yml</code>.
          </p>
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
          <span>Команды Git для загрузки</span>
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
          <span>Альтернатива: Python (aiogram)</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="relative bg-[#0d1117] rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <span className="text-slate-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            {activeTab === 'git' && 'Команды терминала bash / cmd'}
            {activeTab === 'amvera_yml' && 'amvera.yml (конфиг Amvera Cloud)'}
            {activeTab === 'dockerfile' && 'Dockerfile (для контейнеров)'}
            {activeTab === 'python' && 'bot.py (Python aiogram 3.x)'}
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

        <pre className="overflow-x-auto text-[11px] leading-relaxed max-h-96 text-slate-300">
          {activeTab === 'git' && GIT_COMMANDS}
          {activeTab === 'amvera_yml' && AMVERA_YML}
          {activeTab === 'dockerfile' && DOCKERFILE}
          {activeTab === 'python' && PYTHON_SCRIPT}
        </pre>
      </div>

      {/* Variables explanation for Amvera */}
      <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3 text-xs">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Какие переменные окружения (Environment Variables) указать в Amvera:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="font-mono text-sky-400 font-bold block mb-1">TELEGRAM_BOT_TOKEN</span>
            <span className="text-slate-400 text-[11px]">
              Токен вашего бота от @BotFather (например: <code>712345678:AAH...</code>).
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="font-mono text-purple-400 font-bold block mb-1">GEMINI_API_KEY</span>
            <span className="text-slate-400 text-[11px]">
              Ключ Google Gemini для генерации остроумных роастов и отмазок от лица старосты.
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="font-mono text-emerald-400 font-bold block mb-1">PORT</span>
            <span className="text-slate-400 text-[11px]">
              Укажите значение <code>3000</code> (соответствует порту в <code>amvera.yml</code>).
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="font-mono text-amber-400 font-bold block mb-1">NODE_ENV</span>
            <span className="text-slate-400 text-[11px]">
              Укажите значение <code>production</code> для оптимальной производительности.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
