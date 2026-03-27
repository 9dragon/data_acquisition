# 设备类型模块设计文档

**创建日期**: 2026-03-27
**项目**: 工业数据采集项目管理系统
**模块**: 设备类型管理（P0第二批-模块1）
**状态**: 待审查

---

## 1. 概述

### 1.1 目标
实现设备类型的分类管理功能，支持按项目、工序进行筛选和联动，为设备列表和设备调研功能提供基础数据支撑。

### 1.2 范围
- 设备类型的CRUD操作
- 项目与工序的三级联动筛选
- 设备类型编码唯一性约束
- 关联设备的删除校验

### 1.3 依赖关系
- 前置模块：工序管理（已完成）、项目管理（基础）
- 后续模块：设备列表、设备调研

---

## 2. 数据库设计

### 2.1 表结构

**表名**: `t_device_type`

```sql
CREATE TABLE t_device_type (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  project_id BIGINT NOT NULL COMMENT '所属项目ID',
  project_name VARCHAR(100) COMMENT '所属项目名称（冗余）',
  process_id BIGINT COMMENT '所属工序ID',
  process_name VARCHAR(100) COMMENT '所属工序名称（冗余）',
  code VARCHAR(50) NOT NULL COMMENT '类型编码',
  name VARCHAR(100) NOT NULL COMMENT '类型名称',
  description VARCHAR(500) COMMENT '类型描述',
  deleted INT DEFAULT 0 COMMENT '删除标记：0未删除 1已删除',
  created_by BIGINT COMMENT '创建人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by BIGINT COMMENT '更新人ID',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  UNIQUE KEY uk_project_code (project_id, code) COMMENT '同一项目下编码唯一',
  INDEX idx_project_id (project_id),
  INDEX idx_process_id (process_id),
  INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备类型表';
```

### 2.2 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | BIGINT | 是 | 主键，自增 |
| project_id | BIGINT | 是 | 所属项目ID，关联t_project表 |
| project_name | VARCHAR(100) | 否 | 冗余字段，项目名称 |
| process_id | BIGINT | 否 | 所属工序ID，关联t_process表 |
| process_name | VARCHAR(100) | 否 | 冗余字段，工序名称 |
| code | VARCHAR(50) | 是 | 类型编码，同项目下唯一 |
| name | VARCHAR(100) | 是 | 类型名称 |
| description | VARCHAR(500) | 否 | 类型描述 |
| deleted | INT | 是 | 逻辑删除标记，0未删除1已删除 |

### 2.3 约束规则

- 唯一约束：同一项目下，编码不能重复
- 外键关系：project_id → t_project.id, process_id → t_process.id
- 逻辑删除：使用deleted标记，不物理删除数据

---

## 3. 后端设计

### 3.1 实体类

**文件**: `src/main/java/com/dataacquisition/modules/device/entity/DeviceType.java`

```java
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_device_type")
public class DeviceType extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("project_id")
    private Long projectId;

    @TableField("project_name")
    private String projectName;

    @TableField("process_id")
    private Long processId;

    @TableField("process_name")
    private String processName;

    private String code;
    private String description;

    @TableField(exist = false)
    private Integer deviceCount;
}
```

### 3.2 Controller接口

**文件**: `src/main/java/com/dataacquisition/modules/device/controller/DeviceTypeController.java`

**接口列表**:

1. **GET /device-types** - 分页查询设备类型
   - 参数：page, pageSize, projectId, processId, keyword, sortBy, sortOrder
   - 返回：分页数据

2. **GET /device-types/{id}** - 获取设备类型详情
   - 参数：id（路径参数）
   - 返回：设备类型详情

3. **POST /device-types** - 创建设备类型
   - 参数：DeviceType对象（JSON）
   - 返回：创建的设备类型

4. **PUT /device-types/{id}** - 更新设备类型
   - 参数：id（路径参数），DeviceType对象（JSON）
   - 返回：成功/失败

5. **DELETE /device-types/{id}** - 删除设备类型
   - 参数：id（路径参数）
   - 返回：成功/失败

6. **GET /device-types/processes/by-project/{projectId}** - 获取项目工序列表
   - 参数：projectId（路径参数）
   - 返回：工序列表

### 3.3 Service业务逻辑

**文件**: `src/main/java/com/dataacquisition/modules/device/service/DeviceTypeService.java`

**核心方法**:

1. **分页查询**
   - 支持多条件筛选（项目、工序、关键词）
   - 支持排序（创建时间、编码、名称、设备数量）
   - 统计设备数量（LEFT JOIN device表）

2. **创建设备类型**
   - 检查编码唯一性（同一项目下）
   - 自动填充projectName和processName

3. **更新设备类型**
   - 检查编码唯一性（排除自身）
   - 同步更新冗余字段

4. **删除设备类型**
   - 检查是否有关联设备
   - 有关联设备则抛出异常

5. **获取项目工序列表**
   - 根据projectId查询工序
   - 用于前端联动

---

## 4. 前端设计

### 4.1 页面结构

**文件**: `src/views/Device/DeviceTypeList.vue`

**布局**:
```
┌─────────────────────────────────────────────┐
│ 设备类型管理                    [新增类型]  │
├─────────────────────────────────────────────┤
│ [项目▼] [工序▼] [关键词____] [查询] [重置]  │
├─────────────────────────────────────────────┤
│ ▼ [创建时间▼] [编码] [名称]                 │
├─────────────────────────────────────────────┤
│ 项目 │ 工序 │ 编码 │ 名称 │ 设备数 │ 操作  │
├─────────────────────────────────────────────┤
│ ... │ ... │ ... │ ... │ ...   │ 查看│
│     │     │     │     │       │ 编辑│
│     │     │     │     │       │ 删除│
└─────────────────────────────────────────────┘
         [分页：总计 100 条] [10/页▼]
```

### 4.2 组件设计

**主要组件**:

1. **筛选表单**
   - 项目下拉框：el-select，选择后联动工序
   - 工序下拉框：el-select，根据项目动态加载
   - 关键词输入：el-input，搜索编码和名称
   - 查询/重置按钮

2. **数据表格**
   - 列：项目、工序、编码、名称、描述、设备数量、操作
   - 排序：支持点击表头排序
   - 分页：使用el-pagination

3. **新增/编辑对话框**
   - 项目选择：必选，el-select
   - 工序选择：可选，el-select，根据项目联动
   - 编码输入：必填，el-input，2-50字符
   - 名称输入：必填，el-input，2-100字符
   - 描述输入：可选，el-input-type="textarea"

### 4.3 状态管理

**文件**: `src/stores/deviceType.ts`

```typescript
export const useDeviceTypeStore = defineStore('deviceType', () => {
  const projectList = ref<Project[]>([])
  const processList = ref<Process[]>([])

  const fetchProjectList = async () => {
    // 从API加载项目列表
  }

  const fetchProcessListByProject = async (projectId: number) => {
    // 根据项目加载工序列表
  }

  const clearProcessList = () => {
    processList.value = []
  }

  return {
    projectList,
    processList,
    fetchProjectList,
    fetchProcessListByProject,
    clearProcessList
  }
})
```

### 4.4 API封装

**文件**: `src/api/deviceType.ts`

```typescript
export interface DeviceType {
  id?: number
  projectId: number
  projectName?: string
  processId?: number
  processName?: string
  code: string
  name: string
  description?: string
  deviceCount?: number
}

export const deviceTypeApi = {
  getDeviceTypePage(params: {
    page: number
    pageSize: number
    projectId?: number
    processId?: number
    keyword?: string
    sortBy?: string
    sortOrder?: string
  }): Promise<PageResponse<DeviceType>> {
    return http.get('/device-types', { params })
  },

  createDeviceType(data: DeviceType): Promise<DeviceType> {
    return http.post('/device-types', data)
  },

  updateDeviceType(id: number, data: DeviceType): Promise<void> {
    return http.put(`/device-types/${id}`, data)
  },

  deleteDeviceType(id: number): Promise<void> {
    return http.delete(`/device-types/${id}`)
  },

  getProcessesByProject(projectId: number): Promise<Process[]> {
    return http.get(`/device-types/processes/by-project/${projectId}`)
  }
}
```

---

## 5. 业务逻辑

### 5.1 联动逻辑

**项目与工序联动**:
1. 页面加载时，加载所有项目列表
2. 用户选择项目后：
   - 自动加载该项目的工序列表
   - 如果之前选择了工序，清空工序选择
3. 用户切换项目时：
   - 清空工序选择
   - 重新加载新项目的工序列表

### 5.2 唯一性校验

**编码唯一性**:
- 创建时：检查同项目下是否存在相同编码
- 编辑时：检查编码变更后，是否与其他类型冲突
- 错误提示："该编码已存在，请使用其他编码"

### 5.3 删除校验

**关联设备检查**:
- 删除前查询device表，统计typeId匹配的设备数量
- 如果数量>0，返回错误："该设备类型下还有X个设备，无法删除"
- 如果数量=0，允许删除

### 5.4 数据填充

**自动填充冗余字段**:
- 创建时：根据projectId查询project表填充projectName
- 创建时：根据processId查询process表填充processName（如果不为空）
- 编辑时：项目或工序变更时，同步更新name字段

---

## 6. 用户交互

### 6.1 表单验证

**前端验证规则**:
```typescript
const deviceTypeRules = {
  projectId: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ],
  code: [
    { required: true, message: '请输入类型编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9-]+$/, message: '只能包含字母、数字和中划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在2到100个字符', trigger: 'blur' }
  ]
}
```

**后端验证规则**:
- 项目ID存在性检查
- 工序ID存在性检查（如果不为空）
- 编码唯一性检查

### 6.2 加载状态

- 列表加载：显示loading遮罩
- 表单提交：按钮loading，禁用按钮
- 联动加载：工序下拉框显示"加载中..."

### 6.3 错误处理

**错误提示**:
- 网络错误："网络错误，请重试"
- 编码重复："该编码已存在，请使用其他编码"
- 删除失败："该设备类型下还有X个设备，无法删除"
- 权限错误："您没有权限执行此操作"

**成功提示**:
- 创建成功："创建成功"
- 更新成功："更新成功"
- 删除成功："删除成功"

---

## 7. 路由和菜单

### 7.1 路由配置

```typescript
// router/index.ts
{
  path: '/device',
  children: [
    {
      path: 'device-types',
      name: 'DeviceTypeList',
      component: () => import('@/views/Device/DeviceTypeList.vue'),
      meta: { title: '设备类型', requiresAuth: true }
    }
  ]
}
```

### 7.2 菜单配置

```vue
<!-- components/Layout/Sidebar.vue -->
<el-menu-item index="/device/device-types">
  <el-icon><Grid /></el-icon>
  <span>设备类型</span>
</el-menu-item>
```

---

## 8. 测试计划

### 8.1 功能测试

**列表查询**:
- [ ] 默认显示所有设备类型
- [ ] 按项目筛选
- [ ] 按工序筛选
- [ ] 工序筛选与项目联动
- [ ] 关键词搜索
- [ ] 多条件组合筛选
- [ ] 排序功能（创建时间、编码、名称、设备数量）

**CRUD操作**:
- [ ] 创建设备类型
- [ ] 编辑设备类型
- [ ] 删除设备类型（无关联设备）
- [ ] 删除失败提示（有关联设备）
- [ ] 查看设备类型详情

**联动逻辑**:
- [ ] 选择项目后工序下拉框更新
- [ ] 切换项目后工序选择清空
- [ ] 工序为可选字段

**数据校验**:
- [ ] 编码唯一性校验
- [ ] 必填字段校验
- [ ] 字段长度校验
- [ ] 编码格式校验

### 8.2 集成测试

- [ ] 与工序管理模块联动
- [ ] 与项目管理模块联动
- [ ] 为后续设备列表模块提供数据支撑

### 8.3 性能测试

- [ ] 大数据量分页查询（>1000条）
- [ ] 联动加载响应时间
- [ ] 设备数量统计性能

---

## 9. 实施计划

### 9.1 开发阶段

**第1阶段：数据库和Entity（0.5天）**
- 创建t_device_type表
- 创建DeviceType实体类
- 创建DeviceTypeMapper接口

**第2阶段：后端开发（1天）**
- 实现DeviceTypeService接口和实现类
- 实现DeviceTypeController
- 编写单元测试

**第3阶段：前端开发（1.5天）**
- 创建API封装（deviceType.ts）
- 创建Store（deviceType.ts）
- 实现DeviceTypeList.vue页面
- 实现联动逻辑和样式调整

**第4阶段：联调测试（0.5天）**
- 前后端联调
- 功能自测
- Bug修复和优化

**总计：3.5天**

### 9.2 依赖检查

- [x] 工序管理模块已完成
- [x] 项目管理基础数据已准备
- [x] 数据库连接配置正确

---

## 10. 风险与注意事项

### 10.1 技术风险

1. **联动逻辑复杂性**
   - 风险：项目-工序联动可能导致用户困惑
   - 缓解：提供清晰的提示文案，优化交互体验

2. **设备数量统计性能**
   - 风险：LEFT JOIN查询可能影响性能
   - 缓解：添加索引，考虑缓存或异步加载

### 10.2 业务风险

1. **数据一致性**
   - 风险：冗余字段可能与主表数据不一致
   - 缓解：编辑时同步更新，定期校验

2. **用户误操作**
   - 风险：误删除有关联设备的类型
   - 缓解：后端强制校验，前端二次确认

---

## 11. 后续扩展

### 11.1 预留功能

- 设备分类（category）字段
- 默认采集方式（defaultCollectionMethod）字段
- 设备类型的导入导出功能
- 设备类型的复制功能

### 11.2 后续模块

本模块完成后，将为以下模块提供支撑：
- 设备列表模块（设备类型选择器）
- 设备调研模块（设备类型筛选）
- 设备统计模块（按类型统计）

---

**设计完成时间**: 2026-03-27
**设计者**: Claude AI
**版本**: v1.0
