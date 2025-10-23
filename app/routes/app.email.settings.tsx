import { useState, useCallback } from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  Text,
  RadioButton,
  TextField,
  Button,
  Card,
  FormLayout,
  Select,
} from "@shopify/polaris";

export default function EmailSettings() {
  const [isCancelledEnabled, setIsCancelledEnabled] = useState(true);
  const [isRebillingEnabled, setIsRebillingEnabled] = useState(true);
  const [isRenewalEnabled, setIsRenewalEnabled] = useState(true);
  const [isFailedChargeEnabled, setIsFailedChargeEnabled] = useState(true);
  const [isWelcomeEnabled, setIsWelcomeEnabled] = useState(true);


  // These will start empty; placeholders show default text
  const [subject, setSubject] = useState("");
  const [fromName, setFromName] = useState("");
  const [replyToEmail, setReplyToEmail] = useState("");
  const [purchase, setPurchase] = useState("");

  // Body already has default content
  const [body, setBody] = useState(
    "This email is sent when a membership is cancelled. The following variables are available for use in this email: FIRST_NAME, LAST_NAME, MEMBERSHIP_TIER, FREQUENCY_NUMBER, FREQUENCY_INTERVAL, PAID_THROUGH_DATE."
  );

  const handleChange = useCallback(
    (enabled: boolean) => setIsCancelledEnabled(enabled),
    []
  );

  const handleSave = () => {
    // You can call an API to save these settings
    console.log({
      isCancelledEnabled,
      subject: subject || "Failed billing attempt! Update your information to keep your membership.",
      fromName: fromName || "Shop - Lisa i",
      replyToEmail: replyToEmail || "contact@shop-hq.com",
      body,
    });
  };
  // Renewal Reminder Email state
  const [renewalTiming, setRenewalTiming] = useState("7 days before renewal");
  const [renewalBody, setRenewalBody] = useState(
    "Hi FIRST_NAME,\n\n" +
    "We tried to process your membership payment, but it didn't go through.\n\n" +
    "Your current plan: MEMBERSHIP_TIER\n" +
    "Billing frequency: Every FREQUENCY_NUMBER, FREQUENCY_INTERVAL}}\n\n" +
    "We'll automatically try again soon. Please ensure your billing details are up to date to avoid interruption to your membership.\n\n" +
    "If you've already updated your info, thank you! No further action is needed.\n\n" +
    "Thanks for being a valued member,"
  );

  const renewalTimingOptions = [
    { label: "7 days before renewal", value: "7 days before renewal" },
    { label: "1 day before renewal", value: "1 day before renewal" },
    { label: "3 days before renewal", value: "3 days before renewal" },
    { label: "14 days before renewal", value: "14 days before renewal" },
    { label: "Do not send a renewal reminder email", value: "do not send" },
  ];

  const handleRenewalTimingChange = useCallback(
    (value: string) => setRenewalTiming(value),
    []
  );

  const handleSaveRenewal = () => {
    console.log({
      renewalTiming,
      renewalBody,
    });
    alert("Renewal Reminder settings saved (logged to console).");
  };
  //rebilling attempts state
  const [reminderEmail, setreminderEmail] = useState("3 Times");
  const reminderEmailOptions = [
    { label: "3 Times", value: "3 Times" },
    { label: "2 Times", value: "2 Times" },
    { label: "1 Times", value: "2 Times" },
  ];
  const handleReminderEmailChange = useCallback(
    (value: string) => setreminderEmail(value),
    []
  );

  const [reminderDays, setreminderDays] = useState("Every 2 days");
  const reminderDaysOptions = [
    { label: "Every 2 days", value: "Every 2 days" },
    { label: "Every 7 days", value: "Every 7 days" },
    { label: "Every 15 days", value: "Every 15 days" },
  ];
  const handleReminderDaysChange = useCallback(
    (value: string) => setreminderDays(value),
    []
  );

  const [failedChargebody, setfailedChargeBody] = useState(
    "Hi FIRST_NAME,\n\n" +
    "It looks like the payment method associated with your membership didn't go through.\n" +
    "Update your billing information by clicking the Update Payment Method link in your\n" +
    "<a href= https://shop-otter.com/a/membership/dashboard> membership dashboard</a>.\n\n" +
    "We'll try again in NEXT_ATTEMPT_DAYS days. You have ATTEMPTS_LEFT more attempts before your account will be cancelled."
  );

  const [purchaseBody, setPurchaseBody] = useState(
    "Welcome FIRST_NAME,\n" +
    "We're so glad to have you as a MEMBERSHIP_TIER member! Enjoy perks like free shipping, discounted items, and early access to new products.\n\n" +
    "As a reminder, your membership will renew every FREQUENCY_NUMBER FREQUENCY_INTERVAL. You can manage your membership from your <a href= https://shop-otter.com/a/membership/dashboard>Membership Dashboard</a>.\n\n" +
    "Feel free to reach out to our member support team if you have any questions."
  );
  return (
    <>
      <TitleBar title="Premium Membership App" />
      <div style={{ padding: "1rem 4rem" }}>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "2rem",
            marginBottom: "1rem",
          }}
        >
          {/* Header Text */}
          <div style={{ flex: 1 }}>
            <Text as="h1" variant="headingLg">
              Cancelled Membership Email
            </Text>
            <Text as="p" variant="bodyLg"> <div style={{ marginTop: "1rem", marginBottom: "0.5rem" }}> </div>
              This email is sent when a membership is cancelled. The following
              variables are available for use in this email: FIRST_NAME, LAST_NAME,
              MEMBERSHIP_TIER, FREQUENCY_NUMBER, FREQUENCY_INTERVAL, PAID_THROUGH_DATE.
            </Text>
            <Text as="p" variant="bodyLg" ><div style={{ marginTop: "1rem", marginBottom: "0.5rem" }}> </div>
              Reach out to us at support@membership.co
            </Text>
          </div>

          {/* Enable / Disable Radio Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <RadioButton
              label="Enable"
              checked={isCancelledEnabled}
              onChange={() => setIsCancelledEnabled(true)}
            />
            <RadioButton
              label="Disable"
              checked={!isCancelledEnabled}
              onChange={() => setIsCancelledEnabled(false)}
            />

          </div>
        </div>

        {/* Form Section */}
        <Card>
          <FormLayout>
            <fieldset disabled={!isCancelledEnabled}>
              {/* Subject Field */}
              <div>
                <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '1rem' }}></div>
                  Subject
                </Text>
                <TextField
                  label=""
                  value={subject}
                  onChange={setSubject}
                  placeholder="Failed billing attempt! Update your information to keep your membership."
                  autoComplete="off"
                />
              </div>

              {/* From and Reply Fields */}
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '1rem' }}></div>
                    From Name
                  </Text>
                  <TextField
                    label=""
                    value={fromName}
                    onChange={setFromName}
                    placeholder="Shop - Lisa i"
                    autoComplete="off"
                  />
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '1rem' }}></div>
                    Reply to Email
                  </Text>
                  <TextField
                    label=""
                    type="email"
                    value={replyToEmail}
                    onChange={setReplyToEmail}
                    placeholder="contact@shop-hq.com"
                    autoComplete="email"
                  />
                </div>
              </div>


              {/* Body Field */}
              <div>
                <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '1rem' }}></div>
                  Body
                </Text>
                <TextField
                  label=""
                  value={body}
                  onChange={setBody}
                  multiline={3}
                  autoComplete="off"
                />
              </div>
              <Text as="p" variant="bodyMd"><div style={{ marginBottom: '1rem' }}></div>
                Send yourself a test email and see what this email will look like
                in customer inboxes. Note that variables will not be replaced in
                test emails.
              </Text>
              <div style={{ marginBottom: '1rem' }}>
                <Button onClick={() => console.log("Send test email")}>
                  Send Test Email
                </Button>
              </div>

            </fieldset>
          </FormLayout>
        </Card>
      </div>
      <div style={{ padding: "1rem 4rem" }}>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "2rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ flex: 1 }}>
            {/* Renewal Reminder Email Section */}
            <Text as="h1" variant="headingLg"><div style={{ marginTop: "1rem" }}></div>Rebilling Attempts</Text>
            <Text as="p" variant="bodyLg"><div style={{ marginTop: "1rem" }}></div>
              In order to avoid members from churning, you can set up rebilling attempts. These will go out if the member's billing information doesn't go
              through for whatever reason.</Text>
            <Text as="p" variant="bodyLg"><div style={{ marginTop: "1rem", marginBottom: "1rem" }}></div>
              Reach out to us at support@membership.co for any questions!
            </Text>
          </div>
          {/* Enable / Disable Radio Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <RadioButton
              label="Enable"
              checked={isRebillingEnabled}
              onChange={() => setIsRebillingEnabled(true)}
            />
            <RadioButton
              label="Disable"
              checked={!isRebillingEnabled}
              onChange={() => setIsRebillingEnabled(false)}
            />

          </div>
        </div>
        <Card>
          <fieldset disabled={!isRebillingEnabled}>
            <FormLayout >
              {/* Renewal Timing Dropdown */}
              <Text as="p" variant="headingMd" fontWeight="bold">When would you like to send this renewal reminder email?</Text>
              <Select
                label=""
                options={reminderEmailOptions}
                onChange={handleReminderEmailChange}
                value={reminderEmail}
              />
              <Text as="p" variant="headingMd" fontWeight="bold">How often should we try?</Text>
              <Select
                label=""
                options={reminderDaysOptions}
                onChange={handleReminderDaysChange}
                value={reminderDays}
              />
              {/* Email Body Field */}
              <TextField
                label=""
                value={renewalBody}
                onChange={setRenewalBody}
                multiline={6}
                autoComplete="off"
                placeholder="Available variables: FIRST_NAME, NEXT_CHARGE_DATE, MEMBERSHIP_TIER, FREQUENCY_NUMBER, FREQUENCY_INTERVAL"
              />

              {/* Save Button */}
            </FormLayout>
          </fieldset>
        </Card>
      </div>

      <div style={{ padding: "1rem 4rem" }}>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "2rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ flex: 1 }}>
            {/* Renewal Reminder Email Section */}
            <Text as="h1" variant="headingLg"><div style={{ marginTop: "1rem" }}></div>Renewal Attempts</Text>
            <Text as="p" variant="bodyLg"><div style={{ marginTop: "1rem" }}></div>
              This email is sent a few days prior to the membership renewal being charged. The following variables are available for use in this
              email: FIRST_NAME, LAST_NAME, NEXT_CHARGE_DATE, MEMBERSHIP_TIER, FREQUENCY_NUMBER, FREQUENCY_INTERVAL </Text>
            <Text as="p" variant="bodyLg"><div style={{ marginTop: "0.5rem" }}></div>
              The body section supports full HTML markup. We suggest using Klaviyo or Mailchimp to design your email and export the HTML to place
              here
            </Text>
            <Text as="p" variant="bodyLg"><div style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}></div>
              Reach out to us at support@membership.co for any questions!
            </Text>
          </div>
          {/* Enable / Disable Radio Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <RadioButton
              label="Enable"
              checked={isRenewalEnabled}
              onChange={() => setIsRenewalEnabled(true)}
            />
            <RadioButton
              label="Disable"
              checked={!isRenewalEnabled}
              onChange={() => setIsRenewalEnabled(false)}
            />

          </div>
        </div>
        <div style={{ marginTop: "1rem" }}></div>
        <Card>
          <fieldset disabled={!isRenewalEnabled}>
            <FormLayout >
              {/* Renewal Timing Dropdown */}
              <Text as="p" variant="headingMd" fontWeight="bold">When would you like to send this renewal reminder email?</Text>
              <Select
                label=""
                options={renewalTimingOptions}
                onChange={handleRenewalTimingChange}
                value={renewalTiming}
              />

              {/* Email Body Field */}
              <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginTop: "0.5rem" }}></div>Body</Text>
              <TextField
                label=""
                value={renewalBody}
                onChange={setRenewalBody}
                multiline={8}
                autoComplete="off"
                placeholder="Available variables: FIRST_NAME, NEXT_CHARGE_DATE, MEMBERSHIP_TIER, FREQUENCY_NUMBER, FREQUENCY_INTERVAL"
              />
            </FormLayout>
          </fieldset>
        </Card>
      </div>


      <div style={{ padding: "1rem 4rem" }}>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "2rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ flex: 1 }}>
            {/* Renewal Reminder Email Section */}
            <Text as="h1" variant="headingLg"><div style={{ marginTop: "1rem" }}></div>Failed Charge Email</Text>
            <Text as="p" variant="bodyLg"><div style={{ marginTop: "1rem" }}></div>
              This email is sent when a membership charge fails and the member needs to check their payment method.
              The following variables are available for use in this email: </Text>
            <Text as="p" variant="bodyLg"><div style={{ marginTop: "0 rem" }}></div>
              FIRST_NAME, LAST_NAME, MEMBERSHIP_TIER, FREQUENCY_NUMBER, FREQUENCY_INTERVAL, ATTEMPT_NUMBER, NEXT_ATTEMPT_DAYS,
              ATTEMPTS_LEFT.
            </Text>
            <Text as="p" variant="bodyLg"><div style={{ marginTop: "0rem" }}></div>
              The body section supports full HTML markup.
            </Text>
            <Text as="p" variant="bodyLg"><div style={{ marginTop: "0rem", marginBottom: "0.5rem" }}></div>
              We suggest using Klaviyo or Mailchimp to design your email and export the HTML to place here.
            </Text>
          </div>
          {/* Enable / Disable Radio Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <RadioButton
              label="Enable"
              checked={isFailedChargeEnabled}
              onChange={() => setIsFailedChargeEnabled(true)}
            />
            <RadioButton
              label="Disable"
              checked={!isFailedChargeEnabled}
              onChange={() => setIsFailedChargeEnabled(false)}
            />

          </div>
        </div>
        <div style={{ marginTop: "1rem" }}></div>
        <Card>
          <FormLayout>
            <fieldset disabled={!isFailedChargeEnabled}>
              {/* Subject Field */}
              <div>
                <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '1rem' }}></div>
                  Subject
                </Text>
                <TextField
                  label=""
                  value={subject}
                  onChange={setSubject}
                  placeholder="Failed billing attempt! Update your information to keep your membership."
                  autoComplete="off"
                />
              </div>

              {/* From and Reply Fields */}
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '1rem' }}></div>
                    From Name
                  </Text>
                  <TextField
                    label=""
                    value={fromName}
                    onChange={setFromName}
                    placeholder="Shop - Lisa i"
                    autoComplete="off"
                  />
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '1rem' }}></div>
                    Reply to Email
                  </Text>
                  <TextField
                    label=""
                    type="email"
                    value={replyToEmail}
                    onChange={setReplyToEmail}
                    placeholder="contact@shop-hq.com"
                    autoComplete="email"
                  />
                </div>
              </div>


              {/* Body Field */}
              <div>
                <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '1rem' }}></div>
                  Body
                </Text>
                <TextField
                  label=""
                  value={failedChargebody}
                  onChange={setfailedChargeBody}
                  multiline={8}
                  autoComplete="off"
                />
              </div>
            </fieldset>
          </FormLayout>
        </Card>
      </div>

      <div style={{ padding: "1rem 4rem" }}>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "2rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ flex: 1 }}>
            {/* Renewal Reminder Email Section */}
            <Text as="h1" variant="headingLg"><div style={{ marginTop: "1rem" }}></div>Welcome Email</Text>
            <Text as="p" variant="bodyLg"><div style={{ marginTop: "1rem" }}></div>
              This email is sent after a member signs up. Please note that the member will also receive an Order Confirmation email from Shopify that
              serves as their receipt. The following variables are available for use in this email: FIRST_NAME, LAST_NAME, MEMBERSHIP_TIER,
              FREQUENCY_NUMBER, FREQUENCY_INTERVAL </Text>
            <Text as="p" variant="bodyLg"><div style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}></div>
              The body section supports full HTML markup. We suggest using Klaviyo or Mailchimp to design your email and export the HTML to place here.
            </Text>
          </div>
          {/* Enable / Disable Radio Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <RadioButton
              label="Enable"
              checked={isWelcomeEnabled}
              onChange={() => setIsWelcomeEnabled(true)}
            />
            <RadioButton
              label="Disable"
              checked={!isWelcomeEnabled}
              onChange={() => setIsWelcomeEnabled(false)}
            />

          </div>
        </div>
        <div style={{ marginTop: "1rem" }}></div>
        <Card>
          <FormLayout>
            <fieldset disabled={!isWelcomeEnabled}>
              {/* Subject Field */}
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '1rem' }}></div>
                    Subject
                  </Text>
                  <TextField
                    label=""
                    value={subject}
                    onChange={setSubject}
                    autoComplete="off"
                  />
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '1rem' }}></div>
                    How long should we wait to send after purchase?
                  </Text>
                  <TextField
                    label=""
                    value={purchase}
                    onChange={setPurchase}
                    autoComplete="off"
                  />
                </div>
              </div>


              {/* From and Reply Fields */}
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '1rem' }}></div>
                    From Name
                  </Text>
                  <TextField
                    label=""
                    value={fromName}
                    onChange={setFromName}
                    autoComplete="off"
                  />
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '1rem' }}></div>
                    Reply to Email
                  </Text>
                  <TextField
                    label=""
                    type="email"
                    value={replyToEmail}
                    onChange={setReplyToEmail}
                    placeholder="contact@shop-hq.com"
                    autoComplete="email"
                  />
                </div>
              </div>


              {/* Body Field */}
              <div>
                <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '2rem' }}></div>
                  Body
                </Text>
                <TextField
                  label=""
                  value={purchaseBody}
                  onChange={setPurchaseBody}
                  multiline={8}
                  autoComplete="off"
                />
              </div>
            </fieldset>
          </FormLayout>
        </Card>
      </div>
    </>
  );
}
