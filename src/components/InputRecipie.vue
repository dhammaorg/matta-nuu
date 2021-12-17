<template>
  <Dropdown v-bind="$attrs" :options="$root.recipies" optionLabel="name"
            placeholder="Recipie" :filter="true" filterPlaceholder=""
            class="w-100" />
</template>

<script>

export default {
}
</script>
