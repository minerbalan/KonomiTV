/**
 * 日付フォーマット関連のユーティリティ関数
 */

/**
 * 日付を M/D 形式でフォーマット
 */
export const formatMonthDay = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
};

/**
 * 日付を YYYY-MM-DD 形式でフォーマット（ローカル日時）
 */
export const formatDateToISOString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * 日付を「YYYY年M月D日」形式でフォーマット
 */
export const formatDateToJapanese = (date: Date): string => {
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
};

/**
 * 曜日を短縮形式で取得（例: 月、火、水）
 */
export const getShortWeekday = (date: Date): string => {
    return date.toLocaleDateString('ja-JP', { weekday: 'short' });
};

/**
 * カレンダーから選択された日付をローカル日時のDateオブジェクトに変換
 * Vuetifyの v-date-picker は Date オブジェクトまたは文字列を返す可能性がある
 */
export const parseCalendarDate = (value: Date | string | unknown): Date => {
    if (value instanceof Date) {
        // Dateオブジェクトの場合、ローカル日時として扱う
        const year = value.getFullYear();
        const month = value.getMonth();
        const day = value.getDate();
        return new Date(year, month, day);
    } else if (typeof value === 'string') {
        // YYYY-MM-DD形式の文字列の場合
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    } else {
        // 想定外の型の場合は今日を使用
        return new Date();
    }
};

/**
 * 4時基準の新聞式番組表での時間インデックスを計算
 */
export const calculateHourIndex = (hour: number): number => {
    if (hour >= 4) {
        // 4時以降の場合: 4時を0とした相対時間
        return hour - 4;
    } else {
        // 0時〜3時の場合: 翌日の時間として計算
        return 20 + hour;
    }
};

/**
 * 分のみを表示する関数（例：20:00 → 00、21:15 → 15）
 */
export const formatMinutesOnly = (dateString: string): string => {
    const date = new Date(dateString);
    const minutes = date.getMinutes();
    return minutes.toString().padStart(2, '0');
};

/**
 * 時刻範囲をフォーマット（開始時刻 〜 終了時刻）
 */
export const formatTimeRange = (startTime: string | undefined, duration: number | undefined): string => {
    if (!startTime || !duration) return '';

    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 1000);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return `${formatTime(start)} 〜 ${formatTime(end)}`;
};