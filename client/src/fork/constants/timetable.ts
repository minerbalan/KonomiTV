/**
 * 番組表の表示設定定数
 */

/**
 * 1分あたりのピクセル数（番組表の時間軸スケール）
 */
export const PIXELS_PER_MINUTE = 3.5;

/**
 * 1時間あたりのピクセル数
 */
export const PIXELS_PER_HOUR = PIXELS_PER_MINUTE * 60;

/**
 * 番組表の開始時刻（時）
 */
export const TIMETABLE_START_HOUR = 4;

/**
 * 番組表の表示時間（時間）
 */
export const TIMETABLE_DURATION_HOURS = 24;

/**
 * 番組アイテムの最小高さ（px）
 */
export const PROGRAM_MIN_HEIGHT = 25;

/**
 * 時刻ラベルの高さ（px）
 * PIXELS_PER_HOURと同じ値を使用
 */
export const TIME_LABEL_HEIGHT = PIXELS_PER_HOUR;

/**
 * チャンネルヘッダーの高さ（px）
 */
export const CHANNEL_HEADER_HEIGHT = 60;

/**
 * 時間軸カラムの幅（px）
 */
export const TIME_COLUMN_WIDTH = 60;