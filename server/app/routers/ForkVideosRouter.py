# Fork: 録画番組自動再生用の後続番組取得API
import json
from typing import Annotated, Any

from fastapi import APIRouter, HTTPException, Path, status
from tortoise import connections

from app import logging, schemas
from app.models.RecordedProgram import RecordedProgram

# ルーター
router = APIRouter(
    tags=['ForkVideos'],
    prefix='/api/fork/videos',
)


async def ForkConvertRowToRecordedProgram(row: dict[str, Any]) -> schemas.RecordedProgram:
    """
    Fork: データベースの行データを RecordedProgram Pydantic モデルに変換する共通処理
    VideosRouter.ConvertRowToRecordedProgram と同じ実装
    """

    # key_frames の存在確認
    # 高速化のため、SQL で計算された has_key_frames を直接参照する
    has_key_frames: bool = bool(row['has_key_frames'])

    # cm_sections は小さいので、通常通りパースする
    cm_sections: list[schemas.CMSection] | None = None
    if row['cm_sections'] is not None:
        cm_sections = json.loads(row['cm_sections'])

    # recorded_video のデータを構築
    recorded_video_dict = {
        'id': row['rv_id'],
        'status': row['status'],
        'file_path': row['file_path'],
        'file_hash': row['file_hash'],
        'file_size': row['file_size'],
        'file_created_at': row['file_created_at'],
        'file_modified_at': row['file_modified_at'],
        'recording_start_time': row['recording_start_time'],
        'recording_end_time': row['recording_end_time'],
        'duration': row['video_duration'],
        'container_format': row['container_format'],
        'video_codec': row['video_codec'],
        'video_codec_profile': row['video_codec_profile'],
        'video_scan_type': row['video_scan_type'],
        'video_frame_rate': row['video_frame_rate'],
        'video_resolution_width': row['video_resolution_width'],
        'video_resolution_height': row['video_resolution_height'],
        'primary_audio_codec': row['primary_audio_codec'],
        'primary_audio_channel': row['primary_audio_channel'],
        'primary_audio_sampling_rate': row['primary_audio_sampling_rate'],
        'secondary_audio_codec': row['secondary_audio_codec'],
        'secondary_audio_channel': row['secondary_audio_channel'],
        'secondary_audio_sampling_rate': row['secondary_audio_sampling_rate'],
        'has_key_frames': has_key_frames,
        'cm_sections': cm_sections,
        'created_at': row['created_at'],
        'updated_at': row['updated_at'],
    }

    # channel のデータを構築 (channel_id が存在する場合のみ)
    channel_dict: dict[str, Any] | None = None
    if row['ch_id'] is not None:
        channel_dict = {
            'id': row['ch_id'],
            'display_channel_id': row['display_channel_id'],
            'network_id': row['ch_network_id'],
            'service_id': row['ch_service_id'],
            'transport_stream_id': row['transport_stream_id'],
            'remocon_id': row['remocon_id'],
            'channel_number': row['channel_number'],
            'type': row['type'],
            'name': row['ch_name'],
            'jikkyo_force': row['jikkyo_force'],
            'is_subchannel': bool(row['is_subchannel']),
            'is_radiochannel': bool(row['is_radiochannel']),
            'is_watchable': bool(row['is_watchable']),
        }

    # recorded_program のデータを構築
    recorded_program_dict = {
        'id': row['rp_id'],
        'recorded_video': recorded_video_dict,
        'recording_start_margin': row['recording_start_margin'],
        'recording_end_margin': row['recording_end_margin'],
        'is_partially_recorded': bool(row['is_partially_recorded']),
        'channel': channel_dict,  # channel_id が存在しない場合は None
        'channel_id': row['channel_id'],
        'network_id': row['network_id'],
        'service_id': row['service_id'],
        'event_id': row['event_id'],
        'series_id': row['series_id'],
        'series_broadcast_period_id': row['series_broadcast_period_id'],
        'title': row['title'],
        'series_title': row['series_title'],
        'episode_number': row['episode_number'],
        'subtitle': row['subtitle'],
        'description': row['description'],
        'detail': json.loads(row['detail']),
        'start_time': row['start_time'],
        'end_time': row['end_time'],
        'duration': row['duration'],
        'is_free': bool(row['is_free']),
        'genres': json.loads(row['genres']),
        'primary_audio_type': row['primary_audio_type'],
        'primary_audio_language': row['primary_audio_language'],
        'secondary_audio_type': row['secondary_audio_type'],
        'secondary_audio_language': row['secondary_audio_language'],
        'created_at': row['created_at'],
        'updated_at': row['updated_at'],
    }

    # Pydantic モデルに変換して返す
    return schemas.RecordedProgram.model_validate(recorded_program_dict)


@router.get(
    '/{video_id}/next',
    summary='Fork: 録画番組後続番組取得 API',
    response_description='後続番組の情報。存在しない場合は null。',
    response_model=schemas.ForkNextProgramResponse,
)
async def ForkVideoNextProgramAPI(
    video_id: Annotated[int, Path(description='現在の録画番組の ID 。')],
):
    """
    Fork: 指定された録画番組の後続番組（同チャンネル・時系列で次の番組）を取得する。<br>
    後続番組が存在しない場合は null を返す。
    """

    try:
        # 1. 現在の録画番組情報を取得
        current_program = await RecordedProgram.all() \
            .select_related('channel') \
            .get_or_none(id=video_id)

        if current_program is None:
            logging.error(f'[ForkVideosRouter][ForkVideoNextProgramAPI] Specified video_id was not found [video_id: {video_id}]')
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='指定された録画番組が見つかりません。',
            )

        # 2. チャンネル情報がない場合は後続番組なしとして返す
        if current_program.channel is None or current_program.channel_id is None:
            return schemas.ForkNextProgramResponse(next_program=None)

        # 3. 後続番組を検索するSQLクエリ
        query = """
            SELECT
                rp.id AS rp_id,
                rp.recording_start_margin,
                rp.recording_end_margin,
                rp.is_partially_recorded,
                rp.channel_id,
                rp.network_id,
                rp.service_id,
                rp.event_id,
                rp.series_id,
                rp.series_broadcast_period_id,
                rp.title,
                rp.series_title,
                rp.episode_number,
                rp.subtitle,
                rp.description,
                rp.detail,
                rp.start_time,
                rp.end_time,
                rp.duration,
                rp.is_free,
                rp.genres,
                rp.primary_audio_type,
                rp.primary_audio_language,
                rp.secondary_audio_type,
                rp.secondary_audio_language,
                rp.created_at,
                rp.updated_at,
                rv.id AS rv_id,
                rv.status,
                rv.file_path,
                rv.file_hash,
                rv.file_size,
                rv.file_created_at,
                rv.file_modified_at,
                rv.recording_start_time,
                rv.recording_end_time,
                rv.duration AS video_duration,
                rv.container_format,
                rv.video_codec,
                rv.video_codec_profile,
                rv.video_scan_type,
                rv.video_frame_rate,
                rv.video_resolution_width,
                rv.video_resolution_height,
                rv.primary_audio_codec,
                rv.primary_audio_channel,
                rv.primary_audio_sampling_rate,
                rv.secondary_audio_codec,
                rv.secondary_audio_channel,
                rv.secondary_audio_sampling_rate,
                CASE WHEN rv.key_frames != '[]' THEN 1 ELSE 0 END AS has_key_frames,
                rv.cm_sections,
                ch.id AS ch_id,
                ch.display_channel_id,
                ch.network_id AS ch_network_id,
                ch.service_id AS ch_service_id,
                ch.transport_stream_id,
                ch.remocon_id,
                ch.channel_number,
                ch.type,
                ch.name AS ch_name,
                ch.jikkyo_force,
                ch.is_subchannel,
                ch.is_radiochannel,
                ch.is_watchable
            FROM recorded_programs rp
            JOIN recorded_videos rv ON rp.id = rv.recorded_program_id
            LEFT JOIN channels ch ON rp.channel_id = ch.id
            WHERE rp.channel_id = ?
              AND rp.start_time >= ?
            ORDER BY rp.start_time ASC, rp.id ASC
            LIMIT 1
        """

        params = [current_program.channel_id, current_program.end_time]

        # データベースから直接クエリを実行
        conn = connections.get('default')
        rows = await conn.execute_query(query, params)

        # 結果を確認
        if not rows[1]:  # rows[1] が空の場合は後続番組なし
            return schemas.ForkNextProgramResponse(next_program=None)

        # 結果を Pydantic モデルに変換
        next_program = await ForkConvertRowToRecordedProgram(rows[1][0])

        return schemas.ForkNextProgramResponse(next_program=next_program)

    except HTTPException:
        # HTTPException はそのまま再送出
        raise
    except Exception as ex:
        logging.error('[ForkVideosRouter][ForkVideoNextProgramAPI] Failed to get next program:', exc_info=ex)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='サーバーエラーが発生しました。',
        )
