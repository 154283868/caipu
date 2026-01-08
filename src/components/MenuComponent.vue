<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  dishes: {
    type: Object,
    required: true,
  },
  selectedDishes: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['select-dish', 'remove-dish', 'confirm-order']);

const activeCategory = ref("热菜");
const activeSubCategory = ref("肉菜");

const categories = ["热菜", "凉菜", "主食", "汤品", "饮料"];

const hasSubCategories = computed(() => {
  return (
    typeof props.dishes[activeCategory.value] === "object" &&
    !Array.isArray(props.dishes[activeCategory.value])
  );
});

const subCategories = computed(() => {
  if (!hasSubCategories.value) return [];
  return Object.keys(props.dishes[activeCategory.value] || {});
});

const currentDishes = computed(() => {
  const categoryData = props.dishes[activeCategory.value];
  if (!categoryData) return [];

  if (hasSubCategories.value) {
    return categoryData[activeSubCategory.value] || [];
  }

  return categoryData;
});

const handleImageError = (event) => {
  event.target.style.display = "none";
};

const isDishSelected = (dishId) => {
  return props.selectedDishes.some((d) => d.id === dishId);
};

const handleSelectDish = (dish) => {
  emit('select-dish', dish);
};

const handleRemoveDish = (dishId) => {
  emit('remove-dish', dishId);
};

const handleConfirmOrder = () => {
  emit('confirm-order');
};

watch(activeCategory, () => {
  if (hasSubCategories.value) {
    activeSubCategory.value = Object.keys(props.dishes[activeCategory.value])[0];
  }
});
</script>

<template>
  <div class="container">
    <div class="sidebar">
      <div
        v-for="category in categories"
        :key="category"
        class="menu-item"
        :class="{ active: activeCategory === category }"
        @click="activeCategory = category"
      >
        {{ category }}
      </div>
      <div
        v-if="hasSubCategories"
        v-for="subCategory in subCategories"
        :key="subCategory"
        class="menu-item sub-menu-item"
        :class="{ active: activeSubCategory === subCategory }"
        @click="activeSubCategory = subCategory"
      >
        {{ subCategory }}
      </div>
    </div>
    <div class="main-content">
      <div class="content-area">
        <div class="dish-grid">
          <div v-for="dish in currentDishes" :key="dish.id" class="dish-card">
            <img
              v-if="dish.image"
              :src="dish.image"
              :alt="dish.name"
              class="dish-image"
              @error="handleImageError"
            />
            <div class="dish-name">{{ dish.name }}</div>
            <button
              class="dish-button"
              :class="isDishSelected(dish.id) ? 'selected' : 'select'"
              @click="isDishSelected(dish.id) ? handleRemoveDish(dish.id) : handleSelectDish(dish)"
            >
              {{ isDishSelected(dish.id) ? "已选择" : "选择" }}
            </button>
          </div>
        </div>
      </div>
      <div class="order-panel">
        <div class="order-header">
          <span class="order-title">已选菜品 ({{ selectedDishes.length }})</span>
        </div>
        <div class="order-list">
          <div
            v-for="dish in selectedDishes"
            :key="dish.id"
            class="order-item"
          >
            <span class="order-item-name">{{ dish.name }}</span>
            <span class="order-item-remove" @click="handleRemoveDish(dish.id)"
              >删除</span
            >
          </div>
          <div v-if="selectedDishes.length === 0" class="empty-state">
            <div class="empty-state-text">暂无已选菜品</div>
          </div>
        </div>
        <button
          class="confirm-button"
          :disabled="selectedDishes.length === 0"
          @click="handleConfirmOrder"
        >
          确认下单
        </button>
      </div>
    </div>
  </div>
</template>
