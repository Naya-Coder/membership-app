import { Page, Card, DataTable, Text, Button, InlineStack, Badge } from '@shopify/polaris';
import { TitleBar } from "@shopify/app-bridge-react";
import { useNavigate, useLoaderData } from '@remix-run/react';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import prisma from '../db.server';
import { authenticate } from '../shopify.server';

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

  console.log('📊 Found membership plans:', membershipPlans.length);
  console.log('📋 Plans data:', JSON.stringify(membershipPlans, null, 2));

  return json({ membershipPlans });
};

export default function MembershipDataPage() {
  const navigate = useNavigate();
  const { membershipPlans } = useLoaderData<typeof loader>();
console.log(membershipPlans);

  const handleRequest = () => {
    navigate('/app/membership/new');
  };

  const handleEdit = (planId: number) => {
    navigate(`/app/membership/edit/${planId}`);
  };

  const handleDelete = (planId: number) => {
    // TODO: Implement delete functionality
    console.log('Delete plan:', planId);
  };

  // Transform membership plans data for the table
  const rows = membershipPlans.map((plan: any, index: number) => [
    index + 1,
    plan.name || 'Unnamed Plan',
    <InlineStack gap="200" key={plan.id}>
      <Button size="slim" variant="plain" onClick={() => handleEdit(plan.id)}>
        Edit
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
