<template>
    <div class="route-container">
        <HeaderBar />
        <main>
            <Navigation />
            <div class="recorded-timetable-container-wrapper">
                <SPHeaderBar />
                <div class="recorded-timetable-container">
                    <Breadcrumbs :crumbs="[
                        { name: 'ホーム', path: '/' },
                        { name: 'ビデオをみる', path: '/videos/' },
                        { name: '録画番組番組表（Fork版）', path: '/fork/videos/timetable', disabled: true },
                    ]" />
                    <ForkRecordedTimetable
                        title="録画番組番組表（Fork版）"
                        :programs="programs"
                        :channels="channels"
                        :isLoading="is_loading"
                        :initialDate="initialDate"
                        @fetchProgramData="fetchProgramData"
                        @programClick="handleProgramClick" />
                </div>
            </div>
        </main>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import Breadcrumbs from '@/components/Breadcrumbs.vue';
import HeaderBar from '@/components/HeaderBar.vue';
import Navigation from '@/components/Navigation.vue';
import SPHeaderBar from '@/components/SPHeaderBar.vue';
import ForkRecordedTimetable from '@/fork/components/ForkRecordedTimetable.vue';
import ForkVideos from '@/fork/services/ForkVideos';
import { IForkRecordedProgram } from '@/fork/services/ForkVideos';
import { IChannel } from '@/services/Channels';
import type { Program, Channel } from '@/fork/types/timetable';
import useUserStore from '@/stores/UserStore';
import {IRecordedProgram} from "@/services/Videos";

const router = useRouter();
const route = useRoute();

// ローディング状態
const is_loading = ref(true);

// URLクエリパラメータから初期日付を取得
const initialDate = computed(() => {
    const dateParam = route.query.date as string | undefined;
    if (dateParam) {
        const parsed = new Date(dateParam);
        // 有効な日付かつ未来の日付でないかチェック
        if (!isNaN(parsed.getTime()) && parsed <= new Date()) {
            return parsed;
        }
    }
    return undefined;
});

// 番組データとチャンネルデータ
const programs = ref<Program[]>([]);
const channels = ref<Channel[]>([]);

// 番組クリック時の処理
const handleProgramClick = (program: { id: number }) => {
    // 動画再生画面に遷移（リファラー情報と現在の日付を付与）
    const currentDate = route.query.date as string | undefined;
    router.push({
        path: `/videos/watch/${program.id}`,
        query: {
            referrer: 'fork-timetable',
            ...(currentDate && { timetable_date: currentDate })
        }
    });
};

// 番組データを取得する関数
const fetchProgramData = async (date: Date) => {
    is_loading.value = true;

    // 日付をYYYY-MM-DD形式に変換（ローカル日時として）
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const search_date = `${year}-${month}-${day}`;

    // URLクエリパラメータを更新（履歴汚染を防ぐためreplaceを使用）
    router.replace({
        query: { date: search_date }
    });

    try {
        // API呼び出し
        const result = await ForkVideos.fetchVideoTimetable(search_date);
        console.log(result);

        if (result) {
            // 番組データを変換（Fork機能: fork_recorded_videoも含める）
            programs.value = result.recorded_programs.map((program: IForkRecordedProgram) => ({
                id: program.id,
                title: program.title,
                subtitle: program.subtitle || undefined,
                description: program.description || undefined,
                start_time: program.start_time,
                duration: program.duration,
                channel_id: program.channel?.id || '',
                genres: program.genres,
                detail: program.detail,
                recorded_video: program.recorded_video ? {
                    file_size: program.recorded_video.file_size,
                    duration: program.recorded_video.duration,
                    video_resolution_width: program.recorded_video.video_resolution_width,
                    video_resolution_height: program.recorded_video.video_resolution_height,
                    video_codec: program.recorded_video.video_codec,
                    // Fork機能: コメント数情報を含める
                    fork_recorded_video: program.recorded_video.fork_recorded_video,
                } : undefined,
            }));

            // チャンネルデータを抽出（重複を除く）
            const channelMap = new Map<string, IChannel>();
            result.recorded_programs.forEach((program: IForkRecordedProgram) => {
                if (program.channel && !channelMap.has(program.channel.id)) {
                    channelMap.set(program.channel.id, program.channel);
                }
            });
            // チャンネル番号順にソート
            channels.value = Array.from(channelMap.values())
                .sort((a, b) => a.channel_number.localeCompare(b.channel_number))
                .map(channel => ({
                    id: channel.id,
                    name: channel.name,
                }));
        } else {
            // エラーの場合は空配列
            programs.value = [];
            channels.value = [];
        }
    } catch (error) {
        console.error('番組データの取得に失敗しました:', error);
        programs.value = [];
        channels.value = [];
    } finally {
        is_loading.value = false;
    }
};

// 開始時に実行
onMounted(async () => {
    // 事前にログイン状態を同期（トークンがあればユーザー情報を取得）
    const userStore = useUserStore();
    await userStore.fetchUser();

    // 初期データ取得は子コンポーネント（ForkRecordedTimetable）のonMountedで実行される
    is_loading.value = false;
});
</script>

<style lang="scss" scoped>
.recorded-timetable-container-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.recorded-timetable-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 20px;
    margin: 0 auto;
    min-width: 0;
    // Fork機能: 大画面で番組表を広く使えるようmax-widthを削除
    @include smartphone-horizontal {
        padding: 16px 20px !important;
    }
    @include smartphone-horizontal-short {
        padding: 16px 16px !important;
    }
    @include smartphone-vertical {
        padding: 16px 8px !important;
        padding-top: 8px !important;
    }
}
</style>