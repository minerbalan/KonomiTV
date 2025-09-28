import anyio
from tortoise import connections

from app import logging

from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from app.constants import THUMBNAILS_DIR
from app.models.RecordedProgram import RecordedProgram

router = APIRouter(
    tags = ['ForkVideoTimetable'],
    prefix = '/api/fork/clean/database',
)


async def clean_database(folder_path: str):
    query = """
SELECT rp.id, rv.file_hash FROM recorded_programs rp
LEFT JOIN recorded_videos rv
ON rp.id = rv.recorded_program_id

WHERE rv.file_path like ?
ORDER BY rp.id
    """
    like_folder_path = f'{folder_path}%'
    try:
        # データベースから直接クエリを実行
        conn = connections.get('default')
        rows = await conn.execute_query(query, [like_folder_path])

        for row in rows[1]:  # rows[0] はカラム情報、rows[1] が実際のデータ
            await delete_file(row['id'], row['file_hash'])


    except Exception as ex:
        logging.error('[ForkCleanDatabaseAPI] Failed to execute raw SQL query:', exc_info=ex)



async def delete_file(id: int, file_hash: str):
        try:
            # 同じ file_hash を持つ他のレコードが存在するかチェック
            duplicate_records = await RecordedProgram.filter(
                recorded_video__file_hash=file_hash,
            ).exclude(id=id).count()
            has_duplicates = duplicate_records > 0

        except Exception as ex:
            logging.error('[ForkCleanDatabaseAPI] Failed to delete recorded program from database:', exc_info=ex)
            return

        # 同じ file_hash を持つ他のレコードが存在する場合はスキップ
        thumbnails_dir = anyio.Path(str(THUMBNAILS_DIR))
        if await thumbnails_dir.is_dir() and not has_duplicates:
            # 通常サムネイル (.webp または .jpg)
            for ext in ['.webp', '.jpg']:
                thumbnail_path = thumbnails_dir / f'{file_hash}{ext}'
                if await thumbnail_path.is_file():
                    try:
                        await thumbnail_path.unlink()
                    except Exception as ex:
                        logging.error(f'[ForkCleanDatabaseAPI] Failed to delete thumbnail file: {thumbnail_path}',
                                      exc_info=ex)
                        return
                elif ext == '.webp':  # JPEG はよほど長尺でない限り発生しないので WebP のみチェック
                    logging.warning(f'[ForkCleanDatabaseAPI] Thumbnail file does not exist: {thumbnail_path}')

            # タイルサムネイル (.webp または .jpg)
            for ext in ['.webp', '.jpg']:
                tile_thumbnail_path = thumbnails_dir / f'{file_hash}_tile{ext}'
                if await tile_thumbnail_path.is_file():
                    try:
                        await tile_thumbnail_path.unlink()
                    except Exception as ex:
                        logging.error(f'[ForkCleanDatabaseAPI] Failed to delete tile thumbnail file: {tile_thumbnail_path}',
                                      exc_info=ex)
                        return
                elif ext == '.webp':  # JPEG はよほど長尺でない限り発生しないので WebP のみチェック
                    logging.warning(f'[ForkCleanDatabaseAPI] Tile thumbnail file does not exist: {tile_thumbnail_path}')
        elif has_duplicates:
            logging.info(
                f'[ForkCleanDatabaseAPI] Skip deleting thumbnail files because other records with the same file_hash exist: {file_hash}')

        await RecordedProgram.filter(id=id).delete()

class CleanRequest(BaseModel):
    folder_path: str

@router.post(
    '',
    summary = 'クリーンアップ API',
)
async def clean_database_api(
    request: CleanRequest,background_tasks: BackgroundTasks
):
    background_tasks.add_task(clean_database, request.folder_path)
    return "OK"
