export type CheckoutAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
};

export const isAddressValid = (address: CheckoutAddress): boolean => {
  return Boolean(
    address.fullName?.trim() &&
      address.phone?.trim() &&
      address.line1?.trim() &&
      address.city?.trim() &&
      address.pincode?.trim()
  );
};

export const toCheckoutAddress = (value: unknown): CheckoutAddress | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<CheckoutAddress>;
  const address: CheckoutAddress = {
    fullName: String(candidate.fullName ?? ""),
    phone: String(candidate.phone ?? ""),
    line1: String(candidate.line1 ?? ""),
    line2: candidate.line2 ? String(candidate.line2) : undefined,
    city: String(candidate.city ?? ""),
    pincode: String(candidate.pincode ?? "")
  };

  return isAddressValid(address) ? address : null;
};
