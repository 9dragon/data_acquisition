<template>
  <div class="gantt-legend">
    <div class="legend-section">
      <span class="section-title">时间：</span>
      <div class="legend-items">
        <div class="legend-item">
          <span class="color-box plan"></span>
          <span class="label">计划时间</span>
        </div>
        <div class="legend-item multi-color">
          <span class="color-box actual-pending"></span>
          <span class="color-box actual-progress"></span>
          <span class="color-box actual-completed"></span>
          <span class="color-box actual-cancelled"></span>
          <span class="label">实际时间（按状态）</span>
        </div>
      </div>
    </div>
    <div class="legend-section">
      <span class="section-title">状态：</span>
      <div class="legend-items">
        <div class="legend-item">
          <span class="icon">⏳</span>
          <span class="color-dot pending"></span>
          <span class="label">未开始</span>
        </div>
        <div class="legend-item">
          <span class="icon">▶</span>
          <span class="color-dot in-progress"></span>
          <span class="label">进行中</span>
        </div>
        <div class="legend-item">
          <span class="icon">✓</span>
          <span class="color-dot completed"></span>
          <span class="label">已完成</span>
        </div>
        <div class="legend-item">
          <span class="icon">✖</span>
          <span class="color-dot cancelled"></span>
          <span class="label">已取消</span>
        </div>
        <div class="legend-item">
          <span class="icon">⚠</span>
          <span class="label warning">超期</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gantt-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.legend-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  font-weight: 500;
  color: #303133;
  font-size: 13px;
}

.legend-items {
  display: flex;
  align-items: center;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.color-box {
  width: 20px;
  height: 12px;
  border-radius: 2px;
}

.color-box.plan {
  background: rgba(200, 200, 200, 0.35);
  border: 1px solid #ccc;
}

.color-box.actual {
  background: #409EFF;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.multi-color {
  display: flex;
  align-items: center;
  gap: 2px;
}

.color-box.actual-pending {
  background: #909399;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-box.actual-progress {
  background: #409EFF;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-box.actual-completed {
  background: #67C23A;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-box.actual-cancelled {
  background: #F56C6C;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 14px;
}

.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.color-dot.pending {
  background: #909399;
}

.color-dot.in-progress {
  background: #409EFF;
}

.color-dot.completed {
  background: #67C23A;
}

.color-dot.cancelled {
  background: #F56C6C;
}

.label {
  color: #606266;
}

.warning {
  color: #F56C6C;
  font-weight: 500;
}
</style>
