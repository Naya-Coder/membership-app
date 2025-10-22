import {
    FormLayout,
    TextField,
    Text,
    Select,
    Card,
    Divider,
    Checkbox,
    Button,
    ButtonGroup
} from '@shopify/polaris';
import { json } from '@remix-run/react';
import { ProductPicker } from "../components/ProductPicker";
import { useCallback, useState } from "react";
import { useNavigate, useActionData, useLoaderData, Form } from '@remix-run/react';
import { ActionFunctionArgs,LoaderFunctionArgs } from '@remix-run/node';
import { getMembershipById, updateMembership } from "../utils/prisma";
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    try {
        const { session } = await authenticate.admin(request);
        const { membershipId } = params;
        
        if (!membershipId) {
            throw new Error("Membership ID is required");
        }

        const result = await getMembershipById(membershipId, session.shop);
        return json({ membershipPlan: result.membershipPlan });
    } catch (error) {
        console.error("Error loading membership:", error);
        return json({ 
            error: error instanceof Error ? error.message : "Failed to load membership",
            membershipPlan: null 
        }, { status: 404 });
    }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    try {
        const formData = await request.formData();
        const { session } = await authenticate.admin(request);
        const { membershipId } = params;
        const data = Object.fromEntries(formData);

        if (!membershipId) {
            return json({ 
                success: false, 
                error: "Membership ID is required" 
            }, { status: 400 });
        }

        const errors: Record<string, string> = {};

        // Basic required field checks
        if (!data.membershipName) errors.membershipName = "Membership name is required";
        if (!data.orderTagName) errors.orderTagName = "Order tag name is required";
        if (!data.customerTagName) errors.customerTagName = "Customer tag name is required";
        if (!data.selectedProducts || data.selectedProducts === "[]")
            errors.selectedProducts = "Please select at least one product.";

        if (Object.keys(errors).length > 0) {
            return json({ success: false, errors }, { status: 400 });
        }

        // Parse selectedProducts from JSON string
        let selectedProducts: Array<{ id: string; title: string }> = [];
        try {
            selectedProducts = JSON.parse(data.selectedProducts as string);
        } catch (err) {
            return json({ 
                success: false, 
                errors: { selectedProducts: "Invalid product selection format" } 
            }, { status: 400 });
        }

        // Update membership using the utility function
        const membershipData = {
            membershipName: data.membershipName as string,
            orderTagName: data.orderTagName as string,
            customerTagName: data.customerTagName as string,
            requireTags: data.requireTags as string,
            requireTagList: data.requireTagList as string,
            excludeTags: data.excludeTags as string,
            excludeTagList: data.excludeTagList as string,
            selectedProducts,
            shop: session?.shop
        };

        const result = await updateMembership(membershipId, membershipData);

        return new Response(null, {
            status: 302,
            headers: {
                Location: "/app/membership/data"
            }
        });
    } catch (error) {
        console.error("Error in membership action:", error);
        return json({ 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to update membership" 
        }, { status: 500 });
    }
};


export default function EditMembershipPlan() {
    const navigate = useNavigate();
    const actionData = useActionData<typeof action>();
    const loaderData = useLoaderData<typeof loader>();

    // 🧠 State management - Initialize with existing data
    const [formData, setFormData] = useState({
        membershipName: loaderData?.membershipPlan?.name || '',
        orderTagName: loaderData?.membershipPlan?.orderTagName || '',
        customerTagName: loaderData?.membershipPlan?.customerTagName || '',
        renewalFrequency: '1',
        renewalCycle: 'months',
        displayName: '',
        cancellationPolicy: '30',
        automaticExpiration: '30',
        discountValue: '10',
        discountType: 'percentage',
        requireTags: (loaderData?.membershipPlan?.allowedCustomerTags?.length || 0) > 0,
        requireTagList: loaderData?.membershipPlan?.allowedCustomerTags?.join(', ') || '',
        excludeTags: (loaderData?.membershipPlan?.restrictedCustomerTags?.length || 0) > 0,
        excludeTagList: loaderData?.membershipPlan?.restrictedCustomerTags?.join(', ') || '',
    });

    const [selectedProducts, setSelectedProducts] = useState<{ id: string; title: string }[]>(
        loaderData?.membershipPlan?.product ? [{
            id: `gid://shopify/Product/${loaderData.membershipPlan.product.shopifyProductId}`,
            title: loaderData.membershipPlan.product.handle || 'Product'
        }] : []
    );
   
    // 🔁 Handle field changes
    const handleChange = useCallback((field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleSelectProduct = useCallback((products: { id: string; title: string }[]) => {
        setSelectedProducts(products);
    }, []);

    // Show error if membership not found
    if (loaderData?.error || !loaderData?.membershipPlan) {
        return (
            <div style={{ padding: "1rem 4rem" }}>
                <div style={{ 
                    padding: '1rem', 
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    textAlign: 'center'
                }}>
                    <Text as="p" tone="critical">
                        {loaderData?.error || "Membership plan not found"}
                    </Text>
                    <Button 
                        onClick={() => navigate("/app/membership/data")} 
                        variant='primary' 
                        size="medium"
                        style={{ marginTop: '1rem' }}
                    >
                        Back to Memberships
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: "1rem 4rem" }}>
            <Form method='post'>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <div style={{ flex: 8 }}>
                        <Text as="h2" variant="headingLg">
                            Edit Membership Plan
                        </Text>
                    </div>
                    <div style={{ flex: 1 }}>
                        <ButtonGroup>
                            <Button onClick={() => navigate("/app/membership/data")} variant='primary' size="medium">
                                Back
                            </Button>
                            <Button variant='primary' tone='success' size="medium" submit={true}>
                                Update
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>

                {/* Show success/error messages */}
                {actionData && (
                    <div style={{ 
                        marginBottom: '1rem', 
                        padding: '1rem', 
                        backgroundColor: actionData.success ? '#d4edda' : '#f8d7da',
                        border: `1px solid ${actionData.success ? '#c3e6cb' : '#f5c6cb'}`,
                        borderRadius: '4px'
                    }}>
                        <Text as="p" tone={actionData.success ? "success" : "critical"}>
                            {actionData.success ? actionData.message : actionData.error}
                        </Text>
                    </div>
                )}

                <FormLayout>

                    {/* Membership Basic Info */}
                    <Card>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                            <TextField
                                name='membershipName'
                                label="Membership Name"
                                value={formData.membershipName}
                                onChange={(val) => handleChange('membershipName', val)}
                                autoComplete="off"
                                placeholder='e.g. Gold Membership'
                                error={actionData?.errors?.membershipName}
                            />
                            <TextField
                                type="text"
                                name='orderTagName'
                                label="Order Tag Name"
                                value={formData.orderTagName}
                                onChange={(val) => handleChange('orderTagName', val)}
                                autoComplete="off"
                                placeholder='e.g. membership, vip'
                                error={actionData?.errors?.orderTagName}
                            />
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <TextField
                                name='customerTagName'
                                label="Customer Tag Name"
                                value={formData.customerTagName}
                                onChange={(val) => handleChange('customerTagName', val)}
                                autoComplete="off"
                                placeholder='e.g. VIP'
                                error={actionData?.errors?.customerTagName}
                            />
                        </div>
                    </Card>

                    {/* Product Picker */}
                    <Card>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                            <div style={{ flex: 2, marginTop: '1rem' }}>
                                <Text as="h3" variant="headingMd">Membership Listing</Text>
                                <Text as="p">
                                    To make a membership subscription instead of a one-time purchase,
                                    go to Products, pick the product, and switch on subscription only.
                                </Text>
                            </div>
                            <div style={{ flex: 1, marginTop: '1rem' }}>
                                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                                    <Text as="p">Select Membership Listing</Text>
                                </div>
                                <ProductPicker
                                    onSelect={handleSelectProduct}
                                    selectedIds={selectedProducts.map((p) => p.id)}
                                    items={selectedProducts}
                                    type="product"
                                    buttonText="Search for Product"
                                />
                                <input type="hidden" name="selectedProducts" value={JSON.stringify(selectedProducts)} />
                                {/* show validation error for product picker */}
                                {actionData?.errors?.selectedProducts && (
                                    <Text as="p" variant="bodySm" tone="critical" >
                                        {actionData.errors.selectedProducts}
                                    </Text>
                                )}

                            </div>
                        </div>
                    </Card>

                    {/* Renewal Cycle */}
                    <Card>
                        <Text as="h3" variant="headingMd">Renewal Cycle</Text>
                        <Text as="p">Set how often the membership renews and when to charge the customer.</Text>

                        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginTop: '1rem' }}>
                            <TextField
                                type="number"
                                name='renewalFrequency'
                                label="Renewal Frequency"
                                value={formData.renewalFrequency}
                                onChange={(val) => handleChange('renewalFrequency', val)}
                                autoComplete="off"
                                placeholder='e.g. 1,2,3'
                                min={1}
                            />
                            <Select
                                name='renewalCycle'
                                label="Renewal Cycle"
                                options={[
                                    { label: 'Days', value: 'days' },
                                    { label: 'Weeks', value: 'weeks' },
                                    { label: 'Months', value: 'months' },
                                    { label: 'Years', value: 'years' },
                                ]}
                                onChange={(val) => handleChange('renewalCycle', val)}
                                value={formData.renewalCycle}
                            />
                        </div>

                        <div style={{ marginTop: '0.5rem' }}>
                            <TextField
                                name='displayName'
                                type='text'
                                label="Display Name"
                                value={formData.displayName}
                                onChange={(val) => handleChange('displayName', val)}
                                autoComplete="off"
                                placeholder='e.g. Monthly, Yearly'
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginTop: '1rem' }}>
                            <TextField
                                name='cancellationPolicy'
                                type="number"
                                label="Cancellation Policy (in days)"
                                value={formData.cancellationPolicy}
                                onChange={(val) => handleChange('cancellationPolicy', val)}
                                autoComplete="off"
                                placeholder='e.g. 28'
                                min={0}
                            />
                            <TextField
                                name='automaticExpiration'
                                type="number"
                                label="Automatic Expiration (in days)"
                                value={formData.automaticExpiration}
                                onChange={(val) => handleChange('automaticExpiration', val)}
                                autoComplete="off"
                                placeholder='e.g. 29'
                                min={0}
                            />
                        </div>
                    </Card>

                    {/* Discount Section */}
                    <Card>
                        <Text as="h3" variant="headingMd">Discount</Text>
                        <Text as="p">
                            You can set a discount for the membership plan here.
                            This discount applies only to the membership.
                        </Text>

                        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginBottom: '1rem', marginTop: '1rem' }}>
                            <TextField
                                name='discountValue'
                                type="number"
                                label="Discount Value"
                                value={formData.discountValue}
                                onChange={(val) => handleChange('discountValue', val)}
                                autoComplete="off"
                                placeholder='e.g. 10,20'
                                min={0}
                            />
                            <Select
                                name='discountType'
                                label="Discount Type"
                                options={[
                                    { label: 'Percentage', value: 'percentage' },
                                    { label: 'Fixed Amount', value: 'fixed_amount' },
                                ]}
                                onChange={(val) => handleChange('discountType', val)}
                                value={formData.discountType}
                            />
                        </div>

                        <Divider />

                        {/* Require Tags */}
                        <div style={{ marginTop: '1rem' }}>
                            <Checkbox
                                name='requireTags'
                                label="Require Specific Tags"
                                checked={formData.requireTags}
                                onChange={(val) => handleChange('requireTags', val)}
                            />
                            <input type="hidden" name="requireTags" value={formData.requireTags.toString()} />
                            {formData.requireTags && (
                                <TextField
                                    name='requireTagList'
                                    type="text"
                                    label="Member Inclusive Tags"
                                    value={formData.requireTagList}
                                    onChange={(val) => handleChange('requireTagList', val)}
                                    autoComplete="off"
                                    placeholder='e.g. gold member, bronze member'
                                />
                            )}
                        </div>

                        {/* Exclude Tags */}
                        <div style={{ marginTop: '1rem' }}>
                            <Checkbox
                                name='excludeTags'
                                label="Exclude Specific Tags"
                                checked={formData.excludeTags}
                                onChange={(val) => handleChange('excludeTags', val)}
                            />
                            <input type="hidden" name="excludeTags" value={formData.excludeTags.toString()} />
                            {formData.excludeTags && (
                                <TextField
                                    name='excludeTagList'
                                    type="text"
                                    label="Member Exclusive Tags"
                                    value={formData.excludeTagList}
                                    onChange={(val) => handleChange('excludeTagList', val)}
                                    autoComplete="off"
                                    placeholder='e.g. premium, beta_users'
                                />
                            )}
                        </div>
                    </Card>

                </FormLayout>
            </Form>
        </div>
    );
}
