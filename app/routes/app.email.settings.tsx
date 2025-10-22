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
  const [isEnabled, setIsEnabled] = useState(true);

  // These will start empty; placeholders show default text
  const [subject, setSubject] = useState("");
  const [fromName, setFromName] = useState("");
  const [replyToEmail, setReplyToEmail] = useState("");

  // Body already has default content
  const [body, setBody] = useState(
    "This email is sent when a membership is cancelled. The following variables are available for use in this email: FIRST_NAME, LAST_NAME, MEMBERSHIP_TIER, FREQUENCY_NUMBER, FREQUENCY_INTERVAL, PAID_THROUGH_DATE."
  );

  const handleChange = useCallback(
    (enabled: boolean) => setIsEnabled(enabled),
    []
  );

  const handleSave = () => {
    // You can call an API to save these settings
    console.log({
      isEnabled,
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
    "This is a friendly reminder that your membership will renew on NEXT_CHARGE_DATE.\n\n" +
    "Your current plan MEMBERSHIP_TIER\n" +
    "Billing frequency: Every FREQUENCY_NUMBER FREQUENCY_INTERVAL\n\n" +
    "If you'd like to make changes to your membership, please do so before the renewal date.\n\n" +
    "Thank you for being a valued member!"
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
              checked={isEnabled}
              id="enable"
              name="emailStatus"
              onChange={() => handleChange(true)}
            />
            <RadioButton
              label="Disable"
              checked={!isEnabled}
              id="disable"
              name="emailStatus"
              onChange={() => handleChange(false)}
            />
          </div>
        </div>

        {/* Form Section */}
        <Card>
          <FormLayout>
            <fieldset disabled={!isEnabled}>
              {/* Subject Field */}
              <div>
                <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '0.5rem' }}></div>
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
                  <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '0.5rem' }}></div>
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
                  <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '0.5rem' }}></div>
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
                <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginBottom: '0.5rem' }}></div>
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
              <Text as="p" variant="bodyMd">
                Send yourself a test email and see what this email will look like
                in customer inboxes. Note that variables will not be replaced in
                test emails.
              </Text>
              <Button onClick={() => console.log("Send test email")}>
                Send Test Email
              </Button>
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
<div style={{ marginTop: "2rem" }}></div>
            <Card>
              <FormLayout >
                {/* Renewal Timing Dropdown */}
                <Select
                  label="When would you like to send this renewal reminder email?"
                  options={renewalTimingOptions}
                  onChange={handleRenewalTimingChange}
                  value={renewalTiming}
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
            </Card>
          </div>
        </div>
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
              In order to avoid members from churning, you can set up rebilling attempts. These will go out if the member's billing information doesn't go
through for whatever reason. </Text>
            <Text as="p" variant="bodyLg"><div style={{ marginTop: "1rem", marginBottom: "1rem" }}></div>
              Reach out to us at support@membership.co for any questions!
            </Text>
<div style={{ marginTop: "2rem" }}></div>
            <Card>
              <FormLayout >
                {/* Renewal Timing Dropdown */}
                <Select
                  label="When would you like to send this renewal reminder email?"
                  options={renewalTimingOptions}
                  onChange={handleRenewalTimingChange}
                  value={renewalTiming}
                />

                {/* Email Body Field */}
                <Text as="p" variant="headingMd" fontWeight="bold"><div style={{ marginTop: "1rem" }}></div>Body</Text>
                <TextField
                  label=""
                  value={renewalBody}
                  onChange={setRenewalBody}
                  multiline={6}
                  autoComplete="off"
                  placeholder="Available variables: FIRST_NAME, NEXT_CHARGE_DATE, MEMBERSHIP_TIER, FREQUENCY_NUMBER, FREQUENCY_INTERVAL"
                />

                {/* Save Button */}
                <div style={{ marginTop: "1rem" }}>
                  <Button onClick={handleSaveRenewal}>
                    Save Renewal Settings
                  </Button>
                </div>
              </FormLayout>
            </Card>
          </div>
        </div>
        </div>

    </>
  );
}
