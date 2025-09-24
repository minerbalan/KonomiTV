<template>
    <div class="video-choice">
        <div class="filters">
            <ForkResponsiveSelect
                v-model="selectedGenre"
                :options="genreOptions"
                placeholder="ジャンル"
            />
            <ForkResponsiveSelect
                v-model="selectedDate"
                :options="dateOptions"
                placeholder="日付"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, withDefaults, defineProps, defineEmits } from 'vue';

import ForkResponsiveSelect from './ForkResponsiveSelect.vue';

import type { ICustomSearch } from '@/services/Videos';


defineOptions({ name: 'ForkVideoChoice' });

type Option<T = string | number | null> = { value: T; label: string };

const WEEKDAY_JA = ['日','月','火','水','木','金','土'] as const;

// 型付き props 定義（未指定時は空オブジェクトをデフォルトに）
const props = withDefaults(defineProps<{
    customSearch?: ICustomSearch
}>(), {
    customSearch: () => ({})
});

// 親へ通知するイベントを型付きで定義
const emit = defineEmits<{
    // v-model:customSearch 互換
    (e: 'update:customSearch', payload: ICustomSearch): void;
    // 便利イベント（選択された生の値）
    (e: 'change', payload: { genre: string | null; date: string | null }): void;
}>();

// 選択状態
const selectedGenre = ref<string | null>(null);
const selectedDate = ref<string | null>(null);

// オプション（ジャンル）
const genreOptions: Option<string | null>[] = [
    { value: null,     label: '全て' },
    { value: 'ニュース・報道',   label: 'ニュース・報道' },
    { value: 'スポーツ',         label: 'スポーツ' },
    { value: '情報・ワイドショー', label: '情報・ワイドショー' },
    { value: 'ドラマ',           label: 'ドラマ' },
    { value: '音楽',             label: '音楽' },
    { value: 'バラエティ',       label: 'バラエティ' },
    { value: '映画',             label: '映画' },
    { value: 'アニメ・特撮',     label: 'アニメ・特撮' },
    { value: 'ドキュメンタリー・教養', label: 'ドキュメンタリー・教養' },
    { value: '劇場・公演',       label: '劇場・公演' },
    { value: '趣味・教育',       label: '趣味・教育' },
    { value: '福祉',             label: '福祉' },
    { value: 'その他',           label: 'その他' },
];

// オプション（日付）
function buildDateOptions(): Option<string | null>[] {
    const opts: Option<string | null>[] = [{ value: null, label: '全て' }];
    for (let i = 0; i <= 7; i++) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const w = WEEKDAY_JA[d.getDay()];
        const label = `${mm}/${dd}(${w})`;
        const value = `${yyyy}-${mm}-${dd}`;
        opts.push({ value, label });
    }
    opts.push({ value: 'older', label: 'それ以前' });
    return opts;
}
const dateOptions = ref<Option<string | null>[]>(buildDateOptions());

// props から初期選択を反映
function initFromProps() {
    // ジャンル
    selectedGenre.value = props.customSearch?.major_genres ?? null;

    // 日付
    const values = dateOptions.value.map(o => o.value);
    const from = props.customSearch?.from_date;
    const to = props.customSearch?.to_date;

    if (!from && !to) {
        selectedDate.value = null; // 全て
        return;
    }
    if (from && to && from === to && values.includes(to)) {
        selectedDate.value = to; // 単一日付一致
        return;
    }
    if (!from && to) {
        // to_dateのみが設定されている場合は「それ以前」
        selectedDate.value = 'older';
        return;
    }
    // その他の場合も「それ以前」として扱う
    selectedDate.value = 'older';
}

// 選択状態から ICustomSearch を生成
function buildSearchFromSelection(): ICustomSearch {
    const base: ICustomSearch = {};
    if (selectedGenre.value) {
        base.major_genres = selectedGenre.value;
    }
    if (selectedDate.value) {
        if (selectedDate.value === 'older') {
            // "それ以前"が選択された場合は8日前を終了日とする
            const olderDate = new Date();
            olderDate.setHours(0, 0, 0, 0);
            olderDate.setDate(olderDate.getDate() - 8);
            const yyyy = olderDate.getFullYear();
            const mm = String(olderDate.getMonth() + 1).padStart(2, '0');
            const dd = String(olderDate.getDate()).padStart(2, '0');
            base.to_date = `${yyyy}-${mm}-${dd}`;
        } else {
            // 特定の日付が選択された場合
            base.from_date = selectedDate.value;
            base.to_date = selectedDate.value;
        }
    }
    return base;
}

// ICustomSearch の浅い同値判定
function isSameSearch(a: ICustomSearch, b: ICustomSearch): boolean {
    return (a.major_genres ?? null) === (b.major_genres ?? null) &&
           (a.from_date ?? null) === (b.from_date ?? null) &&
           (a.to_date ?? null) === (b.to_date ?? null);
}

// 初期化完了フラグ（props -> ローカル反映が完了したら true）
const initialized = ref(false);

// props 変更時に即時反映（初期化も兼ねる）
watch(() => props.customSearch, () => {
    initFromProps();
    if (!initialized.value) initialized.value = true;
}, { deep: true, immediate: true });

// ローカル選択が変更されたら親へ通知
watch([selectedGenre, selectedDate], () => {
    if (!initialized.value) return;
    const next = buildSearchFromSelection();
    // v-model 互換イベント（同値なら抑止）
    if (!isSameSearch(next, props.customSearch ?? {} as ICustomSearch)) {
        emit('update:customSearch', next);
    }
    // 便利イベント
    emit('change', { genre: selectedGenre.value, date: selectedDate.value });
});
</script>

<style scoped>
.video-choice .filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.video-choice .filters > * {
  flex: 1 1 auto;
  min-width: 160px;
}
</style>