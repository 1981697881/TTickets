/**
 * 场次时间解析与「非今日」提示（选座 / 确认订单共用）
 */

export function parseShowDatetime(value: unknown): Date | null {
  const match = String(value || '').match(
    /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  );
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4] || 0),
    Number(match[5] || 0),
    Number(match[6] || 0)
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 相对今天的日差：0=今天，正=未来，负=过去；解析失败返回 null */
export function getSessionDayOffset(value: unknown, now = new Date()): number | null {
  const show = parseShowDatetime(value);
  if (!show) return null;
  const showDay = new Date(show.getFullYear(), show.getMonth(), show.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((showDay.getTime() - today.getTime()) / 86400000);
}

export function isSessionStarted(value: unknown, now = new Date()): boolean {
  const show = parseShowDatetime(value);
  if (!show) return false;
  return now.getTime() >= show.getTime();
}

export function formatSessionDisplay(value: unknown, now = new Date()): string {
  const show = parseShowDatetime(value);
  if (!show) {
    const raw = String(value || '').trim();
    return raw || '场次时间加载中';
  }
  const month = show.getMonth() + 1;
  const day = show.getDate();
  const hour = String(show.getHours()).padStart(2, '0');
  const minute = String(show.getMinutes()).padStart(2, '0');
  const weekText = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][show.getDay()];
  const dateText = `${String(month).padStart(2, '0')}月${String(day).padStart(2, '0')}日`;
  const dayOffset = getSessionDayOffset(value, now);
  if (dayOffset === 0) return `今天 · ${hour}:${minute}场`;
  if (dayOffset === 1) return `明天 ${dateText} ${weekText} · ${hour}:${minute}场`;
  if (dayOffset === 2) return `后天 ${dateText} ${weekText} · ${hour}:${minute}场`;
  if (typeof dayOffset === 'number' && dayOffset < 0) return `${dateText} ${weekText} · ${hour}:${minute}场（已过期）`;
  return `${dateText} ${weekText} · ${hour}:${minute}场`;
}

export function getNonTodaySessionAlert(value: unknown, now = new Date()): {
  show: boolean;
  dayOffset: number | null;
  title: string;
  detail: string;
} {
  const dayOffset = getSessionDayOffset(value, now);
  const detail = formatSessionDisplay(value, now);
  if (dayOffset == null || dayOffset === 0) {
    return { show: false, dayOffset, title: '', detail };
  }
  if (dayOffset < 0) {
    return {
      show: true,
      dayOffset,
      title: '场次已过期',
      detail: `开场时间 ${detail}，无法购票`
    };
  }
  const dayLabel =
    dayOffset === 1 ? '明天' : dayOffset === 2 ? '后天' : `还有 ${dayOffset} 天`;
  return {
    show: true,
    dayOffset,
    title: '非今日场次',
    detail: `请确认观影日期：${detail}（${dayLabel}）`
  };
}
