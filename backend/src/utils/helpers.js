export function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}${rand}`;
}

export function calculatePackageDimensions(items, products) {
  let totalWeight = 0;
  let maxLength = 0;
  let maxBreadth = 0;
  let totalHeight = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId || p.id === item.id);
    if (!product) continue;

    const qty = item.quantity || 1;
    totalWeight += (product.weight || 0.3) * qty;
    maxLength = Math.max(maxLength, product.length || 30);
    maxBreadth = Math.max(maxBreadth, product.breadth || 25);
    totalHeight += (product.height || 3) * qty;
  }

  return {
    weight: Math.max(totalWeight, 0.5),
    length: Math.max(maxLength, 10),
    breadth: Math.max(maxBreadth, 10),
    height: Math.max(totalHeight, 5),
  };
}

export function paginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
