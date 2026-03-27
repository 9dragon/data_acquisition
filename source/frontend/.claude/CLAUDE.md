## 分页组件标准配置

### 配置规范
- **默认显示条数**：10条
- **支持的条数选项**：[10, 20, 50, 100]
- **语言设置**：中文显示
- **布局**：total, sizes, prev, pager, next, jumper

### 实现位置
- **全局语言配置**：`frontend/src/main.ts` - Element Plus中文语言包
- **应用页面**：所有列表页面（Device、Project、Process、User、Workshop）

### 分页组件模板
```vue
<el-pagination
  v-model:current-page="queryParams.pageNum"
  v-model:page-size="queryParams.pageSize"
  :total="total"
  :page-sizes="[10, 20, 50, 100]"
  layout="total, sizes, prev, pager, next, jumper"
  @size-change="handleQuery"
  @current-change="handleQuery"
/>
```

### 数据结构
```typescript
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  // ... 其他查询参数
})
```


## 日期时间展示规范
- 系统内所有时间格式：2026-03-27 09:32:18
- 系统内所有日期格式：2026-03-27