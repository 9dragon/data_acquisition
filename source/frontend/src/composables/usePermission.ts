import { computed } from 'vue'
import { usePermissionStore } from '@/stores/permission'

export function usePermission() {
  const permissionStore = usePermissionStore()

  const hasPermission = computed(() => {
    return (code: string) => permissionStore.hasPermission(code)
  })

  const hasAnyPermission = computed(() => {
    return (codes: string[]) => permissionStore.hasAnyPermission(codes)
  })

  const hasAllPermissions = computed(() => {
    return (codes: string[]) => permissionStore.hasAllPermissions(codes)
  })

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
}
