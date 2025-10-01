/**
 * 番組表のスクロール管理用Composable
 */

import { nextTick, type Ref } from 'vue';

import { PIXELS_PER_MINUTE, PIXELS_PER_HOUR, TIMETABLE_START_HOUR, CHANNEL_HEADER_HEIGHT } from '@/fork/constants/timetable';

/**
 * 番組表のスクロール機能を管理
 */
export const useScroll = (
    scrollContainer: Ref<HTMLElement | null>,
    displayDate: Ref<Date>
) => {
    /**
     * 初期スクロール位置を設定（現在時刻中心）
     */
    const setInitialScrollPosition = async () => {
        await nextTick();
        if (!scrollContainer.value) return;

        const now = new Date();
        const baseTime = new Date(displayDate.value);
        baseTime.setHours(TIMETABLE_START_HOUR, 0, 0, 0);

        // 現在時刻が表示範囲内の場合、現在時刻を中央に表示
        const minutesFromBase = Math.floor((now.getTime() - baseTime.getTime()) / (1000 * 60));

        if (minutesFromBase >= 0 && minutesFromBase <= 24 * 60) {
            const currentPosition = minutesFromBase * PIXELS_PER_MINUTE;
            const containerHeight = scrollContainer.value.clientHeight;
            const centerOffset = (containerHeight - CHANNEL_HEADER_HEIGHT) / 2;
            const scrollTop = Math.max(0, currentPosition - centerOffset);

            scrollContainer.value.scrollTop = scrollTop;
        } else {
            // 現在時刻が範囲外の場合は朝6時を中央に表示
            const morningPosition = 2 * 60 * PIXELS_PER_MINUTE; // 朝6時（4時+2時間）
            const containerHeight = scrollContainer.value.clientHeight;
            const centerOffset = (containerHeight - CHANNEL_HEADER_HEIGHT) / 2;
            const scrollTop = Math.max(0, morningPosition - centerOffset);

            scrollContainer.value.scrollTop = scrollTop;
        }
    };

    /**
     * 時間帯にスクロール
     */
    const scrollToTimePeriod = (targetHourIndex: number) => {
        if (!scrollContainer.value) return;

        const targetScrollTop = targetHourIndex * PIXELS_PER_HOUR;

        scrollContainer.value.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
        });
    };

    return {
        setInitialScrollPosition,
        scrollToTimePeriod
    };
};
