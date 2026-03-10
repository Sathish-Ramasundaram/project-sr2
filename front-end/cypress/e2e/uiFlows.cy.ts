describe("UI Flows", () => {
  const appUrl = "http://localhost:3005";

  it("shows 404 page for unknown route and navigates back home", () => {
    cy.visit(`${appUrl}/some-unknown-route`);
    cy.contains("404").should("be.visible");
    cy.contains("Page not found").should("be.visible");
    cy.contains("Go back to SR Store").click();
    cy.url().should("eq", `${appUrl}/`);
  });

  it("opens login chooser and routes to customer login with switch query", () => {
    cy.visit(appUrl);
    cy.contains("button", "Login").click();
    cy.contains("Choose Login").should("be.visible");
    cy.contains("Customer Login").click();
    cy.url().should("include", "/customer/login?switch=1");
    cy.contains("Customer Login").should("be.visible");
  });
});

