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

export default function Index() {
  const { session } = useLoaderData<typeof loader>();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggleDropdown = (index: number) =>
    setOpenIndex(openIndex === index ? null : index);
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
//for cards
 const steps = [
    {
      title: "Create Membership Plan",
      description:
        "Set up your membership plans here. You can define pricing, duration, and perks.",
      button: { label: "Create Plan", onClick: () => console.log("Create Plan") },
    },
    {
      title: "Enable Membership Portal",
      description:
        "Activate the membership portal for your customers to access their plans.",
      button: { label: "Enable Portal", onClick: () => console.log("Enable Portal") },
    },
    {
      title: "Enable Manage Membership Button",
      description:
        "Add a button for customers to manage their membership directly on your store.",
      button: {
        label: "Add Manage Button",
        onClick: () => console.log("Add Manage Button"),
      },
    },
    {
      title: "Enable Membership Checkout",
      description:
        "Integrate membership checkout into your store’s checkout flow.",
      button: { label: "Enable Checkout", onClick: () => console.log("Enable Checkout") },
    },
    {
      title: "Add Member Perks (Optional)",
      description:
        "Give extra perks to your members like discounts or exclusive access.",
      button: { label: "Add Perks", onClick: () => console.log("Add Perks") },
    },
    {
      title: "Widget Setup (Optional)",
      description:
        "Add membership widgets on your store to improve engagement.",
      button: { label: "Setup Widget", onClick: () => console.log("Setup Widget") },
    },
  ];
  return (
  <>
      <TitleBar title="Premium Membership App" />
      <div style={{ padding: "1rem 10rem" }}>
        <Card>
          {/* Header */}
          <Text as="h2" variant="headingLg">
            Welcome, {getShopNameInCamelCase(session.shop!)}! Let's get you started
          </Text>
          <div style={{ marginTop: "0.5rem" }}>
            <Text as="p" variant="bodySm">
              Follow the steps in the guide and watch our video to set up Membership in
              your store.
            </Text>
          </div>

          {/* Main layout */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem" }}>
            {/* LEFT SIDE - Setup Guide */}
            <div
              style={{
                flex: 3,
                background: "#f9fafb",
                borderRadius: "10px",
                padding: "1.5rem",
              }}
            >
              <Text as="h3" variant="headingMd" fontWeight="bold">
                Your Setup Guide
              </Text>

              <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
                {steps.map((step, i) => (
                  <li
                    key={i}
                    style={{
                    
                      borderRadius: "8px",
                      border: "1px solid #eee",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    {/* Card header */}
                    <div
                      onClick={() => toggleDropdown(i)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem 1rem",
                        backgroundColor: "#fff",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            backgroundColor: "#008060",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            marginRight: "0.75rem",
                          }}
                        >
                          ✓
                        </span>
                        <Text as="span" variant="bodyMd">
                          {step.title}
                        </Text>
                      </div>

                      {/* Arrow */}
                      <span
                        style={{
                          transform: openIndex === i ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "0.2s",
                        }}
                      >
                        ^
                      </span>
                    </div>

                    {/* Dropdown content */}
                    {openIndex === i && (
                      <div
                        style={{
                          padding: "0.75rem 1rem",
                          backgroundColor: "#f0fdf4",
                        }}
                      >
                        <Text as="p" variant="bodySm">
                          {step.description}
                        </Text>
                        <button
                          style={{
                            marginTop: "0.5rem",
                            backgroundColor: "#008060",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                          }}
                          onClick={step.button.onClick}
                        >
                          {step.button.label}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT SIDE - Onboarding video */}
            <div style={{ flex: 2 }}>
              <Card>
                <div style={{ position: "relative" }}>
                  <iframe
                    width="100%"
                    height="180"
                    src="https://www.youtube.com/embed/aT2Wn6LxVKo"
                    title="Onboarding Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: "8px 8px 0 0" }}
                  ></iframe>
                </div>
                <div style={{ padding: "1rem" }}>
                  <Text as="p" variant="bodyMd">
                    Watch our 7-minute video for a complete walkthrough of the app's features.
                  </Text>
                  <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem" }}>
                    <a
                      href="https://youtu.be/aT2Wn6LxVKo"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "#008060",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "0.5rem 1rem",
                        textDecoration: "none",
                        display: "inline-block",
                        cursor: "pointer",
                      }}
                    >
                      Watch now
                    </a>
                    <a href="#" style={{ color: "#16a5ddff", textDecoration: "none" }}>
                      Need help?
                    </a>
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    <Text as="p" variant="bodySm">
                      New membership or fresh setup? Get going fast with our onboarding
                      wizard{" "}
                      <a href="#" style={{ color: "#008060", textDecoration: "none" }}>
                        click here!
                      </a>
                    </Text>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <Text as="p" variant="bodySm">
          If you need support, we are{" "}
          <a href="#" style={{ color: "#16a5ddff" }}>
            here
          </a>{" "}
          for you ❤️
        </Text>
      </div>
    </>
  );
}