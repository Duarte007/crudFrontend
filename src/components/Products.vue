<template>
  <div>
    <div :style="{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }">
      <md-drawer :show-drawer="showDrawer" 
        :visible="visible"
        :on-close="onClose"
        :save-product="saveProduct"
        :product="product"
        :mode-edit="modeEdit"
        :update-product="updateProduct"
        :saving="saving"/>
      <a-button type="danger" @click="removeProduct">
        <a-icon type="trash" /> Remover Produto
      </a-button>
    </div>
    <a-table :rowSelection="rowSelection"
        :columns="columns"
        :dataSource="data"
        :rowKey="record => record.cd_product"
        :loading="loading">
      <a slot="edit" slot-scope="record" href="javascript:;" @click="edit(record)">Editar</a>
    </a-table>
  </div>
</template>

<script>

import axios from 'axios';
import DrawerProducts from './DrawerProducts.vue';

const columns = [
  { title: 'Código', dataIndex: 'cd_product' },
  { title: 'Nome', dataIndex: 'nm_product' },
  { title: 'Unidade', dataIndex: 'un' },
  { title: '', dataIndex: '', scopedSlots: { customRender: 'edit' } },
];

export default {

  mounted() {
    axios
      .get('http://localhost:8000/products')
      .then(response => {
        this.data = response.data;
        this.loading = false;
      });
  },
  data() {
    return {
      data: [],
      pagination: {},
      loading: true,
      saving:false,
      columns,
      productsToDelete: [],
      visible: false,
      product: {},
      modeEdit: false
    }
  },
  methods: {
    showDrawer() {
      this.visible = true;
    },
    onClose() {
      this.visible = false;
      this.product = {};
      this.modeEdit = false;
    },
    saveProduct(record, form){
        if(this.validFields(record)){
          var params = {
              "cdproduct": record.cd_product.value.toString().padStart(4, '0'),
              "nmproduct": record.nm_product.value,
              "unidade": record.unidade.value
          }
          this.saving = true;
          let uri = 'http://localhost:8000/products';
          this.axios.post(uri, params).then((response) => {
              this.afterSaveOrUpdate();
              form.resetFields();
          }, error => {
            this.saving = false;
            if(error.response.data.error){
              this.saving = false;
              this.error(error.response, error.response.data.error.errorInfo[2]);
            } else {
              this.error('Operação bloqueada. Um erro inesperado aconteceu.');
            }
          });
        } else {
          this.requiredFields();
        }
    },
    updateProduct(record, form){
      if(this.validFields(record)){
        var params = {
            "cd_product": record.cd_product.value.toString().padStart(4, '0'),
            "nm_product": record.nm_product.value,
            "un": record.unidade.value
        }
        this.saving = true;
        let uri = `http://localhost:8000/products/${params.cd_product}`;
        this.axios.put(uri, params).then((response) => {
          this.afterSaveOrUpdate();
          form.resetFields();
        }, error => {
          this.saving = false;
          if(error.response.data.error){
            this.error(error.response, error.response.data.error.errorInfo[2]);
          } else {
            this.error('Operação bloqueada. Um erro inesperado aconteceu.');
          }
        });
      } else {
        this.requiredFields();
      }
    },
    afterSaveOrUpdate: function(){
      this.onClose();
      this.success();
      this.saving = false;
      axios
      .get('http://localhost:8000/products')
      .then(response => {
          this.data = response.data;
      });
    },
    removeProduct: function () {
      if (this.productsToDelete.length !== 0){
        this.loading = true;
        let flagError = true;
        let flagSuccess = true;
        this.productsToDelete.forEach(product => {
          var cdProduto = product.cd_product.toString().padStart(4, '0');
          var url = `http://localhost:8000/products/${cdProduto}`;
          axios.delete(url)
          .then(response => {
              this.afterRemove(flagSuccess);
              flagSuccess = false;
          }, error => {
            this.saving = false;
            this.loading = false;
            if(error.response.data.error){
              this.error(error.response, error.response.data.error.errorInfo[2]);
            } else if(flagError){
              this.error('Operação bloqueada. Um erro inesperado aconteceu.');
              flagError = false;
            }
          });
        });
      } else {
          this.info();
      }
    },
    afterRemove: function(flagSuccess){
      this.productsToDelete = [];
      this.product = {};
      this.loading = false;
      this.saving = false;
      if(flagSuccess){
        this.success();
      }
      axios
      .get('http://localhost:8000/products')
      .then(response => {
        this.data = response.data;
        this.loading = false;
      });
    },
    edit: function(record) {
      this.product = record;
      this.modeEdit = true;
      this.showDrawer();
    },
    info() {
      const h = this.$createElement
      this.$info({
        title: 'Atenção!',
        content: h('div',{}, [
          h('p', 'Selecione algum produto antes de tentar deletar.')
        ]),
        onOk() {},
      });
    },
    requiredFields() {
      const h = this.$createElement
      this.$info({
        title: 'Atenção!',
        content: h('div',{}, [
          h('p', 'Preencha todos os campos.')
        ]),
        onOk() {},
      });
    },
    success() {
      this.$success({
        title: '',
        content: (  // JSX support
          <div>
            <p>Operação realizada com sucesso.</p>
          </div>
        )
      });
    },
    error(response, message) {
      if(message.indexOf('Cannot delete or update') != -1){
        message = this.buildMessageError(response);
      }
      this.$error({
        title: 'Erro',
        content: message,
      });
    },
    buildMessageError: function(response){
      let msg = response.request.responseURL.split('products/')[1];
      return `Impossível remover o produto ${msg}, pois ele possui estoque.`;
    },
    validFields(record){
        let flag = true;
        if(record.cd_product.value === undefined || record.cd_product.value === ""){
          flag = false;
        }
        if(record.nm_product.value === undefined || record.nm_product.value === ""){
          flag = false;
        }
        if(record.unidade.value === undefined || record.unidade.value === ""){
          flag = false;
        }
        return flag;
    }
  }, components: {
    'md-drawer': DrawerProducts
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this;
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          this.productsToDelete = selectedRows;
        },
        getCheckboxProps: record => ({
          props: {
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name
          }
        }),
      }
    }
  }
}
</script>
