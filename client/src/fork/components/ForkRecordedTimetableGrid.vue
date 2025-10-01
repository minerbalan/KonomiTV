<template>
    <div class="fork-recorded-timetable__grid">
        <!-- 番組表本体（Grid コンテナ） -->
        <div class="fork-recorded-timetable__body" ref="scrollContainer">
            <div class="fork-recorded-timetable__grid-container" :style="{
                gridTemplateColumns: gridTemplateColumns,
                height: `${timetableHeight + CHANNEL_HEADER_HEIGHT}px`
            }">
                <!-- ヘッダー行（Grid の1行目、sticky固定） -->
                <div class="fork-recorded-timetable__time-column-header">時間</div>
                <div
                    v-for="channel in channels"
                    :key="channel.id"
                    class="fork-recorded-timetable__channel-header">
                    {{ channel.name }}
                </div>

                <!-- 時間軸（Grid の1列目、2行目以降） -->
                <div class="fork-recorded-timetable__time-column">
                    <div
                        v-for="hour in timeHours"
                        :key="hour.label"
                        class="fork-recorded-timetable__time-label"
                        :style="{ height: `${TIME_LABEL_HEIGHT}px` }">
                        <div class="fork-recorded-timetable__time-date">{{ hour.date }}</div>
                        <div class="fork-recorded-timetable__time-hour">{{ hour.time }}</div>
                    </div>
                </div>

                <!-- 各チャンネル列（Grid の2〜8列目、2行目以降） -->
                <div
                    v-for="(channel, index) in channels"
                    :key="channel.id"
                    class="fork-recorded-timetable__channel-column"
                    :style="{ gridColumn: index + 2, gridRowStart: 2 }">
                    <div
                        v-for="(program, programIndex) in getProgramsForChannel(channel.id)"
                        :key="program.id"
                        class="fork-recorded-timetable__program-item"
                        :style="getProgramStyle(program, programIndex)"
                        @click="$emit('programClick', program)"
                        @mouseenter="showTooltip(program, $event)"
                        @mouseleave="hideTooltip">
                        <div class="fork-recorded-timetable__program-content">
                            <div class="fork-recorded-timetable__program-minutes">
                                {{ formatMinutesOnly(program.start_time) }}
                            </div>
                            <div class="fork-recorded-timetable__program-info">
                                <div class="fork-recorded-timetable__program-title">
                                    {{ program.title }}
                                </div>
                                <div v-if="program.subtitle" class="fork-recorded-timetable__program-subtitle">
                                    {{ program.subtitle }}
                                </div>
                                <div v-if="program.description" class="fork-recorded-timetable__program-description">
                                    {{ program.description }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 現在時刻インジケーター -->
                <div class="fork-recorded-timetable__current-time-line" :style="getCurrentTimeLineStyle()"></div>
            </div>
        </div>

        <!-- ツールチップ -->
        <div
            v-if="tooltipVisible"
            class="fork-recorded-timetable__tooltip"
            :style="tooltipStyle"
            @mouseenter="onTooltipMouseEnter"
            @mouseleave="onTooltipMouseLeave">
            <div class="fork-recorded-timetable__tooltip-time">
                {{ formatTimeRange(tooltipProgram?.start_time, tooltipProgram?.duration) }}
            </div>
            <div class="fork-recorded-timetable__tooltip-title">
                {{ tooltipProgram?.title }}
            </div>
            <div v-if="tooltipProgram?.subtitle" class="fork-recorded-timetable__tooltip-subtitle">
                {{ tooltipProgram?.subtitle }}
            </div>
            <div v-if="tooltipProgram?.description" class="fork-recorded-timetable__tooltip-description">
                {{ tooltipProgram?.description }}
            </div>

            <!-- ジャンル -->
            <div v-if="tooltipProgram?.genres && tooltipProgram.genres.length > 0" class="fork-recorded-timetable__tooltip-genres">
                <div class="fork-recorded-timetable__tooltip-label">ジャンル</div>
                <div class="fork-recorded-timetable__tooltip-genre-list">
                    <span
                        v-for="(genre, index) in tooltipProgram.genres"
                        :key="index"
                        class="fork-recorded-timetable__tooltip-genre-tag">
                        {{ genre.major }}{{ genre.middle ? ` / ${genre.middle}` : '' }}
                    </span>
                </div>
            </div>

            <!-- 録画情報 -->
            <div v-if="tooltipProgram?.recorded_video" class="fork-recorded-timetable__tooltip-video-info">
                <div class="fork-recorded-timetable__tooltip-label">録画情報</div>
                <div class="fork-recorded-timetable__tooltip-info-grid">
                    <div v-if="tooltipProgram.recorded_video.video_resolution_width && tooltipProgram.recorded_video.video_resolution_height">
                        <span class="fork-recorded-timetable__tooltip-info-key">解像度:</span>
                        <span class="fork-recorded-timetable__tooltip-info-value">
                            {{ tooltipProgram.recorded_video.video_resolution_width }}×{{ tooltipProgram.recorded_video.video_resolution_height }}
                        </span>
                    </div>
                    <div v-if="tooltipProgram.recorded_video.video_codec">
                        <span class="fork-recorded-timetable__tooltip-info-key">映像:</span>
                        <span class="fork-recorded-timetable__tooltip-info-value">{{ tooltipProgram.recorded_video.video_codec }}</span>
                    </div>
                    <div v-if="tooltipProgram.recorded_video.duration">
                        <span class="fork-recorded-timetable__tooltip-info-key">実録画時間:</span>
                        <span class="fork-recorded-timetable__tooltip-info-value">{{ formatDuration(tooltipProgram.recorded_video.duration) }}</span>
                    </div>
                    <div v-if="tooltipProgram.recorded_video.file_size">
                        <span class="fork-recorded-timetable__tooltip-info-key">ファイルサイズ:</span>
                        <span class="fork-recorded-timetable__tooltip-info-value">{{ formatFileSize(tooltipProgram.recorded_video.file_size) }}</span>
                    </div>
                </div>
            </div>

            <!-- 詳細情報 -->
            <div v-if="tooltipProgram?.detail" class="fork-recorded-timetable__tooltip-detail">
                <template v-for="(value, key) in tooltipProgram.detail" :key="key">
                    <div v-if="value" class="fork-recorded-timetable__tooltip-detail-section">
                        <div class="fork-recorded-timetable__tooltip-label">{{ key }}</div>
                        <div class="fork-recorded-timetable__tooltip-detail-content">{{ value }}</div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, toRef } from 'vue';

import type { Program, Channel } from '@/fork/types/timetable';

import { useScroll } from '@/fork/composables/useScroll';
import { useTimetableTime } from '@/fork/composables/useTimetableTime';
import { useTooltip } from '@/fork/composables/useTooltip';
import { TIME_LABEL_HEIGHT, CHANNEL_HEADER_HEIGHT, TIME_COLUMN_WIDTH } from '@/fork/constants/timetable';
import { formatMinutesOnly, formatTimeRange } from '@/fork/utils/dateFormat';
import { formatDuration, formatFileSize } from '@/fork/utils/formatters';
import { getProgramStyle as calculateProgramStyle, calculateCurrentTimePosition } from '@/fork/utils/programLayout';

interface Props {
    programs: Program[];
    channels: Channel[];
    displayDate: Date;
    currentTime: Date;
}

const props = defineProps<Props>();

defineEmits<{
    programClick: [program: Program];
}>();

const scrollContainer = ref<HTMLElement | null>(null);

// Composables
const displayDateRef = toRef(props, 'displayDate');
const { timeHours, timetableHeight } = useTimetableTime(displayDateRef);
const { setInitialScrollPosition, scrollToTimePeriod } = useScroll(scrollContainer, displayDateRef);
const {
    tooltipVisible,
    tooltipProgram,
    tooltipStyle,
    showTooltip,
    hideTooltip,
    onTooltipMouseEnter,
    onTooltipMouseLeave
} = useTooltip(scrollContainer);

// Grid列の構成を計算
const gridTemplateColumns = computed(() => {
    const channelCount = props.channels.length;
    return `${TIME_COLUMN_WIDTH}px repeat(${channelCount}, 1fr)`;
});

// チャンネル別の番組リストを取得
const getProgramsForChannel = (channelId: string): Program[] => {
    return props.programs
        .filter(program => program.channel_id === channelId)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
};

// 番組のスタイル（位置とサイズ、ジャンル色、z-index）を計算
const getProgramStyle = (program: Program, programIndex: number): Record<string, string> => {
    return calculateProgramStyle(program, programIndex, props.displayDate);
};

// 現在時刻ラインのスタイルを計算（リアルタイム更新）
const getCurrentTimeLineStyle = (): Record<string, string | number> => {
    const currentPosition = calculateCurrentTimePosition(props.currentTime, props.displayDate);

    if (currentPosition === null) {
        return {
            display: 'none'
        };
    }

    return {
        position: 'absolute',
        top: `${currentPosition}px`,
        left: '0',
        right: '0',
        height: '2px',
        background: '#ff4444',
        zIndex: 20,
        gridColumn: '1 / -1',
        gridRow: 2,
        pointerEvents: 'none'
    };
};

// 外部から呼び出し可能な関数をexposeする
defineExpose({
    scrollToTimePeriod,
    setInitialScrollPosition
});

onMounted(() => {
    setInitialScrollPosition();
});
</script>

<style lang="scss" scoped>
.fork-recorded-timetable__grid {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.fork-recorded-timetable__time-column-header {
    grid-column: 1;
    grid-row: 1;
    padding: 12px 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 12px;
    color: rgb(var(--v-theme-text));
    background: rgb(var(--v-theme-surface));
    border-right: 2px solid rgb(var(--v-theme-background-lighten-2));
    border-bottom: 2px solid rgb(var(--v-theme-primary-lighten-3));
    position: sticky;
    top: 0;
    z-index: 15;
    width: 60px;

    @include smartphone-vertical {
        font-size: 11px;
        padding: 12px 2px;
    }
}

.fork-recorded-timetable__channel-header {
    grid-row: 1;
    padding: 12px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 13px;
    color: rgb(var(--v-theme-text));
    text-align: center;
    background: rgb(var(--v-theme-surface));
    border-right: 1px solid rgb(var(--v-theme-background-lighten-2));
    border-bottom: 2px solid rgb(var(--v-theme-primary-lighten-3));
    position: sticky;
    top: 0;
    z-index: 1001; // 番組カードのホバー時(z-index: 1000)より上に配置

    &:last-child {
        border-right: none;
    }

    @include smartphone-vertical {
        font-size: 12px;
        padding: 12px 4px;
    }
}

.fork-recorded-timetable__body {
    overflow: auto;
    position: relative;
    height: calc(100vh - 180px);
    min-height: 0;
}

.fork-recorded-timetable__grid-container {
    display: grid;
    position: relative;
    width: 100%;
    grid-template-rows: auto 1fr;
}

.fork-recorded-timetable__time-column {
    grid-column: 1;
    grid-row: 2;
    background: rgb(var(--v-theme-background-lighten-1));
    border-right: 2px solid rgb(var(--v-theme-background-lighten-2));
    position: sticky;
    left: 0;
    z-index: 5;
    width: 60px;
}

.fork-recorded-timetable__time-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px 2px;
    border-bottom: 1px solid rgb(var(--v-theme-background-lighten-2));
    gap: 2px;

    @include smartphone-vertical {
        padding: 4px 1px;
    }
}

.fork-recorded-timetable__time-date {
    font-size: 9px;
    font-weight: 600;
    color: rgb(var(--v-theme-primary));
    line-height: 1;

    @include smartphone-vertical {
        font-size: 8px;
    }
}

.fork-recorded-timetable__time-hour {
    font-size: 11px;
    font-weight: 500;
    color: rgb(var(--v-theme-text-darken-1));
    line-height: 1;

    @include smartphone-vertical {
        font-size: 10px;
    }
}

.fork-recorded-timetable__channel-column {
    position: relative;
    border-right: 1px solid rgb(var(--v-theme-background-lighten-2));

    &:last-child {
        border-right: none;
    }
}

.fork-recorded-timetable__program-item {
    position: relative;
    cursor: pointer;
    border: 1px solid rgb(var(--v-theme-primary-lighten-3));
    background: rgb(var(--v-theme-surface)); // デフォルトは不透明な背景
    margin: 1px;
    transition: all 0.2s ease;
    border-radius: 4px;
    overflow: hidden; // 角丸を有効にするためhidden

    // 左ボーダーストライプ（::before疑似要素）
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: var(--genre-stripe, transparent);
        border-radius: 4px 0 0 4px;
        z-index: 1; // テキストより前に配置
    }

    &:hover {
        background: var(--genre-bg-hover, rgb(var(--v-theme-primary-lighten-4)));
        border-color: rgb(var(--v-theme-primary-lighten-2));
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.15);
        z-index: 1000 !important; // ホバー時は最前面に表示
    }
}

.fork-recorded-timetable__program-content {
    padding: 8px 10px;
    height: 100%;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    overflow: hidden;
    min-height: 35px;
}

.fork-recorded-timetable__program-minutes {
    font-size: 14px;
    font-weight: 700;
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1;
    flex-shrink: 0;
    border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.fork-recorded-timetable__program-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.fork-recorded-timetable__program-title {
    font-size: 13px;
    font-weight: 500;
    color: rgb(var(--v-theme-text));
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
    margin-bottom: 2px;
}

.fork-recorded-timetable__program-subtitle {
    font-size: 11px;
    color: rgb(var(--v-theme-text-darken-1));
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
    margin-bottom: 2px;
}

.fork-recorded-timetable__program-description {
    font-size: 10px;
    color: rgb(var(--v-theme-text-darken-2));
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
}

.fork-recorded-timetable__current-time-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #ff4444, #ff6666);
    z-index: 20;
    grid-column: 1 / -1;
    grid-row: 2;
    pointer-events: none;
    box-shadow: 0 0 4px rgba(255, 68, 68, 0.6);

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: -2px;
        width: 6px;
        height: 6px;
        background: #ff4444;
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(255, 68, 68, 0.8);
    }
}

.fork-recorded-timetable__tooltip {
    position: fixed;
    width: 350px;
    max-height: 400px;
    padding: 16px;
    background: rgb(var(--v-theme-surface));
    border: 2px solid rgb(var(--v-theme-primary));
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    z-index: 10000; // 最上位に配置
    overflow-y: auto;
    pointer-events: auto;

    @include smartphone-vertical {
        width: 280px;
        padding: 12px;
        font-size: 12px;
    }
}

.fork-recorded-timetable__tooltip-time {
    font-size: 14px;
    font-weight: 600;
    color: rgb(var(--v-theme-primary));
    margin-bottom: 8px;
    padding: 4px 8px;
    background: rgba(var(--v-theme-primary), 0.1);
    border-radius: 4px;
    display: inline-block;

    @include smartphone-vertical {
        font-size: 12px;
    }
}

.fork-recorded-timetable__tooltip-title {
    font-size: 16px;
    font-weight: 600;
    color: rgb(var(--v-theme-text));
    line-height: 1.4;
    margin-bottom: 8px;

    @include smartphone-vertical {
        font-size: 14px;
    }
}

.fork-recorded-timetable__tooltip-subtitle {
    font-size: 14px;
    font-weight: 500;
    color: rgb(var(--v-theme-text-darken-1));
    line-height: 1.4;
    margin-bottom: 8px;

    @include smartphone-vertical {
        font-size: 12px;
    }
}

.fork-recorded-timetable__tooltip-description {
    font-size: 13px;
    color: rgb(var(--v-theme-text-darken-1));
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
    margin-bottom: 12px;

    @include smartphone-vertical {
        font-size: 11px;
    }
}

.fork-recorded-timetable__tooltip-label {
    font-size: 11px;
    font-weight: 600;
    color: rgb(var(--v-theme-text-darken-2));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
    margin-top: 8px;

    @include smartphone-vertical {
        font-size: 10px;
    }
}

.fork-recorded-timetable__tooltip-genres {
    margin-bottom: 12px;
}

.fork-recorded-timetable__tooltip-genre-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.fork-recorded-timetable__tooltip-genre-tag {
    display: inline-block;
    padding: 4px 10px;
    background: rgba(var(--v-theme-primary), 0.15);
    border: 1px solid rgba(var(--v-theme-primary), 0.3);
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    color: rgb(var(--v-theme-text));

    @include smartphone-vertical {
        font-size: 10px;
        padding: 3px 8px;
    }
}

.fork-recorded-timetable__tooltip-video-info {
    margin-bottom: 12px;
}

.fork-recorded-timetable__tooltip-info-grid {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    background: rgba(var(--v-theme-background), 0.3);
    border-radius: 4px;
}

.fork-recorded-timetable__tooltip-info-key {
    font-size: 11px;
    font-weight: 500;
    color: rgb(var(--v-theme-text-darken-2));
    margin-right: 6px;

    @include smartphone-vertical {
        font-size: 10px;
    }
}

.fork-recorded-timetable__tooltip-info-value {
    font-size: 12px;
    font-weight: 500;
    color: rgb(var(--v-theme-text));

    @include smartphone-vertical {
        font-size: 11px;
    }
}

.fork-recorded-timetable__tooltip-detail {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.fork-recorded-timetable__tooltip-detail-section {
    padding-top: 8px;
    border-top: 1px solid rgba(var(--v-theme-background-lighten-2), 0.5);

    &:first-child {
        padding-top: 0;
        border-top: none;
    }
}

.fork-recorded-timetable__tooltip-detail-content {
    font-size: 12px;
    color: rgb(var(--v-theme-text-darken-1));
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;

    @include smartphone-vertical {
        font-size: 11px;
    }
}
</style>