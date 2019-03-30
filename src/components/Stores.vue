<template>
  <div>
    <div :style="{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }">
      <md-drawer-store :show-drawer="showDrawer" 
        :visible="visible"
        :on-close="onClose"
        :save-store="saveStore"
        :store="store"
        :mode-edit="modeEdit"
        :update-store="updateStore"
        :saving="saving"/>
      <a-button type="danger" @click="removeStore">
        <a-icon type="trash" /> Remover Loja
      </a-button>
    </div>
    <a-table :rowSelection="rowSelection"
        :columns="columns"
        :dataSource="data"
        :rowKey="record => record.cd_store"
        :loading="loading">
      <a slot="edit" slot-scope="record" href="javascript:;" @click="edit(record)">Editar</a>
    </a-table>
  </div>
</template>

<script>

import axios from 'axios';
import DrawerStores from './DrawerStores.vue';

const columns = [
  { title: 'Código', dataIndex: 'cd_store' },
  { title: 'Nome', dataIndex: 'nm_store' },
  { title: '', dataIndex: '', scopedSlots: { customRender: 'edit' } }
];

export default {

  mounted() {
    axios
      .get('http://localhost:8000/stores')
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
      storesToDelete: [],
      visible: false,
      store: {},
      modeEdit: false
    }
  },
  methods: {
    showDrawer() {
      this.visible = true
    },
    onClose() {
      this.visible = false,
      this.store = {};
      this.modeEdit = false;
    },
    saveStore(record, form){
      if(this.validFields(record)){
        var params = {
            "cdstore": record.cd_store.value.toString().padStart(4, '0'),
            "nmstore": record.nm_store.value
        }
        this.saving = true;
        let uri = 'http://localhost:8000/stores';
        this.axios.post(uri, params).then((response) => {
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
    updateStore(record, form){
      if(this.validFields(record)){
        var params = {
            "cd_store": record.cd_store.value.toString().padStart(4, '0'),
            "nm_store": record.nm_store.value
        }
        this.saving = true;
        let uri = `http://localhost:8000/stores/${params.cd_store}`;
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
      .get('http://localhost:8000/stores')
      .then(response => {
          this.data = response.data;
      });
    },
    removeStore: function () {
      if (this.storesToDelete.length !== 0){
        let flagError = true;
        let flagSuccess = true;
        this.loading = true;
        this.storesToDelete.forEach(store => {
          var cdLoja = store.cd_store.toString().padStart(4, '0');
          var url = `http://localhost:8000/stores/${cdLoja}`;
          axios.delete(url)
          .then(response => {
              this.afterRemove(flagSuccess);
              flagSuccess = false;
          }, error => {
            if(error.response.data.error){
              this.error(error.response, error.response.data.error.errorInfo[2]);
              this.loading = false;
            } else if(flagError){
              this.error('Operação bloqueada. Um erro inesperado aconteceu.');
              this.loading = false;
              flagError = false;
            }
          });
        });
      } else {
          this.info();
      }
    },
    afterRemove: function(flagSuccess){
      this.store = {};
      this.storesToDelete = [];
      if(flagSuccess){
        this.success();
      }
      axios
      .get('http://localhost:8000/stores')
      .then(response => {
        this.data = response.data;
        this.loading = false;
      });
    },
    edit: function(record) {
      this.store = record;
      this.modeEdit = true;
      this.showDrawer();
    },
    info() {
      const h = this.$createElement
      this.$info({
        title: 'Atenção!',
        content: h('div',{}, [
          h('p', 'Selecione alguma loja antes de tentar deletar.')
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
      let msg = response.request.responseURL.split('stores/')[1];
      return `Impossível remover a loja ${msg}, pois ela possui estoque.`;
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
    validFields(record){
        let flag = true;
        if(record.cd_store.value === undefined || record.cd_store.value === ""){
          flag = false;
        }
        if(record.nm_store.value === undefined || record.nm_store.value === ""){
          flag = false;
        }
        return flag;
    }
  }, components: {
    'md-drawer-store': DrawerStores
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this;
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          this.storesToDelete = selectedRows;
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
