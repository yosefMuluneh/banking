# Appwrite migration: provider-independent registration

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

Do not delete the legacy Dwolla attributes yet. Existing US-linked users may still have values in them, and the current legacy Plaid/Dwolla flow checks `dwollaCustomerId`.

## Important security note

The application no longer collects SSN during registration. Existing SSN values, if any, are still stored in the old attribute; do not use real customer data until sensitive fields and bank access tokens are encrypted and an appropriate data-retention policy is in place.

## What this migration changes

- Appwrite Auth remains the identity provider.
- A user profile is created without creating a Dwolla customer.
- Registration collects only first name, last name, country, email, and password.
- Bank linking is hidden unless a legacy Dwolla customer is already linked to the profile.
- This does **not** make bank linking, deposits, or transfers internationally available. A provider must be selected and its country, product, and regulatory eligibility verified before those features are enabled.
