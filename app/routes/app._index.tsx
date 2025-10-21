import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  ButtonGroup,
  InlineGrid,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  return { session };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]!.node!.id!;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
  };
};

export default function Index() {
  const { session } = useLoaderData<typeof loader>();

  function getShopNameInCamelCase(shopUrl: string): string {
    if (!shopUrl || typeof shopUrl !== 'string') {
      return '';
    }

    const parts = shopUrl.toLowerCase().split('.myshopify.com');
    const subdomain = parts[0];

    // If the URL doesn't contain .myshopify.com, return the original string or handle as an error
    if (!subdomain) {
      return shopUrl;
    }

    const camelCaseName = subdomain.replace(/-([a-z])/g, (match, char) => {
      return char.toUpperCase();
    });

    return camelCaseName;
  }

  return (
    <>
      <TitleBar title="Premium Membership App" />
      <div style={{ padding: "1rem 4rem" }}>
        <Card>
          <Text as="h2" variant="headingLg">
            Welcome, {getShopNameInCamelCase(session.shop!)}! Let's get you started
          </Text>
          <div style={{ marginTop: '1rem' }}>
            <Text as="p" variant="bodySm" >
              Follow the steps in the guide to set up Membership in your store.
            </Text>
          </div>
          <div style={{display: 'flex', marginTop: '2rem', gap: '2rem'}}>
            <div style={{flex:3}}></div>
            <div style={{flex:1}}></div>
          </div>
        </Card>
      </div>
    </>
  );
}
