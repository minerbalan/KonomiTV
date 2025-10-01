/**
 * 番組レイアウト計算ユーティリティ
 */

import { getGenreBackgroundStyle, getGenreBackgroundHoverStyle, getGenreStripeStyle } from './genreStyles';

import { PIXELS_PER_MINUTE, PROGRAM_MIN_HEIGHT, TIMETABLE_START_HOUR } from '@/fork/constants/timetable';

export interface Program {
    id: number;
    start_time: string;
    duration: number;
    genres?: Array<{ major: string; middle: string }>;
}

/**
 * 番組のスタイル（位置とサイズ、ジャンル色、z-index）を計算
 */
export const getProgramStyle = (
    program: Program,
    programIndex: number,
    displayDate: Date
): Record<string, string> => {
    const startTime = new Date(program.start_time);

    // 表示日の開始時刻を基準点として計算
    const baseTime = new Date(displayDate);
    baseTime.setHours(TIMETABLE_START_HOUR, 0, 0, 0);

    // 基準時間からの経過分数を計算
    const minutesFromBase = Math.floor((startTime.getTime() - baseTime.getTime()) / (1000 * 60));
    const durationInMinutes = program.duration / 60;

    // ピクセル位置とサイズを計算
    const top = minutesFromBase * PIXELS_PER_MINUTE;
    const height = Math.max(durationInMinutes * PIXELS_PER_MINUTE, PROGRAM_MIN_HEIGHT);

    // ジャンル別スタイル
    const genreBackground = getGenreBackgroundStyle(program.genres);
    const genreStripe = getGenreStripeStyle(program.genres);
    const genreBackgroundHover = getGenreBackgroundHoverStyle(program.genres);

    const style: Record<string, string> = {
        position: 'absolute',
        top: `${top}px`,
        height: `${height}px`,
        width: '100%',
        left: '0',
        zIndex: String(programIndex),
    };

    if (genreBackground) {
        style.background = genreBackground;
    }

    if (genreStripe) {
        style['--genre-stripe'] = genreStripe;
    }

    if (genreBackgroundHover) {
        style['--genre-bg-hover'] = genreBackgroundHover;
    }

    return style;
};

/**
 * 現在時刻ラインの位置を計算
 */
export const calculateCurrentTimePosition = (currentTime: Date, displayDate: Date): number | null => {
    const baseTime = new Date(displayDate);
    baseTime.setHours(TIMETABLE_START_HOUR, 0, 0, 0);

    const minutesFromBase = Math.floor((currentTime.getTime() - baseTime.getTime()) / (1000 * 60));

    // 現在時刻が表示範囲外の場合はnullを返す
    if (minutesFromBase < 0 || minutesFromBase > 24 * 60) {
        return null;
    }

    return minutesFromBase * PIXELS_PER_MINUTE;
};
