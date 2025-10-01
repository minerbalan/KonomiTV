/**
 * 番組表の時間軸計算用Composable
 */

import { computed, type Ref } from 'vue';

import { PIXELS_PER_MINUTE, TIMETABLE_DURATION_HOURS, TIMETABLE_START_HOUR } from '@/fork/constants/timetable';

/**
 * 番組表の時間軸情報を管理
 */
export const useTimetableTime = (displayDate: Ref<Date>) => {
    /**
     * 時間軸表示用（開始時刻〜開始時刻+24時間）
     */
    const timeHours = computed(() => {
        const hours: Array<{ label: string; date: string; time: string }> = [];

        // 表示日の開始時刻を開始点として24時間分生成
        const startTime = new Date(displayDate.value);
        startTime.setHours(TIMETABLE_START_HOUR, 0, 0, 0);

        for (let hour = 0; hour < TIMETABLE_DURATION_HOURS; hour++) {
            const currentTime = new Date(startTime.getTime() + hour * 60 * 60 * 1000);

            const dateStr = currentTime.toLocaleDateString('ja-JP', {
                month: 'numeric',
                day: 'numeric'
            });

            const timeStr = currentTime.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            hours.push({
                label: `${dateStr} ${timeStr}`,
                date: dateStr,
                time: timeStr
            });
        }

        return hours;
    });

    /**
     * 番組表の固定高さを計算（24時間分）
     */
    const timetableHeight = computed(() => {
        return TIMETABLE_DURATION_HOURS * 60 * PIXELS_PER_MINUTE;
    });

    return {
        timeHours,
        timetableHeight
    };
};
