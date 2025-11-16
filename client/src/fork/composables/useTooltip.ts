/**
 * ツールチップ管理用Composable
 */

import { ref, type Ref } from 'vue';
import type { Program } from '@/fork/types/timetable';

/**
 * ツールチップの状態とタイマー管理
 */
export const useTooltip = (scrollContainer: Ref<HTMLElement | null>) => {
    const tooltipVisible = ref(false);
    const tooltipProgram = ref<Program | null>(null);
    const tooltipStyle = ref<Record<string, string>>({});

    let hideTooltipTimeout: number | null = null;
    let showTooltipTimeout: number | null = null;

    /**
     * ツールチップを表示（遅延あり）
     */
    const showTooltip = (program: Program, event: MouseEvent) => {
        // 既存の非表示タイマーをキャンセル
        if (hideTooltipTimeout !== null) {
            clearTimeout(hideTooltipTimeout);
            hideTooltipTimeout = null;
        }

        // 既存の表示タイマーをキャンセル
        if (showTooltipTimeout !== null) {
            clearTimeout(showTooltipTimeout);
            showTooltipTimeout = null;
        }

        // 番組要素の位置を事前に取得（タイムアウト前）
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const gridRect = scrollContainer.value?.getBoundingClientRect();

        if (!gridRect) return;

        // 画面の中央を基準に左右を判定
        const screenCenter = window.innerWidth / 2;
        const showOnRight = rect.left < screenCenter;

        // ツールチップの幅
        const tooltipWidth = 350;
        const gap = 8;

        let left: number;
        let top: number;

        if (showOnRight) {
            // 右側に表示
            left = rect.right + gap;
        } else {
            // 左側に表示
            left = rect.left - tooltipWidth - gap;
        }

        // 上端に配置（番組要素の上端に合わせる）
        top = rect.top;

        // 画面からはみ出さないように調整
        if (left + tooltipWidth > window.innerWidth) {
            left = window.innerWidth - tooltipWidth - 16;
        }
        if (left < 16) {
            left = 16;
        }
        if (top + 200 > window.innerHeight) {
            top = window.innerHeight - 200 - 16;
        }
        if (top < 16) {
            top = 16;
        }

        // 300ms後にツールチップを表示
        showTooltipTimeout = window.setTimeout(() => {
            tooltipProgram.value = program;
            tooltipVisible.value = true;

            tooltipStyle.value = {
                left: `${left}px`,
                top: `${top}px`,
            };
        }, 300);
    };

    /**
     * ツールチップを非表示（遅延あり）
     */
    const hideTooltip = () => {
        // 表示タイマーをキャンセル
        if (showTooltipTimeout !== null) {
            clearTimeout(showTooltipTimeout);
            showTooltipTimeout = null;
        }

        // 200ms後に非表示にする（ツールチップに移動する時間を確保）
        hideTooltipTimeout = window.setTimeout(() => {
            tooltipVisible.value = false;
            tooltipProgram.value = null;
        }, 200);
    };

    /**
     * ツールチップにマウスが入った時はキャンセル
     */
    const onTooltipMouseEnter = () => {
        if (hideTooltipTimeout !== null) {
            clearTimeout(hideTooltipTimeout);
            hideTooltipTimeout = null;
        }
    };

    /**
     * ツールチップからマウスが離れた時は即座に非表示
     */
    const onTooltipMouseLeave = () => {
        tooltipVisible.value = false;
        tooltipProgram.value = null;
    };

    return {
        tooltipVisible,
        tooltipProgram,
        tooltipStyle,
        showTooltip,
        hideTooltip,
        onTooltipMouseEnter,
        onTooltipMouseLeave
    };
};