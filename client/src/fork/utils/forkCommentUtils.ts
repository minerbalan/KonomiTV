/**
 * Fork機能: コメント数関連のユーティリティ関数
 */

/**
 * 分間コメント数を計算する
 * @param commentCount 合計コメント数
 * @param durationSeconds 録画時間（秒）
 * @returns 分間コメント数（小数点第1位まで）
 */
export function forkCalculateCommentsPerMinute(commentCount: number, durationSeconds: number): number {
    if (!commentCount || !durationSeconds || durationSeconds === 0) {
        return 0;
    }
    const durationMinutes = durationSeconds / 60;
    return Math.round((commentCount / durationMinutes) * 10) / 10;
}

/**
 * コメント数を表示用にフォーマットする
 * @param count コメント数
 * @returns フォーマットされた文字列（例: "1,234", "12.3k", "1.2M"）
 */
export function forkFormatCommentCount(count: number): string {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
    } else {
        return count.toLocaleString();
    }
}