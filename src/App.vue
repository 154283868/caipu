<script setup>
import { ref, onMounted } from "vue";
import MenuComponent from "./components/MenuComponent.vue";
import HistoryComponent from "./components/HistoryComponent.vue";

const activeTab = ref("menu");
const dishes = ref({});
const selectedDishes = ref([]);
const orderHistory = ref([]);

const loadDishes = async () => {
  try {
    const response = await fetch("./dishes.json");
    dishes.value = await response.json();
  } catch (error) {
    console.error("加载菜品数据失败:", error);
  }
};

const loadOrderHistory = async () => {
  try {
    const response = await fetch("./orders.json");
    orderHistory.value = await response.json();
  } catch (error) {
    console.error("加载历史订单失败:", error);
  }
};

const handleSelectDish = (dish) => {
  const index = selectedDishes.value.findIndex((d) => d.id === dish.id);
  if (index === -1) {
    selectedDishes.value.push({ ...dish, quantity: 1 });
  } else {
    selectedDishes.value[index].quantity++;
  }
};

const handleRemoveDish = (dishId) => {
  const index = selectedDishes.value.findIndex((d) => d.id === dishId);
  if (index !== -1) {
    if (selectedDishes.value[index].quantity > 1) {
      selectedDishes.value[index].quantity--;
    } else {
      selectedDishes.value.splice(index, 1);
    }
  }
};

const handleDeleteDish = (dishId) => {
  const index = selectedDishes.value.findIndex((d) => d.id === dishId);
  if (index !== -1) {
    selectedDishes.value.splice(index, 1);
  }
};

const handleClearAll = () => {
  selectedDishes.value = [];
};

const handleConfirmOrder = async () => {
  if (selectedDishes.value.length === 0) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const timeStr = `${year}${month}${day}${hours}${minutes}`;

  const newOrder = {
    id: Date.now(),
    time: timeStr,
    dishes: [...selectedDishes.value],
  };

  orderHistory.value.unshift(newOrder);

  try {
    await fetch("./orders.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderHistory.value),
    });
  } catch (error) {
    console.error("保存订单失败:", error);
  }

  selectedDishes.value = [];
  activeTab.value = "history";
};

onMounted(() => {
  loadDishes();
  loadOrderHistory();
});
</script>

<template>
  <div id="app">
    <MenuComponent
      v-if="activeTab === 'menu'"
      :dishes="dishes"
      :selected-dishes="selectedDishes"
      @select-dish="handleSelectDish"
      @remove-dish="handleRemoveDish"
      @delete-dish="handleDeleteDish"
      @clear-all="handleClearAll"
      @confirm-order="handleConfirmOrder"
    />

    <HistoryComponent
      v-if="activeTab === 'history'"
      :order-history="orderHistory"
      @reorder="handleReorder"
    />

    <div class="tab-bar">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'menu' }"
        @click="activeTab = 'menu'"
      >
        点餐
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        历史记录
      </div>
    </div>
  </div>
</template>
