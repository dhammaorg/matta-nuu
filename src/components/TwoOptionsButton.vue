<template>
    <SelectButton v-model="selectedOption" :options="possibleOptions" optionLabel="label" />
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
            selectedOption: null,
            possibleOptions: [{ label: this.option1, value: this.option1 }, { label: this.option2, value: this.option2 }]
        };
    }

}
</script>
