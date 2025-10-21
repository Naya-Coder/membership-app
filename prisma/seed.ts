import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Create Session
  const session = await prisma.session.create({
    data: {
      id: "sess_001",
      shop: "demo-shop.myshopify.com",
      state: "active",
      isOnline: true,
      accessToken: "demo_access_token",
      firstName: "Aadarsh",
      lastName: "Singh",
      email: "aadarsh@example.com",
      accountOwner: true,
      locale: "en-IN",
    },
  });

  // 2️⃣ Create Product
  const product = await prisma.product.create({
    data: {
      shopifyProductId: "prod_1001",
      sku: "SKU-001",
      handle: "premium-membership",
    },
  });

  // 3️⃣ Create Membership Plans
  const goldPlan = await prisma.membershipPlan.create({
    data: {
      shop: session.shop,
      orderTagName: "gold",
      name: "Gold Membership",
      customerTagName: "gold-member",
      productId: product.id,
      restrictedCustomerTags: ["guest"],
      allowedCustomerTags: ["member", "vip"],
    },
  });

  // Create additional membership plans
  const platinumPlan = await prisma.membershipPlan.create({
    data: {
      shop: session.shop,
      orderTagName: "platinum",
      name: "Platinum Membership",
      customerTagName: "platinum-member",
      productId: product.id,
      restrictedCustomerTags: ["guest"],
      allowedCustomerTags: ["member", "vip", "premium"],
    },
  });

  const basicPlan = await prisma.membershipPlan.create({
    data: {
      shop: session.shop,
      orderTagName: "basic",
      name: "Basic Membership",
      customerTagName: "basic-member",
      productId: product.id,
      restrictedCustomerTags: ["guest"],
      allowedCustomerTags: ["member"],
    },
  });
  

  // 4️⃣ Create Perks + Discount + Content
  const discount = await prisma.discount.create({
    data: {
      shopifyDiscountId: "disc_123",
      discountType: "percentage",
      discountValue: 20,
      message: "20% off for members!",
    },
  });

  const content = await prisma.memberExclusiveContent.create({
    data: {
      pagesUrl: ["/members-only", "/vip-zone"],
      accessDeniedMessage: "Access restricted to premium members only.",
    },
  });

  await prisma.perk.createMany({
    data: [
      {
        membershipPlanId: goldPlan.id,
        perkType: "MEMBER_DISCOUNT",
        discountTableId: discount.id,
      },
      {
        membershipPlanId: goldPlan.id,
        perkType: "MEMBER_EXCLUSIVE_CONTENT",
        contentTableId: content.id,
      },
    ],
  });

  // 5️⃣ Create Customer
  const customer = await prisma.customer.create({
    data: {
      shopifyCustomerId: "cust_1001",
      name: "Ravi Kumar",
      email: "ravi@example.com",
      address: "123, Delhi, India",
    },
  });

  // 6️⃣ Create Order (with payment + renewal info)
  await prisma.order.create({
    data: {
      shopifyOrderId: "order_9001",
      customerId: customer.id,
      price: 999.99,
      lineItems: {
        items: [{ productId: product.id, quantity: 1 }],
      },
      gatewayName: "Shopify Payments",
      paymentStatus: "paid",
      renewalDate: new Date("2025-12-31"),
      cancellationPolicy: "Cancel anytime before renewal",
      automaticExpiration: false,
    },
  });

  // 7️⃣ Create App Plan
  await prisma.appPlan.create({
    data: {
      name: "Basic Plan",
      description: "Access to essential membership features.",
      price: 499.0,
    },
  });

  console.log("✅ Dummy data inserted successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
