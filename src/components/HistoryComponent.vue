<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  orderHistory: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["reorder", "back-to-menu"]);

const selectedTimeFilter = ref("all");

const timeFilters = computed(() => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  return [
    {
      label: "全部",
      value: "all",
    },

    {
      label: "今天",
      value: "today",
    },

    {
      label: "昨天",
      value: "yesterday",
    },

    {
      label: "最近7天",
      value: "week",
    },

    {
      label: "最近30天",
      value: "month",
    },
  ];
});

const filteredOrders = computed(() => {
  if (selectedTimeFilter.value === "all") {
    return props.orderHistory;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  return props.orderHistory.filter((order) => {
    const orderDate = parseOrderDate(order.time);

    switch (selectedTimeFilter.value) {
      case "today":
        return orderDate >= today;
      case "yesterday":
        return orderDate >= yesterday && orderDate < today;
      case "week":
        return orderDate >= weekAgo;
      case "month":
        return orderDate >= monthAgo;
      default:
        return true;
    }
  });
});

const parseOrderDate = (timeStr) => {
  const year = parseInt(timeStr.substring(0, 4));
  const month = parseInt(timeStr.substring(4, 6)) - 1;
  const day = parseInt(timeStr.substring(6, 8));
  return new Date(year, month, day);
};

const formatTime = (timeStr) => {
  const year = timeStr.substring(0, 4);
  const month = timeStr.substring(4, 6);
  const day = timeStr.substring(6, 8);
  const hours = timeStr.substring(8, 10);
  const minutes = timeStr.substring(10, 12);
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
</script><template>
  <div class="history-section">
    <div class="history-header">
      <div class="history-title">历史订单</div>
      <select v-model="selectedTimeFilter" class="time-filter">
        <option
          v-for="filter in timeFilters"
          :key="filter.value"
          :value="filter.value"
        >
          {{ filter.label }}
        </option>
      </select>
    </div>
    <div class="history-list">
      <div v-if="filteredOrders.length === 0" class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">暂无历史订单</div>
      </div>
      <div v-for="order in filteredOrders" :key="order.id" class="history-item">
        <div class="history-header">
          <span class="history-time">{{ formatTime(order.time) }}</span>
        </div>
        <div class="history-dishes">
          <div
            v-for="dish in order.dishes"
            :key="dish.id"
            class="history-dish-item"
          >
            <span class="dish-name">{{ dish.name }}</span>
            <span class="dish-detail"> × {{ dish.quantity || 1 }} </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>