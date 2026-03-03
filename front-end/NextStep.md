Set up PostgreSQL + Hasura
Run Postgres and Hasura (Docker easiest).
Verify Hasura console opens.
Connect Hasura to Postgres.

Create DB schema first
Tables:
customers
products
inventory
cart_items
orders
order_items
payments
Add FK + unique constraints before app code.

Track tables in Hasura
Track all tables/relationships in Hasura metadata.
Confirm GraphQL schema is generated.

Add roles + permissions
Roles: customer, admin.
Row-level rules:
customer can only access own cart/orders/profile.
admin can access inventory/orders analytics.

Verify permissions end-to-end
Use API Explorer with headers:
customer role + customer UUID
admin role
Confirm customer cannot access others’ rows.

Define GraphQL operations
Create queries/mutations for:
products + inventory
cart CRUD
create order + order_items
payments read
admin stock update/dashboard reads

Add frontend GraphQL client
Create front-end/src/api/graphqlClient.ts
Endpoint from env: HASURA_GRAPHQL_URL
Pass auth headers (x-hasura-role, x-hasura-user-id for now in dev).

Integrate Redux-Saga with Hasura
Keep existing saga structure.
Add new sagas:
productsSaga
cartSaga
ordersSaga
inventorySaga
Wire in rootSaga.

Migrate screens incrementally
First: catalogue/customer-home reads from Hasura.
Then: cart persistence.
Then: checkout/order/payment flow.
Then: admin dashboard + stock updates.

Remove localStorage logic

Real-time
Add subscriptions for:
stock updates
order updates
dashboard live changes.

Tests
Unit test sagas and utilities.
Keep Cypress for E2E flows.
Add API error case tests.

Error handling
Standardize GraphQL error mapping in saga layer.
Add Sentry later for production monitoring.


Good catch.

Lambda is optional here because Hasura + PostgreSQL can handle most CRUD/business flows directly.

Use **Lambda** when you need custom backend logic, for example:
1. Payment gateway webhook verification
2. Custom auth/token issuance
3. Calling third-party APIs securely
4. Complex business rules not suitable in pure GraphQL mutation
5. Scheduled/background jobs

So recommended:
- Start with Hasura + Redux-Saga for core app.
- Add Lambda only for custom/secure workflows (especially payments).