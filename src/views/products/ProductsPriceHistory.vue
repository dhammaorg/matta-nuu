<template>
    <Dialog v-model:visible="visible" :style="{ width: '600px' }" header="Price History"
            position="top" :modal="true" class="p-fluid">

        <div class="p-field">
            <InputText id="name" v-model="product.name" placeholder="Name"
                       autofocus />
        </div>

        <div class="prices my-4 py-2">
            <div v-for="price in product.prices" class="d-flex mb-2" :key="price">
                <div class="p-inputgroup">
                    <Calendar v-model="price.date" showIcon iconDisplay="input"
                              dateFormat="dd/mm/yy" class="w-50" />
                    <InputNumber v-model="price.value" :maxFractionDigits="2"
                                 placeholder="Value"
                                 inputClass="border-start-0 input-amount" />
                    <span class="p-inputgroup-addon" style="width: 6rem;">€ / {{ product.unit
                        }}</span>
                </div>
                <Button icon="pi pi-times" class="p-button-text p-button-danger"
                        @click="removeRow(price)" />
            </div>
            <Button icon="pi pi-plus" class="p-button-primary p-button-sm w-auto mt-2"
                    label="Price"
                    @click="newRow"></Button>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text"
                    @click="visible = false" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" :loading="loading"
                    @click="savePrice" />
        </template>
    </Dialog>
</template>

<script>

import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar';

export default {
    components: {
        InputNumber, Calendar,
    },
    data() {
        return {
            visible: false,
            loading: false,
            product: {},
        }
    },
    methods: {
        show(object = {}) {
            this.product = {
                ...object,
                prices: Array.isArray(object.prices) ? [...object.prices] : [{}]
            };
            this.visible = true
        },
        newRow(event) {
            this.product.prices.push({})
        },
        async savePrice() {
            if (this.product.prices) {
                // filter empty prices and order
                this.product.prices = this.product.prices.filter((p) => p.date && p.value).sort((a, b) => new Date(b.date) - new Date(a.date));

                if (this.product.id) {
                    this.dbUpdate('products', this.product)
                }
                this.visible = false
                this.product.prices = [{}]
                this.product = {}
                this.$emit('updatedPrices', this.updatedProductData);
            }
        },
        removeRow(price) {
            this.product.prices = this.product.prices.filter((p) => p.date !== price.date)
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('default', { dateStyle: 'long' }).format(date);
        },
    },
}
</script>

<style lang="scss">
.prices {
    .input-product-wrapper {
        width: 20% !important;
    }

    .p-inputgroup {
        &:hover>.btn-edit-product {
            border-color: var(--primary-color);
        }

        .btn-edit-product {
            border-radius: 0 !important;
            background-color: transparent;
            border-color: #ced4da;
            border-left: none !important;
            width: 2.5rem !important;
            justify-content: flex-start;
            padding-left: .25rem !important;
            color: var(--text-color);

            .pi {
                font-size: .9rem;
            }

            &:hover {
                background-color: transparent !important;
                color: var(--primary-color);
                border-color: #ced4da;
            }
        }
    }

    .input-product {
        border-right: none;
    }
}
</style>
