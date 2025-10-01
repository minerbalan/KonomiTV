# Composables

このディレクトリには、Vue Composition APIを使用した再利用可能なロジックが含まれています。

## ファイル一覧

### `useDateTabs.ts`
日付タブ管理用のComposable

- **パラメータ:**
  - `displayDate: Ref<Date>` - 表示中の日付

- **戻り値:**
  - `weekTabs`: 一週間分の日付タブデータ（今日から過去6日分）
  - `isOutsideWeekRange`: 選択されている日付が週間範囲外かどうか
  - `calendarTabContent`: カレンダータブの表示内容

**用途:** 日付タブの生成とラベルフォーマットを管理します。

### `useScroll.ts`
番組表のスクロール管理用Composable

- **パラメータ:**
  - `scrollContainer: Ref<HTMLElement | null>` - スクロールコンテナの参照
  - `displayDate: Ref<Date>` - 表示中の日付

- **戻り値:**
  - `setInitialScrollPosition()`: 初期スクロール位置を設定（現在時刻を中心に表示）
  - `scrollToTimePeriod(targetHourIndex)`: 指定された時間帯にスクロール

**設計:** PIXELS_PER_HOURを使用してスムーズなスクロール動作を実現。

### `useTimetableTime.ts`
番組表の時間軸計算用Composable

- **パラメータ:**
  - `displayDate: Ref<Date>` - 表示中の日付

- **戻り値:**
  - `timeHours`: 時間軸表示用データ（開始時刻から24時間分）
  - `timetableHeight`: 番組表の固定高さ（ピクセル）

**設計:** TIMETABLE_START_HOURを基準に24時間分の時間ラベルを生成。

### `useTooltip.ts`
ツールチップ管理用Composable

- **パラメータ:**
  - `scrollContainer: Ref<HTMLElement | null>` - スクロールコンテナの参照

- **戻り値:**
  - `tooltipVisible`: ツールチップの表示状態
  - `tooltipProgram`: 表示中の番組データ
  - `tooltipStyle`: ツールチップの位置スタイル
  - `showTooltip(program, event)`: ツールチップを表示（300ms遅延）
  - `hideTooltip()`: ツールチップを非表示（200ms遅延）
  - `onTooltipMouseEnter()`: ツールチップにマウスが入った時の処理
  - `onTooltipMouseLeave()`: ツールチップからマウスが離れた時の処理

**設計:** タイマーを使用した遅延表示により、誤操作を防ぐUXを実現。