export type CartItemResponse = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    unit: string;
    price: number;
    is_active: boolean;
  } | null;
};

export type GetMyCartResponse = {
  cart_items: CartItemResponse[];
};

export type PlaceOrderResponse = {
  orderId: string;
  totalAmount: number;
  paymentStatus: string;
  message: string;
};

export type CheckoutAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
};

export const initialAddress: CheckoutAddress = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  pincode: ""
};
