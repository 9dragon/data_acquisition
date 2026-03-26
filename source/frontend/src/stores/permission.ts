import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Permission {
  id: string
  code: string
  name: string
  description?: string
}

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<Permission[]>([])
  const permissionsCode = ref<string[]>([])

  function setPermissions(newPermissions: Permission[]) {
    permissions.value = newPermissions
    permissionsCode.value = newPermissions.map(p => p.code)
  }

  function hasPermission(code: string): boolean {
    return permissionsCode.value.includes(code)
  }

  function hasAnyPermission(codes: string[]): boolean {
    return codes.some(code => hasPermission(code))
  }

  function hasAllPermissions(codes: string[]): boolean {
    return codes.every(code => hasPermission(code))
  }

  return {
    permissions,
    permissionsCode,
    setPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
})
