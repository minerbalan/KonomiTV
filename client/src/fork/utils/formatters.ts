/**
 * データフォーマット用ユーティリティ関数
 */

/**
 * 録画時間をフォーマット（秒 → 時:分:秒）
 */
export const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * ファイルサイズをフォーマット（バイト → GB/MB/KB）
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    } else if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
        return `${(bytes / 1024).toFixed(2)} KB`;
    }
};