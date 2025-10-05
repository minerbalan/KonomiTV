<template>
    <Watch :playback_mode="'Video'" />
</template>
<script lang="ts">

import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

import Watch from '@/components/Watch/Watch.vue';
import ForkAutoplay from '@/fork/services/ForkAutoplay';  // Fork機能: 動画自動再生
import PlayerController from '@/services/player/PlayerController';
import Videos from '@/services/Videos';
import usePlayerStore from '@/stores/PlayerStore';
import useSettingsStore from '@/stores/SettingsStore';

// PlayerController のインスタンス
// data() 内に記述すると再帰的にリアクティブ化され重くなる上リアクティブにする必要自体がないので、グローバル変数にしている
let player_controller: PlayerController | null = null;

export default defineComponent({
    name: 'Video-Watch',
    components: {
        Watch,
    },
    computed: {
        ...mapStores(usePlayerStore, useSettingsStore),
    },
    // 開始時に実行
    created() {

        // 下記以外の視聴画面の開始処理は Watch コンポーネントの方で自動的に行われる

        // 再生セッションを初期化
        this.init();

        // Fork機能: 動画自動再生
        // ビデオ再生終了イベントのリスナーを登録
        // thisコンテキストを保持するためbindする
        this.playerStore.event_emitter.on('VideoEnded', this.forkHandleVideoEnded.bind(this));
    },
    // チャンネル切り替え時に実行
    // コンポーネント（インスタンス）は再利用される
    // ref: https://v3.router.vuejs.org/ja/guide/advanced/navigation-guards.html#%E3%83%AB%E3%83%BC%E3%83%88%E5%8D%98%E4%BD%8D%E3%82%AB%E3%82%99%E3%83%BC%E3%83%88%E3%82%99
    beforeRouteUpdate(to, from, next) {

        // 前の再生セッションを破棄して終了し、完了を待ってから再度初期化する
        const destroy_promise = this.destroy();
        destroy_promise.then(() => this.init());

        // 次のルートに置き換え
        next();
    },
    // 終了前に実行
    beforeUnmount() {

        // Fork機能: 動画自動再生
        // ビデオ再生終了イベントのリスナーを解除
        this.playerStore.event_emitter.off('VideoEnded', this.forkHandleVideoEnded);

        // destroy() を実行
        // 別のページへ遷移するため、DPlayer のインスタンスを確実に破棄する
        // さもなければ、ブラウザがリロードされるまでバックグラウンドで永遠に再生され続けてしまう
        this.destroy();

        // 上記以外の視聴画面の終了処理は Watch コンポーネントの方で自動的に行われる
    },
    methods: {

        // 再生セッションを初期化する
        async init() {

            // URL 上の録画番組 ID が未定義なら実行しない (フェイルセーフ)
            // 基本あり得ないはずだが、念のため
            if (this.$route.params.video_id === undefined) {
                this.$router.push({path: '/not-found/'});
                return;
            }

            // 録画番組情報を更新する
            const recorded_program = await Videos.fetchVideo(parseFloat(this.$route.params.video_id as string));
            if (recorded_program === null) {
                this.$router.push({path: '/not-found/'});
                return;
            }
            this.playerStore.recorded_program = recorded_program;

            // PlayerController を初期化
            player_controller = new PlayerController('Video');
            await player_controller.init();
        },

        // 再生セッションを破棄する
        // 再生する録画番組を切り替える際にも実行される
        async destroy() {

            // PlayerController を破棄
            if (player_controller !== null) {
                await player_controller.destroy();
                player_controller = null;
            }
        },

        // Fork機能: 動画自動再生
        // ビデオ再生終了時に後続番組を自動再生する
        async forkHandleVideoEnded() {

            // 自動再生設定が無効な場合は何もしない
            if (!this.settingsStore.settings.video_autoplay_enabled) {
                return;
            }

            // 現在の録画番組IDを取得
            const current_video_id = this.playerStore.recorded_program.id;

            // 後続番組を取得
            const next_program = await ForkAutoplay.fetchNextProgram(current_video_id);

            // 後続番組が存在しない、またはエラーの場合は何もしない
            if (next_program === null) {
                return;
            }

            // 現在のURLクエリパラメータを保持
            // リファラーなどのクエリを維持したまま次の動画に遷移
            const currentQuery = this.$route.query;

            // 後続番組のページに遷移
            // beforeRouteUpdateが実行され、既存のセッションが破棄されてから新しいセッションが初期化される
            this.$router.push({
                path: `/videos/watch/${next_program.id}`,
                query: currentQuery,  // クエリパラメータを保持
            });
        }
    }
});

</script>