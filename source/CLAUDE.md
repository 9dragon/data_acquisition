MySQL在远程，不要直接操作，生成SQL语句手动执行即可

## 日期时间展示规范
- 系统内所有时间格式：2026-03-27 09:32:18
- 系统内所有日期格式：2026-03-27

## 接口规范
- 移动端和WEB端共用业务接口（Controller），不按终端新建不同的Controller，业务逻辑保持一致，通过参数兼容区分

## 前端操作按钮规范
- 列表页操作列按钮统一使用 `link` 类型，带 `:icon` 属性
- 详情/查看使用 `View` icon，编辑使用 `Edit` icon，删除使用 `Delete` icon
- 操作列按钮用 `<div class="action-buttons">` 包裹，确保按钮在同一行显示
- 删除按钮使用 `el-popconfirm` 包裹，需设置 `confirm-button-text="确定"` 和 `cancel-button-text="取消"`
- 按钮文字统一用"查看"而非"详情"

