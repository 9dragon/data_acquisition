<template>
  <div class="about-page">
    <div class="logo-section">
      <div class="logo">
        <van-icon name="apps-o" size="60" color="#1989fa" />
      </div>
      <div class="app-name">工业数据采集系统</div>
      <div class="app-version">版本 {{ appVersion }}</div>
    </div>

    <van-cell-group inset title="基本信息">
      <van-cell title="应用名称" value="工业数据采集系统" />
      <van-cell title="应用版本" :value="appVersion" />
      <van-cell title="更新时间" value="2026-04-02" />
    </van-cell-group>

    <van-cell-group inset title="联系我们">
      <van-cell title="技术支持" value="support@example.com" />
      <van-cell title="客服电话" value="400-xxx-xxxx" />
      <van-cell title="官方网站" is-link @click="openUrl" />
    </van-cell-group>

    <div class="footer">
      <p>© 2026 工业数据采集系统 版权所有</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'

const appVersion = ref('v1.0.0')

const openUrl = () => {
  showToast('功能开发中...')
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px 40px;
  background: #fff;
  margin-bottom: 12px;
}

.logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1989fa 0%, #40a9ff 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.app-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.app-version {
  font-size: 14px;
  color: #999;
}

:deep(.van-cell-group) {
  margin-bottom: 12px;
}

.footer {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 12px;
}

.footer p {
  margin: 0;
}
</style>
