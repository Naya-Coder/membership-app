import { Page, Card, Text, Button, InlineStack, BlockStack, DataTable, LegacyCard, EmptyState } from '@shopify/polaris';
import React from 'react';
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, useSubmit } from '@remix-run/react';
import prisma from '../db.server';
import { authenticate } from '../shopify.server';
import { deleteMembershipById } from '../utils/prisma';

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  const membershipPlans = await (prisma as any).membershipPlan.findMany({
    where: { shop: session.shop },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });

  return json({ membershipPlans });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = form.get('intent');

  if (intent === 'delete') {
    const planId = Number(form.get('planId'));
    if (!planId || Number.isNaN(planId)) {
      return json({ success: false, error: 'Invalid plan ID' }, { status: 400 });
    }

    try {
      await deleteMembershipById(planId, session.shop);
      return json({ success: true, message: 'Membership plan deleted successfully!' });
    } catch (error) {
      console.error('Error deleting membership:', error);
      return json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete membership plan' 
      }, { status: 500 });
    }
  }

  return json({ success: false }, { status: 400 });
}

export default function PerksPage() {
  const navigate = useNavigate();
  const { membershipPlans } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleCreatePlan = () => {
    navigate('/app/membership/new');
  };

  const handleEditPlan = (planId: number) => {
    navigate(`/app/membership/${planId}/edit`);
  };

  const handleEditPerks = (planId: number) => {
    navigate(`/app/membership/${planId}/perks`);
  };

  const handleDelete = (planId: number) => {
    const form = new FormData();
    form.append('intent', 'delete');
    form.append('planId', String(planId));
    submit(form, { method: 'post' });
  };

  // Transform membership plans data for the table
  const rows = membershipPlans.map((plan: any, index: number) => [
    index + 1,
    plan.name || 'Unnamed Plan',
    <InlineStack gap="200" key={plan.id}>
      <Button size="slim" variant="plain" onClick={() => handleEditPlan(plan.id)}>
        Edit Plan
      </Button>
      <Button size="slim" variant="plain" onClick={() => handleEditPerks(plan.id)}>
        Edit Perks
      </Button>
      <Button size="slim" variant="plain" tone="critical" onClick={() => handleDelete(plan.id)}>
        Delete
      </Button>
    </InlineStack>
  ]);

  return (
    <Page 
      title="Manage Perks"
      primaryAction={{
        content: 'Create New Plan',
        onAction: handleCreatePlan
      }}
    >
      <BlockStack gap="400">
        {membershipPlans.length === 0 ? (
          <LegacyCard sectioned>
            <EmptyState
              heading="No membership plans yet"
              action={{ 
                content: 'Create your first plan', 
                onAction: handleCreatePlan 
              }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              fullWidth
            >
              <p>
                Create membership plans and add perks to enhance your customer experience. 
                You can offer discounts, exclusive content, and more to your members.
              </p>
            </EmptyState>
          </LegacyCard>
        ) : (
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">Membership Plans ({membershipPlans.length})</Text>
              <Text as="p" variant="bodyMd">
                Select a membership plan to manage its perks. You can add discounts, exclusive content, and other member benefits.
              </Text>
              
              <DataTable
                columnContentTypes={['numeric', 'text', 'text']}
                headings={['#', 'Plan Name', 'Actions']}
                rows={rows}
              />
            </BlockStack>
          </Card>
        )}
      </BlockStack>
    </Page>
  );
}
