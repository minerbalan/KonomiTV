<template>
    <div class="fork-recorded-timetable__date-section">
        <div class="fork-recorded-timetable__tab-container">
            <div
                v-for="tab in weekTabs"
                :key="tab.date.toDateString()"
                class="fork-recorded-timetable__tab"
                :class="{
                    'fork-recorded-timetable__tab--selected': tab.isSelected,
                    'fork-recorded-timetable__tab--today': tab.isToday
                }"
                @click="$emit('tabClick', tab)">
                <div class="fork-recorded-timetable__tab-day">{{ tab.dayOfWeek }}</div>
                <div class="fork-recorded-timetable__tab-date">{{ tab.label }}</div>
            </div>
            <!-- カレンダー選択タブ -->
            <div
                class="fork-recorded-timetable__tab fork-recorded-timetable__tab--calendar"
                :class="{
                    'fork-recorded-timetable__tab--selected': isOutsideWeekRange
                }"
                @click="$emit('showCalendar')">
                <div class="fork-recorded-timetable__tab-calendar-content">
                    <div class="fork-recorded-timetable__tab-calendar-text">
                        <div class="fork-recorded-timetable__tab-day">{{ calendarTabContent.day }}</div>
                        <div class="fork-recorded-timetable__tab-date">{{ calendarTabContent.date }}</div>
                    </div>
                    <Icon icon="fluent:calendar-ltr-20-regular" class="fork-recorded-timetable__tab-calendar-icon" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue';

interface TabData {
    date: Date;
    label: string;
    isToday: boolean;
    isSelected: boolean;
    dayOfWeek: string;
    daysAgo: number;
}

interface CalendarTabContent {
    day: string;
    date: string;
}

interface Props {
    weekTabs: TabData[];
    isOutsideWeekRange: boolean;
    calendarTabContent: CalendarTabContent;
}

defineProps<Props>();

defineEmits<{
    tabClick: [tab: TabData];
    showCalendar: [];
}>();
</script>

<style lang="scss" scoped>
.fork-recorded-timetable__date-section {
    flex: 1;
    min-width: 0; // flex内での縮小を許可
}

.fork-recorded-timetable__tab-container {
    display: flex;
    gap: 4px;
    overflow-x: auto;
    padding: 4px;

    @include smartphone-vertical {
        gap: 2px;
        padding: 2px;
    }

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(var(--v-theme-text), 0.2);
        border-radius: 2px;
    }
}

.fork-recorded-timetable__tab {
    flex: 1;
    min-width: 80px;
    padding: 12px 8px;
    text-align: center;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-background-lighten-2));
    user-select: none;

    @include smartphone-vertical {
        min-width: 60px;
        padding: 8px 4px;
    }

    &:hover {
        background: rgb(var(--v-theme-primary-lighten-4));
        border-color: rgb(var(--v-theme-primary-lighten-3));
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.15);
    }

    &--selected {
        background: rgb(var(--v-theme-primary));
        color: white;
        border-color: rgb(var(--v-theme-primary-darken-1));
        box-shadow: 0 2px 12px rgba(var(--v-theme-primary), 0.3);

        &:hover {
            background: rgb(var(--v-theme-primary-darken-1));
            transform: translateY(-1px);
        }

        .fork-recorded-timetable__tab-day,
        .fork-recorded-timetable__tab-date {
            color: white;
        }
    }

    &-day {
        font-size: 11px;
        font-weight: 500;
        color: rgb(var(--v-theme-text-darken-1));
        margin-bottom: 2px;
        line-height: 1;

        @include smartphone-vertical {
            font-size: 10px;
        }
    }

    &-date {
        font-size: 13px;
        font-weight: 600;
        color: rgb(var(--v-theme-text));
        line-height: 1;

        @include smartphone-vertical {
            font-size: 12px;
        }
    }

    &-calendar-content {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
    }

    &-calendar-text {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        flex: 1;

        .fork-recorded-timetable__tab-day,
        .fork-recorded-timetable__tab-date {
            margin: 0;
            line-height: 1;
        }
    }

    &-calendar-icon {
        position: absolute;
        left: 6px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px !important;
        height: 24px !important;
        opacity: 0.7;

        @include smartphone-vertical {
            width: 20px !important;
            height: 20px !important;
            left: 4px;
        }
    }
}
</style>