
import APIClient from '@/services/APIClient';
import { IRecordedProgram } from '@/services/Videos';


/**
 * Fork機能: 動画自動再生レスポンスを表すインターフェース
 */
interface INextProgramResponse {
    next_program: IRecordedProgram | null;
}


/**
 * Fork機能: 動画自動再生を管理するサービスクラス
 * ビデオ再生終了後に同チャンネルの後続番組を取得し、自動再生を実現する
 */
class ForkAutoplay {

    /**
     * 指定された録画番組IDの後続番組を取得する
     * 同じチャンネルで、放送時刻が現在の番組終了後の最も早い番組を返す
     *
     * @param video_id 現在の録画番組ID
     * @returns 後続番組情報 or 後続番組が存在しない場合は null、エラー時も null
     */
    static async fetchNextProgram(video_id: number): Promise<IRecordedProgram | null> {

        // API リクエストを実行
        const response = await APIClient.get<INextProgramResponse>(`/fork/videos/${video_id}/next`);

        // エラー処理
        // エラー時はユーザー体験を損なわないよう、エラーメッセージを表示せずnullを返す
        if (response.type === 'error') {
            console.warn(`Failed to fetch next program for video ${video_id}:`, response.data);
            return null;
        }

        // 後続番組が存在しない場合もnullを返す
        return response.data.next_program;
    }
}

export default ForkAutoplay;
