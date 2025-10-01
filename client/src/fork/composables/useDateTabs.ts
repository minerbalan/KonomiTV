/**
 * 日付タブ管理用のComposable
 */

import { computed, type Ref } from 'vue';

import type { TabData } from '@/fork/types/timetable';

import { formatMonthDay, getShortWeekday } from '@/fork/utils/dateFormat';

/**
 * タブラベルのフォーマット
 */
const formatTabLabel = (date: Date, isToday: boolean, daysAgo: number): string => {
    if (isToday) {
        return '今日';
    }

    if (daysAgo === 1) {
        return '昨日';
    }

    return formatMonthDay(date);
};

/**
 * 日付タブの状態管理
 */
export const useDateTabs = (displayDate: Ref<Date>) => {
    /**
     * 一週間分の日付タブを生成（今日から過去7日分）
     */
    const weekTabs = computed((): TabData[] => {
        const tabs: TabData[] = [];
        const today = new Date();

        // 今日から過去7日分のタブを生成（今日が左端、右に行くほど古い）
        for (let i = 0; i >= -6; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const isToday = i === 0;
            const isSelected = date.toDateString() === displayDate.value.toDateString();

            tabs.push({
                date: new Date(date),
                label: formatTabLabel(date, isToday, Math.abs(i)),
                isToday,
                isSelected,
                dayOfWeek: getShortWeekday(date),
                daysAgo: Math.abs(i)
            });
        }

        return tabs;
    });

    /**
     * 選択されている日付が週間範囲外かどうかをチェック
     */
    const isOutsideWeekRange = computed(() => {
        const today = new Date();
        const displayDateStr = displayDate.value.toDateString();

        // 今日から過去6日の範囲内かチェック
        for (let i = 0; i >= -6; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            if (date.toDateString() === displayDateStr) {
                return false;
            }
        }
        return true;
    });

    /**
     * カレンダータブの表示内容
     */
    const calendarTabContent = computed(() => {
        if (isOutsideWeekRange.value) {
            return {
                day: getShortWeekday(displayDate.value),
                date: formatMonthDay(displayDate.value)
            };
        } else {
            return {
                day: '日付',
                date: '選択'
            };
        }
    });

    return {
        weekTabs,
        isOutsideWeekRange,
        calendarTabContent
    };
};
