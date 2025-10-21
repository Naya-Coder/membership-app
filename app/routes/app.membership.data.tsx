import { Page, Card, DataTable, Text, Button } from '@shopify/polaris';
import { TitleBar } from "@shopify/app-bridge-react";
import { useNavigate } from '@remix-run/react';

export default function AdditionalPage() {
  const navigate = useNavigate();
  const rows = [
    ['Emerald Silk Gown', '$875.00',<div>
        <Button size="slim" variant="primary">Edit</Button>
        <Button size="slim" variant="primary" tone='critical' >Delete</Button>
      </div>],
    ['Mauve Cashmere Scarf', '$230.00',<div>
        <Button size="slim" variant="primary">Edit</Button>
        <Button size="slim" variant="primary" tone='critical' >Delete</Button>
      </div>],
    [
      'Navy Merino Wool Blazer with khaki chinos and yellow belt',
      '$445.00',
      <div>
        <Button size="slim" variant="primary">Edit</Button>
        <Button size="slim" variant="primary" tone='critical' >Delete</Button>
      </div>
    ]
  ];

  const handleRequest = () => {
    navigate('/app/membership/new');
  };

  return (
    <>
      <TitleBar title="Membership App" />
      <div style={{ padding: "1rem 4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <Text as="h1" variant="headingLg">
              Manage Membership Plans & Perks
            </Text>
            <Text as="p" variant="bodyMd">
              Manage creating and offering membership plans.
            </Text>
          </div>
          <div>
            <Button variant="primary" onClick={handleRequest}>Create Memberhip</Button>
          </div>
        </div>
        <Card>
          <DataTable
            columnContentTypes={[
              'text',
              'text',
              'text',
            ]}
            headings={[
              'S.No',
              'Membership Title',
              'Actions',
            ]}
            rows={rows}
          />
        </Card>
      </div>
    </>
  );
}
