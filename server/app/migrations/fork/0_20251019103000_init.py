
from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE fork_recorded_videos(
            recorded_video_id INTEGER not null primary key references recorded_videos on delete cascade ,
            comment_count INTEGER
        );
    """


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE fork_recorded_videos;
    """
