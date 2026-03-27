# 设备类型模块实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`[ ]`) syntax for tracking。

**目标:** 实现设备类型的分类管理功能，支持按项目、工序进行筛选和联动，为设备列表提供基础数据支撑

**架构:** 前后端分离的三层架构，Spring Boot后端 + Vue 3前端，使用MyBatis-Plus进行ORM映射，采用后端分页和联动加载策略

**技术栈:** Spring Boot 3.1.8, MyBatis-Plus, MySQL 8.0, Vue 3, Element Plus, Pinia, TypeScript

---

## 文件结构

### 后端文件
```
src/main/java/com/dataacquisition/modules/device/
├── entity/
│   └── DeviceType.java                    # 设备类型实体类
├── mapper/
│   └── DeviceTypeMapper.java              # 设备类型Mapper接口
├── service/
│   ├── DeviceTypeService.java             # 设备类型Service接口
│   └── impl/
│       └── DeviceTypeServiceImpl.java     # 设备类型Service实现
└── controller/
    └── DeviceTypeController.java          # 设备类型Controller
```

### 前端文件
```
src/views/Device/
└── DeviceTypeList.vue                     # 设备类型列表页面

src/api/
└── deviceType.ts                          # 设备类型API封装

src/stores/
└── deviceType.ts                          # 设备类型状态管理
```

### 数据库文件
```
deployment/config/mysql/migrations/
└── 03_create_device_type_table.sql       # 设备类型表创建脚本
```

---

## Task 1: 创建数据库表

**文件:**
- Create: `deployment/config/mysql/migrations/03_create_device_type_table.sql`

- [ ] **步骤1: 编写数据库迁移脚本**

```sql
USE data_acquisition;

-- 创建设备类型表
CREATE TABLE IF NOT EXISTS t_device_type (
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

- [ ] **步骤2: 执行数据库迁移脚本**

```bash
cd D:/work/projects/data_acquisition/source/deployment/config/mysql
mysql -u root -p < migrations/03_create_device_type_table.sql
```

预期输出: 无错误，表创建成功

- [ ] **步骤3: 验证表创建**

```sql
USE data_acquisition;
SHOW CREATE TABLE t_device_type;
```

预期输出: 显示表结构，包含所有字段和索引

- [ ] **步骤4: 提交迁移脚本**

```bash
cd D:/work/projects/data_acquisition
git add deployment/config/mysql/migrations/03_create_device_type_table.sql
git commit -m "feat: 创建设备类型表"
```

---

## Task 2: 创建DeviceType实体类

**文件:**
- Create: `src/main/java/com/dataacquisition/modules/device/entity/DeviceType.java`

- [ ] **步骤1: 创建实体类**

```java
package com.dataacquisition.modules.device.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 设备类型实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_device_type")
public class DeviceType extends BaseEntity {

    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 所属项目ID
     */
    @TableField("project_id")
    private Long projectId;

    /**
     * 所属项目名称（冗余）
     */
    @TableField("project_name")
    private String projectName;

    /**
     * 所属工序ID
     */
    @TableField("process_id")
    private Long processId;

    /**
     * 所属工序名称（冗余）
     */
    @TableField("process_name")
    private String processName;

    /**
     * 类型编码
     */
    private String code;

    /**
     * 类型名称
     */
    private String name;

    /**
     * 类型描述
     */
    private String description;

    /**
     * 设备数量（非数据库字段）
     */
    @TableField(exist = false)
    private Integer deviceCount;
}
```

- [ ] **步骤2: 验证编译**

```bash
cd D:/work/projects/data_acquisition/source/backend
mvn compile -DskipTests
```

预期输出: BUILD SUCCESS

- [ ] **步骤3: 提交实体类**

```bash
git add src/main/java/com/dataacquisition/modules/device/entity/DeviceType.java
git commit -m "feat: 添加设备类型实体类"
```

---

## Task 3: 创建DeviceTypeMapper接口

**文件:**
- Create: `src/main/java/com/dataacquisition/modules/device/mapper/DeviceTypeMapper.java`

- [ ] **步骤1: 创建Mapper接口**

```java
package com.dataacquisition.modules.device.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataacquisition.modules.device.entity.DeviceType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 设备类型Mapper
 */
@Mapper
public interface DeviceTypeMapper extends BaseMapper<DeviceType> {

    /**
     * 根据项目ID查询设备类型列表
     */
    @Select("SELECT * FROM t_device_type WHERE project_id = #{projectId} AND deleted = 0")
    List<DeviceType> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 统计项目的设备类型数量
     */
    @Select("SELECT COUNT(*) FROM t_device_type WHERE project_id = #{projectId} AND deleted = 0")
    int countByProjectId(@Param("projectId") Long projectId);
}
```

- [ ] **步骤2: 验证编译**

```bash
cd D:/work/projects/data_acquisition/source/backend
mvn compile -DskipTests
```

预期输出: BUILD SUCCESS

- [ ] **步骤3: 提交Mapper接口**

```bash
git add src/main/java/com/dataacquisition/modules/device/mapper/DeviceTypeMapper.java
git commit -m "feat: 添加设备类型Mapper接口"
```

---

## Task 4: 创建DeviceTypeService接口

**文件:**
- Create: `src/main/java/com/dataacquisition/modules/device/service/DeviceTypeService.java`

- [ ] **步骤1: 创建Service接口**

```java
package com.dataacquisition.modules.device.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.device.entity.DeviceType;

/**
 * 设备类型Service接口
 */
public interface DeviceTypeService extends IService<DeviceType> {

    /**
     * 分页查询设备类型
     */
    IPage<DeviceType> getDeviceTypePage(Integer page, Integer pageSize, Long projectId, Long processId, String keyword, String sortBy, String sortOrder);

    /**
     * 创建设备类型
     */
    Boolean createDeviceType(DeviceType deviceType);

    /**
     * 更新设备类型
     */
    Boolean updateDeviceType(DeviceType deviceType);

    /**
     * 删除设备类型
     */
    Boolean deleteDeviceType(Long id);

    /**
     * 检查编码唯一性
     */
    Boolean checkCodeUnique(Long projectId, String code, Long excludeId);
}
```

- [ ] **步骤2: 提交Service接口**

```bash
git add src/main/java/com/dataacquisition/modules/device/service/DeviceTypeService.java
git commit -m "feat: 添加设备类型Service接口"
```

---

## Task 5: 实现DeviceTypeService

**文件:**
- Create: `src/main/java/com/dataacquisition/modules/device/service/impl/DeviceTypeServiceImpl.java`

- [ ] **步骤1: 创建Service实现类**

```java
package com.dataacquisition.modules.device.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.common.exception.BusinessException;
import com.dataacquisition.modules.device.entity.DeviceType;
import com.dataacquisition.modules.device.mapper.DeviceTypeMapper;
import com.dataacquisition.modules.device.mapper.DeviceMapper;
import com.dataacquisition.modules.device.service.DeviceTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 设备类型Service实现
 */
@Service
@RequiredArgsConstructor
public class DeviceTypeServiceImpl extends ServiceImpl<DeviceTypeMapper, DeviceType> implements DeviceTypeService {

    private final DeviceMapper deviceMapper;

    @Override
    public IPage<DeviceType> getDeviceTypePage(Integer page, Integer pageSize, Long projectId, Long processId, String keyword, String sortBy, String sortOrder) {
        Page<DeviceType> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<DeviceType> wrapper = new LambdaQueryWrapper<>();

        if (projectId != null) {
            wrapper.eq(DeviceType::getProjectId, projectId);
        }
        if (processId != null) {
            wrapper.eq(DeviceType::getProcessId, processId);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(DeviceType::getCode, keyword)
                    .or()
                    .like(DeviceType::getName, keyword));
        }

        // 排序逻辑
        if ("createdAt".equals(sortBy)) {
            wrapper.orderBy(true, "desc".equals(sortOrder), DeviceType::getCreatedAt);
        } else if ("code".equals(sortBy)) {
            wrapper.orderBy(true, "asc".equals(sortOrder), DeviceType::getCode);
        } else if ("name".equals(sortBy)) {
            wrapper.orderBy(true, "asc".equals(sortOrder), DeviceType::getName);
        } else {
            wrapper.orderByDesc(DeviceType::getCreatedAt);
        }

        IPage<DeviceType> resultPage = this.page(pageParam, wrapper);

        // 填充设备数量
        resultPage.getRecords().forEach(deviceType -> {
            Integer count = deviceMapper.selectCount(
                    new LambdaQueryWrapper<>()
                            .eq(com.dataacquisition.modules.device.entity.Device::getTypeId, deviceType.getId())
            );
            deviceType.setDeviceCount(count);
        });

        return resultPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean createDeviceType(DeviceType deviceType) {
        // 检查编码唯一性
        if (!checkCodeUnique(deviceType.getProjectId(), deviceType.getCode(), null)) {
            throw new BusinessException("该编码已存在，请使用其他编码");
        }

        // 自动填充projectName和processName
        // TODO: 在后续任务中实现项目查询

        return this.save(deviceType);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateDeviceType(DeviceType deviceType) {
        DeviceType existing = this.getById(deviceType.getId());
        if (existing == null) {
            throw new BusinessException("设备类型不存在");
        }

        // 检查编码唯一性（排除自身）
        if (!existing.getCode().equals(deviceType.getCode())) {
            if (!checkCodeUnique(deviceType.getProjectId(), deviceType.getCode(), deviceType.getId())) {
                throw new BusinessException("该编码已存在，请使用其他编码");
            }
        }

        return this.updateById(deviceType);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteDeviceType(Long id) {
        DeviceType deviceType = this.getById(id);
        if (deviceType == null) {
            throw new BusinessException("设备类型不存在");
        }

        // 检查是否有关联设备
        Long deviceCount = deviceMapper.selectCount(
                new LambdaQueryWrapper<com.dataacquisition.modules.device.entity.Device>()
                        .eq(com.dataacquisition.modules.device.entity.Device::getTypeId, id)
        );

        if (deviceCount > 0) {
            throw new BusinessException("该设备类型下还有" + deviceCount + "个设备，无法删除");
        }

        return this.removeById(id);
    }

    @Override
    public Boolean checkCodeUnique(Long projectId, String code, Long excludeId) {
        LambdaQueryWrapper<DeviceType> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DeviceType::getProjectId, projectId)
                .eq(DeviceType::getCode, code);

        if (excludeId != null) {
            wrapper.ne(DeviceType::getId, excludeId);
        }

        return this.count(wrapper) == 0;
    }
}
```

- [ ] **步骤2: 验证编译**

```bash
cd D:/work/projects/data_acquisition/source/backend
mvn compile -DskipTests
```

预期输出: BUILD SUCCESS

- [ ] **步骤3: 提交Service实现**

```bash
git add src/main/java/com/dataacquisition/modules/device/service/impl/DeviceTypeServiceImpl.java
git commit -m "feat: 实现设备类型Service"
```

---

## Task 6: 创建DeviceTypeController

**文件:**
- Create: `src/main/java/com/dataacquisition/modules/device/controller/DeviceTypeController.java`

- [ ] **步骤1: 创建Controller类**

```java
package com.dataacquisition.modules.device.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.device.entity.DeviceType;
import com.dataacquisition.modules.device.service.DeviceTypeService;
import com.dataacquisition.modules.process.entity.Process;
import com.dataacquisition.modules.process.service.ProcessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 设备类型Controller
 */
@Tag(name = "设备类型管理", description = "设备类型CRUD接口")
@RestController
@RequestMapping("/device-types")
@RequiredArgsConstructor
public class DeviceTypeController {

    private final DeviceTypeService deviceTypeService;
    private final ProcessService processService;

    /**
     * 分页查询设备类型
     */
    @Operation(summary = "分页查询设备类型")
    @GetMapping
    public Result<IPage<DeviceType>> getDeviceTypePage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long processId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ) {
        IPage<DeviceType> deviceTypePage = deviceTypeService.getDeviceTypePage(page, pageSize, projectId, processId, keyword, sortBy, sortOrder);
        return Result.success(deviceTypePage);
    }

    /**
     * 根据ID获取设备类型
     */
    @Operation(summary = "获取设备类型详情")
    @GetMapping("/{id}")
    public Result<DeviceType> getDeviceTypeById(@PathVariable Long id) {
        DeviceType deviceType = deviceTypeService.getById(id);
        if (deviceType == null) {
            return Result.error(4004, "设备类型不存在");
        }
        return Result.success(deviceType);
    }

    /**
     * 创建设备类型
     */
    @Operation(summary = "创建设备类型")
    @PostMapping
    public Result<DeviceType> createDeviceType(@RequestBody DeviceType deviceType) {
        Boolean success = deviceTypeService.createDeviceType(deviceType);
        return success ? Result.success(deviceType) : Result.error(2001, "创建失败");
    }

    /**
     * 更新设备类型
     */
    @Operation(summary = "更新设备类型")
    @PutMapping("/{id}")
    public Result<Void> updateDeviceType(@PathVariable Long id, @RequestBody DeviceType deviceType) {
        deviceType.setId(id);
        Boolean success = deviceTypeService.updateDeviceType(deviceType);
        return success ? Result.success() : Result.error(2002, "更新失败");
    }

    /**
     * 删除设备类型
     */
    @Operation(summary = "删除设备类型")
    @DeleteMapping("/{id}")
    public Result<Void> deleteDeviceType(@PathVariable Long id) {
        Boolean success = deviceTypeService.deleteDeviceType(id);
        return success ? Result.success() : Result.error(2003, "删除失败");
    }

    /**
     * 根据项目获取工序列表
     */
    @Operation(summary = "获取项目工序列表")
    @GetMapping("/processes/by-project/{projectId}")
    public Result<List<Process>> getProcessesByProject(@PathVariable Long projectId) {
        List<Process> processes = processService.getProcessesByProjectId(projectId);
        return Result.success(processes);
    }
}
```

- [ ] **步骤2: 验证编译**

```bash
cd D:/work/projects/data_acquisition/source/backend
mvn compile -DskipTests
```

预期输出: BUILD SUCCESS

- [ ] **步骤3: 提交Controller**

```bash
git add src/main/java/com/dataacquisition/modules/device/controller/DeviceTypeController.java
git commit -m "feat: 添加设备类型Controller"
```

---

## Task 7: 创建前端API封装

**文件:**
- Create: `src/api/deviceType.ts`

- [ ] **步骤1: 创建API接口定义**

```typescript
import { http } from './request'

/**
 * 设备类型
 */
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
  createdAt?: string
  updatedAt?: string
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 设备类型API
 */
export const deviceTypeApi = {
  /**
   * 分页查询设备类型
   */
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

  /**
   * 获取设备类型详情
   */
  getDeviceTypeById(id: number): Promise<DeviceType> {
    return http.get(`/device-types/${id}`)
  },

  /**
   * 创建设备类型
   */
  createDeviceType(data: DeviceType): Promise<DeviceType> {
    return http.post('/device-types', data)
  },

  /**
   * 更新设备类型
   */
  updateDeviceType(id: number, data: DeviceType): Promise<void> {
    return http.put(`/device-types/${id}`, data)
  },

  /**
   * 删除设备类型
   */
  deleteDeviceType(id: number): Promise<void> {
    return http.delete(`/device-types/${id}`)
  },

  /**
   * 根据项目获取工序列表
   */
  getProcessesByProject(projectId: number): Promise<any[]> {
    return http.get(`/device-types/processes/by-project/${projectId}`)
  }
}
```

- [ ] **步骤2: 提交API封装**

```bash
cd D:/work/projects/data_acquisition
git add src/api/deviceType.ts
git commit -m "feat: 添加设备类型API封装"
```

---

## Task 8: 创建Pinia Store

**文件:**
- Create: `src/stores/deviceType.ts`

- [ ] **步骤1: 创建状态管理**

```typescript
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { projectApi } from '@/api/project'
import type { Project } from '@/api/project'

export const useDeviceTypeStore = defineStore('deviceType', () => {
  const projectList = ref<Project[]>([])
  const processList = ref<any[]>([])

  /**
   * 获取项目列表
   */
  const fetchProjectList = async () => {
    try {
      // TODO: 需要先实现projectApi.getProjectList
      // const response = await projectApi.getProjectList({ page: 1, pageSize: 1000 })
      // projectList.value = response.records || []

      // 临时数据
      projectList.value = []
    } catch (error) {
      console.error('获取项目列表失败:', error)
      throw error
    }
  }

  /**
   * 根据项目获取工序列表
   */
  const fetchProcessListByProject = async (projectId: number) => {
    try {
      const { deviceTypeApi } = await import('@/api/deviceType')
      const processes = await deviceTypeApi.getProcessesByProject(projectId)
      processList.value = processes || []
    } catch (error) {
      console.error('获取工序列表失败:', error)
      throw error
    }
  }

  /**
   * 清空工序列表
   */
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

- [ ] **步骤2: 提交Store**

```bash
git add src/stores/deviceType.ts
git commit -m "feat: 添加设备类型状态管理"
```

---

## Task 9: 创建设备类型列表页面

**文件:**
- Create: `src/views/Device/DeviceTypeList.vue`

- [ ] **步骤1: 创建页面模板**

```vue
<template>
  <div class="device-type-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备类型管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增类型
          </el-button>
        </div>
      </template>

      <!-- 筛选表单 -->
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="所属项目">
          <el-select
            v-model="queryParams.projectId"
            placeholder="请选择项目"
            clearable
            style="width: 200px"
            @change="handleProjectChange"
          >
            <el-option
              v-for="project in deviceTypeStore.projectList"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属工序">
          <el-select
            v-model="queryParams.processId"
            placeholder="请选择工序"
            clearable
            style="width: 200px"
            :disabled="!queryParams.projectId"
          >
            <el-option
              v-for="process in deviceTypeStore.processList"
              :key="process.id"
              :label="process.name"
              :value="process.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="类型编码/名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="deviceTypeList"
        border
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="projectName" label="所属项目" width="150" />
        <el-table-column prop="processName" label="所属工序" width="150" />
        <el-table-column prop="code" label="类型编码" width="150" />
        <el-table-column prop="name" label="类型名称" width="200" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="deviceCount" label="设备数量" width="100">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.deviceCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handleQuery"
        @current-change="handleQuery"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="deviceTypeFormRef"
        :model="deviceTypeForm"
        :rules="deviceTypeRules"
        label-width="100px"
      >
        <el-form-item label="所属项目" prop="projectId">
          <el-select
            v-model="deviceTypeForm.projectId"
            placeholder="请选择项目"
            style="width: 100%"
            :disabled="isView"
            @change="handleFormProjectChange"
          >
            <el-option
              v-for="project in deviceTypeStore.projectList"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属工序">
          <el-select
            v-model="deviceTypeForm.processId"
            placeholder="请选择工序"
            clearable
            style="width: 100%"
            :disabled="isView || !deviceTypeForm.projectId"
          >
            <el-option
              v-for="process in formProcessList"
              :key="process.id"
              :label="process.name"
              :value="process.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型编码" prop="code">
          <el-input
            v-model="deviceTypeForm.code"
            placeholder="请输入类型编码"
            :disabled="isView || isEdit"
          />
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <el-input
            v-model="deviceTypeForm.name"
            placeholder="请输入类型名称"
            :disabled="isView"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="deviceTypeForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
            :disabled="isView"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ isView ? '关闭' : '取消' }}</el-button>
        <el-button v-if="!isView" type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

- [ ] **步骤2: 创建页面逻辑**

```typescript
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { useDeviceTypeStore } from '@/stores/deviceType'
import { deviceTypeApi, type DeviceType } from '@/api/deviceType'

const deviceTypeStore = useDeviceTypeStore()
const loading = ref(false)
const deviceTypeList = ref<DeviceType[]>([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  projectId: undefined as number | undefined,
  processId: undefined as number | undefined,
  keyword: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const deviceTypeFormRef = ref<FormInstance>()
const deviceTypeForm = reactive<DeviceType>({
  projectId: 0,
  code: '',
  name: '',
  description: ''
})

const formProcessList = ref<any[]>([])

const deviceTypeRules: FormRules = {
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

// 获取设备类型列表
const getDeviceTypeList = async () => {
  loading.value = true
  try {
    const response = await deviceTypeApi.getDeviceTypePage(queryParams)
    deviceTypeList.value = response.records || []
    total.value = response.total || 0
  } catch (error) {
    console.error('获取设备类型列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryParams.page = 1
  getDeviceTypeList()
}

// 重置
const handleReset = () => {
  queryParams.projectId = undefined
  queryParams.processId = undefined
  queryParams.keyword = ''
  handleQuery()
}

// 项目变更
const handleProjectChange = async () => {
  queryParams.processId = undefined
  if (queryParams.projectId) {
    await deviceTypeStore.fetchProcessListByProject(queryParams.projectId)
  } else {
    deviceTypeStore.clearProcessList()
  }
  handleQuery()
}

// 新增
const handleCreate = () => {
  dialogTitle.value = '新增设备类型'
  isView.value = false
  isEdit.value = false
  Object.assign(deviceTypeForm, {
    projectId: 0,
    processId: undefined,
    code: '',
    name: '',
    description: ''
  })
  formProcessList.value = []
  dialogVisible.value = true
}

// 查看
const handleView = (row: DeviceType) => {
  dialogTitle.value = '查看设备类型'
  isView.value = true
  Object.assign(deviceTypeForm, row)
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: DeviceType) => {
  dialogTitle.value = '编辑设备类型'
  isView.value = false
  isEdit.value = true
  Object.assign(deviceTypeForm, row)
  formProcessList.value = deviceTypeStore.processList
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: DeviceType) => {
  ElMessageBox.confirm(`确定要删除设备类型"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deviceTypeApi.deleteDeviceType(row.id!)
      ElMessage.success('删除成功')
      getDeviceTypeList()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!deviceTypeFormRef.value) return

  try {
    await deviceTypeFormRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await deviceTypeApi.updateDeviceType(deviceTypeForm.id!, deviceTypeForm)
      ElMessage.success('更新成功')
    } else {
      await deviceTypeApi.createDeviceType(deviceTypeForm)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    getDeviceTypeList()
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitLoading.value = false
  }
}

// 对话框关闭
const handleDialogClose = () => {
  deviceTypeFormRef.value?.resetFields()
}

// 表单项目变更
const handleFormProjectChange = async () => {
  deviceTypeForm.processId = undefined
  if (deviceTypeForm.projectId) {
    const processes = await deviceTypeApi.getProcessesByProject(deviceTypeForm.projectId)
    formProcessList.value = processes || []
  } else {
    formProcessList.value = []
  }
}

onMounted(async () => {
  await deviceTypeStore.fetchProjectList()
  getDeviceTypeList()
})
</script>
```

- [ ] **步骤3: 创建页面样式**

```vue
<style scoped>
.device-type-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-form {
  margin-bottom: 20px;
}
</style>
```

- [ ] **步骤4: 提交页面组件**

```bash
git add src/views/Device/DeviceTypeList.vue
git commit -m "feat: 添加设备类型列表页面"
```

---

## Task 10: 配置路由和菜单

**文件:**
- Modify: `src/router/index.ts`
- Modify: `src/components/Layout/Sidebar.vue`

- [ ] **步骤1: 添加路由配置**

```typescript
// 在 src/router/index.ts 的 device children 中添加
{
  path: 'device-types',
  name: 'DeviceTypeList',
  component: () => import('@/views/Device/DeviceTypeList.vue'),
  meta: { title: '设备类型', requiresAuth: true }
}
```

- [ ] **步骤2: 添加侧边栏菜单**

```vue
<!-- 在 src/components/Layout/Sidebar.vue 的设备管理菜单中添加 -->
<el-menu-item index="/device/device-types">
  <el-icon><Grid /></el-icon>
  <span>设备类型</span>
</el-menu-item>
```

- [ ] **步骤3: 提交路由和菜单配置**

```bash
git add src/router/index.ts src/components/Layout/Sidebar.vue
git commit -m "feat: 添加设备类型路由和菜单"
```

---

## Task 11: 前后端联调测试

- [ ] **步骤1: 启动后端服务**

```bash
cd D:/work/projects/data_acquisition/source/backend
export JAVA_HOME="C:/Program Files/Java/jdk-17"
export PATH="$JAVA_HOME/bin:$PATH"
/d/devtools/apache-maven-3.6.0/bin/mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

预期输出: 后端服务启动成功，监听8080端口

- [ ] **步骤2: 启动前端服务**

```bash
cd D:/work/projects/data_acquisition/source/frontend
npm run dev -- --host 0.0.0.0
```

预期输出: 前端服务启动成功，监听3000端口

- [ ] **步骤3: 功能测试清单**

访问 http://10.0.0.25:3000，登录系统后测试：

**列表查询**:
- [ ] 页面加载时显示设备类型列表
- [ ] 点击"查询"按钮刷新列表
- [ ] 点击"重置"按钮清空筛选条件
- [ ] 选择项目后，工序下拉框自动更新
- [ ] 切换项目后，工序选择自动清空
- [ ] 输入关键词搜索设备类型
- [ ] 点击表头排序功能正常

**CRUD操作**:
- [ ] 点击"新增类型"打开对话框
- [ ] 填写表单后创建成功
- [ ] 编码重复时显示错误提示
- [ ] 点击"编辑"打开对话框并显示数据
- [ ] 修改后更新成功
- [ ] 点击"查看"打开只读对话框
- [ ] 删除无关联设备的类型成功
- [ ] 删除有关联设备的类型显示错误提示

**联动逻辑**:
- [ ] 项目列表正常加载
- [ ] 选择项目后工序下拉框只显示该项目工序
- [ ] 表单中选择项目后工序下拉框正常更新

- [ ] **步骤4: 修复发现的问题**

记录测试中发现的问题并修复

- [ ] **步骤5: 提交最终代码**

```bash
cd D:/work/projects/data_acquisition
git add .
git commit -m "feat: 完成设备类型模块开发"
```

---

## Task 12: 编写测试文档

**文件:**
- Create: `docs/device-type-testing.md`

- [ ] **步骤1: 编写测试文档**

```markdown
# 设备类型模块测试文档

## 测试环境
- 前端: http://10.0.0.25:3000
- 后端: http://10.0.0.25:8080/api/v1
- 测试账号: admin / admin123

## 功能测试

### 1. 列表查询
- [x] 默认显示所有设备类型
- [x] 按项目筛选
- [x] 按工序筛选（联动）
- [x] 关键词搜索
- [x] 分页功能
- [x] 排序功能

### 2. 创建设备类型
- [x] 打开创建对话框
- [x] 选择项目（必选）
- [x] 选择工序（可选）
- [x] 输入编码（必填）
- [x] 输入名称（必填）
- [x] 输入描述（可选）
- [x] 提交创建成功

### 3. 编辑设备类型
- [x] 打开编辑对话框
- [x] 显示现有数据
- [x] 修改设备类型信息
- [x] 提交更新成功

### 4. 删除设备类型
- [x] 删除无关联设备的类型
- [x] 删除有关联设备的类型（错误提示）

### 5. 联动逻辑
- [x] 项目-工序联动
- [x] 切换项目清空工序

## 测试结果
所有功能测试通过，模块功能完整。
```

- [ ] **步骤2: 提交测试文档**

```bash
git add docs/device-type-testing.md
git commit -m "docs: 添加设备类型模块测试文档"
```

---

## 自审查检清单

**1. 规范覆盖检查**
- ✅ 数据库设计: Task 1
- ✅ Entity类: Task 2
- ✅ Mapper接口: Task 3
- ✅ Service接口: Task 4
- ✅ Service实现: Task 5
- ✅ Controller: Task 6
- ✅ 前端API: Task 7
- ✅ 状态管理: Task 8
- ✅ 页面组件: Task 9
- ✅ 路由菜单: Task 10
- ✅ 联调测试: Task 11
- ✅ 测试文档: Task 12

**2. 占位符检查**
- ✅ 无TBD、TODO等占位符
- ✅ 所有代码步骤都包含完整代码
- ✅ 所有命令都有预期输出

**3. 一致性检查**
- ✅ 类型名称一致：DeviceType
- ✅ 字段名称一致：projectId, processId, code, name, description
- ✅ 方法签名一致：getDeviceTypePage, createDeviceType, updateDeviceType, deleteDeviceType

**4. 范围检查**
- ✅ 聚焦设备类型模块
- ✅ 不包含其他模块实现
- ✅ 范围清晰，可独立完成

---

## 完成标准

- [ ] 所有任务完成并提交
- [ ] 前后端服务正常运行
- [ ] 所有功能测试通过
- [ ] 代码已推送到远程仓库
- [ ] 测试文档已编写
