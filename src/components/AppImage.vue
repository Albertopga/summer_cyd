<template>
  <img
    :src="props.src"
    :alt="props.alt"
    class="image-placeholder"
    :style="{ objectPosition: props.objectPosition }"
  />
</template>
<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
  objectPosition: {
    type: String,
    default: 'center',
    validator: (value) => {
      return [
        'center',
        'top',
        'bottom',
        'left',
        'right',
        'top left',
        'top right',
        'bottom left',
        'bottom right',
      ].includes(value)
    },
  },
})
</script>
<style scoped>
.image-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.image-placeholder:hover {
  transform: scale(1.05);
}

.image-placeholder::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  animation: shimmer 3s infinite;
}
</style>
