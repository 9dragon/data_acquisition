import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

export function useTable(fetchFn: Function) {
  const loading = ref(false)
  const tableData = ref<any[]>([])
  const total = ref(0)

  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    keyword: ''
  })

  const pagination = computed(() => ({
    currentPage: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    total: total.value
  }))

  async function handleQuery() {
    loading.value = true
    try {
      const response = await fetchFn(queryParams)
      tableData.value = response.records || []
      total.value = response.total || 0
    } catch (error) {
      ElMessage.error('查询失败')
    } finally {
      loading.value = false
    }
  }

  function handleReset() {
    queryParams.keyword = ''
    queryParams.pageNum = 1
    handleQuery()
  }

  function handlePageChange(page: number) {
    queryParams.pageNum = page
    handleQuery()
  }

  function handleSizeChange(size: number) {
    queryParams.pageSize = size
    queryParams.pageNum = 1
    handleQuery()
  }

  return {
    loading,
    tableData,
    total,
    queryParams,
    pagination,
    handleQuery,
    handleReset,
    handlePageChange,
    handleSizeChange
  }
}
