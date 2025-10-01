<template>
    <div class="fork-recorded-timetable__time-section">
        <div class="fork-recorded-timetable__time-buttons">
            <button
                v-for="period in timePeriods"
                :key="period.key"
                class="fork-recorded-timetable__time-button"
                :class="{
                    'fork-recorded-timetable__time-button--selected': selectedTimePeriod === period.key
                }"
                @click="$emit('scrollToPeriod', period)">
                <span class="fork-recorded-timetable__time-button-label">{{ period.label }}</span>
                <span class="fork-recorded-timetable__time-button-time">{{ period.startTime }}</span>
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { TimePeriod } from '@/fork/types/timetable';

interface Props {
    timePeriods: readonly TimePeriod[];
    selectedTimePeriod: string;
}

defineProps<Props>();

defineEmits<{
    scrollToPeriod: [period: TimePeriod];
}>();
</script>

<style lang="scss" scoped>
.fork-recorded-timetable__time-section {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    @include smartphone-vertical {
        justify-content: flex-start;
    }
}

.fork-recorded-timetable__time-buttons {
    display: flex;
    gap: 6px;

    @include smartphone-vertical {
        gap: 4px;
    }
}

.fork-recorded-timetable__time-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 10px;
    border: 1px solid rgb(var(--v-theme-background-lighten-3));
    border-radius: 8px;
    background: rgb(var(--v-theme-surface));
    cursor: pointer;
    transition: all 0.15s ease;
    min-width: 48px;
    user-select: none;

    @include smartphone-vertical {
        padding: 6px 8px;
        min-width: 42px;
        border-radius: 6px;
    }

    &:hover {
        background: rgb(var(--v-theme-primary-lighten-4));
        border-color: rgb(var(--v-theme-primary-lighten-2));
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(var(--v-theme-primary), 0.15);
    }

    &--selected {
        background: rgb(var(--v-theme-primary));
        border-color: rgb(var(--v-theme-primary-darken-1));
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.25);

        &:hover {
            background: rgb(var(--v-theme-primary-darken-1));
            transform: translateY(-1px);
        }

        .fork-recorded-timetable__time-button-label,
        .fork-recorded-timetable__time-button-time {
            color: white;
        }
    }

    &-label {
        font-size: 11px;
        font-weight: 600;
        color: rgb(var(--v-theme-text));
        line-height: 1;
        margin-bottom: 2px;

        @include smartphone-vertical {
            font-size: 10px;
            margin-bottom: 1px;
        }
    }

    &-time {
        font-size: 9px;
        font-weight: 500;
        color: rgb(var(--v-theme-text-darken-1));
        line-height: 1;

        @include smartphone-vertical {
            font-size: 8px;
        }
    }
}
</style>