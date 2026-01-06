<script setup lang="ts">
import {onMounted} from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'

const cartStore = useCartStore();

onMounted(() => {
	cartStore.syncCategoryCount();
})

</script>

<template>
  

  <RouterView />
</template>

<style scoped>

</style>
