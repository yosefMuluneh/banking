# Appwrite migration: provider-independent registration and sandbox transfers

Apply these changes to the **Horizon Banking** Appwrite project before deploying this branch.

## Database

Database: `horizon_banking_db`  
Collection: `users`

1. Add a String attribute named `country` (maximum length 64) and make it **required**.
2. Change these existing String attributes from required to optional:
   - `address1`
   - `city`
   - `state`
   - `postalCode`
   - `dateOfBirth`
   - `ssn`
   - `dwollaCustomerId`
   - `dwollaCustomerUrl`
3. Keep `userId`, `email`, `firstName`, and `lastName` required.
4. Keep the unique `userId_idx` index.

Do not delete the legacy Dwolla attributes. The app stores the Dwolla customer ID and URL in these optional fields after sandbox onboarding.

## Sandbox-only Dwolla onboarding

- Plaid bank linking remains available independently of Dwolla.
- The Transfer Funds page offers a Dwolla onboarding action when the user has no Dwolla customer or has Plaid banks without Dwolla funding sources.
- The onboarding action is server-side and explicitly requires `DWOLLA_ENV=sandbox`.
- It creates a synthetic Dwolla personal customer using sandbox test values, then stores only `dwollaCustomerId` and `dwollaCustomerUrl` in the Appwrite user document.
- It does **not** store the synthetic address, date of birth, SSN, or test IP address in Appwrite.
- Existing Plaid-linked checking and savings accounts are converted to Dwolla processor tokens and attached as funding sources. Unsupported account types and provider failures are reported per bank and can be retried.
- Banks connected after onboarding continue to receive a Dwolla funding source through the existing Plaid Link exchange flow.

The UI clearly labels this as synthetic sandbox data. Never enter real personal information in this demo flow. It is not a real identity-verification process and must not be used to onboard real customers or initiate live transfers.

## Important security note

The application no longer collects SSN during registration. Existing SSN values, if any, may still exist in legacy attributes; do not use real customer data until sensitive fields and bank access tokens are encrypted and an appropriate data-retention policy is in place.

## What registration does

- Appwrite Auth remains the identity provider.
- A user profile is created without creating a Dwolla customer.
- Registration collects first name, last name, country, email, and password.
- US sandbox transfer setup happens separately and uses synthetic test data only.
