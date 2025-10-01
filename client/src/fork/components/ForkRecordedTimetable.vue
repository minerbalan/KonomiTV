<template>
    <div class="fork-recorded-timetable">
        <!-- ヘッダー部分 -->
        <ForkRecordedTimetableHeader
            :title="title"
            :is-loading="isLoading"
            :total-programs="totalPrograms"
            :current-date-label="currentDateLabel"
            @previous-day="goToPreviousDay"
            @today="goToToday"
            @next-day="goToNextDay"
        />

        <!-- 統合ナビゲーション（日付タブ + 時間帯ボタン） -->
        <div class="fork-recorded-timetable__navigation">
            <!-- 日付タブエリア -->
            <ForkRecordedTimetableDateTabs
                :week-tabs="weekTabs"
                :is-outside-week-range="isOutsideWeekRange"
                :calendar-tab-content="calendarTabContent"
                @tab-click="onTabClick"
                @show-calendar="showCalendarPicker = true"
            />

            <!-- 時間帯ボタンエリア -->
            <ForkRecordedTimetableTimePeriods
                :time-periods="timePeriods"
                :selected-time-period="selectedTimePeriod"
                @scroll-to-period="scrollToTimePeriod"
            />
        </div>

        <div class="fork-recorded-timetable__content">
            <!-- 番組表グリッド -->
            <ForkRecordedTimetableGrid
                v-if="!isLoading"
                ref="gridRef"
                :programs="programs"
                :channels="channels"
                :display-date="displayDate"
                :current-time="currentTime"
                @program-click="handleProgramClick"
            />

            <div class="fork-recorded-timetable__loading" v-if="isLoading">
                <v-progress-circular
                    indeterminate
                    color="primary"
                    size="48"
                ></v-progress-circular>
                <p class="mt-4">番組表を読み込んでいます...</p>
            </div>
        </div>

        <!-- カレンダー選択ダイアログ -->
        <v-dialog v-model="showCalendarPicker" max-width="400px">
            <v-card>
                <v-card-title>日付を選択</v-card-title>
                <v-card-text>
                    <v-date-picker
                        v-model="selectedCalendarDate"
                        :max="new Date().toISOString().substring(0, 10)"
                        show-adjacent-months
                    ></v-date-picker>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="showCalendarPicker = false">キャンセル</v-btn>
                    <v-btn color="primary" @click="onCalendarDateSelect">選択</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';


import ForkRecordedTimetableDateTabs from './ForkRecordedTimetableDateTabs.vue';
import ForkRecordedTimetableGrid from './ForkRecordedTimetableGrid.vue';
import ForkRecordedTimetableHeader from './ForkRecordedTimetableHeader.vue';
import ForkRecordedTimetableTimePeriods from './ForkRecordedTimetableTimePeriods.vue';

import type { Program, Channel, TabData } from '@/fork/types/timetable';

import { useDateTabs } from '@/fork/composables/useDateTabs';
import { TIME_PERIODS } from '@/fork/constants/timePeriods';
import { formatDateToJapanese, parseCalendarDate, calculateHourIndex } from '@/fork/utils/dateFormat';

// Props
const props = withDefaults(defineProps<{
    title: string;
    programs?: Program[];
    channels?: Channel[];
    isLoading?: boolean;
}>(), {
    programs: () => [],
    channels: () => [],
    isLoading: false,
});

// Emits
const emit = defineEmits<{
    (e: 'programClick', program: Program): void;
    (e: 'fetchProgramData', date: Date): void;
}>();

// State
const displayDate = ref(new Date());
const showCalendarPicker = ref(false);
const selectedCalendarDate = ref<Date | string>(new Date().toISOString().substring(0, 10));
const selectedTimePeriod = ref('');
const currentTime = ref(new Date());
const gridRef = ref<InstanceType<typeof ForkRecordedTimetableGrid> | null>(null);

let timeUpdateInterval: number | null = null;

// Composables
const { weekTabs, isOutsideWeekRange, calendarTabContent } = useDateTabs(displayDate);

// Constants
const timePeriods = TIME_PERIODS;

// Computed
const channels = computed(() => props.channels || []);
const programs = computed(() => props.programs || []);

const currentDateLabel = computed(() => {
    const date = displayDate.value;
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    return `${formatDateToJapanese(date)} 4:00 〜 ${formatDateToJapanese(nextDate)} 4:00`;
});

const totalPrograms = computed(() => {
    return programs.value.length;
});

// Methods
const handleProgramClick = (program: Program) => {
    emit('programClick', program);
};

const goToDate = (date: Date) => {
    displayDate.value = new Date(date);
    emit('fetchProgramData', date);
};

const changeDate = (days: number) => {
    const newDate = new Date(displayDate.value);
    newDate.setDate(newDate.getDate() + days);
    goToDate(newDate);
};

const goToPreviousDay = () => {
    changeDate(-1);
};

const goToNextDay = () => {
    changeDate(1);
};

const goToToday = () => {
    goToDate(new Date());
};

const onTabClick = (tab: TabData) => {
    goToDate(tab.date);
};

const onCalendarDateSelect = () => {
    const selectedDate = parseCalendarDate(selectedCalendarDate.value);
    showCalendarPicker.value = false;
    goToDate(selectedDate);
};

const scrollToTimePeriod = async (period: typeof TIME_PERIODS[number]) => {
    selectedTimePeriod.value = period.key;

    await nextTick();

    if (!gridRef.value) return;

    const targetHourIndex = calculateHourIndex(period.hour);
    gridRef.value.scrollToTimePeriod(targetHourIndex);
};

// Lifecycle
onMounted(async () => {
    displayDate.value = new Date();
    emit('fetchProgramData', displayDate.value);

    // 現在時刻を1分ごとに更新
    currentTime.value = new Date();
    timeUpdateInterval = window.setInterval(() => {
        currentTime.value = new Date();
    }, 60000);

    // DOMの描画を待ってからスクロール位置を設定
    await nextTick();
    setTimeout(() => {
        if (gridRef.value) {
            gridRef.value.setInitialScrollPosition();
        }
    }, 100);
});

onUnmounted(() => {
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
        timeUpdateInterval = null;
    }
});
</script>

<style lang="scss" scoped>
.fork-recorded-timetable {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    &__navigation {
        background: rgb(var(--v-theme-background));
        border-bottom: 1px solid rgb(var(--v-theme-background-lighten-2));
        display: flex;
        gap: 16px;
        padding: 12px 16px;

        @include smartphone-vertical {
            flex-direction: column;
            gap: 8px;
            padding: 10px 12px;
        }
    }

    &__content {
        flex: 1;
        display: flex;
        flex-direction: column;
        width: 100%;
        background: rgb(var(--v-theme-background-lighten-1));
        border-radius: 8px;
        overflow: hidden;
        height: 100%;
    }

    &__loading {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: rgb(var(--v-theme-text-darken-1));

        p {
            font-size: 14px;
            margin: 0;
        }
    }
}
</style>