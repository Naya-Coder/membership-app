import { Page, Card, DataTable, Text, Button, InlineStack, Badge } from '@shopify/polaris';
import { TitleBar } from "@shopify/app-bridge-react";
import { useNavigate, useLoaderData, Form, useSubmit } from '@remix-run/react';
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import prisma from '../db.server';
import { authenticate } from '../shopify.server';
import { deleteMembershipById } from "../utils/prisma";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  console.log('🔍 Current session shop:', session.shop);
  
  // Fetch membership plans with related data
  const membershipPlans = await (prisma as any).membershipPlan.findMany({
    where: {
      shop: session.shop,
    },
    include: {
      product: true,
      perks: {
        include: {
          discount: true,
          content: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return json({ membershipPlans });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = form.get('intent');
  const planId = Number(form.get('planId'));

  if (intent === 'delete' && Number.isFinite(planId)) {
    await deleteMembershipById(planId, session.shop);
    return json({ success: true });
  }

  return json({ success: false }, { status: 400 });
};

export default function MembershipDataPage() {
  const navigate = useNavigate();
  const { membershipPlans } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleRequest = () => {
    navigate('/app/membership/new');
  };

  const handleEdit = (planId: number) => {
    navigate(`/app/membership/${planId}/edit`);
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
      <Button size="slim" variant="plain" onClick={() => handleEdit(plan.id)}>
        Edit Plan
      </Button>
      <Button size="slim" variant="plain" onClick={() => navigate(`/app/membership/${plan.id}/perks`)}>
        Edit Perk
      </Button>
      <Button size="slim" variant="plain" tone="critical" onClick={() => handleDelete(plan.id)}>
        Delete
      </Button>
    </InlineStack>
  ]);

  return (
    <>
      <TitleBar title="Membership Plans" />
      <div style={{ padding: "1rem 4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <Text as="h1" variant="headingLg">
              Manage Membership Plans & Perks
            </Text>
            <Text as="p" variant="bodyMd">
              Manage creating and offering membership plans. Total plans: {membershipPlans.length}
            </Text>
          </div>
          <div>
            <Button variant="primary" onClick={handleRequest}>Create Membership</Button>
          </div>
        </div>
        
        {membershipPlans.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Text as="p" variant="bodyLg">
                No membership plans found. Create your first membership plan to get started.
              </Text>
              <div style={{ marginTop: '1rem' }}>
                <Button variant="primary" onClick={handleRequest}>
                  Create Your First Membership Plan
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <DataTable
              columnContentTypes={[
                'text',
                'text',
                'text',
              ]}
              headings={[
                'S.No',
                'Plan Name',
                'Actions',
              ]}
              rows={rows}
            />
          </Card>
        )}
      </div>
    </>
  );
}
