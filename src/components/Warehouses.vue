<template>
  <div>
    <div :style="{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }">
      <md-drawer :show-drawer="showDrawer" 
        :visible="visible"
        :on-close="onClose"
        :save-warehouse="saveWarehouse"
        :warehouse="warehouse"
        :mode-edit="modeEdit"
        :update-warehouse="updateWarehouse"
        :saving="saving"/>
    </div>
    <a-table :columns="columns"
        :dataSource="data"
        :rowKey="record => record.id"
        :loading="loading">
      <a slot="edit" slot-scope="record" href="javascript:;" @click="edit(record)">Editar</a>
    </a-table>
  </div>
</template>

<script>

import axios from 'axios';
import DrawerWarehouse from './DrawerWarehouse.vue';


const columns = [
    {
        title: 'Produto',
        dataIndex: 'cd_product'
    },
    {
        title: 'Loja',
        dataIndex: 'cd_store'
    },
    {
        title: 'Quantidade',
        dataIndex: 'qtd_product'
    },
    { 
        title: '', 
        dataIndex: '', 
        scopedSlots: { customRender: 'edit' }
    }
];

export default {

  mounted() {
    axios
      .get('http://localhost:8000/warehouses')
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
      visible: false,
      warehouse: {},
      modeEdit: false
    }
  },
  methods: {
    showDrawer() {
      this.visible = true
    },
    onClose() {
      this.visible = false,
      this.warehouse = {};
      this.modeEdit = false;
    },
    saveWarehouse(cdProduct, cdStore, qtdProduct, form){
      if(this.validRows(cdProduct, cdStore, qtdProduct)){
        if(this.isPositive(qtdProduct)){
          if(this.isNew(this.data, cdProduct, cdStore)){
            var params = {
                "cdproduct": cdProduct.toString().padStart(4, '0'),
                "cdstore": cdStore.toString().padStart(4, '0'),
                "qtdproduct": parseFloat(qtdProduct)
            }
            this.saving = true;
            let uri = 'http://localhost:8000/warehouses';
            this.axios.post(uri, params).then((response) => {
                this.afterSaveOrUpdate();
                form.resetFields();
            }, error => {
              if(error.response.data.error){
                this.error(error.response, error.response.data.error.errorInfo[2]);
                this.loading = false;
              } else {
                this.error('Operação bloqueada. Um erro inesperado aconteceu.');
                this.loading = false;
              }
            });
          } else {
            this.notIsNew();
          }
        } else {
          this.onlyPositive();
        }
      } else {
        this.requiredFields();
      }
    },
    updateWarehouse(record, qtdProduct, id){
      record.qtd_product.value = qtdProduct;
      if(this.validFields(record)){
        if(this.isPositive(qtdProduct)){
          var params = {
              "cd_product": record.cd_product.value.toString().padStart(4, '0'),
              "cd_store": record.cd_store.value.toString().padStart(4, '0'),
              "qtd_product": parseFloat(qtdProduct)
          }
          this.saving = true;
          let uri = `http://localhost:8000/warehouses/${id}`;
          this.axios.put(uri, params).then((response) => {
              this.afterSaveOrUpdate();
              form.resetFields();
          }, error => {
            if(error.response.data.error){
              this.error(error.response, error.response.data.error.errorInfo[2]);
              this.loading = false;
            } else {
              this.error('Operação bloqueada. Um erro inesperado aconteceu.');
              this.loading = false;
            }
          });
        } else {
          this.onlyPositive();
        }
      } else {
        this.requiredFields();
      }
    },
    afterSaveOrUpdate: function(){
      this.onClose();
      this.success();
      this.saving = false;
      axios
      .get('http://localhost:8000/warehouses')
      .then(response => {
          this.data = response.data;
      });
    },
    edit: function(record) {
      this.warehouse = record;
      this.modeEdit = true;
      this.showDrawer();
    },
    info() {
      const h = this.$createElement
      this.$info({
        title: 'Atenção!',
        content: h('div',{}, [
          h('p', 'Selecione algum estoque antes de tentar deletar.')
        ]),
        onOk() {},
      });
    },
    notIsNew() {
      const h = this.$createElement
      this.$info({
        title: 'Atenção!',
        content: h('div',{}, [
          h('p', 'Operação bloqueada. Registro já existe.')
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
    errorSave() {
      this.$error({
        title: 'Erro',
        content: 'Operação não permitida. Um erro inesperado aconteceu.',
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
    onlyPositive() {
      const h = this.$createElement
      this.$info({
        title: 'Atenção!',
        content: h('div',{}, [
          h('p', 'A quantidade deve ser maior ou igual a zero.')
        ]),
        onOk() {},
      });
    },
    validFields(record){
        let flag = true;
        if(record.cd_store.value === undefined || record.cd_store.value === ""){
          flag = false;
        }
        if(record.cd_product.value === undefined || record.cd_product.value === ""){
          flag = false;
        }
        if(record.qtd_product.value === undefined || record.qtd_product.value === ""){
          flag = false;
        }
        return flag;
    },
    validRows(cd_product, cd_store, qtd_product){
        let flag = true;
        if(cd_store === undefined || cd_store === "" || cd_store.toString() === "[object Object]"){
          flag = false;
        }
        if(cd_product === undefined || cd_product === "" || cd_product.toString() === "[object Object]"){
          flag = false;
        }
        if(qtd_product === undefined || qtd_product === "" || qtd_product.toString() === "[object Object]"){
          flag = false;
        }
        return flag;
    },
    isPositive(qtd){
      if(parseFloat(qtd) >= 0){
        return true;
      } else {
        return false;
      }
    },
    isNew(data, cdProduct, cdStore){
      let newRow = true;
      data.forEach(row => {
        if(row.cd_product == cdProduct && row.cd_store == cdStore){
          newRow = false;
        }
      });
      return newRow;
    }
  }, components: {
    'md-drawer': DrawerWarehouse
  },
  computed: {}
}
</script>
