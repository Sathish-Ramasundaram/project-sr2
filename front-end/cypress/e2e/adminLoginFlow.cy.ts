describe("Admin Login Flow", () => {
  const STEP_DELAY_MS = 900;
  const TYPE_DELAY_MS = 120;

  beforeEach(() => {
    cy.visit("http://localhost:3005/admin/login", {
      onBeforeLoad(win) {
        win.localStorage.removeItem("sr-store-admin-session");
      }
    });
    cy.wait(STEP_DELAY_MS);
  });

  it("shows error for invalid credentials", () => {
    cy.get("#admin-email").type("wrong@admin.com", { delay: TYPE_DELAY_MS });
    cy.wait(STEP_DELAY_MS);

    cy.get("#admin-password").type("wrongpass", { delay: TYPE_DELAY_MS });
    cy.wait(STEP_DELAY_MS);

    cy.contains("button", "Submit").click();
    cy.wait(STEP_DELAY_MS);

    cy.contains("Invalid admin credentials.").should("be.visible");
    cy.url().should("include", "/admin/login");
  });

  it("logs in with valid credentials and redirects to dashboard", () => {
    cy.get("#admin-email").type("admin@admin.com", { delay: TYPE_DELAY_MS });
    cy.wait(STEP_DELAY_MS);

    cy.get("#admin-password").type("1234", { delay: TYPE_DELAY_MS });
    cy.wait(STEP_DELAY_MS);

    cy.contains("button", "Submit").click();
    cy.wait(STEP_DELAY_MS);

    cy.url().should("include", "/admin/dashboard");
    cy.contains("Admin Dashboard").should("be.visible");

    cy.window().then((win) => {
      expect(win.localStorage.getItem("sr-store-admin-session")).to.equal("true");
    });
  });
});
