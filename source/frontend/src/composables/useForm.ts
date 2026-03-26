import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export function useForm<T>(submitFn: (data: T) => Promise<void>, defaultData?: T) {
  const visible = ref(false)
  const loading = ref(false)
  const formData = reactive<T>({} as T)

  function open(data?: T) {
    visible.value = true
    if (data) {
      Object.assign(formData, data)
    } else if (defaultData) {
      Object.assign(formData, defaultData)
    }
  }

  function close() {
    visible.value = false
  }

  async function submit() {
    loading.value = true
    try {
      await submitFn(formData)
      ElMessage.success('操作成功')
      close()
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      loading.value = false
    }
  }

  function reset() {
    if (defaultData) {
      Object.assign(formData, defaultData)
    }
  }

  return {
    visible,
    loading,
    formData,
    open,
    close,
    submit,
    reset
  }
}
