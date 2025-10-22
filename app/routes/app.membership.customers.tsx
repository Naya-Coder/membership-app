import { Page, LegacyCard, EmptyState, Button } from '@shopify/polaris';
import React from 'react';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
import { authenticate } from '../shopify.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  // This page will show customer memberships in the future
  // For now, it shows an empty state since no customers have bought memberships yet
  return json({ session });
}

export default function CustomerMembershipsPage() {
  const navigate = useNavigate();

  return (
    <Page title="Customer Memberships">
      <LegacyCard sectioned>
        <EmptyState
          heading="No customer memberships yet"
          action={{ 
            content: 'View Membership Plans', 
            onAction: () => navigate('/app/membership/data') 
          }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          fullWidth
        >
          <p>
            This page shows customers who have purchased memberships. 
            Once customers start buying your membership plans, you'll see their details here.
          </p>
          <p>
            You can manage your membership plans by clicking the button above.
          </p>
        </EmptyState>
      </LegacyCard>
    </Page>
  );
}
