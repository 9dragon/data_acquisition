import { http } from './request'
import type { ProjectPlan, ProjectPlanFormData, ProjectPlanQueryParams } from '@/types/plan'

/**
 * 项目计划API
 */
export const planApi = {
  /**
   * 获取所有计划列表
   */
  getPlanList(): Promise<ProjectPlan[]> {
    return http.get('/project-plans')
  },

  /**
   * 根据ID获取计划详情
   */
  getPlanById(id: number): Promise<ProjectPlan> {
    return http.get(`/project-plans/${id}`)
  },

  /**
   * 根据项目ID获取计划
   */
  getPlanByProjectId(projectId: number): Promise<ProjectPlan> {
    return http.get(`/project-plans/project/${projectId}`)
  },

  /**
   * 获取项目完整计划（含阶段、任务）
   */
  getProjectPlan(projectId: number, params?: ProjectPlanQueryParams): Promise<ProjectPlan> {
    return http.get(`/projects/${projectId}/plan`, { params })
  },

  /**
   * 创建计划
   */
  createPlan(data: ProjectPlanFormData): Promise<void> {
    // 将 stages 数组转换为 stagesJson 字符串
    const payload = {
      ...data,
      stagesJson: JSON.stringify(data.stages)
    }
    // 移除 stages 字段，后端使用 stagesJson
    delete (payload as any).stages
    return http.post('/project-plans', payload)
  },

  /**
   * 更新计划
   */
  updatePlan(id: number, data: Partial<ProjectPlanFormData>): Promise<void> {
    // 将 stages 数组转换为 stagesJson 字符串
    const payload = {
      ...data
    }
    if (data.stages) {
      (payload as any).stagesJson = JSON.stringify(data.stages)
      delete (payload as any).stages
    }
    return http.put(`/project-plans/${id}`, payload)
  },

  /**
   * 删除计划
   */
  deletePlan(id: number): Promise<void> {
    return http.delete(`/project-plans/${id}`)
  }
}
