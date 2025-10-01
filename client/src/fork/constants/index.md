# Constants

このディレクトリには、番組表アプリケーション全体で使用される定数定義が含まれています。

## ファイル一覧

### `genreColors.ts`
ジャンル別の色定義と不透明度設定

- **エクスポート:**
  - `GenreColor`: ジャンル色のRGB型定義
  - `GENRE_COLOR_MAP`: 13種類のジャンルごとの色マップ
  - `GENRE_OPACITY`: ジャンル色の不透明度設定（通常時、ホバー時など）

### `timetable.ts`
番組表の表示設定に関する定数

- **エクスポート:**
  - `PIXELS_PER_MINUTE`: 1分あたりのピクセル数（3.5px）
  - `PIXELS_PER_HOUR`: 1時間あたりのピクセル数（210px）
  - `TIMETABLE_START_HOUR`: 番組表の開始時刻（4時）
  - `TIMETABLE_DURATION_HOURS`: 番組表の表示時間（24時間）
  - `PROGRAM_MIN_HEIGHT`: 番組アイテムの最小高さ（25px）
  - `TIME_LABEL_HEIGHT`: 時刻ラベルの高さ（210px）
  - `CHANNEL_HEADER_HEIGHT`: チャンネルヘッダーの高さ（60px）
  - `TIME_COLUMN_WIDTH`: 時間軸カラムの幅（60px）

**設計思想:** すべての時間軸スケール関連の値は `PIXELS_PER_MINUTE` を基準に計算されており、この値を変更するだけで全体のスケールを統一して調整できます。

### `timePeriods.ts`
時間帯ボタンの定義

- **エクスポート:**
  - `TIME_PERIODS`: 時間帯の配列（朝、昼、夕、深夜）