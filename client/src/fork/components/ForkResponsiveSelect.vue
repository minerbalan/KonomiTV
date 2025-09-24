<template>
    <div class="responsive-select">
        <!-- PC用: 横長ボタンレイアウト（ブレークポイントでのみ切替） -->
        <div class="desktop-layout">
            <button
                v-for="option in options"
                :key="option.value"
                :class="[
                    'select-button',
                    sizeClass(option.label),
                    { active: modelValue === option.value }
                ]"
                @click="selectOption(option.value)"
            >
                {{ option.label }}
            </button>
        </div>

        <!-- モバイル用: ドロップダウンレイアウト（スマホ幅のみ） -->
        <div class="mobile-layout">
            <button
                class="dropdown-trigger"
                @click="toggleDropdown"
                :class="{ open: isOpen }"
            >
                <span class="selected-text">
                  {{ selectedLabel || placeholder }}
                </span>
                <svg class="dropdown-icon" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                </svg>
            </button>

            <transition name="dropdown">
                <ul v-show="isOpen" class="dropdown-menu">
                    <li
                        v-for="option in options"
                        :key="option.value"
                        :class="['dropdown-item', { selected: modelValue === option.value }]"
                        @click="selectOption(option.value)"
                    >
                        {{ option.label }}
                    </li>
                </ul>
            </transition>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ForkResponsiveSelect',
    props: {
        modelValue: {
            type: [String, null],
            default: null
        },
        options: {
            type: Array,
            required: true,
            validator: (options) => {
                return options.every(option =>
                    typeof option === 'object' &&
                    'value' in option &&
                    'label' in option
                );
            }
        },
        placeholder: {
            type: String,
            default: '選択してください'
        }
    },
    data() {
        return {
            isOpen: false,
            _docClickHandler: null
        };
    },
    computed: {
        selectedLabel() {
            const selected = this.options.find(option => option.value === this.modelValue);
            return selected ? selected.label : null;
        }
    },
    watch: {
        // オプション変更時、未選択なら先頭を選択
        options: {
            handler() {
                if ((this.modelValue === null || this.modelValue === undefined) && this.options && this.options.length > 0) {
                    this.$emit('update:modelValue', this.options[0].value);
                }
            },
            deep: true
        }
    },
    methods: {
        selectOption(value) {
            this.$emit('update:modelValue', value);
            this.isOpen = false;
        },
        toggleDropdown() {
            this.isOpen = !this.isOpen;
        },
        closeDropdown() {
            this.isOpen = false;
        },
        sizeClass(label) {
            const len = (label || '').length;
            if (len <= 3) return 'size-xs';
            if (len <= 6) return 'size-sm';
            if (len <= 10) return 'size-md';
            return 'size-lg';
        }
    },
    mounted() {
        // 初期選択（未指定時は先頭を選択）
        if ((this.modelValue === null || this.modelValue === undefined) && this.options && this.options.length > 0) {
            this.$emit('update:modelValue', this.options[0].value);
        }

        // 外側クリックでドロップダウンを閉じる
        this._docClickHandler = (e) => {
            if (!this.$el.contains(e.target)) {
                this.closeDropdown();
            }
        };
        document.addEventListener('click', this._docClickHandler);
    },
    beforeUnmount() {
        if (this._docClickHandler) {
            document.removeEventListener('click', this._docClickHandler);
            this._docClickHandler = null;
        }
    }
};
</script>

<style lang="scss" scoped>
.responsive-select {
    position: relative;
    width: 100%;
}

// PC用レイアウト（768px以上）
.desktop-layout {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;

    @media (max-width: 767px) {
        display: none;
    }
}

.select-button {
    padding: 6px 12px;
    border: 2px solid #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    color: #64748b;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.2;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        border-color: #3b82f6;
        background: #f8fafc;
    }

    &.active {
        background: #3b82f6;
        border-color: #3b82f6;
        color: #ffffff;
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
}

/* 文字数に応じたサイズ調整（横方向の余白中心、縦はコンパクト維持） */
.select-button.size-xs { padding: 4px 8px;  font-size: 12px; }
.select-button.size-sm { padding: 6px 10px; font-size: 12.5px; }
.select-button.size-md { padding: 6px 12px; font-size: 13px; }
.select-button.size-lg { padding: 7px 14px; font-size: 13px; }

// モバイル用レイアウト（767px以下）
.mobile-layout {
    display: none;
    position: relative;

    @media (max-width: 767px) {
        display: block;
    }
}

.dropdown-trigger {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    background: #ffffff;
    color: #1f2937;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;

    &:hover {
        border-color: #3b82f6;
    }

    &.open {
        border-color: #3b82f6;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
}

.selected-text {
    flex: 1;
    text-align: left;
    color: inherit;
}

.dropdown-icon {
    width: 18px;
    height: 18px;
    fill: #6b7280;
    transition: transform 0.2s ease;

    .dropdown-trigger.open & {
        transform: rotate(180deg);
    }
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #ffffff;
    border: 2px solid #3b82f6;
    border-top: none;
    border-radius: 0 0 10px 10px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
    margin: 0;
    padding: 0;
    list-style: none;
}

.dropdown-item {
    padding: 10px 12px;
    cursor: pointer;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
    color: #1f2937;
    transition: background-color 0.2s ease;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: #f8fafc;
    }

    &.selected {
        background: #eff6ff;
        color: #3b82f6;
        font-weight: 600;
    }
}

// ドロップダウンアニメーション
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.2s ease;
    transform-origin: top;
}

.dropdown-enter-from {
    opacity: 0;
    transform: scaleY(0.8) translateY(-10px);
}

.dropdown-leave-to {
    opacity: 0;
    transform: scaleY(0.8) translateY(-10px);
}

// スクロールバーのスタイリング（Webkit系ブラウザ）
.dropdown-menu::-webkit-scrollbar {
    width: 4px;
}

.dropdown-menu::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.dropdown-menu::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>