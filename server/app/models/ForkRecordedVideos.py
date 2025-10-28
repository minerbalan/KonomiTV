
# Type Hints を指定できるように
# ref: https://stackoverflow.com/a/33533514/17124142
from __future__ import annotations

from tortoise import fields
from tortoise.models import Model as TortoiseModel

from app.models.RecordedVideo import RecordedVideo


class ForkRecordedVideo(TortoiseModel):
    class Meta(TortoiseModel.Meta):
        table: str = 'fork_recorded_videos'

    recorded_video: fields.OneToOneRelation[RecordedVideo] = fields.OneToOneField('models.RecordedVideo', related_name='fork_recorded_video',on_delete=fields.CASCADE,pk=True)

    comment_count = fields.IntField(null=True)
