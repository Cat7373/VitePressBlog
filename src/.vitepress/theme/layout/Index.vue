<template>
  <Layout>
    <template #doc-after>
      <GitalkLauout :key="num" />
    </template>
  </Layout>
</template>

<script lang="ts" setup>
import Theme from 'vitepress/theme'
import { watch, ref } from 'vue'
import { useRoute } from 'vitepress'

import GitalkLauout from './GitalkLayout.vue'

const { Layout } = Theme
const route = useRoute()
const num = ref(0)

watch(
  () => route.path,
  () => num.value++,
)
</script>
