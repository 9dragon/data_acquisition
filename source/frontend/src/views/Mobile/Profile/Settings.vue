<template>
  <div class="settings-page">
    <van-cell-group inset title="通用设置">
      <van-cell title="消息通知" is-link>
        <template #right-icon>
          <van-switch v-model="settings.notification" size="20" />
        </template>
      </van-cell>
      <van-cell title="声音提醒" is-link>
        <template #right-icon>
          <van-switch v-model="settings.sound" size="20" />
        </template>
      </van-cell>
      <van-cell title="震动反馈" is-link>
        <template #right-icon>
          <van-switch v-model="settings.vibrate" size="20" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset title="显示设置">
      <van-cell title="字体大小" is-link :value="settings.fontSize" @click="showFontSizePicker = true" />
      <van-cell title="深色模式" is-link>
        <template #right-icon>
          <van-switch v-model="settings.darkMode" size="20" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset title="缓存与存储">
      <van-cell title="清除缓存" is-link @click="handleClearCache" />
      <van-cell title="存储空间" :value="storageInfo" />
    </van-cell-group>

    <!-- 字体大小选择弹窗 -->
    <van-popup v-model:show="showFontSizePicker" position="bottom">
      <van-radio-group v-model="settings.fontSize">
        <van-cell-group inset>
          <van-cell title="小" clickable @click="settings.fontSize = '小'; showFontSizePicker = false">
            <template #right-icon>
              <van-radio name="小" />
            </template>
          </van-cell>
          <van-cell title="中" clickable @click="settings.fontSize = '中'; showFontSizePicker = false">
            <template #right-icon>
              <van-radio name="中" />
            </template>
          </van-cell>
          <van-cell title="大" clickable @click="settings.fontSize = '大'; showFontSizePicker = false">
            <template #right-icon>
              <van-radio name="大" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { showToast, showConfirmDialog } from 'vant'

const showFontSizePicker = ref(false)

const settings = reactive({
  notification: true,
  sound: true,
  vibrate: true,
  fontSize: '中',
  darkMode: false
})

const storageInfo = ref('23.5 MB')

const handleClearCache = () => {
  showConfirmDialog({
    title: '清除缓存',
    message: '确定要清除所有缓存吗？'
  }).then(() => {
    showToast('缓存已清除')
    storageInfo.value = '0 MB'
  }).catch(() => {
    // 取消
  })
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

:deep(.van-cell-group) {
  margin-bottom: 12px;
}
</style>
