import { reactive } from 'vue'

export default {
  session: reactive({
    // default value before session get retrieved
    rows: [],
    events: [],
  }),
}
