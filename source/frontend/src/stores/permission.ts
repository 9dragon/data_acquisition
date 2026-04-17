import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Permission {
  id: string | number
  code: string
  name: string
  path?: string
  parentId?: number | null
  description?: string
  children?: Permission[]
}

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<Permission[]>([])
  const permissionsCode = ref<string[]>([])
  const menus = ref<Permission[]>([])

  function setPermissions(newPermissions: string[]) {
    permissionsCode.value = newPermissions || []
  }

  function setMenus(newMenus: Permission[]) {
    menus.value = newMenus || []
  }

  function hasPermission(code: string): boolean {
    if (permissionsCode.value.length === 0) return true
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
    menus,
    setPermissions,
    setMenus,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
})
