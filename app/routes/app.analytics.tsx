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

export default function Analytics() {
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <Text as="h1" variant="headingLg">
              Analytics & Reports
            </Text>
            <Text as="p" variant="bodyMd">
              Key performance metrics and analytics, for product, member, revenue and growth.
            </Text>
          </div>
          <div>
            <ButtonGroup>
              <Button variant="primary">Overview</Button>
              <Button>Active Members</Button>
            </ButtonGroup>
          </div>
        </div>
        {/* <BlockStack gap="500"> */}
        <div style={{ padding: "2rem 0rem 0rem 1rem" }}>
          <InlineGrid gap="400" columns={4}>
            <Card>
              <Text variant="headingLg" as="p">1,200</Text>
              <Text variant="bodyMd" as="p" >+5% from last month</Text>
            </Card>
            <Card>
              <Text variant="headingLg" as="p">$12,500</Text>
              <Text variant="bodyMd" as="p" >+8% from last month</Text>
            </Card>
            <Card>
              <Text variant="headingLg" as="p">3.2%</Text>
              <Text variant="bodyMd" as="p">-1% from last month</Text>
            </Card>
            <Card >
              <Text variant="headingLg" as="p">150</Text>
              <Text variant="bodyMd" as="p" >+10% from last month</Text>
            </Card>
          </InlineGrid>
        </div>
        <div style={{ padding: "2rem 0rem 0rem 1rem" }}>

          <InlineGrid gap="400" columns={3}>
            <Card>
              <Text variant="headingLg" as="p">1,200</Text>
              <Text variant="bodyMd" as="p" >+5% from last month</Text>
            </Card>
            <Card>
              <Text variant="headingLg" as="p">$12,500</Text>
              <Text variant="bodyMd" as="p" >+8% from last month</Text>
            </Card>
            <div>
              <div style={{marginBottom: "1rem"}}>
                <Card>
                  <Text variant="bodyMd" as="p">Total active customers</Text>
                  <Text variant="headingLg" as="p">25</Text>
                </Card>
              </div>
              <div style={{marginBottom: "1rem"}}>
                <Card>
                  <Text variant="bodyMd" as="p">Total Revenue</Text>
                  <Text variant="headingLg" as="p">$10000</Text>
                </Card>
              </div>
              <div style={{marginBottom: "1rem"}}>
                <Card>
                  <Text variant="bodyMd" as="p">Recurring Order Revenue</Text>
                  <Text variant="headingLg" as="p">$4000</Text>
                </Card>
              </div>
            </div>
          </InlineGrid>
        </div>
        {/* </BlockStack> */}
      </div>
    </>
  );
}
