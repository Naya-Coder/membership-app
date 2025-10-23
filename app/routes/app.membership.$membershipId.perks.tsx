import { Page, Card, Text, Button, InlineStack, BlockStack, Divider, Select, TextField, LegacyCard, EmptyState, Modal, DataTable, Icon } from '@shopify/polaris';
import React from 'react';
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, useFetcher } from '@remix-run/react';
import prisma from '../db.server';
import { authenticate } from '../shopify.server';
import { upsertDiscountPerk, upsertContentPerk, updateDiscountPerk, updateContentPerk } from "../utils/prisma";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const membershipId = Number(params.membershipId);

  if (!membershipId || Number.isNaN(membershipId)) {
    return json({ membershipId: null, perks: null });
  }

  const perks = await (prisma as any).perk.findMany({
    where: { membershipPlanId: membershipId },
    include: { discount: true, content: true }
  });

  return json({ membershipId, perks });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = form.get('intent');
  const membershipId = Number(params.membershipId);

  if (!membershipId || Number.isNaN(membershipId)) {
    return json({ success: false, error: 'Invalid membership ID' }, { status: 400 });
  }

  if (intent === 'validate-discount') {
    const discountId = String(form.get('discountId') || '');
    const discountType = String(form.get('discountType') || '');
    const message = String(form.get('message') || '');

    if (!discountId) {
      return json({ success: false, error: 'Discount ID is required' }, { status: 400 });
    }

    const response = await fetch(`https://${session.shop}/admin/api/2025-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': session.accessToken,
      },
      body: JSON.stringify({
        query: `#graphql
          query GetDiscount {
            discountNode(id: "gid://shopify/DiscountNode/${discountId}") { id }
          }
        `
      })
    });

    if (response.status !== 200) {
      return json({ success: false, error: 'Failed to validate discount' }, { status: 500 });
    }

    const data = await response.json();
    if (intent === 'save-discount') {
      await upsertDiscountPerk({
        shop: session.shop,
        membershipPlanId: membershipId,
        discountId,
        discountType,
        message,
      });
    }

    return json({ success: true, intent });
  }

  if (intent === 'save-discount') {
    const discountId = String(form.get('discountId') || '');
    const discountType = String(form.get('discountType') || '');
    const message = String(form.get('message') || '');

    if (!discountId || !discountType || !message) {
      return json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    await upsertDiscountPerk({
      shop: session.shop,
      membershipPlanId: membershipId,
      discountId,
      discountType,
      message,
    });

    return json({ success: true, intent });
  }

  if (intent === 'save-content') {
    const denialMessage = String(form.get('denialMessage') || '');
    const urls = String(form.get('urls') || '');

    if (!denialMessage || !urls) {
      return json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    await upsertContentPerk({
      shop: session.shop,
      membershipPlanId: membershipId,
      denialMessage,
      urls,
    });

    return json({ success: true, intent });
  }

  if (intent === 'update-discount') {
    const perkId = Number(form.get('perkId'));
    const discountId = String(form.get('discountId') || '');
    const discountType = String(form.get('discountType') || '');
    const message = String(form.get('message') || '');

    if (!perkId || !discountId || !discountType || !message) {
      return json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    await updateDiscountPerk({
      shop: session.shop,
      perkId,
      discountId,
      discountType,
      message,
    });

    return json({ success: true, intent });
  }

  if (intent === 'update-content') {
    const perkId = Number(form.get('perkId'));
    const denialMessage = String(form.get('denialMessage') || '');
    const urls = String(form.get('urls') || '');

    if (!perkId || !denialMessage || !urls) {
      return json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    await updateContentPerk({
      shop: session.shop,
      perkId,
      denialMessage,
      urls,
    });

    return json({ success: true, intent });
  }

  return json({ success: false }, { status: 400 });
}

export default function MembershipPerks() {
  const { membershipId, perks } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [selection, setSelection] = React.useState<'discount' | 'content' | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalStep, setModalStep] = React.useState<'choose' | 'form'>('choose');
  const [editingPerk, setEditingPerk] = React.useState<any>(null);
  const [discountForm, setDiscountForm] = React.useState({
    discountType: 'percentage',
    discountId: '',
    message: ''
  });
  const [discountError, setDiscountError] = React.useState<string | undefined>(undefined);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [contentForm, setContentForm] = React.useState({
    denialMessage: '',
    urls: ''
  });

  // Refresh data after successful operations
  React.useEffect(() => {
    if (fetcher.data?.success && (fetcher.data?.intent === 'save-discount' || fetcher.data?.intent === 'save-content' || fetcher.data?.intent === 'update-discount' || fetcher.data?.intent === 'update-content')) {
      // Refresh the page to show updated data
      window.location.reload();
    }
  }, [fetcher.data]);

  // Function to handle editing a perk
  const handleEditPerk = (perk: any) => {
    setEditingPerk(perk);
    if (perk.discount) {
      setSelection('discount');
      setDiscountForm({
        discountType: perk.discount.discountType,
        discountId: perk.discount.shopifyDiscountId,
        message: perk.discount.message
      });
    } else if (perk.content) {
      setSelection('content');
      setContentForm({
        denialMessage: perk.content.accessDeniedMessage,
        urls: perk.content.pagesUrl?.join(', ') || ''
      });
    }
    setModalStep('form');
    setModalOpen(true);
  };

  // Function to handle creating a new perk
  const handleCreatePerk = () => {
    setEditingPerk(null);
    setSelection(null);
    setDiscountForm({
      discountType: 'percentage',
      discountId: '',
      message: ''
    });
    setContentForm({
      denialMessage: '',
      urls: ''
    });
    setModalStep('choose');
    setModalOpen(true);
  };
  React.useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.success === false && fetcher.data.error) {
      setDiscountError(fetcher.data.error as string);
    } else if (fetcher.data.success === true) {
      setDiscountError(undefined);
    }
  }, [fetcher.data]);

  return (
    <Page 
      title="Choose a perk for this membership"
      backAction={{
        content: 'Membership Plans',
        onAction: () => navigate('/app/membership/data')
      }}
    >
      <BlockStack gap="400">
        {!selection && (!perks || perks.length === 0) && (
          <LegacyCard sectioned>
            <EmptyState
              heading="No perks added yet"
              action={{ content: 'Create a perk', onAction: handleCreatePerk }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              fullWidth
            >
              <p>
                Create a member perk to enhance your plan. Choose a discount for members or restrict access to exclusive content.
              </p>
            </EmptyState>
          </LegacyCard>
        )}

        {perks && perks.length > 0 && (
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between">
                <Text as="h3" variant="headingMd">Current Perks ({perks.length})</Text>
                <Button 
                  variant="primary" 
                  onClick={handleCreatePerk}
                >
                  Add More Perks
                </Button>
              </InlineStack>
              
              <DataTable
                columnContentTypes={['text', 'text', 'text']}
                headings={['Perk Type', 'Details', 'Actions']}
                rows={perks.map((perk: any) => [
                  perk.discount ? 'Member Discount' : 'Member-Exclusive Content',
                  perk.discount 
                    ? `Discount: ${perk.discount.discountType} - ${perk.discount.message || 'No message'}`
                    : `Content: ${perk.content?.accessDeniedMessage || 'No message'}`,
                  <InlineStack gap="200" key={perk.id}>
                    <Button 
                      size="slim" 
                      variant="plain"
                      onClick={() => handleEditPerk(perk)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="slim" 
                      variant="plain" 
                      tone="critical"
                      onClick={() => {
                        // TODO: Implement delete functionality
                        console.log('Delete perk:', perk.id);
                      }}
                    >
                      Delete
                    </Button>
                  </InlineStack>
                ])}
              />
            </BlockStack>
          </Card>
        )}

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalStep === 'choose' ? 'Choose a perk type' : (selection === 'discount' ? 'Set up Member Discount' : 'Set up Member-Exclusive Content')}
          primaryAction={modalStep === 'choose' ? undefined : undefined}
          secondaryActions={modalStep === 'choose' ? [] : []}
        >
          <Modal.Section>
            {modalStep === 'choose' ? (
              <InlineStack gap="400" align="space-between">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">Member Discount</Text>
                    <Text as="p">Offer a discount to members.</Text>
                    <Button onClick={() => { setSelection('discount'); setModalStep('form'); }}>Get started</Button>
                  </BlockStack>
                </Card>
      <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">Member-Exclusive Content</Text>
                    <Text as="p">Restrict content to members only.</Text>
                    <Button onClick={() => { setSelection('content'); setModalStep('form'); }}>Get started</Button>
                  </BlockStack>
                </Card>
              </InlineStack>
            ) : (
              <BlockStack gap="300">
                {selection === 'discount' ? (
                  <>
                    <Select
                      label="Discount type"
                      options={[
                        { label: 'Percentage', value: 'percentage' },
                        { label: 'Fixed amount', value: 'fixed_amount' },
                        { label: 'Buy X Get Y amount', value: 'buy_x_get_y_amount' },
                        { label: 'Free Shipping', value: 'free_shipping' }
                      ]}
                      value={discountForm.discountType}
                      onChange={(v) => setDiscountForm((p) => ({ ...p, discountType: v }))}
                    />
                      <TextField
                        type='number'
                        label="Shopify Discount ID"
                        value={discountForm.discountId}
                        onChange={(v) => {
                          setDiscountForm((p) => ({ ...p, discountId: String(v) }));
                          setDiscountError(undefined);
                          if (debounceRef.current) clearTimeout(debounceRef.current);
                          debounceRef.current = setTimeout(() => {
                            const trimmed = String(v).trim();
                            if (trimmed.length >= 3 && membershipId) {
                              const form = new FormData();
                              form.append('intent', 'validate-discount');
                              form.append('planId', String(membershipId));
                              form.append('discountId', trimmed);
                              form.append('discountType', discountForm.discountType);
                              form.append('message', discountForm.message);
                              fetcher.submit(form, { method: 'post', action: `/app/membership/${membershipId}/perks` });
                            }
                          }, 300);
                        }}
                        onBlur={() => {
                          const trimmed = discountForm.discountId.trim();
                          if (trimmed.length >= 3 && membershipId) {
                            // Clear any pending debounce
                            if (debounceRef.current) clearTimeout(debounceRef.current);
                            const form = new FormData();
                            form.append('intent', 'validate-discount');
                            form.append('planId', String(membershipId));
                            form.append('discountId', trimmed);
                            form.append('discountType', discountForm.discountType);
                            form.append('message', discountForm.message);
                            fetcher.submit(form, { method: 'post', action: `/app/membership/${membershipId}/perks` });
                          }
                        }}
                      autoComplete="off"
                      placeholder="e.g. gid://shopify/DiscountAutomatic/1234567890"
                      error={discountError}
                    />
                    <TextField
                      label="Message"
                      value={discountForm.message}
                      onChange={(v) => setDiscountForm((p) => ({ ...p, message: v }))}
                      autoComplete="off"
                      placeholder="Shown to members when discount applies"
                    />
                    <InlineStack gap="200">
                      <Button 
                        variant="primary"
                        onClick={() => {
                          if (discountForm.discountId.trim() && discountForm.message.trim()) {
                            const form = new FormData();
                            const intent = editingPerk ? 'update-discount' : 'save-discount';
                            form.append('intent', intent);
                            form.append('planId', String(membershipId));
                            form.append('discountId', discountForm.discountId);
                            form.append('discountType', discountForm.discountType);
                            form.append('message', discountForm.message);
                            if (editingPerk) {
                              form.append('perkId', String(editingPerk.id));
                            }
                            fetcher.submit(form, { method: 'post', action: `/app/membership/${membershipId}/perks` });
                          }
                        }}
                        disabled={!discountForm.discountId.trim() || !discountForm.message.trim()}
                      >
                        {editingPerk ? 'Update Discount' : 'Save Discount'}
                      </Button>
                      <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                    </InlineStack>
                  </>
                ) : (
                  <>
                    <TextField
                      label="Access denial message"
                      value={contentForm.denialMessage}
                      onChange={(v) => setContentForm((p) => ({ ...p, denialMessage: v }))}
                      autoComplete="off"
                      placeholder="Message shown to non-members"
                    />
                    <TextField
                      label="Restricted URLs"
                      value={contentForm.urls}
                      onChange={(v) => setContentForm((p) => ({ ...p, urls: v }))}
                      autoComplete="off"
                      placeholder="Comma-separated URLs, e.g. /collections/vip, /blogs/private"
                      multiline
                    />
                    <InlineStack gap="200">
                      <Button
                        variant="primary"
                        loading={fetcher.state === 'submitting'}
                        onClick={() => {
                          const form = new FormData();
                          const intent = editingPerk ? 'update-content' : 'save-content';
                          form.append('intent', intent);
                          form.append('planId', String(membershipId ?? ''));
                          form.append('denialMessage', contentForm.denialMessage);
                          form.append('urls', contentForm.urls);
                          if (editingPerk) {
                            form.append('perkId', String(editingPerk.id));
                          }
                          fetcher.submit(form, { method: 'post', action: `/app/membership/${membershipId}/perks` });
                        }}
                      >
                        {editingPerk ? 'Update Content' : 'Save Content'}
                      </Button>
                      <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                    </InlineStack>
                  </>
                )}
              </BlockStack>
            )}
          </Modal.Section>
        </Modal>
      </BlockStack>
    </Page>
  );
}
