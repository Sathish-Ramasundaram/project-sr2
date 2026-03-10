describe("Public Navigation", () => {
  const appUrl = "http://localhost:3005";

  it("navigates from home to catalogue", () => {
    cy.visit(appUrl);
    cy.contains("a", "Catalogue").click();
    cy.url().should("include", "/catalogue");
    cy.contains("Grocery Price List").should("be.visible");
  });

  it("navigates from home to faq", () => {
    cy.visit(appUrl);
    cy.contains("a", "FAQ").click();
    cy.url().should("include", "/faq");
    cy.contains("FAQ").should("be.visible");
    cy.contains("Enter your question and submit.").should("be.visible");
  });
});

