/**
 * ジャンル色スタイル生成ユーティリティ
 */

import { GENRE_COLOR_MAP, GENRE_OPACITY, type GenreColor } from '@/fork/constants/genreColors';

/**
 * ジャンル情報から色配列を取得
 */
const getGenreColors = (genres?: Array<{ major: string; middle: string }>, maxCount = 3): GenreColor[] => {
    if (!genres || genres.length === 0) return [];

    return genres.slice(0, maxCount)
        .map(g => GENRE_COLOR_MAP[g.major])
        .filter(c => c !== undefined);
};

/**
 * 左ボーダーストライプのスタイルを生成
 */
export const getGenreStripeStyle = (genres?: Array<{ major: string; middle: string }>): string | null => {
    const colors = getGenreColors(genres);

    if (colors.length === 0) return null;

    const colorStrings = colors.map(c => `rgba(${c.r}, ${c.g}, ${c.b}, ${GENRE_OPACITY.STRIPE})`);

    if (colorStrings.length === 1) {
        return colorStrings[0];
    } else if (colorStrings.length === 2) {
        return `linear-gradient(to bottom, ${colorStrings[0]} 0%, ${colorStrings[0]} 50%, ${colorStrings[1]} 50%, ${colorStrings[1]} 100%)`;
    } else {
        return `linear-gradient(to bottom, ${colorStrings[0]} 0%, ${colorStrings[0]} 33.33%, ${colorStrings[1]} 33.33%, ${colorStrings[1]} 66.66%, ${colorStrings[2]} 66.66%, ${colorStrings[2]} 100%)`;
    }
};

/**
 * 背景グラデーションのスタイルを生成（不透明な背景色の上にジャンル色を重ねる）
 */
export const getGenreBackgroundStyle = (genres?: Array<{ major: string; middle: string }>): string => {
    const colors = getGenreColors(genres);
    const baseBackground = 'rgb(var(--v-theme-surface))';

    if (colors.length === 0) return baseBackground;

    if (colors.length === 1) {
        const c = colors[0];
        return `linear-gradient(rgba(${c.r}, ${c.g}, ${c.b}, ${GENRE_OPACITY.SINGLE}), rgba(${c.r}, ${c.g}, ${c.b}, ${GENRE_OPACITY.SINGLE})), ${baseBackground}`;
    } else if (colors.length === 2) {
        const c1 = colors[0];
        const c2 = colors[1];
        return `linear-gradient(135deg, rgba(${c1.r}, ${c1.g}, ${c1.b}, ${GENRE_OPACITY.NORMAL}) 0%, rgba(${c2.r}, ${c2.g}, ${c2.b}, ${GENRE_OPACITY.NORMAL}) 100%), ${baseBackground}`;
    } else {
        const c1 = colors[0];
        const c2 = colors[1];
        return `linear-gradient(135deg, rgba(${c1.r}, ${c1.g}, ${c1.b}, ${GENRE_OPACITY.NORMAL}) 0%, rgba(${c2.r}, ${c2.g}, ${c2.b}, ${GENRE_OPACITY.NORMAL}) 100%), ${baseBackground}`;
    }
};

/**
 * ホバー時の背景グラデーションのスタイルを生成（不透明な背景色の上にジャンル色を重ねる）
 */
export const getGenreBackgroundHoverStyle = (genres?: Array<{ major: string; middle: string }>): string => {
    const colors = getGenreColors(genres);
    const baseBackground = 'rgb(var(--v-theme-surface))';

    if (colors.length === 0) return 'rgb(var(--v-theme-primary-lighten-4))';

    if (colors.length === 1) {
        const c = colors[0];
        return `linear-gradient(rgba(${c.r}, ${c.g}, ${c.b}, ${GENRE_OPACITY.SINGLE_HOVER}), rgba(${c.r}, ${c.g}, ${c.b}, ${GENRE_OPACITY.SINGLE_HOVER})), ${baseBackground}`;
    } else if (colors.length === 2) {
        const c1 = colors[0];
        const c2 = colors[1];
        return `linear-gradient(135deg, rgba(${c1.r}, ${c1.g}, ${c1.b}, ${GENRE_OPACITY.HOVER}) 0%, rgba(${c2.r}, ${c2.g}, ${c2.b}, ${GENRE_OPACITY.HOVER}) 100%), ${baseBackground}`;
    } else {
        const c1 = colors[0];
        const c2 = colors[1];
        return `linear-gradient(135deg, rgba(${c1.r}, ${c1.g}, ${c1.b}, ${GENRE_OPACITY.HOVER}) 0%, rgba(${c2.r}, ${c2.g}, ${c2.b}, ${GENRE_OPACITY.HOVER}) 100%), ${baseBackground}`;
    }
};