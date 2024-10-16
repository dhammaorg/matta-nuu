<template>
    <SelectButton v-model="$root.selectedInventoryMode" :options="availableOptions"
                  optionLabel="label"
                  optionValue="value" />
</template>

<script>
import SelectButton from 'primevue/selectbutton'

export default {
    name: 'TwoOptionsButton',
    components: {
        SelectButton
    },
    props: {
        option1: {
            type: String,
            default: "Option 1"
        },
        option2: {
            type: String,
            default: "Option 2"
        },
    },
    data() {
        return {
            availableOptions: [{ label: this.option1, value: "option1" }, { label: this.option2, value: "option2" }]
        };
    }

}
</script>
