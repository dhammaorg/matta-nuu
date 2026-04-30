<template>
  <Spinner />
</template>

<script>
import Spinner from '@/components/Spinner.vue'
import {
  readLastSessionId,
  readLastSessionRouteName,
  resolveDefaultSessionId,
} from '@/services/session-nav-storage'

export default {
  components: { Spinner },
  mounted() {
    const { sessions } = this.$root
    let id = readLastSessionId()

    if (!id || !sessions[id] || sessions[id].is_template) {
      id = resolveDefaultSessionId(sessions)
    }

    if (id && sessions[id]) {
      this.$router.replace({ name: readLastSessionRouteName(), params: { id } })
      return
    }

    this.$router.replace({ name: 'sessions' })
  },
}
</script>
