<template>
    <div class="route-container">
        <HeaderBar />
        <main>
            <Navigation />
            <div class="recorded-programs-container-wrapper">
                <SPHeaderBar />
                <div class="recorded-programs-container">
                    <Breadcrumbs :crumbs="[
                        { name: 'ホーム', path: '/' },
                        { name: 'ビデオをみる', path: '/videos/' },
                        { name: '録画番組一覧（Fork版）', path: '/fork/videos/programs', disabled: true },
                    ]" />
                    <ForkRecordedProgramList
                        title="録画番組一覧（Fork版）"
                        :programs="programs"
                        :total="total_programs"
                        :page="current_page"
                        :sortOrder="sort_order"
                        :isLoading="is_loading"
                        :showBackButton="true"
                        :showEmptyMessage="!is_loading"
                        :showCustomChoice="true"
                        :customSearch="custom_search"
                        @update:page="updatePage"
                        @update:sortOrder="updateSortOrder($event as SortOrder)"
                        @update:customSearch="updateCustomSearch" />
                </div>
            </div>
        </main>
    </div>
</template>
<script lang="ts" setup>

import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Breadcrumbs from '@/components/Breadcrumbs.vue';
import HeaderBar from '@/components/HeaderBar.vue';
import Navigation from '@/components/Navigation.vue';
import SPHeaderBar from '@/components/SPHeaderBar.vue';
import ForkRecordedProgramList from '@/fork/components/ForkRecordedProgramList.vue';
import { IRecordedProgram, ICustomSearch, SortOrder } from '@/fork/services/ForkVideos';
import ForkVideos from '@/fork/services/ForkVideos';
import useUserStore from '@/stores/UserStore';

// ルーター
const route = useRoute();
const router = useRouter();

// 録画番組のリスト
const programs = ref<IRecordedProgram[]>([]);
const total_programs = ref(0);
const is_loading = ref(true);

// 現在のページ番号
const current_page = ref(1);

// 並び順
const sort_order = ref<'desc' | 'asc'>('desc');

// Fork機能: カスタム検索条件
const custom_search = ref<ICustomSearch>({});

// 録画番組を取得
const fetchPrograms = async () => {
    const result = await ForkVideos.fetchVideos(sort_order.value, current_page.value, null, custom_search.value);
    if (result) {
        programs.value = result.recorded_programs;
        total_programs.value = result.total;
    }
    is_loading.value = false;
};

// ページを更新
const updatePage = async (page: number) => {
    current_page.value = page;
    is_loading.value = true;
    await router.replace({
        query: {
            ...route.query,
            page: page.toString(),
        },
    });
};

// 並び順を更新
const updateSortOrder = async (order: 'desc' | 'asc') => {
    sort_order.value = order;
    current_page.value = 1;  // ページを1に戻す
    is_loading.value = true;
    await router.replace({
        query: {
            ...route.query,
            order,
            page: '1',
        },
    });
};

// Fork機能: カスタム検索条件を更新
const updateCustomSearch = async (customSearch: ICustomSearch) => {
    custom_search.value = customSearch;
    current_page.value = 1;  // ページを1に戻す
    is_loading.value = true;

    // URLクエリパラメータを構築
    const queryParams: Record<string, string> = {
        ...route.query,
        page: '1',
    };

    // カスタム検索パラメータをクエリに追加
    if (customSearch.major_genres) {
        queryParams.major_genres = customSearch.major_genres;
    } else {
        delete queryParams.major_genres;
    }

    if (customSearch.from_date) {
        queryParams.from_date = customSearch.from_date;
    } else {
        delete queryParams.from_date;
    }

    if (customSearch.to_date) {
        queryParams.to_date = customSearch.to_date;
    } else {
        delete queryParams.to_date;
    }

    await router.replace({
        query: queryParams,
    });
};

// クエリパラメータが変更されたら録画番組を再取得
watch(() => route.query, async (newQuery) => {
    // ページ番号を同期
    if (newQuery.page) {
        current_page.value = parseInt(newQuery.page as string);
    }
    // ソート順を同期
    if (newQuery.order) {
        sort_order.value = newQuery.order as 'desc' | 'asc';
    }
    // Fork機能: カスタム検索条件を同期
    const newCustomSearch: ICustomSearch = {};
    if (newQuery.major_genres) {
        newCustomSearch.major_genres = newQuery.major_genres as string;
    }
    if (newQuery.from_date) {
        newCustomSearch.from_date = newQuery.from_date as string;
    }
    if (newQuery.to_date) {
        newCustomSearch.to_date = newQuery.to_date as string;
    }
    custom_search.value = newCustomSearch;

    await fetchPrograms();
}, { deep: true });

// 開始時に実行
onMounted(async () => {
    // 事前にログイン状態を同期（トークンがあればユーザー情報を取得）
    const userStore = useUserStore();
    await userStore.fetchUser();

    // クエリパラメータから初期値を設定
    if (route.query.page) {
        current_page.value = parseInt(route.query.page as string);
    }
    if (route.query.order) {
        sort_order.value = route.query.order as 'desc' | 'asc';
    }

    // Fork機能: カスタム検索条件の初期値を設定
    const initialCustomSearch: ICustomSearch = {};
    if (route.query.major_genres) {
        initialCustomSearch.major_genres = route.query.major_genres as string;
    }
    if (route.query.from_date) {
        initialCustomSearch.from_date = route.query.from_date as string;
    }
    if (route.query.to_date) {
        initialCustomSearch.to_date = route.query.to_date as string;
    }
    custom_search.value = initialCustomSearch;

    // 録画番組を取得
    await fetchPrograms();
});

</script>
<style lang="scss" scoped>

.recorded-programs-container-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.recorded-programs-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 20px;
    margin: 0 auto;
    min-width: 0;
    max-width: 1000px;
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