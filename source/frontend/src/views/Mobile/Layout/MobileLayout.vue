<template>
  <div class="mobile-layout">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      :title="pageTitle"
      left-arrow
      @click-left="handleBack"
      v-if="showNavBar"
    />

    <!-- 主内容区域 -->
    <div class="mobile-content" :class="{ 'has-nav': showNavBar, 'has-tab': showTabBar }">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>

    <!-- 底部标签栏 -->
    <van-tabbar v-model="activeTab" v-if="showTabBar" route>
      <van-tabbar-item to="/mobile" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/mobile/attendance/check-in" icon="location-o">签到</van-tabbar-item>
      <van-tabbar-item to="/mobile/task/list" icon="apps-o">任务</van-tabbar-item>
      <van-tabbar-item to="/mobile/issue/list" icon="chat-o">问题</van-tabbar-item>
      <van-tabbar-item to="/mobile/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeTab = ref(0)

// 是否显示顶部导航栏
const showNavBar = computed(() => {
  return !route.meta?.hideNavBar
})

// 是否显示底部标签栏
const showTabBar = computed(() => {
  return !route.meta?.hideTabBar
})

// 页面标题
const pageTitle = computed(() => {
  return route.meta?.title || '数据采集'
})

// 返回上一页
const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/mobile')
  }
}

// 监听路由变化更新activeTab
watch(() => route.path, (newPath) => {
  if (newPath === '/mobile' || newPath === '/mobile/') {
    activeTab.value = 0
  } else if (newPath.includes('/attendance')) {
    activeTab.value = 1
  } else if (newPath.includes('/task')) {
    activeTab.value = 2
  } else if (newPath.includes('/issue')) {
    activeTab.value = 3
  } else if (newPath.includes('/profile')) {
    activeTab.value = 4
  }
}, { immediate: true })
</script>

<style scoped>
.mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.mobile-content.has-nav {
  padding-top: 46px;
}

.mobile-content.has-tab {
  padding-bottom: 50px;
}

:deep(.van-nav-bar) {
  background-color: #1989fa;
}

:deep(.van-nav-bar__title) {
  color: #fff;
}

:deep(.van-nav-bar .van-icon) {
  color: #fff;
}
</style>
