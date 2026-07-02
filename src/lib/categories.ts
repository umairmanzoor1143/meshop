import type { PublicShopCategory, PublicShopProduct } from "./types";

// Categories form a parent→child tree via parentCategoryId (empty string or
// undefined = root). The live data nests e.g. "August-Määrt 2026" under "2026".

export interface CategoryNode {
  category: PublicShopCategory;
  children: CategoryNode[];
}

const bySort = (a: PublicShopCategory, b: PublicShopCategory) => a.sortOrder - b.sortOrder;

export function buildCategoryTree(categories: PublicShopCategory[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>();
  for (const c of categories) nodes.set(c.id, { category: c, children: [] });
  const roots: CategoryNode[] = [];
  for (const c of [...categories].sort(bySort)) {
    const node = nodes.get(c.id)!;
    const parent = c.parentCategoryId ? nodes.get(c.parentCategoryId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

/** The category id plus all descendant ids (for filtering & counting). */
export function categoryWithDescendants(id: string, categories: PublicShopCategory[]): Set<string> {
  const childrenOf = new Map<string, string[]>();
  for (const c of categories) {
    const parent = c.parentCategoryId || "";
    if (!childrenOf.has(parent)) childrenOf.set(parent, []);
    childrenOf.get(parent)!.push(c.id);
  }
  const out = new Set<string>();
  const queue = [id];
  while (queue.length) {
    const cur = queue.pop()!;
    if (out.has(cur)) continue;
    out.add(cur);
    for (const child of childrenOf.get(cur) ?? []) queue.push(child);
  }
  return out;
}

/** Product count per category, including products in descendant categories. */
export function productCounts(
  categories: PublicShopCategory[],
  products: PublicShopProduct[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of categories) {
    const ids = categoryWithDescendants(c.id, categories);
    counts[c.id] = products.filter((p) => ids.has(p.categoryId)).length;
  }
  return counts;
}
