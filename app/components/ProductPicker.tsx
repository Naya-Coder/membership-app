import { Button, BlockStack, InlineStack, Link, Divider } from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { useCallback } from "react";

interface ResourceItem {
  id: string;
  title: string;
  imageUrl?: string;
}

interface ProductPickerProps {
  onSelect: (selectedItems: { id: string; title: string; imageUrl?: string }[]) => void;
  selectedIds: string[];
  items?: ResourceItem[];
  type?: "product" | "variant";
  buttonText?: string;
}

function firstTruthy<T>(...vals: (T | undefined)[]): T | undefined {
  for (const v of vals) if (v) return v;
  return undefined;
}

export function ProductPicker({
  onSelect,
  selectedIds = [],
  items = [],
  type = "product",
  buttonText = "Select products",
}: ProductPickerProps) {
  const handleSelect = useCallback(async () => {
    const selected = await (window as any).shopify?.resourcePicker({
      type,
      action: "select",
      multiple: false,
      selectionIds: selectedIds.map((id) => ({ id, type })),
    });

    if (selected) {
      const selectedItems = selected.map((item: any) => {
        const featured = item?.featuredImage || item?.image;
        const imagesList = item?.images || item?.media;
        const edges = imagesList?.edges || [];
        const firstEdge = edges[0]?.node;
        const firstArray = Array.isArray(imagesList) ? imagesList[0] : undefined;
        const imageUrl = firstTruthy<string>(
          featured?.url,
          featured?.src,
          featured?.originalSrc,
          firstEdge?.url,
          firstEdge?.src,
          firstEdge?.image?.url,
          firstEdge?.image?.src,
          firstArray?.url,
          firstArray?.src,
        );
        return {
          id: item.id as string,
          title: item.title as string,
          imageUrl,
        };
      });
      onSelect(selectedItems);
    }
  }, [selectedIds, onSelect, type]);

  const handleRemove = useCallback(
    (id: string) => {
      onSelect(items.filter((item) => item.id !== id));
    },
    [onSelect, items],
  );

  const selectedText = items?.length ? `(${items.length} selected)` : "";

  return (
    <BlockStack gap="400">
      <Button onClick={handleSelect}>
        {buttonText}
        {selectedText}
      </Button>
      {items?.length > 0 ? (
        <BlockStack gap="200">
          {items.map((item) => (
            <BlockStack gap="200" key={item.id}>
              <InlineStack blockAlign="center" align="space-between">
                <Link
                  url={`shopify://admin/${type === "variant" ? "variants" : "products"}/${item.id.split("/").pop()}`}
                  monochrome
                  removeUnderline
                >
                  {item.title}
                </Link>
                <Button variant="tertiary" onClick={() => handleRemove(item.id)} icon={DeleteIcon} />
              </InlineStack>
              <Divider />
            </BlockStack>
          ))}
        </BlockStack>
      ) : null}
    </BlockStack>
  );
} 