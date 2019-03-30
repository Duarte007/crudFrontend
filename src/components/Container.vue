<template>
  <a-layout id="layout">
    <a-layout-sider
    >
      <div class="logo">Desafio Nerus</div>
      <a-menu theme="dark" mode="inline" :defaultSelectedKeys = '["/products"]'>
        <a-menu-item key="/products">
          <a-icon type="tags" />
          <router-link to="/products">Produtos</router-link>  
        </a-menu-item>
        <a-menu-item key="/stores">
          <a-icon type="shopping-cart" />
          <router-link to="/stores">Lojas</router-link>  
        </a-menu-item>
        <a-menu-item key="/warehouses">
          <a-icon type="home" />
          <router-link to="/warehouses">Estoque</router-link>  
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content :style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }">
        <router-view></router-view>   
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>


export default {
  data(){
    return {
      collapsed: false,
      selectedKeys: '/products'
    }
  },
  watch:{
    $route (to, from){
      this.selectedKeys = to.path;
    }
  }
}
</script>
<style>

#layout .logo {
  height: 32px;
  background: rgba(255,255,255,.2);
  margin: 16px;
  text-align: center;
  color: #fff;
  line-height: 32px;    
}

#layout {
    height: 100vh;
}

#layout .ant-layout .ant-layout-content {
    margin: 0px !important;
}

.ant-menu-item > a {
    display: inline !important;
}
</style>
