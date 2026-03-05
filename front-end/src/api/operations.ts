export const GET_ACTIVE_PRODUCTS_WITH_INVENTORY = `
query GetActiveProductsWithInventory {
  products(
    where: { is_active: { _eq: true } }
    order_by: { name: asc }
  ) {
    id
    sku
    name
    description
    image_url
    unit
    price
    inventory {
      stock
      reorder_threshold
      updated_at
    }
  }
}
`;

export const GET_PRODUCT_BY_ID = `
query GetProductById($id: uuid!) {
  products_by_pk(id: $id) {
    id
    name
    description
    image_url
    unit
    price
    is_active
  }
}
`;

export const GET_MY_CART = `
query GetMyCart {
  cart_items(order_by: { created_at: desc }) {
    id
    customer_id
    product_id
    quantity
    created_at
    updated_at
    product {
      id
      name
      image_url
      unit
      price
      is_active
    }
  }
}
`;

export const GET_CART_COUNT_BY_CUSTOMER = `
query GetCartCountByCustomer($customerId: uuid!) {
  cart_items_aggregate(where: { customer_id: { _eq: $customerId } }) {
    aggregate {
      sum {
        quantity
      }
    }
  }
}
`;

export const GET_CART_ITEM_QUANTITY = `
query GetCartItemQuantity($customerId: uuid!, $productId: uuid!) {
  cart_items(
    where: {
      customer_id: { _eq: $customerId }
      product_id: { _eq: $productId }
    }
    limit: 1
  ) {
    id
    quantity
  }
}
`;

export const INSERT_CART_ITEM = `
mutation InsertCartItem($customerId: uuid!, $productId: uuid!, $quantity: Int!) {
  insert_cart_items_one(
    object: {
      customer_id: $customerId
      product_id: $productId
      quantity: $quantity
    }
  ) {
    id
  }
}
`;

export const UPDATE_CART_ITEM_QUANTITY = `
mutation UpdateCartItemQuantity($customerId: uuid!, $productId: uuid!, $quantity: Int!) {
  update_cart_items(
    where: {
      customer_id: { _eq: $customerId }
      product_id: { _eq: $productId }
    }
    _set: {
      quantity: $quantity
    }
  ) {
    affected_rows
  }
}
`;

export const DELETE_CART_ITEM = `
mutation DeleteCartItem($cartItemId: uuid!) {
  delete_cart_items_by_pk(id: $cartItemId) {
    id
  }
}
`;

export const CREATE_ORDER = `
mutation CreateOrder($customerId: uuid!, $totalAmount: numeric!) {
  insert_orders_one(
    object: {
      customer_id: $customerId
      total_amount: $totalAmount
      status: "pending"
    }
  ) {
    id
    customer_id
    total_amount
    status
    placed_at
  }
}
`;

export const INSERT_ORDER_ITEMS = `
mutation InsertOrderItems($items: [order_items_insert_input!]!) {
  insert_order_items(objects: $items) {
    affected_rows
  }
}
`;

export const CREATE_PAYMENT = `
mutation CreatePayment(
  $orderId: uuid!
  $provider: String!
  $providerRef: String
  $amount: numeric!
  $status: String!
) {
  insert_payments_one(
    object: {
      order_id: $orderId
      provider: $provider
      provider_ref: $providerRef
      amount: $amount
      status: $status
    }
  ) {
    id
    order_id
    amount
    status
    paid_at
  }
}
`;

export const APPLY_COUPON = `
mutation ApplyCoupon($input: ApplyCouponInput!) {
  apply_coupon(input: $input) {
    success
    message
    discount_amount
    final_total
  }
}
`;
