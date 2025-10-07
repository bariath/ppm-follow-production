import { defineStore } from 'pinia'

export const useAssociationStore = defineStore('association', {
  state: () => ({
    isAssociating: false,
    progress: 0,
  }),
  actions: {
    startAssociating() {
      this.isAssociating = true
      this.progress = 0
    },
    setProgress(pct) {
      this.progress = pct
    },
    stopAssociating() {
      this.isAssociating = false
      this.progress = 100
    },
    reset() {
      this.isAssociating = false
      this.progress = 0
    }
  },
 
})
