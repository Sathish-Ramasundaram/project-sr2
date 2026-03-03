describe("Theme Toggle", () => {
  const STEP_DELAY_MS = 800;

  it("toggles theme and keeps it across pages", () => {
    cy.visit("http://localhost:3005/");
    cy.wait(STEP_DELAY_MS);

    cy.get('button[aria-label="Switch to dark mode"]').click();
    cy.wait(STEP_DELAY_MS);

    cy.get("html").should("have.class", "dark");
    cy.get('button[aria-label="Switch to light mode"]').should("exist");
    cy.wait(STEP_DELAY_MS);

    cy.window().then((win) => {
      expect(win.localStorage.getItem("sr-store-theme")).to.equal("dark");
    });

    cy.contains("a", "Catalogue").click();
    cy.wait(STEP_DELAY_MS);

    cy.url().should("include", "/catalogue");
    cy.get("html").should("have.class", "dark");
    cy.get('button[aria-label="Switch to light mode"]').should("exist");
  });

  it("loads dark theme from localStorage on page load", () => {
    cy.visit("http://localhost:3005/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("sr-store-theme", "dark");
      }
    });
    cy.wait(STEP_DELAY_MS);

    cy.get("html").should("have.class", "dark");
    cy.get('button[aria-label="Switch to light mode"]').should("exist");
  });
});
