<template>
  <Message v-if="$root.help" severity="success" :closable="false" icon="pi pi-question"
           class="help-message">
    <slot></slot>
  </Message>
</template>

<script>
import Message from 'primevue/message'

export default {
  components: { Message },
}
</script>

<style lang='scss'>
.help-message.p-message {
  max-width: 800px;
  margin: 0 auto;
  margin-top: 1rem;

  p {
    margin-top: 0;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.help-message .p-message-icon {
  margin-right: 1.5rem !important;
}

.page-full-content .help-message {
  max-width: 100%;
  margin-bottom: 1rem;
  margin-top: 0;

  &:first-child {
    margin-top: -1rem;
  }
}
</style>
