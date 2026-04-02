<template>
  <div class="weight-slider" ref="sliderRef">
    <div class="slider-track" ref="trackRef" @click="handleClick">
      <div class="slider-bar" :style="{ width: percentage + '%' }"></div>
      <div 
        class="slider-button" 
        :style="{ left: percentage + '%' }"
        @mousedown="startDrag"
      ></div>
    </div>
    <el-input-number
      :model-value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      controls-position="right"
      @update:model-value="handleInputChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
}

interface Emits {
  'update:modelValue': [value: number]
  'change': [value: number]
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1
})

const emit = defineEmits<Emits>()

const sliderRef = ref<HTMLElement>()
const trackRef = ref<HTMLElement>()
const isDragging = ref(false)

const percentage = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100
})

function handleInputChange(value: number | undefined) {
  if (value !== undefined) {
    emit('update:modelValue', value)
    emit('change', value)
  }
}

function handleClick(e: MouseEvent) {
  if (!trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  const value = Math.round((percent / 100) * (props.max - props.min) / props.step) * props.step + props.min
  const clampedValue = Math.max(props.min, Math.min(props.max, value))
  emit('update:modelValue', clampedValue)
  emit('change', clampedValue)
}

function startDrag(e: MouseEvent) {
  e.preventDefault()
  isDragging.value = true
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value || !trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  const value = Math.round((percent / 100) * (props.max - props.min) / props.step) * props.step + props.min
  const clampedValue = Math.max(props.min, Math.min(props.max, value))
  emit('update:modelValue', clampedValue)
  emit('change', clampedValue)
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}
</script>

<style scoped>
.weight-slider {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  height: 32px;
  padding: 4px 0;
}

.slider-track {
  flex: 1;
  position: relative;
  height: 8px;
  background-color: #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  min-width: 72px;
}

.slider-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: #409eff;
  border-radius: 4px;
  pointer-events: none;
}

.slider-button {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background-color: #fff;
  border: 2px solid #409eff;
  border-radius: 50%;
  cursor: grab;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  z-index: 10;
}

.slider-button:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.slider-button:active {
  cursor: grabbing;
}

.weight-slider .el-input-number {
  width: 90px;
  flex-shrink: 0;
}
</style>