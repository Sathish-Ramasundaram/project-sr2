Core pending items for a strong demo:

Complete checkout backend flow:
create order
create order_items
payment success update
clear cart

Move stock/sales updates to payment-success (not add-to-cart).

Admin sales from real order/payment data (date filters already ready in UI).

Admin stock management actions (add stock / adjust stock), persisted in DB.
If you complete these, this is a solid, demo-worthy full-stack project.

Optional polish (nice-to-have):

Order history page for customer.
Basic payment webhook simulation (success/failure).
A few e2e tests for checkout + admin stock flow.


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