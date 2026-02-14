<template>
  <div class="admin-tabs">
    <div role="tablist" :aria-label="ariaLabel" class="tabs-list">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :id="`tab-${tab.id}`"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`panel-${tab.id}`"
        :tabindex="activeTab === tab.id ? 0 : -1"
        class="tab-button"
        :class="{ 'tab-button--active': activeTab === tab.id }"
        @click="selectTab(tab.id)"
        @keydown.right.prevent="selectNextTab"
        @keydown.left.prevent="selectPrevTab"
        @keydown.home.prevent="selectFirstTab"
        @keydown.end.prevent="selectLastTab"
      >
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="tab-count">({{ tab.count }})</span>
      </button>
    </div>

    <div
      v-for="tab in tabs"
      :key="tab.id"
      :id="`panel-${tab.id}`"
      role="tabpanel"
      :aria-labelledby="`tab-${tab.id}`"
      :hidden="activeTab !== tab.id"
      class="tab-panel"
    >
      <slot :name="tab.id" :tab="tab" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    validator: (tabs) => {
      return tabs.every((tab) => tab.id && tab.label)
    },
  },
  defaultTab: {
    type: String,
    default: null,
  },
  ariaLabel: {
    type: String,
    default: 'Pestañas de administración',
  },
})

const emit = defineEmits(['tab-change'])

const activeTab = ref(props.defaultTab || props.tabs[0]?.id || '')

const selectTab = (tabId) => {
  if (activeTab.value !== tabId) {
    activeTab.value = tabId
    emit('tab-change', tabId)
  }
}

const selectNextTab = () => {
  const currentIndex = props.tabs.findIndex((tab) => tab.id === activeTab.value)
  const nextIndex = currentIndex < props.tabs.length - 1 ? currentIndex + 1 : 0
  selectTab(props.tabs[nextIndex].id)
  focusTabButton(props.tabs[nextIndex].id)
}

const selectPrevTab = () => {
  const currentIndex = props.tabs.findIndex((tab) => tab.id === activeTab.value)
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : props.tabs.length - 1
  selectTab(props.tabs[prevIndex].id)
  focusTabButton(props.tabs[prevIndex].id)
}

const selectFirstTab = () => {
  selectTab(props.tabs[0].id)
  focusTabButton(props.tabs[0].id)
}

const selectLastTab = () => {
  selectTab(props.tabs[props.tabs.length - 1].id)
  focusTabButton(props.tabs[props.tabs.length - 1].id)
}

const focusTabButton = (tabId) => {
  const button = document.getElementById(`tab-${tabId}`)
  if (button) {
    button.focus()
  }
}

watch(
  () => props.defaultTab,
  (newTab) => {
    if (newTab && props.tabs.some((tab) => tab.id === newTab)) {
      activeTab.value = newTab
    }
  },
)
</script>

<style scoped>
.admin-tabs {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.tabs-list {
  display: flex;
  gap: var(--spacing-xs);
  border-bottom: 2px solid var(--color-cream-dark);
  flex-wrap: wrap;
}

.tab-button {
  background: none;
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-light);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: var(--color-primary);
  background-color: var(--color-cream);
}

.tab-button--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.tab-count {
  font-weight: 400;
  color: var(--color-text-light);
  margin-left: var(--spacing-xs);
}

.tab-button--active .tab-count {
  color: var(--color-primary);
}

.tab-panel {
  display: block;
}

.tab-panel[hidden] {
  display: none;
}

@media (max-width: 768px) {
  .tabs-list {
    flex-direction: column;
    border-bottom: none;
    border-left: 2px solid var(--color-cream-dark);
  }

  .tab-button {
    border-bottom: none;
    border-left: 3px solid transparent;
    margin-bottom: 0;
    margin-left: -2px;
    text-align: left;
  }

  .tab-button--active {
    border-left-color: var(--color-primary);
    border-bottom-color: transparent;
  }
}
</style>
