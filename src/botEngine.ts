import { BotState, TelegramMessage, InlineKeyboardButton } from './types';

const DAYS_NAMES = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

const ROASTS = [
  '⚡ Слышь, ты время видел? Деканат уже приготовил тебе персональный бланк на отчисление. Бегом на пару!',
  '😴 Проснулся в 13:00? Молодец, теперь твоя специальность — профессиональный диванолог с отличием.',
  '🚨 Староста предупреждает: если не сдашь лабу до пятницы, я лично приду к тебе во сне с конспектом по матанализу!',
  '📉 Твой средний балл сейчас настолько стремительно падает, что его зафиксировали сейсмологи Камчатки.',
  '☕ Ты думаешь, стипендия сама себя на карту переведет? Препод уже забыл твою фамилию, а староста тебя ищет с собаками!',
  '💡 "Я сделаю это завтра" — девиз человека, который в декабре будет ночевать под дверью кафедры в слезах.',
];

const EXCUSES = [
  '🤒 «Внезапно обострилась аллергия на нечетные интегралы и ранние подъемы, восстанавливаю чакры дома».',
  '💻 «Обновлялся Windows/Arch Linux и случайно пересобрал ядро не в ту сторону, выхожу как только скомпилируется».',
  '🚌 «Водитель автобуса №42 решил срезать через другое измерение, застряли между остановками "Надежда" и "Реальность"».',
  '🐈 «Кот лег на методичку и угрожающе мурчал при попытке забрать. Рисковать жизнью не стал».',
  '🔑 «Заело замок в общежитии, комендант ушла пить чай с плюшками, жду спасателей МЧС».',
  '🌐 «Делал домашку всю ночь, но интернет отключили хакеры из Пентагона, чтобы скрыть мой гениальный код».',
];

export function handleBotInput(
  rawInput: string,
  state: BotState,
  chatType: 'private' | 'group' = 'private',
  userName: string = 'Студент'
): Omit<TelegramMessage, 'id' | 'timestamp'> {
  const text = rawInput.trim();
  const lower = text.toLowerCase();

  // 1. /start
  if (lower === '/start' || lower === 'старт' || lower === 'меню') {
    const welcome = `👋 *Привет, ${userName}! Я бот-Староста (Сратоста) группы ${state.groupName}* 🎓\n\nЯ слежу за тем, чтобы вас не отчислили, напоминаю про пары, домашку, дежурства и собираю дань на подарок куратору.\n\nТекущая неделя: *${state.currentWeekType === 'numerator' ? 'Числитель (нечетная)' : 'Знаменатель (четная)'}*\n\nВыбери нужный раздел на кнопках ниже или напиши команду:`;
    
    return {
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: welcome,
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
            { text: '⚠️ Список должников', callback_data: 'cmd_debt' },
            { text: '💰 Фонд группы', callback_data: 'cmd_fund' },
          ],
          [
            { text: '🔥 Роаст от старосты', callback_data: 'cmd_roast' },
            { text: '🧠 Отмазка для деканата', callback_data: 'cmd_excuse' },
          ],
          [
            { text: '📖 Цитата дня', callback_data: 'cmd_quote' },
            { text: '📊 Опрос в чат', callback_data: 'cmd_poll' },
          ],
        ],
        keyboard: [
          ['📅 Сегодня', '📅 Завтра', '📝 Домашка'],
          ['🧹 Дежурные', '⚠️ Долги', '💰 Фонд'],
          ['🔥 Роаст', '🧠 Отмазка', 'ℹ️ Помощь'],
        ],
        resize_keyboard: true,
      },
    };
  }

  // 2. /help or Помощь
  if (lower === '/help' || lower.includes('помощь') || lower.includes('команды')) {
    const helpText = `📋 *Список команд Сратоста Бота:*\n\n` +
      `• /today или *📅 Сегодня* — расписание на текущий день\n` +
      `• /tomorrow или *📅 Завтра* — расписание на завтра\n` +
      `• /week — полное расписание на неделю\n` +
      `• /dz или *📝 Домашка* — актуальные задания и дедлайны\n` +
      `• /duty или *🧹 Дежурные* — кто сегодня дежурит и убирает доску\n` +
      `• /debt или *⚠️ Долги* — список хвостов и несданных лаб\n` +
      `• /fund или *💰 Фонд* — статус сбора денег группы\n` +
      `• /roast или *🔥 Роаст* — староста промоет мозги за прогулы\n` +
      `• /excuse или *🧠 Отмазка* — отмазка для преподавателя\n` +
      `• /quote — перлы преподавателей и группы\n` +
      `• /poll — опрос на явку`;

    return {
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: helpText,
      replyMarkup: {
        inline_keyboard: [
          [{ text: '📅 Сегодня', callback_data: 'cmd_today' }, { text: '📝 Домашка', callback_data: 'cmd_dz' }],
          [{ text: '🔥 Роаст меня!', callback_data: 'cmd_roast' }],
        ],
      },
    };
  }

  // 3. /today or Сегодня
  if (lower === '/today' || lower === 'сегодня' || lower.includes('сегодня') || lower.includes('пары сегодня')) {
    const todayNum = new Date().getDay(); // 0 is Sun, 1-6 Mon-Sat
    const day = todayNum === 0 ? 1 : todayNum; // If Sun, show Mon
    const dayName = DAYS_NAMES[day];
    
    const items = state.schedule.filter(
      (s) => s.dayOfWeek === day && (s.weekType === 'all' || s.weekType === state.currentWeekType)
    ).sort((a, b) => a.pairNumber - b.pairNumber);

    if (items.length === 0) {
      return {
        sender: 'bot',
        senderName: 'Сратоста Бот',
        text: `🎉 *На ${dayName} пар нет!* Можно спать или ботать долги.`,
        replyMarkup: {
          inline_keyboard: [[{ text: '📅 А что завтра?', callback_data: 'cmd_tomorrow' }]],
        },
      };
    }

    let textOut = `📅 *Расписание на ${dayName}* (${state.currentWeekType === 'numerator' ? 'Числитель' : 'Знаменатель'}):\n\n`;
    items.forEach((item) => {
      textOut += `🔹 *${item.pairNumber} пара* (${item.time})\n`;
      textOut += `   📚 *${item.subject}* [_${item.type}_]\n`;
      textOut += `   📍 ${item.room} | 👨‍🏫 ${item.teacher}\n\n`;
    });

    return {
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: textOut.trim(),
      replyMarkup: {
        inline_keyboard: [
          [{ text: '📅 Пары на завтра', callback_data: 'cmd_tomorrow' }],
          [{ text: '📝 Проверить ДЗ', callback_data: 'cmd_dz' }, { text: '🧹 Дежурный', callback_data: 'cmd_duty' }],
        ],
      },
    };
  }

  // 4. /tomorrow or Завтра
  if (lower === '/tomorrow' || lower === 'завтра' || lower.includes('завтра') || lower.includes('пары завтра')) {
    const todayNum = new Date().getDay();
    let nextDay = (todayNum + 1) % 7;
    if (nextDay === 0) nextDay = 1; // If Sunday, show Monday
    const dayName = DAYS_NAMES[nextDay];

    const items = state.schedule.filter(
      (s) => s.dayOfWeek === nextDay && (s.weekType === 'all' || s.weekType === state.currentWeekType)
    ).sort((a, b) => a.pairNumber - b.pairNumber);

    if (items.length === 0) {
      return {
        sender: 'bot',
        senderName: 'Сратоста Бот',
        text: `🎉 *На завтра (${dayName}) пар нет!* Официальный чилл или самоподготовка.`,
        replyMarkup: {
          inline_keyboard: [[{ text: '📅 Вся неделя', callback_data: 'cmd_week' }]],
        },
      };
    }

    let textOut = `📅 *Расписание на завтра (${dayName})*:\n\n`;
    items.forEach((item) => {
      textOut += `🔹 *${item.pairNumber} пара* (${item.time})\n`;
      textOut += `   📚 *${item.subject}* [_${item.type}_]\n`;
      textOut += `   📍 ${item.room} | 👨‍🏫 ${item.teacher}\n\n`;
    });

    return {
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: textOut.trim(),
      replyMarkup: {
        inline_keyboard: [
          [{ text: '📝 Задали что-то?', callback_data: 'cmd_dz' }],
          [{ text: '📊 Сделать опрос явки', callback_data: 'cmd_poll' }],
        ],
      },
    };
  }

  // 5. /week or Вся неделя
  if (lower === '/week' || lower.includes('неделя') || lower.includes('вся неделя')) {
    let textOut = `📆 *Расписание группы ${state.groupName} на неделю* (${state.currentWeekType === 'numerator' ? 'Числитель' : 'Знаменатель'}):\n\n`;
    
    for (let day = 1; day <= 6; day++) {
      const dayPairs = state.schedule
        .filter((s) => s.dayOfWeek === day && (s.weekType === 'all' || s.weekType === state.currentWeekType))
        .sort((a, b) => a.pairNumber - b.pairNumber);
      
      if (dayPairs.length > 0) {
        textOut += `📌 *${DAYS_NAMES[day]}:*\n`;
        dayPairs.forEach((p) => {
          textOut += `  ${p.pairNumber}. ${p.subject} (${p.room}, ${p.type})\n`;
        });
        textOut += '\n';
      }
    }

    return {
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: textOut.trim(),
      replyMarkup: {
        inline_keyboard: [
          [
            {
              text: state.currentWeekType === 'numerator' ? '🔄 Переключить на Знаменатель' : '🔄 Переключить на Числитель',
              callback_data: 'toggle_week',
            },
          ],
          [{ text: '🔙 В меню', callback_data: 'cmd_start' }],
        ],
      },
    };
  }

  // 6. /dz or Домашка
  if (lower === '/dz' || lower.includes('дз') || lower.includes('домашка') || lower.includes('задания')) {
    if (state.homeworks.length === 0) {
      return {
        sender: 'bot',
        senderName: 'Сратоста Бот',
        text: '✨ *Домашки нет!* Либо староста забыл записать, либо у вас райские каникулы.',
      };
    }

    let textOut = `📝 *Актуальные домашние задания (ДЗ):*\n\n`;
    state.homeworks.forEach((hw, idx) => {
      const isDone = hw.isCompleted ? '✅ [Сдано]' : '⏳ [Активно]';
      textOut += `${idx + 1}. *${hw.subject}* ${isDone}\n`;
      textOut += `   📌 *${hw.title}*\n`;
      textOut += `   📖 ${hw.description}\n`;
      textOut += `   ⏰ Дедлайн: *${hw.deadline}*\n`;
      if (hw.link) {
        textOut += `   🔗 [Материалы к заданию](${hw.link})\n`;
      }
      textOut += '\n';
    });

    return {
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: textOut.trim(),
      replyMarkup: {
        inline_keyboard: [
          [{ text: '⚠️ Проверить долги', callback_data: 'cmd_debt' }],
          [{ text: '🔙 Главное меню', callback_data: 'cmd_start' }],
        ],
      },
    };
  }

  // 7. /duty or Дежурные
  if (lower === '/duty' || lower.includes('дежур') || lower.includes('доск')) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayDuty = state.dutyRoster.find((d) => d.date === todayStr) || state.dutyRoster[0];

    const studentNames = todayDuty
      ? todayDuty.studentIds
          .map((id) => state.students.find((s) => s.id === id)?.name || 'Неизвестный боец')
          .join(' и ')
      : 'Не назначены';

    const dutyText = `🧹 *Дежурство по аудитории на сегодня:*\n\n` +
      `👑 Дежурные бойцы: *${studentNames}*\n\n` +
      `📋 *Обязанности дежурных:*\n` +
      `1. Помыть доску перед началом пары и стереть каракули с прошлой пары 🧼\n` +
      `2. Принести маркеры/мел из учительской/деканата 🖍️\n` +
      `3. Проветрить аудиторию на перемене 🪟\n` +
      `4. Не бесить старосту! 😇`;

    return {
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: dutyText,
      replyMarkup: {
        inline_keyboard: [
          [{ text: '🔄 Сменить дежурного', callback_data: 'swap_duty' }],
          [{ text: '📅 Пары на сегодня', callback_data: 'cmd_today' }],
        ],
      },
    };
  }

  // 8. /debt or Долги
  if (lower === '/debt' || lower === '/debts' || lower.includes('долг') || lower.includes('хвост')) {
    const pending = state.debts.filter((d) => d.status !== 'approved');

    if (pending.length === 0) {
      return {
        sender: 'bot',
        senderName: 'Сратоста Бот',
        text: '🎉 *Шок и сенсация:* В группе нет ни одного должника! Деканат плачет от счастья.',
      };
    }

    let textOut = `🚨 *Список академических долгов & хвостов:*\n\n`;
    pending.forEach((debt, i) => {
      const statusIcon = debt.status === 'submitted' ? '🟡 На проверке' : '🔴 Не сдано';
      textOut += `${i + 1}. *${debt.studentName}*\n`;
      textOut += `   📚 ${debt.subject}: _${debt.taskTitle}_\n`;
      textOut += `   Статус: ${statusIcon} (дедлайн: ${debt.deadline})\n\n`;
    });

    return {
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: textOut.trim(),
      replyMarkup: {
        inline_keyboard: [
          [{ text: '🔥 Роаст должников', callback_data: 'cmd_roast' }],
          [{ text: '🔙 Меню', callback_data: 'cmd_start' }],
        ],
      },
    };
  }

  // 9. /fund or Фонд
  if (lower === '/fund' || lower.includes('фонд') || lower.includes('сбор') || lower.includes('деньги')) {
    if (state.funds.length === 0) {
      return {
        sender: 'bot',
        senderName: 'Сратоста Бот',
        text: '💰 Сейчас нет активных денежных сборов. Ваши кошельки в безопасности.',
      };
    }

    let textOut = `💰 *Фонд группы & Сборы:*\n\n`;
    state.funds.forEach((fund) => {
      const percent = Math.round((fund.currentAmount / fund.targetAmount) * 100);
      const progressBar = '🟩'.repeat(Math.min(10, Math.floor(percent / 10))) + '⬜'.repeat(Math.max(0, 10 - Math.floor(percent / 10)));
      textOut += `🎁 *${fund.title}*\n`;
      textOut += `   Прогресс: ${progressBar} *${percent}%*\n`;
      textOut += `   Собрано: *${fund.currentAmount} ₽* из ${fund.targetAmount} ₽\n`;
      textOut += `   Дедлайн: ${fund.deadline}\n`;
      textOut += `   Сдали (${fund.donors.length}): ${fund.donors.map((d) => d.name).slice(0, 4).join(', ')}${fund.donors.length > 4 ? ' и др.' : ''}\n\n`;
    });

    textOut += `💳 Реквизиты для перевода: по номеру старосты (+7-999-123-45-67, Т-Банк/Сбер с пометкой "ФИО")`;

    return {
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: textOut,
      replyMarkup: {
        inline_keyboard: [
          [{ text: '📢 Напомнить тем, кто не сдал', callback_data: 'remind_fund' }],
          [{ text: '🔙 В меню', callback_data: 'cmd_start' }],
        ],
      },
    };
  }

  // 10. /roast
  if (lower === '/roast' || lower.includes('роаст') || lower.includes('отчитай')) {
    const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    return {
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: randomRoast,
      replyMarkup: {
        inline_keyboard: [
          [{ text: '🔥 Еще роаст!', callback_data: 'cmd_roast' }],
          [{ text: '🧠 Дай отмазку', callback_data: 'cmd_excuse' }],
        ],
      },
    };
  }

  // 11. /excuse
  if (lower === '/excuse' || lower.includes('отмазк')) {
    const randomExcuse = EXCUSES[Math.floor(Math.random() * EXCUSES.length)];
    return {
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: `🧠 *Генератор отмазок для деканата / препода:*\n\n${randomExcuse}\n\n_Используй на свой страх и риск! Староста ответственность с себя снимает._`,
      replyMarkup: {
        inline_keyboard: [
          [{ text: '🔄 Сгенерировать другую отмазку', callback_data: 'cmd_excuse' }],
          [{ text: '📅 Посмотреть пары', callback_data: 'cmd_today' }],
        ],
      },
    };
  }

  // 12. /quote
  if (lower === '/quote' || lower.includes('цитат') || lower.includes('перл')) {
    const quote = state.quotes[Math.floor(Math.random() * state.quotes.length)];
    const quoteText = quote
      ? `🗣️ *Цитата дня группы ${state.groupName}:*\n\n«${quote.text}»\n\n— *${quote.author}* (${quote.role}${quote.subject ? `, ${quote.subject}` : ''})\n📅 _${quote.date}_`
      : 'Цитат пока нет!';

    return {
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: quoteText,
      replyMarkup: {
        inline_keyboard: [
          [{ text: '🎲 Случайная цитата', callback_data: 'cmd_quote' }],
          [{ text: '🔙 Меню', callback_data: 'cmd_start' }],
        ],
      },
    };
  }

  // 13. /poll
  if (lower === '/poll' || lower.includes('опрос') || lower.includes('переклич')) {
    return {
      sender: 'bot',
      senderName: 'Сратоста Бот',
      text: `📊 *Опрос старосты: Явка на завтра (1-я пара, 09:00)*\n\n` +
        `🔘 Точно буду в строю (7)\n` +
        `🔘 Опоздаю минут на 15-20 (4)\n` +
        `🔘 Болею / лежу трупом (2)\n` +
        `🔘 Морально с вами, физически в кровати (5)\n\n` +
        `_Голосование анонимное (но староста все равно всё узнает) 😈_`,
      replyMarkup: {
        inline_keyboard: [
          [{ text: '✅ Буду в строю', callback_data: 'poll_vote_1' }],
          [{ text: '🛌 Сплю дома', callback_data: 'poll_vote_2' }],
        ],
      },
    };
  }

  // Default: conversational / fallback
  return {
    sender: 'bot',
    senderName: 'Сратоста Бот',
    text: `🤔 Я тебя понял, но староста сейчас занят сдачей отчета в деканат.\n\nНажми /start или воспользуйся меню быстрых команд, чтобы узнать пары, домашку или дежурных!`,
    replyMarkup: {
      inline_keyboard: [
        [{ text: '📅 Расписание на сегодня', callback_data: 'cmd_today' }],
        [{ text: '📝 Домашка', callback_data: 'cmd_dz' }, { text: '🔥 Роаст', callback_data: 'cmd_roast' }],
        [{ text: '📋 Все команды /help', callback_data: 'cmd_help' }],
      ],
    },
  };
}
