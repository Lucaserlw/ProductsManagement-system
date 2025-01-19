// 商品类型定义
export const ProductType = {
  id: String,
  name: String,
  cost: Number,
  shippingFeeNormal: Number,
  shippingFeeRemote: Number,
}

// 订单类型定义
export const OrderType = {
  id: String,
  date: Date,
  items: [{
    productId: String,
    quantity: Number,
    sellingPrice: Number,
    isRemoteArea: Boolean,
  }],
  totalAmount: Number,
  totalProfit: Number,
} 