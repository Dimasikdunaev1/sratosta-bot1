export interface ScheduleItem {
  id: string;
  dayOfWeek: number; // 1 = Понедельник, ..., 6 = Суббота
  pairNumber: number; // 1, 2, 3, 4, 5
  time: string; // "09:00 - 10:35"
  subject: string;
  type: 'Лекция' | 'Семинар' | 'Лабораторная' | 'Зачет' | 'Консультация';
  room: string;
  teacher: string;
  weekType: 'all' | 'numerator' | 'denominator'; // Все, числитель (нечетная), знаменатель (четная)
}

export interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  description: string;
  deadline: string; // YYYY-MM-DD
  link?: string;
  isCompleted?: boolean;
  assignedBy?: string;
}

export interface Student {
  id: string;
  name: string;
  telegramUsername?: string;
  phone?: string;
  dutyCount: number;
}

export interface DebtItem {
  id: string;
  studentName: string;
  subject: string;
  taskTitle: string;
  deadline: string;
  status: 'pending' | 'submitted' | 'approved';
}

export interface FundItem {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  donors: { name: string; amount: number; date: string }[];
}

export interface QuoteItem {
  id: string;
  author: string;
  role: 'Преподаватель' | 'Студент' | 'Староста';
  text: string;
  date: string;
  subject?: string;
}

export interface BotState {
  groupName: string;
  university: string;
  currentWeekType: 'numerator' | 'denominator';
  schedule: ScheduleItem[];
  homeworks: HomeworkItem[];
  students: Student[];
  dutyRoster: { date: string; studentIds: string[] }[];
  debts: DebtItem[];
  funds: FundItem[];
  quotes: QuoteItem[];
  telegramToken?: string;
  botUsername?: string;
  isBotRunning: boolean;
}

export interface InlineKeyboardButton {
  text: string;
  callback_data: string;
  url?: string;
}

export interface TelegramMessage {
  id: string;
  sender: 'bot' | 'user';
  senderName: string;
  text: string;
  timestamp: string;
  replyMarkup?: {
    inline_keyboard?: InlineKeyboardButton[][];
    keyboard?: string[][];
    resize_keyboard?: boolean;
  };
  isCommand?: boolean;
}
