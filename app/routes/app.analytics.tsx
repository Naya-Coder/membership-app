import { useEffect, useState } from "react";
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

// Possible views - Overview and Active Members
type AnalyticsView = "Overview" | "Active Members";

export default function Analytics() {
  const { session } = useLoaderData<typeof loader>();
  const [activeView, setActiveView] = useState<AnalyticsView>("Overview");

  function getShopNameInCamelCase(shopUrl: string): string {
    if (!shopUrl || typeof shopUrl !== "string") return "";
    const parts = shopUrl.toLowerCase().split(".myshopify.com");
    const subdomain = parts[0];
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
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div>
            <Text as="h1" variant="headingLg">
              Analytics & Reports
            </Text>
            <Text as="h1" variant="bodyLg">
              Key performance metrics and analytics, for product, member,
              revenue and growth.
            </Text>
          </div>
          <div>
            <ButtonGroup>
              <Button
                variant={activeView === "Overview" ? "primary" : "secondary"}
                onClick={() => setActiveView("Overview")}
              >
                Overview
              </Button>
              <Button
                variant={activeView === "Active Members" ? "primary" : "secondary"}
                onClick={() => setActiveView("Active Members")}
              >
                Active Members
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {/* Conditional Rendering */}
        {activeView === "Overview" && (
          <>
            <div style={{ padding: "2rem 0rem 0rem 1rem" }}>
              <InlineGrid gap="400" columns={4}>
                <Card>
               <Text variant="bodyMd" as="h3">
                    Membership Growth Rate (%)
                  </Text>
                  <Text variant="headingLg" as="p">
                    %60
                  </Text>
                </Card>
                <Card>
                  <Text variant="bodyMd" as="h3">
                    Total Re-Activated Memberships
                  </Text>
                  <Text variant="headingLg" as="p">
                    125
                  </Text>
                </Card>
                <Card>
                  <Text variant="bodyMd" as="h3">
                    Cancellation Rate
                  </Text>
                  <Text variant="headingLg" as="p">
                    %32
                  </Text>
                </Card>
                <Card>
                  <Text variant="bodyMd" as="h3">
                    Total Recurring Orders
                  </Text>
                  <Text variant="headingLg" as="p">
                    60
                  </Text>
                </Card>
              </InlineGrid>
            </div>
            <div style={{ padding: "2rem 0rem 0rem 0rem" }}>
                <InlineGrid gap="400" columns={3}>
                  {/* --- 1. Order Amount Per Week (Corrected) --- */}
                  <Card padding="500">
                    <Text variant="headingMd" as="h3">
                      Membership Per Week
                    </Text>
                    <div
                      style={{
                        // Main chart container
                        height: "200px",
                        paddingTop: "1rem",
                        display: "flex",
                        alignItems: "stretch", // Ensures children stretch vertically
                      }}
                    >
                      {/* Y-axis Labels */}
                      <div style={{ width: "10%", paddingRight: "1rem", display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', alignItems: 'flex-end', paddingTop: '10px', paddingBottom: '10px' }}>
                        <Text as="span" variant="bodySm">1</Text>
                        <Text as="span" variant="bodySm">0.5</Text>
                        <Text as="span" variant="bodySm">0</Text>
                      </div>

                      {/* Chart Area with Grid and Bar */}
                      <div
                        style={{
                          flexGrow: 1,
                          position: "relative",
                          borderBottom: "1px solid #e1e3e5", // X-axis line
                        }}
                      >
                        {/* Horizontal Grid Lines */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: '1px solid #e1e3e5' }}></div> {/* Line for 1 */}
                        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0, right: 0, borderTop: '1px solid #e1e3e5' }}></div> {/* Line for 0.5 */}

                        {/* Bar (Height 50% for 0.5 value) */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: "75%", /* Pushes it toward the 2025-10-19 date */
                            transform: "translateX(-50%)",
                            width: "30%", // Made it slightly wider to match the image
                            height: "50%",
                            backgroundColor: "#cccccc",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* X-axis Date Labels (Outside the main chart div for better alignment) */}
                    <div style={{ display: "flex", justifyContent: "space-around", paddingLeft: "10%", marginTop: "0.5rem" }}>
                      <Text as="span" variant="bodySm">2025-10-12</Text>
                      <Text as="span" variant="bodySm">2025-10-19</Text>
                    </div>
                  </Card>

                  {/* --- 2. Total Active Memberships Over Time (Corrected) --- */}
                  <Card padding="500">
                    <Text variant="headingMd" as="h3">
                      Total Active Memberships Over Time
                    </Text>
                    <div
                      style={{
                        // Main chart container
                        height: "200px",
                        paddingTop: "1rem",
                        display: "flex",
                        alignItems: "stretch",
                      }}
                    >
                      {/* Y-axis Labels */}
                      <div style={{ width: "10%", paddingRight: "1rem", display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', alignItems: 'flex-end', paddingTop: '10px', paddingBottom: '10px' }}>
                        <Text as="span" variant="bodySm">1</Text>
                        <Text as="span" variant="bodySm">0.5</Text>
                        <Text as="span" variant="bodySm">0</Text>
                      </div>

                      {/* Chart Area with Grid and Bar */}
                      <div
                        style={{
                          flexGrow: 1,
                          position: "relative",
                          borderBottom: "1px solid #e1e3e5",
                        }}
                      >
                        {/* Horizontal Grid Lines */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: '1px solid #e1e3e5' }}></div>
                        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0, right: 0, borderTop: '1px solid #e1e3e5' }}></div>

                        {/* Bar (Height 50% for 0.5 value) */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: "75%",
                            transform: "translateX(-50%)",
                            width: "30%",
                            height: "50%",
                            backgroundColor: "#cccccc",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* X-axis Date Labels */}
                    <div style={{ display: "flex", justifyContent: "space-around", paddingLeft: "10%", marginTop: "0.5rem" }}>
                      <Text as="span" variant="bodySm">2025-10-12</Text>
                      <Text as="span"  variant="bodySm">2025-10-19</Text>
                    </div>
                  </Card>
                <div>
                  <div style={{ marginBottom: "2rem" }}>
                   <Card>
                <Text variant="headingLg" as="h3">Total Failed Recurring Orders</Text>
                <Text variant="bodySm" as="p">Failed recurring orders in period</Text>
                <Text variant="headingLg" as="p">60</Text>
              </Card>
              </div>
              <div style={{ marginBottom: "1rem" }}>
              <Card>
                <Text variant="headingLg" as="h3">Total Paused Memberships</Text>
                <Text variant="bodySm" as="p">Paused memberships in period</Text>
                <Text variant="headingLg" as="p">60</Text>
              </Card>
                  </div>
                </div>
              </InlineGrid>
            </div>
          </>
        )}

        {/* Active Members View */}
        {activeView === "Active Members" && (
          <>
            <div style={{ padding: "2rem 0rem 0rem 1rem" }}>
              <InlineGrid gap="400" columns={4}>
                <Card>
                  <Text variant="bodyMd" as="h3">
                    From
                  </Text>
                  <Text variant="bodyMd" as="p">
                    July 17,2025
                  </Text>
                </Card>
                <Card>
                  <Text variant="bodyMd" as="h3">
                    To
                  </Text>
                  <Text variant="bodyMd" as="p">
                    October 14,2025
                  </Text>
                </Card>
                <Card>
                  <Text variant="bodyMd" as="h3">
                    Total Orders
                  </Text>
                  <Text variant="headingLg" as="p">
                    200
                  </Text>
                </Card>
                <Card>
                  <Text variant="bodyMd" as="h3">
                    Total Membership Created
                  </Text>
                  <Text variant="headingLg" as="p">
                    125
                  </Text>
                </Card>
              </InlineGrid>

              <div style={{ padding: "2rem 0rem 0rem 0rem" }}>
                <InlineGrid gap="400" columns={3}>
                  {/* --- 1. Order Amount Per Week (Corrected) --- */}
                  <Card padding="500">
                    <Text variant="headingMd" as="h3">
                      Order Amount Per Week
                    </Text>
                    <div
                      style={{
                        // Main chart container
                        height: "200px",
                        paddingTop: "1rem",
                        display: "flex",
                        alignItems: "stretch", // Ensures children stretch vertically
                      }}
                    >
                      {/* Y-axis Labels */}
                      <div style={{ width: "10%", paddingRight: "1rem", display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', alignItems: 'flex-end', paddingTop: '10px', paddingBottom: '10px' }}>
                        <Text as="span" variant="bodySm">1</Text>
                        <Text as="span" variant="bodySm">0.5</Text>
                        <Text as="span" variant="bodySm">0</Text>
                      </div>

                      {/* Chart Area with Grid and Bar */}
                      <div
                        style={{
                          flexGrow: 1,
                          position: "relative",
                          borderBottom: "1px solid #e1e3e5", // X-axis line
                        }}
                      >
                        {/* Horizontal Grid Lines */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: '1px solid #e1e3e5' }}></div> {/* Line for 1 */}
                        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0, right: 0, borderTop: '1px solid #e1e3e5' }}></div> {/* Line for 0.5 */}

                        {/* Bar (Height 50% for 0.5 value) */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: "75%", /* Pushes it toward the 2025-10-19 date */
                            transform: "translateX(-50%)",
                            width: "30%", // Made it slightly wider to match the image
                            height: "50%",
                            backgroundColor: "#cccccc",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* X-axis Date Labels (Outside the main chart div for better alignment) */}
                    <div style={{ display: "flex", justifyContent: "space-around", paddingLeft: "10%", marginTop: "0.5rem" }}>
                      <Text as="span" variant="bodySm">2025-10-12</Text>
                      <Text as="span" variant="bodySm">2025-10-19</Text>
                    </div>
                  </Card>

                  {/* --- 2. Total Active Memberships Over Time (Corrected) --- */}
                  <Card padding="500">
                    <Text variant="headingMd" as="h3">
                      Total Active Memberships Over Time
                    </Text>
                    <div
                      style={{
                        // Main chart container
                        height: "200px",
                        paddingTop: "1rem",
                        display: "flex",
                        alignItems: "stretch",
                      }}
                    >
                      {/* Y-axis Labels */}
                      <div style={{ width: "10%", paddingRight: "1rem", display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', alignItems: 'flex-end', paddingTop: '10px', paddingBottom: '10px' }}>
                        <Text as="span" variant="bodySm">1</Text>
                        <Text as="span" variant="bodySm">0.5</Text>
                        <Text as="span" variant="bodySm">0</Text>
                      </div>

                      {/* Chart Area with Grid and Bar */}
                      <div
                        style={{
                          flexGrow: 1,
                          position: "relative",
                          borderBottom: "1px solid #e1e3e5",
                        }}
                      >
                        {/* Horizontal Grid Lines */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: '1px solid #e1e3e5' }}></div>
                        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0, right: 0, borderTop: '1px solid #e1e3e5' }}></div>

                        {/* Bar (Height 50% for 0.5 value) */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: "75%",
                            transform: "translateX(-50%)",
                            width: "30%",
                            height: "50%",
                            backgroundColor: "#cccccc",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* X-axis Date Labels */}
                    <div style={{ display: "flex", justifyContent: "space-around", paddingLeft: "10%", marginTop: "0.5rem" }}>
                      <Text as="span" variant="bodySm">2025-10-12</Text>
                      <Text as="span"  variant="bodySm">2025-10-19</Text>
                    </div>
                  </Card>
                  <BlockStack gap="400">
                    <Card>
                      <Text variant="bodyMd" as="h3">
                        Total Active Customers  
                      </Text>
                      <Text variant="headingLg" as="p">
                        255
                      </Text>
                    </Card>
                    <Card>
                      <Text variant="bodyMd" as="h3">
                        Total Revenue
                      </Text>
                      <Text variant="headingLg" as="p">
                        $10,000
                      </Text>
                    </Card>
                    <Card>
                      <Text variant="bodyMd" as="h3">
                        Recurring Order Revenue
                      </Text>
                      <Text variant="headingLg" as="p">
                        $4,000
                      </Text>
                    </Card>
                  </BlockStack>
                </InlineGrid>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
