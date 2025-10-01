# Utils

このディレクトリには、番組表アプリケーション全体で使用されるユーティリティ関数が含まれています。

## ファイル一覧

### `dateFormat.ts`
日付・時刻のフォーマット関連ユーティリティ

- **エクスポート:**
  - `formatMonthDay(date)`: 日付を M/D 形式でフォーマット
  - `formatDateToISOString(date)`: 日付を YYYY-MM-DD 形式でフォーマット（ローカル日時）
  - `formatDateToJapanese(date)`: 日付を「YYYY年M月D日」形式でフォーマット
  - `getShortWeekday(date)`: 曜日を短縮形式で取得（例: 月、火、水）
  - `parseCalendarDate(value)`: カレンダーから選択された日付をローカル日時のDateオブジェクトに変換
  - `calculateHourIndex(hour)`: 4時基準の新聞式番組表での時間インデックスを計算
  - `formatMinutesOnly(dateString)`: 分のみを表示（例：20:00 → 00、21:15 → 15）
  - `formatTimeRange(startTime, duration)`: 時刻範囲をフォーマット（開始時刻 〜 終了時刻）

### `formatters.ts`
データフォーマット用ユーティリティ

- **エクスポート:**
  - `formatDuration(seconds)`: 録画時間をフォーマット（秒 → 時:分:秒）
  - `formatFileSize(bytes)`: ファイルサイズをフォーマット（バイト → GB/MB/KB）

### `genreStyles.ts`
ジャンル色スタイル生成ユーティリティ

- **エクスポート:**
  - `getGenreStripeStyle(genres)`: 左ボーダーストライプのスタイルを生成
  - `getGenreBackgroundStyle(genres)`: 背景グラデーションのスタイルを生成（通常時）
  - `getGenreBackgroundHoverStyle(genres)`: 背景グラデーションのスタイルを生成（ホバー時）

**設計:** 不透明な背景色の上にジャンル色を重ねる方式。単一ジャンルは単色、複数ジャンルは最大3色までグラデーション表示。

### `programLayout.ts`
番組レイアウト計算ユーティリティ

- **エクスポート:**
  - `getProgramStyle(program, programIndex, displayDate)`: 番組のスタイル（位置、サイズ、ジャンル色、z-index）を計算
  - `calculateCurrentTimePosition(currentTime, displayDate)`: 現在時刻ラインの位置を計算

**設計:** PIXELS_PER_MINUTEを基準として、番組の開始時刻と長さから絶対位置を計算します。