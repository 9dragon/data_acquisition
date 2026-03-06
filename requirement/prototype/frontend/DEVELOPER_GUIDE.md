# 进度填报功能 - 开发者快速参考

## 快速开始

### 导入组件

```typescript
// 导入进度填报模态框
import { ProgressReportModal } from '@/components/Progress';

// 或者单独导入
import ProgressReportModal from '@/components/Progress/ProgressReportModal';
```

### 基本使用

```typescript
import { ProgressReportModal } from '@/components/Progress';
import { useProjectStore } from '@/stores/projectStore';
import { Project } from '@/types/project';

function MyComponent() {
  const { projects } = useProjectStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleReport = (project: Project) => {
    setSelectedProject(project);
    setModalVisible(true);
  };

  return (
    <>
      <Button onClick={() => handleReport(project)}>填报进度</Button>

      <ProgressReportModal
        visible={modalVisible}
        project={selectedProject}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
```

## 核心工具函数

### 进度计算

```typescript
import {
  calculateOverallProgress,           // 计算总体进度
  calculateByTaskStageProgress,       // 按任务计算阶段进度
  calculateByDeviceStageProgress,     // 按设备计算阶段进度
  updateStageStatus,                  // 更新阶段状态
  initializeStageProgress,            // 初始化阶段进度
  updateStageProgress,                // 更新阶段进度
  formatReportDate,                   // 格式化填报日期
  getStageStatusText,                 // 获取阶段状态文本
  getStageStatusColor,                // 获取阶段状态颜色
} from '@/utils/progressCalculators';
```

### 使用示例

```typescript
// 计算总体进度
const overallProgress = calculateOverallProgress(stageConfigs);
// 返回: 45 (表示 45%)

// 按任务计算阶段进度
const taskProgress = calculateByTaskStageProgress(taskProgressArray);
// 返回: 75 (表示 75%，即 3/4 任务完成)

// 按设备计算阶段进度
const deviceProgress = calculateByDeviceStageProgress(deviceProgressArray, totalDeviceCount);
// 返回: 50 (表示 50%，即 2/4 设备完成)

// 更新阶段状态
const status = updateStageStatus(100);
// 返回: 'completed'

// 格式化填报日期
const formattedDate = formatReportDate('2024-02-10T10:00:00.000Z');
// 返回: '2024-02-10 10:00'
```

## Store 方法

### useProjectStore 进度管理

```typescript
import { useProjectStore, ProgressReportData } from '@/stores/projectStore';

const {
  updateProjectProgress,              // 更新项目进度
  calculateAndUpdateOverallProgress,  // 计算并更新总体进度
  updateStageProgress,                // 更新阶段进度
} = useProjectStore();
```

### 使用示例

```typescript
// 更新项目进度
const progressData: ProgressReportData = {
  stageConfigs: updatedStageConfigs,
  overallRemark: '项目进展顺利',
};
updateProjectProgress(projectId, progressData);

// 计算并更新总体进度
calculateAndUpdateOverallProgress(projectId);

// 更新单个阶段进度
updateStageProgress(projectId, 'construction', {
  deviceProgress: updatedDeviceProgress,
  remark: '设备安装已完成80%',
});
```

## 数据结构

### ProgressReportData

```typescript
interface ProgressReportData {
  stageConfigs: ProjectStageConfig[];  // 阶段配置列表
  overallRemark?: string;              // 总体说明
}
```

### ProjectStageConfig（扩展）

```typescript
interface ProjectStageConfig {
  // 原有字段
  stageKey: string;
  weight: number;
  status?: 'not_started' | 'in_progress' | 'completed';

  // 新增字段
  actualProgress?: number;              // 阶段实际进度 0-100（自动计算）
  taskProgress?: StageTaskProgress[];   // 任务完成情况
  deviceProgress?: StageDeviceProgress[]; // 设备完成情况
  remark?: string;                      // 阶段说明
  lastReportDate?: string;              // 最后填报日期
}
```

### StageTaskProgress

```typescript
interface StageTaskProgress {
  taskId: string;           // 任务ID
  taskName: string;         // 任务名称
  completed: boolean;       // 是否完成
  completedDate?: string;   // 完成日期 (YYYY-MM-DD)
  remark?: string;          // 备注
}
```

### StageDeviceProgress

```typescript
interface StageDeviceProgress {
  deviceId: string;         // 设备ID
  deviceName: string;       // 设备名称
  completed: boolean;       // 是否完成
  completedDate?: string;   // 完成日期 (YYYY-MM-DD)
  remark?: string;          // 备注
}
```

## 组件 Props

### ProgressReportModal

```typescript
interface ProgressReportModalProps {
  visible: boolean;              // 是否显示模态框
  project: Project | null;       // 项目对象
  onClose: () => void;           // 关闭回调
  onSubmit?: (data: ProgressReportData) => void; // 提交回调（可选）
}
```

### StageProgressCard

```typescript
interface StageProgressCardProps {
  stageConfig: ProjectStageConfig;    // 阶段配置
  stageDefinition: StageDefinition;   // 阶段定义
  projectDeviceCount: number;         // 项目设备总数
  onChange: (updatedConfig: ProjectStageConfig) => void; // 变更回调
  disabled?: boolean;                 // 是否禁用
}
```

### ByTaskStageProgressPanel

```typescript
interface ByTaskStageProgressPanelProps {
  taskProgress: StageTaskProgress[];  // 任务进度列表
  onChange: (taskProgress: StageTaskProgress[]) => void; // 变更回调
  disabled?: boolean;                 // 是否禁用
}
```

### ByDeviceStageProgressPanel

```typescript
interface ByDeviceStageProgressPanelProps {
  deviceProgress: StageDeviceProgress[]; // 设备进度列表
  totalDeviceCount: number;              // 项目设备总数
  onChange: (deviceProgress: StageDeviceProgress[]) => void; // 变更回调
  disabled?: boolean;                    // 是否禁用
}
```

## 常见场景

### 场景1：创建新的阶段配置

```typescript
import { initializeStageProgress } from '@/utils/progressCalculators';

const stageProgress = initializeStageProgress(stageDefinition, projectDevices);
// 返回包含 taskProgress 或 deviceProgress 的阶段配置
```

### 场景2：更新任务完成状态

```typescript
const updatedTaskProgress = taskProgress.map(task =>
  task.taskId === targetTaskId
    ? { ...task, completed: true, completedDate: '2024-02-10' }
    : task
);

const newStageProgress = updateStageProgress(stageConfig, {
  taskProgress: updatedTaskProgress
});
// 返回更新后的阶段配置，actualProgress 会自动重新计算
```

### 场景3：批量完成设备

```typescript
const updatedDeviceProgress = deviceProgress.map(device => ({
  ...device,
  completed: true,
  completedDate: new Date().toISOString().split('T')[0],
}));

updateStageProgress(projectId, stageKey, {
  deviceProgress: updatedDeviceProgress
});
```

### 场景4：获取阶段状态信息

```typescript
import { getStageStatusText, getStageStatusColor } from '@/utils/progressCalculators';

const status = 'in_progress';
const statusText = getStageStatusText(status);  // '进行中'
const statusColor = getStageStatusColor(status); // '#1890ff'
```

## 样式定制

### Ant Design 主题定制

```typescript
// 在 App.tsx 或全局配置中
import { ConfigProvider } from 'antd';

<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',      // 主题色
      colorSuccess: '#52c41a',      // 成功色
      colorWarning: '#faad14',      // 警告色
      colorError: '#ff4d4f',        // 错误色
    },
  }}
>
  <App />
</ConfigProvider>
```

### 自定义组件样式

所有组件都使用内联样式，可以轻松覆盖：

```typescript
<StageProgressCard
  stageConfig={config}
  stageDefinition={definition}
  projectDeviceCount={deviceCount}
  onChange={handleChange}
  // 可以在外部包裹 div 来添加自定义样式
/>
```

## 调试技巧

### 查看当前项目进度

```typescript
const project = useProjectStore(state =>
  state.projects.find(p => p.id === projectId)
);

console.log('项目总体进度:', project.progress);
console.log('阶段配置:', project.stageConfigs);
```

### 验证进度计算

```typescript
import { calculateOverallProgress } from '@/utils/progressCalculators';

const calculated = calculateOverallProgress(stageConfigs);
console.log('计算的总体进度:', calculated);
```

### 检查阶段状态

```typescript
stageConfigs.forEach(config => {
  console.log(`${config.stageKey}:`, {
    进度: config.actualProgress,
    状态: config.status,
    权重: config.weight,
  });
});
```

## 常见问题

### Q: 为什么总体进度没有自动更新？

A: 确保调用了 `updateProjectProgress` 方法，它会自动计算并更新总体进度。

### Q: 如何处理没有设备的阶段？

A: 对于 `by_device` 阶段，如果没有设备，`deviceProgress` 应该是空数组，进度会是 0%。

### Q: 如何添加新的阶段类型？

A: 在 `mockStageDefinitions` 中添加新的阶段定义，指定 `progressMode` 为 `by_task` 或 `by_device`。

### Q: 日期格式是什么？

A: 使用 ISO 8601 格式：`YYYY-MM-DDTHH:mm:ss.sssZ` 或简化为 `YYYY-MM-DD`。

## 相关文件

- **类型定义**: `src/types/project.ts`
- **工具函数**: `src/utils/progressCalculators.ts`
- **组件**: `src/components/Progress/`
- **Store**: `src/stores/projectStore.ts`
- **Mock数据**: `src/services/mockData.ts`
- **页面**: `src/pages/Progress/ProgressList.tsx`

## 更多信息

查看完整实施文档：`IMPLEMENTATION_SUMMARY.md`
