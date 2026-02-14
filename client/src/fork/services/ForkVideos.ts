import APIClient from  '@/services/APIClient';
import {
    IRecordedProgram,
    IRecordedPrograms,
    IRecordedVideo,
    IRecordedVideoDefault
} from '@/services/Videos';

/** ソート順序を表す型 */
export type SortOrder = 'desc' | 'asc';

/** マイリストのソート順序を表す型 */
export type MylistSortOrder = 'mylist_added_desc' | 'mylist_added_asc' | 'recorded_desc' | 'recorded_asc';

/** 録画ファイル情報を表すインターフェース */
export interface IForkRecordedVideo extends IRecordedVideo{
    fork_recorded_video: {comment_count: number} | null;
}

/** 録画ファイル情報を表すインターフェースのデフォルト値 */
export const IForkRecordedVideoDefault: IForkRecordedVideo = {
    ...IRecordedVideoDefault,
    fork_recorded_video: null
};

/** 録画番組情報を表すインターフェース */
export interface IForkRecordedProgram extends IRecordedProgram{
    recorded_video: IForkRecordedVideo;
}

/** 録画番組情報リストを表すインターフェース */
export interface IForkRecordedPrograms extends IRecordedPrograms {
    recorded_programs: IForkRecordedProgram[];
}

/** Fork機能: カスタム検索条件を表すインターフェース */
export interface ICustomSearch {
    major_genres?: string;
    from_date?: string;
    to_date?: string;
}

class ForkVideos {

    /**
     * Fork機能拡張版: 録画番組一覧を取得する（カスタム検索対応）
     * @param order ソート順序 ('desc' or 'asc' or 'ids')
     * @param page ページ番号
     * @param ids 録画番組の ID のリスト
     * @param customSearch カスタム検索条件（Fork機能）
     * @returns 録画番組一覧情報 or 録画番組一覧情報の取得に失敗した場合は null
     */
    static async fetchVideos(order: 'desc' | 'asc' | 'ids' = 'desc', page: number = 1, ids: number[] | null = null, customSearch: ICustomSearch | null = null): Promise<IForkRecordedPrograms | null> {

        // API リクエストを実行
        const response = await APIClient.get<IForkRecordedPrograms>('/videos', {
            params: {
                order,
                page,
                ids,
                // Fork機能: カスタム検索条件を追加
                ...(customSearch?.major_genres && { major_genres: customSearch.major_genres }),
                ...(customSearch?.from_date && { from_date: customSearch.from_date }),
                ...(customSearch?.to_date && { to_date: customSearch.to_date }),
            },
            // 録画番組の ID のリストを FastAPI が受け付ける &ids=1&ids=2&ids=3&... の形式にエンコードする
            // ref: https://github.com/axios/axios/issues/5058#issuecomment-1272107602
            paramsSerializer: {
                indexes: null,
            },
        });

        // エラー処理
        if (response.type === 'error') {
            APIClient.showGenericError(response, '録画番組一覧を取得できませんでした。');
            return null;
        }

        return response.data;
    }

    /**
     * Fork機能: 録画番組番組表データを取得する
     * @param search_date 検索日付 (YYYY-MM-DD形式)
     * @returns 録画番組一覧情報 or 録画番組一覧情報の取得に失敗した場合は null
     */
    static async fetchVideoTimetable(search_date: string): Promise<IForkRecordedPrograms | null> {

        // API リクエストを実行
        const response = await APIClient.get<IForkRecordedPrograms>('/fork/video/timetable', {
            params: {
                search_date,
            },
        });

        // エラー処理
        if (response.type === 'error') {
            APIClient.showGenericError(response, '番組表データを取得できませんでした。');
            return null;
        }

        return response.data;
    }
}

export default ForkVideos;
