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

const emit = defineEmits([
  "select-dish",
  "remove-dish",
  "delete-dish",
  "clear-all",
  "confirm-order",
]);

const activeCategory = ref("热菜");
const activeSubCategory = ref("肉菜");
const searchQuery = ref("");
const showImagePreview = ref(false);
const previewImage = ref("");
const enableImagePreview = ref(true);

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

  let dishes = [];
  if (hasSubCategories.value) {
    dishes = categoryData[activeSubCategory.value] || [];
  } else {
    dishes = categoryData;
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    dishes = dishes.filter((dish) => dish.name.toLowerCase().includes(query));
  }

  return dishes;
});

const handleImageError = (event) => {
  event.target.style.display = "none";
};

const getDishQuantity = (dishId) => {
  const dish = props.selectedDishes.find((d) => d.id === dishId);
  return dish ? dish.quantity : 0;
};

const handleSelectDish = (dish) => {
  emit("select-dish", dish);
};

const handleRemoveDish = (dishId) => {
  emit("remove-dish", dishId);
};

const handleDeleteDish = (dishId) => {
  emit("delete-dish", dishId);
};

const handleClearAll = () => {
  emit("clear-all");
};

const handleConfirmOrder = () => {
  emit("confirm-order");
};

const handleImageClick = (image) => {
  if (!enableImagePreview.value) return;
  previewImage.value = image;
  showImagePreview.value = true;
};

const closeImagePreview = () => {
  showImagePreview.value = false;
  previewImage.value = "";
};

const totalPrice = computed(() => {
  return props.selectedDishes.reduce(
    (sum, dish) => sum + dish.price * dish.quantity,
    0
  );
});

watch(activeCategory, () => {
  if (hasSubCategories.value) {
    activeSubCategory.value = Object.keys(
      props.dishes[activeCategory.value]
    )[0];
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
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索菜品..."
          class="search-input"
        />
      </div>
      <div class="content-area" ref="contentAreaRef">
        <div class="dish-grid">
          <div v-for="dish in currentDishes" :key="dish.id" class="dish-card">
            <img
              v-if="dish.image"
              :src="dish.image"
              :alt="dish.name"
              class="dish-image"
              @error="handleImageError"
              @click="handleImageClick(dish.image)"
            />
            <div class="dish-name">{{ dish.name }}</div>
            <button
              class="dish-button"
              :class="getDishQuantity(dish.id) > 0 ? 'selected' : 'select'"
              @click="
                getDishQuantity(dish.id) > 0
                  ? handleRemoveDish(dish.id)
                  : handleSelectDish(dish)
              "
            >
              {{
                getDishQuantity(dish.id) > 0
                  ? `已选 ${getDishQuantity(dish.id)}`
                  : "选择"
              }}
            </button>
          </div>
        </div>
      </div>
      <div class="order-panel">
        <div class="order-header">
          <span class="order-title"
            >已选菜品 ({{ selectedDishes.length }})</span
          >
          <button
            class="clear-button"
            @click="handleClearAll"
            v-if="selectedDishes.length > 0"
          >
            清空
          </button>
        </div>
        <div class="order-list">
          <div v-for="dish in selectedDishes" :key="dish.id" class="order-item">
            <div class="order-item-info">
              <span class="order-item-name">{{ dish.name }}</span>
              <span class="order-item-price">× {{ dish.quantity }}</span>
            </div>
            <div class="order-item-actions">
              <!-- <button class="quantity-btn" @click="handleRemoveDish(dish.id)">
                -
              </button> -->
              <!-- <span class="quantity">{{ dish.quantity }}</span> -->
              <!-- <button class="quantity-btn" @click="handleSelectDish(dish)">
                +
              </button> -->
              <span class="order-item-remove" @click="handleDeleteDish(dish.id)"
                >删除</span
              >
            </div>
          </div>
          <div v-if="selectedDishes.length === 0" class="empty-state">
            <div class="empty-state-text">暂无已选菜品</div>
          </div>
        </div>
        <!-- <div class="order-total">
          <span class="total-label">总计:</span>
          <span class="total-price">¥{{ totalPrice }}</span>
        </div> -->
        <button
          class="confirm-button"
          :disabled="selectedDishes.length === 0"
          @click="handleConfirmOrder"
        >
          确认下单
        </button>
      </div>
    </div>

    <div
      v-if="showImagePreview"
      class="image-preview-overlay"
      @click="closeImagePreview"
    >
      <div class="image-preview-modal" @click.stop>
        <button class="preview-close-button" @click="closeImagePreview">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <img :src="previewImage" alt="菜品预览" class="preview-image" />
      </div>
    </div>
  </div>
</template>
