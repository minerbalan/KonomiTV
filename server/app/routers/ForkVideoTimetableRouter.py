# ルーター
import json
from datetime import date, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Query, HTTPException, status
from tortoise import connections

from app import logging, schemas

router = APIRouter(
    tags = ['ForkVideoTimetable'],
    prefix = '/api/fork/video/timetable',
)

async def ConvertRowToRecordedProgram(row: dict[str, Any]) -> schemas.RecordedProgram:
    """ データベースの行データを RecordedProgram Pydantic モデルに変換する共通処理 """

    # key_frames の存在確認
    # 高速化のため、SQL で計算された has_key_frames を直接参照する
    has_key_frames: bool = bool(row['has_key_frames'])

    # cm_sections は小さいので、通常通りパースする
    cm_sections: list[schemas.CMSection] | None = None
    if row['cm_sections'] is not None:
        cm_sections = json.loads(row['cm_sections'])
    fork_recorded_video = {}
    if row['comment_count'] is not None:
        fork_recorded_video = {
            'comment_count': int(row['comment_count'])
        }

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
        'fork_recorded_video': fork_recorded_video
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
    '',
    summary = '録画番組一覧 API',
    response_description = '録画番組の情報のリスト。',
    response_model = schemas.RecordedPrograms,
)
async def VideosTimetableAPI(
    search_date: date = Query(..., description="検索日付")
):
    start_date = datetime(search_date.year, search_date.month, search_date.day, 4)
    end_date = start_date + timedelta(days=1)


    # 生 SQL クエリを構築
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
            -- key_frames は巨大なデータなので実際のデータは取得せず
            -- 空かどうかの判定結果だけを取得する
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
            ch.is_watchable,
            frv.comment_count
        FROM recorded_programs rp
        JOIN recorded_videos rv ON rp.id = rv.recorded_program_id
        LEFT JOIN channels ch ON rp.channel_id = ch.id
        LEFT JOIN fork_recorded_videos frv ON rv.id = frv.recorded_video_id
        WHERE rp.end_time >= ?
        AND rp.start_time < ?
    """

    params = [start_date, end_date]

    try:
        # データベースから直接クエリを実行
        conn = connections.get('default')
        rows = await conn.execute_query(query, params)

        # 結果を Pydantic モデルに変換
        recorded_programs: list[schemas.RecordedProgram] = []
        for row in rows[1]:  # rows[0] はカラム情報、rows[1] が実際のデータ
            recorded_programs.append(await ConvertRowToRecordedProgram(row))

        return schemas.RecordedPrograms(
            total=len(recorded_programs),
            recorded_programs = recorded_programs,
        )

    except Exception as ex:
        logging.error('[VideosAPI] Failed to execute raw SQL query:', exc_info=ex)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to execute raw SQL query',
        )


    # ids が指定されている場合は、指定された ID の録画番組のみを返す
    # target_ids: list[int] | None = None
    # if ids is not None:
    #     # order が 'ids' の場合は、指定された順序を維持する
    #     if order == 'ids':
    #         # ページングを考慮して必要な範囲の ID のみを使用
    #         target_ids = ids[(page - 1) * PAGE_SIZE:page * PAGE_SIZE]
    #         if not target_ids:
    #             return schemas.RecordedPrograms(
    #                 total = await RecordedProgram.all().filter(id__in=ids).count(),
    #                 recorded_programs = [],
    #             )
    #
    #         # IN 句のプレースホルダーを生成
    #         placeholders = ','.join(['?' for _ in target_ids])
    #         query = base_query.format(
    #             where_clause = f'AND rp.id IN ({placeholders})',
    #             order = 'DESC'  # order は無視されるが、SQL の構文上必要
    #         )
    #         params = [*target_ids, str(PAGE_SIZE), '0']  # OFFSET は 0 固定
    #
    #         # 総数を取得
    #         total_query = 'SELECT COUNT(*) as count FROM recorded_programs WHERE id IN ({})'.format(
    #             ','.join(['?' for _ in ids])
    #         )
    #         total_params = ids
    #
    #     else:
    #         # 通常のソート順で取得
    #         query = base_query.format(
    #             where_clause = f'AND rp.id IN ({",".join(["?" for _ in ids])})',
    #             order = 'DESC' if order == 'desc' else 'ASC'
    #         )
    #         params = [*ids, str(PAGE_SIZE), str((page - 1) * PAGE_SIZE)]
    #
    #         # 総数を取得
    #         total_query = 'SELECT COUNT(*) as count FROM recorded_programs WHERE id IN ({})'.format(
    #             ','.join(['?' for _ in ids])
    #         )
    #         total_params = ids
    #
    # else:
    #     where_parts = []
    #     params = []
    #     if major_genres is not None:
    #         where_parts.append('''
    #         AND EXISTS (
    #         SELECT 1
    #         FROM json_each(rp.genres) AS gen
    #         WHERE json_extract(gen.value, '$.major') = ?
    #         )
    #         ''')
    #         params.append(major_genres)
    #
    #     if only_viewable == '1':
    #         where_parts.append('''
    #         AND rv.key_frames != '[]'
    #         ''')
    #
    #     if from_date is not None and datetime.strptime(from_date, '%Y-%m-%d'):
    #         where_parts.append('''
    #                     AND rv.recording_start_time >= ?
    #                     ''')
    #         params.append(from_date)
    #
    #     if to_date is not None and (to_date_obj := datetime.strptime(to_date, '%Y-%m-%d')):
    #         to_date_obj = to_date_obj + timedelta(days=1)
    #         where_parts.append('''
    #                     AND rv.recording_start_time < ?
    #                     ''')
    #         params.append(to_date_obj.strftime('%Y-%m-%d'))
    #
    #
    #     total_params = copy.copy(params)
    #
    #     query = base_query.format(
    #         where_clause=' '.join(where_parts),
    #         order='DESC' if order == 'desc' else 'ASC'
    #     )
    #
    #     params.append(str(PAGE_SIZE))
    #     params.append(str((page - 1) * PAGE_SIZE))
    #
    #     # 総数を取得
    #     total_query = '''
    #     SELECT COUNT(*) as count
    #     FROM recorded_programs rp
    #     JOIN recorded_videos rv ON rp.id = rv.recorded_program_id
    #     LEFT JOIN channels ch ON rp.channel_id = ch.id
    #     WHERE 1=1
    #     {where_clause}
    #     '''.format(
    #         where_clause = ' '.join(where_parts),
    #     )
    #
