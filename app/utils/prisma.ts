import prisma from "../db.server";

export interface CreateMembershipData {
  membershipName: string;
  orderTagName: string;
  customerTagName: string;
  requireTags: string;
  requireTagList: string;
  excludeTags: string;
  excludeTagList: string;
  selectedProducts: Array<{
    id: string;
    title: string;
  }>;
  shop: string;
}

export async function createMembership(data: CreateMembershipData) {
  try {
    // Parse the selected products
    const selectedProducts = data.selectedProducts || [];
    
    if (selectedProducts.length === 0) {
      throw new Error("At least one product must be selected");
    }

    // Get the first selected product (assuming single product for now)
    const firstProduct = selectedProducts[0];
    const shopifyProductId = firstProduct.id.replace('gid://shopify/Product/', '');

    // Check if product already exists in our database
    let product = await prisma.product.findUnique({
      where: { shopifyProductId }
    });

    // If product doesn't exist, create it
    if (!product) {
      product = await prisma.product.create({
        data: {
          shopifyProductId,
          handle: firstProduct.title.toLowerCase().replace(/\s+/g, '-'),
        }
      });
    }

    // Parse tag arrays
    const allowedCustomerTags = data.requireTags === "true" && data.requireTagList 
      ? data.requireTagList.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];
    
    const restrictedCustomerTags = data.excludeTags === "true" && data.excludeTagList 
      ? data.excludeTagList.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];

    // Create the membership plan
    const membershipPlan = await prisma.membershipPlan.create({
      data: {
        shop: data.shop,
        name: data.membershipName,
        orderTagName: data.orderTagName,
        customerTagName: data.customerTagName,
        productId: product.id,
        allowedCustomerTags,
        restrictedCustomerTags,
      }
    });

    return {
      success: true,
      membershipPlan,
      product,
    };
  } catch (error) {
    console.error("Error creating membership:", error);
    throw new Error(`Failed to create membership: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getMembershipById(membershipId: string, shop: string) {
  try {
    const membershipPlan = await prisma.membershipPlan.findUnique({
      where: { 
        id: parseInt(membershipId),
        shop: shop
      },
      include: {
        product: true,
      }
    });

    if (!membershipPlan) {
      throw new Error("Membership plan not found or does not belong to this shop");
    }

    return {
      success: true,
      membershipPlan,
    };
  } catch (error) {
    console.error("Error getting membership:", error);
    throw new Error(`Failed to get membership: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export interface UpdateMembershipData {
  membershipName: string;
  orderTagName: string;
  customerTagName: string;
  requireTags: string;
  requireTagList: string;
  excludeTags: string;
  excludeTagList: string;
  selectedProducts: Array<{
    id: string;
    title: string;
  }>;
  shop: string;
}

export async function updateMembership(membershipId: string, data: UpdateMembershipData) {
  try {
    // Parse the selected products
    const selectedProducts = data.selectedProducts || [];
    
    if (selectedProducts.length === 0) {
      throw new Error("At least one product must be selected");
    }

    // Get the first selected product (assuming single product for now)
    const firstProduct = selectedProducts[0];
    const shopifyProductId = firstProduct.id.replace('gid://shopify/Product/', '');

    // Get the current membership to find its product
    const currentMembership = await prisma.membershipPlan.findUnique({
      where: { 
        id: parseInt(membershipId),
        shop: data.shop
      },
      include: {
        product: true,
      }
    });

    if (!currentMembership) {
      throw new Error("Membership plan not found or does not belong to this shop");
    }

    // Update the existing product with new data
    const product = await prisma.product.update({
      where: { id: currentMembership.productId },
      data: {
        shopifyProductId,
        handle: firstProduct.title.toLowerCase().replace(/\s+/g, '-'),
      }
    });

    // Parse tag arrays
    const allowedCustomerTags = data.requireTags === "true" && data.requireTagList 
      ? data.requireTagList.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];
    
    const restrictedCustomerTags = data.excludeTags === "true" && data.excludeTagList 
      ? data.excludeTagList.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];

    // Update the membership plan with shop validation
    const membershipPlan = await prisma.membershipPlan.update({
      where: { 
        id: parseInt(membershipId),
        shop: data.shop
      },
      data: {
        shop: data.shop,
        name: data.membershipName,
        orderTagName: data.orderTagName,
        customerTagName: data.customerTagName,
        allowedCustomerTags,
        restrictedCustomerTags,
      },
      include: {
        product: true,
      }
    });

    return {
      success: true,
      membershipPlan,
      product,
    };
  } catch (error) {
    console.error("Error updating membership:", error);
    throw new Error(`Failed to update membership: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteMembershipById(membershipId: number, shop: string) {
  try {
    const membership = await prisma.membershipPlan.findFirst({
      where: { id: membershipId, shop },
      select: { id: true, productId: true },
    });

    if (!membership) {
      throw new Error("Membership plan not found for this shop");
    }

    // Deleting the product will cascade-delete the membership plan due to the FK on MembershipPlan.product
    await prisma.product.delete({ where: { id: membership.productId } });

    return { success: true };
  } catch (error) {
    console.error("Error deleting membership:", error);
    throw new Error(`Failed to delete membership: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function upsertDiscountPerk(params: {
  shop: string;
  membershipPlanId: number;
  discountId: string;
  discountType: string;
  message: string;
}) {
  const { membershipPlanId, discountId, discountType, message } = params;
  
  // Always create new discount and perk (no updating existing ones)
  const createdDiscount = await prisma.discount.create({
    data: { shopifyDiscountId: discountId, discountType, message },
  });

  const createdPerk = await prisma.perk.create({
    data: {
      membershipPlanId,
      perkType: 'MEMBER_DISCOUNT' as any,
      discountTableId: createdDiscount.id,
    },
  });

  return { success: true, discountId: createdDiscount.id, perkId: createdPerk.id };
}

export async function upsertContentPerk(params: {
  shop: string;
  membershipPlanId: number;
  denialMessage: string;
  urls: string;
}) {
  const { membershipPlanId, denialMessage, urls } = params;
  
  // Always create new content and perk (no updating existing ones)
  const createdContent = await prisma.memberExclusiveContent.create({
    data: { 
      accessDeniedMessage: denialMessage, 
      pagesUrl: urls.split(',').map(url => url.trim()).filter(url => url.length > 0)
    },
  });

  const createdPerk = await prisma.perk.create({
    data: {
      membershipPlanId,
      perkType: 'MEMBER_EXCLUSIVE_CONTENT' as any,
      contentTableId: createdContent.id,
    },
  });

  return { success: true, contentId: createdContent.id, perkId: createdPerk.id };
}

export async function updateDiscountPerk(params: {
  shop: string;
  perkId: number;
  discountId: string;
  discountType: string;
  message: string;
}) {
  const { perkId, discountId, discountType, message } = params;
  
  // Get the perk to find the associated discount
  const perk = await prisma.perk.findFirst({
    where: { id: perkId },
    select: { discountTableId: true }
  });

  if (!perk?.discountTableId) {
    throw new Error("Perk or associated discount not found");
  }

  // Update the existing discount
  const updatedDiscount = await prisma.discount.update({
    where: { id: perk.discountTableId },
    data: { shopifyDiscountId: discountId, discountType, message },
  });

  return { success: true, discountId: updatedDiscount.id };
}

export async function updateContentPerk(params: {
  shop: string;
  perkId: number;
  denialMessage: string;
  urls: string;
}) {
  const { perkId, denialMessage, urls } = params;
  
  // Get the perk to find the associated content
  const perk = await prisma.perk.findFirst({
    where: { id: perkId },
    select: { contentTableId: true }
  });

  if (!perk?.contentTableId) {
    throw new Error("Perk or associated content not found");
  }

  // Update the existing content
  const updatedContent = await prisma.memberExclusiveContent.update({
    where: { id: perk.contentTableId },
    data: { 
      accessDeniedMessage: denialMessage, 
      pagesUrl: urls.split(',').map(url => url.trim()).filter(url => url.length > 0)
    },
  });

  return { success: true, contentId: updatedContent.id };
}
