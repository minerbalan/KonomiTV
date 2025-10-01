/**
 * 時間帯定数
 */

import type { TimePeriod } from '@/fork/types/timetable';

export const TIME_PERIODS: readonly TimePeriod[] = [
    { key: 'morning', label: '朝', startTime: '04:00', hour: 4 },
    { key: 'noon', label: '昼', startTime: '10:00', hour: 10 },
    { key: 'evening', label: '夕', startTime: '16:00', hour: 16 },
    { key: 'midnight', label: '深夜', startTime: '21:00', hour: 21 }
] as const;