<template>
    <div>
        <router-view />
    </div>
    </template>
    
    <script>
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'App',
  created() {
    const authStore = useAuthStore()
    authStore.loadFromStorage()
  }
}
</script>
    
    <style>
    
    </style>
    