<template>
    <div class="fork-recorded-timetable__header">
        <div class="fork-recorded-timetable__title">
            <span class="fork-recorded-timetable__title-text">{{ title }}</span>
            <span class="fork-recorded-timetable__title-loading" v-if="isLoading">
                <Icon icon="line-md:loading-twotone-loop" class="mr-1 spin" width="20px" height="20px" />
                <span>読み込み中...</span>
            </span>
            <span class="fork-recorded-timetable__title-count" v-if="!isLoading">
                {{ totalPrograms }}件の録画番組
            </span>
        </div>
        <div class="fork-recorded-timetable__controls">
            <v-btn variant="outlined" size="small" @click="$emit('previousDay')" class="mr-2">
                <Icon icon="fluent:chevron-left-20-regular" width="18px" />
                前日
            </v-btn>
            <v-btn variant="outlined" color="primary" @click="$emit('today')" class="mr-2">
                <Icon icon="fluent:calendar-ltr-20-regular" width="18px" class="mr-1" />
                今日
            </v-btn>
            <v-btn variant="outlined" size="small" @click="$emit('nextDay')">
                翌日
                <Icon icon="fluent:chevron-right-20-regular" width="18px" class="ml-1" />
            </v-btn>
            <div class="fork-recorded-timetable__date-display ml-4">
                {{ currentDateLabel }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue';

interface Props {
    title: string;
    isLoading: boolean;
    totalPrograms: number;
    currentDateLabel: string;
}

defineProps<Props>();

defineEmits<{
    previousDay: [];
    today: [];
    nextDay: [];
}>();
</script>

<style lang="scss" scoped>
.fork-recorded-timetable__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    @include smartphone-vertical {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
}

.fork-recorded-timetable__title {
    display: flex;
    align-items: center;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    @include smartphone-vertical {
        font-size: 22px;
    }

    &-text {
        color: rgb(var(--v-theme-text));
    }

    &-loading {
        display: flex;
        align-items: center;
        margin-left: 16px;
        font-size: 14px;
        font-weight: 400;
        color: rgb(var(--v-theme-text-darken-1));

        .spin {
            animation: spin 1.15s linear infinite;
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    }

    &-count {
        display: flex;
        align-items: center;
        margin-left: 16px;
        font-size: 14px;
        font-weight: 400;
        color: rgb(var(--v-theme-primary));
        background: rgb(var(--v-theme-primary-lighten-4));
        padding: 4px 8px;
        border-radius: 12px;
    }
}

.fork-recorded-timetable__controls {
    display: flex;
    align-items: center;
    gap: 12px;
}

.fork-recorded-timetable__date-display {
    font-size: 16px;
    font-weight: 600;
    color: rgb(var(--v-theme-text));
    background: rgb(var(--v-theme-surface));
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgb(var(--v-theme-background-lighten-2));
}
</style>