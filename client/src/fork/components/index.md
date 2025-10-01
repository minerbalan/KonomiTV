# Components

このディレクトリには、録画番組表と関連機能のVueコンポーネントが含まれています。

## ファイル一覧

### 番組表関連コンポーネント

#### `ForkRecordedTimetable.vue`
録画番組表のメインコンテナコンポーネント

- **Props:**
  - `title`: 番組表のタイトル
  - `programs`: 番組データ配列
  - `channels`: チャンネルデータ配列
  - `isLoading`: ローディング状態

- **Emits:**
  - `programClick`: 番組がクリックされた時
  - `fetchProgramData`: 番組データの取得が必要な時

- **機能:**
  - 日付タブナビゲーション
  - 時間帯ボタン
  - カレンダー選択ダイアログ
  - 番組表グリッドの表示制御

**設計:** Composableを活用してロジックを分離し、コンポーネント自体はプレゼンテーションに集中。

#### `ForkRecordedTimetableGrid.vue`
番組表グリッドコンポーネント（グリッドレイアウトと番組表示）

- **Props:**
  - `programs`: 番組データ配列
  - `channels`: チャンネルデータ配列
  - `displayDate`: 表示する日付
  - `currentTime`: 現在時刻

- **Emits:**
  - `programClick`: 番組がクリックされた時

- **Expose:**
  - `scrollToTimePeriod(hourIndex)`: 指定時間帯にスクロール
  - `setInitialScrollPosition()`: 初期スクロール位置を設定

- **機能:**
  - CSS Gridを使用した番組表レイアウト
  - ジャンル別色表示（左ボーダーストライプ + 背景グラデーション）
  - ツールチップ表示
  - 現在時刻インジケーター

**設計:** 1042行から652行に削減（リファクタリング後）。Composableとユーティリティ関数を活用。

#### `ForkRecordedTimetableHeader.vue`
番組表のヘッダーコンポーネント

- **Props:**
  - `title`: タイトル
  - `isLoading`: ローディング状態
  - `totalPrograms`: 総番組数
  - `currentDateLabel`: 現在の日付ラベル

- **Emits:**
  - `previousDay`: 前日ボタンクリック
  - `today`: 今日ボタンクリック
  - `nextDay`: 翌日ボタンクリック

#### `ForkRecordedTimetableDateTabs.vue`
日付タブコンポーネント

- **Props:**
  - `weekTabs`: 週間タブデータ配列
  - `isOutsideWeekRange`: 範囲外フラグ
  - `calendarTabContent`: カレンダータブの内容

- **Emits:**
  - `tabClick`: タブがクリックされた時
  - `showCalendar`: カレンダー表示要求

#### `ForkRecordedTimetableTimePeriods.vue`
時間帯ボタンコンポーネント

- **Props:**
  - `timePeriods`: 時間帯データ配列（readonly）
  - `selectedTimePeriod`: 選択中の時間帯

- **Emits:**
  - `scrollToPeriod`: 時間帯ボタンクリック

### その他のコンポーネント

#### `ForkRecordedProgramList.vue`
録画番組リスト表示コンポーネント

#### `ForkVideoChoice.vue`
動画選択コンポーネント

#### `ForkResponsiveSelect.vue`
レスポンシブ対応セレクトボックスコンポーネント

## コンポーネント構造

```
ForkRecordedTimetable (メインコンテナ)
├── ForkRecordedTimetableHeader (ヘッダー)
├── ForkRecordedTimetableDateTabs (日付タブ)
├── ForkRecordedTimetableTimePeriods (時間帯ボタン)
└── ForkRecordedTimetableGrid (グリッド)
```