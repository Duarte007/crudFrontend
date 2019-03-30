<template>
  <div>
    <a-button type="primary" @click="showDrawer">
      <a-icon type="plus" /> Adicionar Estoque
    </a-button>
    
    <a-drawer
      title="Adicinar Estoque"
      :width="720"
      @close="resetAndClose"
      :visible="visible"
      :wrapStyle="{height: 'calc(100% - 108px)',overflow: 'auto',paddingBottom: '108px'}"
    >
    <a-spin tip="Carregando..." :spinning="saving">
      <a-form :form="form" layout="vertical">
          <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Código Produto">
              <a-select
                placeholder="Produto"
                :disabled = (modeEdit)
                v-decorator="['cd_product', {
                  initialValue: warehouse.cd_product
                }]"
                @change="handleChangeProduct"
              >
                <a-select-option v-for="product in selectProducts" :key="product.cd_product">{{product.cd_product+' - '+product.nm_product}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Código Loja">
              <a-select
                placeholder="Loja"
                :disabled = (modeEdit)
                v-decorator="['cd_store', {
                  initialValue: warehouse.cd_store
                }]"
                @change="handleChangeStore"
              >
                <a-select-option v-for="store in selectStores" :key="store.cd_store">{{store.cd_store+' - '+store.nm_store}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Quantidade">
              <a-input
                type="number"
                min="0"
                v-model="quantity"
                maxlength="10"
                v-decorator="['qtd_product', {
                  rules: [{ required: true, message: 'Insira a quantidade' }],
                  initialValue: warehouse.qtd_product
                }]"
                placeholder=""
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <div
        :style="{
          position: 'relative',
          right: 0,
          bottom: 0,
          width: '50%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
        }"
      >
        <a-button
          :style="{marginRight: '8px'}"
          @click="onClose"
        >
          Cancelar
        </a-button>
        <a-button @click="resetAndSave" type="primary">Salvar</a-button>
      </div>
      </a-spin>
    </a-drawer>
  </div>
</template>
<script>

import axios from 'axios';
import Warehouses from './Warehouses.vue';


export default {
  data() {
    return {
        name: 'md-drawer',
        form: this.$form.createForm(this),
        selectProducts: [],
        selectStores: [],
        rowStore: {},
        rowProduct: {},
        quantity: 0
    }
  },
  mounted() {
  axios
    .get('http://localhost:8000/products')
    .then(response => {
      this.selectProducts = response.data;
      this.loading = false;
    });
    axios
      .get('http://localhost:8000/stores')
      .then(response => {
        this.selectStores = response.data;
        this.loading = false;
      });
  },
  methods: {
    handleChangeProduct(value) {
      this.rowProduct = value;
    },
    handleChangeStore(value) {
      this.rowStore = value;
    },
    resetAndSave() {
      if(this.modeEdit) {
        this.updateWarehouse(this.form.instances, this.quantity, this.warehouse.id, this.form)
       } else {
        this.saveWarehouse(this.rowProduct, this.rowStore, this.quantity, this.form);
       }
    },
    resetAndClose() {
      this.onClose();
      this.form.resetFields();
    }
  },
  props: ['visible', 'showDrawer', 'onClose', 'saveWarehouse', 'warehouse', 'modeEdit', 'updateWarehouse', 'saving']
    
}
</script>
