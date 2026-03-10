describe("Auth Pages", () => {
  const appUrl = "http://localhost:3005";

  it("opens customer login page and shows expected fields", () => {
    cy.visit(`${appUrl}/customer/login`);
    cy.contains("Customer Login").should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.contains("Forgot Password").should("be.visible");
    cy.contains("Create Account").should("be.visible");
  });

  it("opens admin login page and shows expected fields", () => {
    cy.visit(`${appUrl}/admin/login`);
    cy.contains("Admin Login").should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.contains("Submit").should("be.visible");
  });
});

