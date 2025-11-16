/**
 * 録画番組番組表の型定義
 */

export interface Program {
    id: number;
    title: string;
    subtitle?: string;
    description?: string;
    start_time: string;
    duration: number; // 秒
    channel_id: string;
    genres?: Array<{ major: string; middle: string }>;
    detail?: Record<string, string>;
    recorded_video?: {
        file_size?: number;
        duration?: number;
        video_resolution_width?: number;
        video_resolution_height?: number;
        video_codec?: string;
        fork_recorded_video?: {
            comment_count: number;
        } | null;
    };
}

export interface Channel {
    id: string;
    name: string;
}

export interface TabData {
    date: Date;
    label: string;
    isToday: boolean;
    isSelected: boolean;
    dayOfWeek: string;
    daysAgo: number;
}

export interface TimePeriod {
    key: string;
    label: string;
    startTime: string;
    hour: number;
}