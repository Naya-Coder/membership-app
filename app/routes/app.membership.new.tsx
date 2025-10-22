import {
    FormLayout,
    TextField,
    Form,
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
import { useNavigate, useSubmit } from '@remix-run/react';
import { ActionFunctionArgs } from '@remix-run/node';

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);

    // Safe destructuring with type narrowing
    const selectedProductsRaw = rawData.selectedProducts;

    let selectedProducts: any[] = [];
    if (typeof selectedProductsRaw === "string") {
        try {
            selectedProducts = JSON.parse(selectedProductsRaw);
        } catch (err) {
            console.error("Invalid JSON in selectedProducts:", err);
        }
    }

    // Construct normalized data object
    const data = {
        ...rawData,
        selectedProducts,
    };

    // TODO: Save to DB or send to API
    console.log("Received membership form data:", data);

    return json({ success: true });
};

export default function NewMembershipPlan() {
    const navigate = useNavigate();
    const submit = useSubmit();

    // 🧠 State management
    const [formData, setFormData] = useState({
        membershipName: '',
        orderTagName: '',
        customerTagName: '',
        renewalFrequency: '1',
        renewalCycle: 'months',
        displayName: '',
        cancellationPolicy: '30',
        automaticExpiration: '30',
        discountValue: '10',
        discountType: 'percentage',
        requireTags: false,
        requireTagList: '',
        excludeTags: false,
        excludeTagList: '',
    });

    const [selectedProducts, setSelectedProducts] = useState<{ id: string; title: string }[]>([]);
    const [showErrors, setShowErrors] = useState(false); // 👈 NEW
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({}); // 👈 NEW

    // 🔁 Handle field changes
    const handleChange = useCallback((field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setValidationErrors((prev) => ({ ...prev, [field]: '' })); // clear error on change
    }, []);

    const handleSelectProduct = useCallback((products: { id: string; title: string }[]) => {
        setSelectedProducts(products);
        setValidationErrors((prev) => ({ ...prev, selectedProducts: '' })); // clear error
    }, []);

    // ✅ Validation logic
    const validateForm = useCallback(() => {
        const errors: Record<string, string> = {};

        if (!formData.membershipName.trim()) errors.membershipName = "Membership name is required.";
        if (!formData.orderTagName.trim()) errors.orderTagName = "Order tag name is required.";
        if (!formData.customerTagName.trim()) errors.customerTagName = "Customer tag name is required.";
        if (selectedProducts.length === 0) errors.selectedProducts = "Please select at least one product.";

        setValidationErrors(errors);

        return Object.keys(errors).length === 0;
    }, [formData, selectedProducts]);

    // 💾 Submit handler
    const handleSubmit = useCallback(() => {
        setShowErrors(true); // 👈 triggers visible error messages
        const isValid = validateForm();
        if (!isValid) return; // stop submit if errors exist

        const payload = {
            ...formData,
            selectedProducts,
        };

        const form = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            form.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        });

        submit(form, { method: "post", action: "/app/membership/new" });
    }, [formData, selectedProducts, submit, validateForm]);
    return (
        <div style={{ padding: "1rem 4rem" }}>
            <Form onSubmit={handleSubmit}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <div style={{ flex: 8 }}>
                        <Text as="h2" variant="headingLg">
                            Create New Membership Plan
                        </Text>
                    </div>
                    <div style={{ flex: 1 }}>
                        <ButtonGroup>
                            <Button onClick={() => navigate("/app/membership/data")} variant='primary' size="medium">
                                Back
                            </Button>
                            <Button variant='primary' tone='success' size="medium" submit>
                                Save
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>

                <FormLayout>

                    {/* Membership Basic Info */}
                    <Card>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                            <TextField
                                label="Membership Name"
                                value={formData.membershipName}
                                onChange={(val) => handleChange('membershipName', val)}
                                autoComplete="off"
                                placeholder='e.g. Gold Membership'
                                error={showErrors ? validationErrors.membershipName : undefined}
                            />
                            <TextField
                                type="text"
                                label="Order Tag Name"
                                value={formData.orderTagName}
                                onChange={(val) => handleChange('orderTagName', val)}
                                autoComplete="off"
                                placeholder='e.g. membership, vip'
                                error={showErrors ? validationErrors.orderTagName : undefined}
                            />
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <TextField
                                label="Customer Tag Name"
                                value={formData.customerTagName}
                                onChange={(val) => handleChange('customerTagName', val)}
                                autoComplete="off"
                                placeholder='e.g. VIP'
                                error={showErrors ? validationErrors.customerTagName : undefined}
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
                                {/* show validation error for product picker */}
                                {showErrors && validationErrors.selectedProducts && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <Text as="p" variant="bodySm" tone="critical">
                                            {validationErrors.selectedProducts}
                                        </Text>
                                    </div>

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
                                label="Renewal Frequency"
                                value={formData.renewalFrequency}
                                onChange={(val) => handleChange('renewalFrequency', val)}
                                autoComplete="off"
                                placeholder='e.g. 1,2,3'
                                min={1}
                            />
                            <Select
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
                                type="number"
                                label="Cancellation Policy (in days)"
                                value={formData.cancellationPolicy}
                                onChange={(val) => handleChange('cancellationPolicy', val)}
                                autoComplete="off"
                                placeholder='e.g. 28'
                                min={0}
                            />
                            <TextField
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
                                type="number"
                                label="Discount Value"
                                value={formData.discountValue}
                                onChange={(val) => handleChange('discountValue', val)}
                                autoComplete="off"
                                placeholder='e.g. 10,20'
                                min={0}
                            />
                            <Select
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
                                label="Require Specific Tags"
                                checked={formData.requireTags}
                                onChange={(val) => handleChange('requireTags', val)}
                            />
                            {formData.requireTags && (
                                <TextField
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
                                label="Exclude Specific Tags"
                                checked={formData.excludeTags}
                                onChange={(val) => handleChange('excludeTags', val)}
                            />
                            {formData.excludeTags && (
                                <TextField
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
