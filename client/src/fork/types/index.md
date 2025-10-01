# Types

このディレクトリには、番組表アプリケーション全体で使用される型定義が含まれています。

## ファイル一覧

### `timetable.ts`
録画番組番組表の型定義

- **エクスポート:**
  - `Program`: 番組情報の型
    - 基本情報: id, title, subtitle, description
    - 放送情報: start_time, duration, channel_id
    - メタデータ: genres, detail, recorded_video
  - `Channel`: チャンネル情報の型
    - id, name
  - `TabData`: 日付タブの型
    - date, label, isToday, isSelected, dayOfWeek, daysAgo
  - `TimePeriod`: 時間帯情報の型
    - key, label, startTime, hour

**用途:** これらの型は、番組表コンポーネント、ユーティリティ関数、Composableなどで共有され、型安全性を保証します。