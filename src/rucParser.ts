import { ScheduleItem } from './types';

export interface RucBranch {
  id: string;
  name: string;
}

export interface RucYear {
  id: string;
  name: string;
}

export interface RucGroup {
  id: string;
  name: string;
}

const RUC_BASE_URL = 'https://schedule.ruc.su';

// Extract options from HTML string: <option value="xyz">Name</option>
function extractOptions(html: string, selectName: string): { id: string; name: string }[] {
  const selectRegex = new RegExp(`<select[^>]*name=["']${selectName}["'][^>]*>([\\s\\S]*?)<\\/select>`, 'i');
  const match = html.match(selectRegex);
  if (!match) return [];

  const inner = match[1];
  const optionRegex = /<option\s+value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi;
  const results: { id: string; name: string }[] = [];
  let optMatch: RegExpExecArray | null;

  while ((optMatch = optionRegex.exec(inner)) !== null) {
    const val = optMatch[1].trim();
    const label = optMatch[2].replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (val && val !== '--') {
      results.push({ id: val, name: label });
    }
  }

  return results;
}

// 1. Get branches from root page
export async function fetchRucBranches(): Promise<RucBranch[]> {
  const res = await fetch(`${RUC_BASE_URL}/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SratostaBot/1.0',
    },
  });
  if (!res.ok) throw new Error(`Ошибка загрузки branches с schedule.ruc.su: ${res.status}`);
  const html = await res.text();
  return extractOptions(html, 'branch');
}

// 2. Get years for branch
export async function fetchRucYears(branchId: string): Promise<RucYear[]> {
  const body = new URLSearchParams({ branch: branchId });
  const res = await fetch(`${RUC_BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SratostaBot/1.0',
    },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Ошибка загрузки years с schedule.ruc.su: ${res.status}`);
  const html = await res.text();
  return extractOptions(html, 'year');
}

// 3. Get groups for branch + year
export async function fetchRucGroups(branchId: string, yearId: string): Promise<RucGroup[]> {
  const body = new URLSearchParams({ branch: branchId, year: yearId });
  const res = await fetch(`${RUC_BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SratostaBot/1.0',
    },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Ошибка загрузки groups с schedule.ruc.su: ${res.status}`);
  const html = await res.text();
  return extractOptions(html, 'group');
}

// Map day string to dayOfWeek index (1 = Mon ... 6 = Sat)
const DAY_MAP: Record<string, number> = {
  'понедельник': 1,
  'вторник': 2,
  'среда': 3,
  'четверг': 4,
  'пятница': 5,
  'суббота': 6,
  'воскресенье': 7,
};

const PAIR_TIME_MAP: Record<number, string> = {
  1: '09:00 - 10:35',
  2: '10:50 - 12:25',
  3: '13:00 - 14:35',
  4: '14:50 - 16:25',
  5: '16:40 - 18:15',
  6: '18:30 - 20:05',
};

// 4. Fetch and parse timetable for group
export async function fetchRucSchedule(
  branchId: string,
  yearId: string,
  groupId: string
): Promise<{ schedule: ScheduleItem[]; rawHtmlPreview: string }> {
  const body = new URLSearchParams({ branch: branchId, year: yearId, group: groupId });
  const res = await fetch(`${RUC_BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SratostaBot/1.0',
    },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Ошибка получения расписания группы с schedule.ruc.su: ${res.status}`);
  const html = await res.text();

  // Extract cards
  const cards: ScheduleItem[] = [];
  const cardRegex = /<div class="card">([\s\S]*?)<\/div>\s*(?=<div class="card">|<\/form>|<\/div>\s*<\/div>\s*<\/div>\s*<\/main>|$)/gi;

  let cardMatch: RegExpExecArray | null;

  while ((cardMatch = cardRegex.exec(html)) !== null) {
    const cardHtml = cardMatch[1];

    // Card Header contains date & day: "02.11.2026 (Понедельник)"
    const headerMatch = cardHtml.match(/<div class="card-header[^>]*>([\s\S]*?)<\/div>/i);
    if (!headerMatch) continue;

    const headerText = headerMatch[1].replace(/<[^>]+>/g, '').trim();
    // Parse day name inside parentheses: "(Понедельник)"
    const dayParentheses = headerText.match(/\(([^)]+)\)/);
    const dayName = (dayParentheses ? dayParentheses[1] : headerText).toLowerCase().trim();
    const dayOfWeek = DAY_MAP[dayName] || 1;

    // Inside card, each pair is in <div class="card-body p-2"> ... </div>
    const bodyRegex = /<div class="card-body p-2">([\s\S]*?)<\/div>/gi;
    let bodyMatch: RegExpExecArray | null;

    while ((bodyMatch = bodyRegex.exec(cardHtml)) !== null) {
      const bodyContent = bodyMatch[1];
      // Clean HTML lines
      const lines = bodyContent
        .split(/<br\s*\/?>/i)
        .map((l) => l.replace(/<[^>]+>/g, '').trim())
        .filter(Boolean);

      if (lines.length === 0) continue;

      // Line 1: "1. Анализ финансово-хозяйственной деятельности"
      const firstLine = lines[0] || '';
      const pairNumMatch = firstLine.match(/^(\d+)\.\s*(.*)$/);
      const pairNumber = pairNumMatch ? parseInt(pairNumMatch[1], 10) : 1;
      const subject = pairNumMatch ? pairNumMatch[2].trim() : firstLine;

      // Line 2: "Себекина Татьяна Ильинична" (teacher)
      const teacher = lines.length > 1 ? lines[1] : '';

      // Line 3: "ауд. 4-108, лекция" (room and type)
      const details = lines.length > 2 ? lines[2] : '';
      let room = 'ауд. не указана';
      let type: ScheduleItem['type'] = 'Лекция';

      if (details) {
        const parts = details.split(',').map((s) => s.trim());
        if (parts[0]) room = parts[0];
        if (parts[1]) {
          const typeStr = parts[1].toLowerCase();
          if (typeStr.includes('практик') || typeStr.includes('семинар')) type = 'Семинар';
          else if (typeStr.includes('лабор')) type = 'Лабораторная';
          else if (typeStr.includes('зачет') || typeStr.includes('экзамен')) type = 'Зачет';
          else if (typeStr.includes('консульт')) type = 'Консультация';
          else type = 'Лекция';
        }
      }

      const time = PAIR_TIME_MAP[pairNumber] || '09:00 - 10:35';

      cards.push({
        id: `ruc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        dayOfWeek,
        pairNumber,
        time,
        subject,
        type,
        room,
        teacher,
        weekType: 'all',
      });
    }
  }

  return {
    schedule: cards,
    rawHtmlPreview: html.slice(0, 1000),
  };
}
