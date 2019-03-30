<template>
  <div>
    <a-button type="primary" @click="showDrawer">
      <a-icon type="plus" /> Adicionar Produto
    </a-button>
      <a-drawer
        title="Adicinar Produto"
        :width="720"
        @close="resetAndClose"
        :visible="visible"
        :wrapStyle="{height: 'calc(100% - 108px)',overflow: 'auto',paddingBottom: '108px'}"
        :saving="saving"
      >
        <a-spin tip="Carregando..." :spinning="saving">
          <a-form :form="form" layout="vertical">
              <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="Código">
                  <a-input
                    :disabled = (modeEdit)
                    maxlength = "4"
                    v-decorator="['cd_product', {
                      rules: [{ required: true, message: 'Insira o código do Produto' }],
                      initialValue: product.cd_product 
                    }]"
                    placeholder=""
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="Produto">
                  <a-input
                    maxlength = "40"
                    v-decorator="['nm_product', {
                      rules: [{ required: true, message: 'Insira o nome do Produto' }],
                      initialValue: product.nm_product
                    }]"
                    placeholder=""
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="Unidade">
                  <a-input
                    maxlength="5"
                    v-decorator="['unidade', {
                      rules: [{ required: true, message: 'Insira a unidade' }],
                      initialValue: product.un
                    }]"
                    placeholder="Kg"
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
            <a-button @click="resetAndSave()" type="primary">Salvar</a-button>
          </div>
        </a-spin>
      </a-drawer>
  </div>
</template>
<script>

import axios from 'axios';
import Products from './Products.vue';

export default {
  data() {
    return {
        name: 'md-drawer',
        form: this.$form.createForm(this)
    }
  },
  methods: {
    resetAndSave() {
      if(this.modeEdit) {
        this.updateProduct(this.form.instances, this.form)
       } else {
        this.saveProduct(this.form.instances, this.form);
       }
    },
    resetAndClose() {
      this.onClose();
      this.form.resetFields();
    }
  },
  props: ['visible', 'showDrawer', 'onClose', 'saveProduct', 'product', 'modeEdit', 'updateProduct', 'saving']   
}
</script>
