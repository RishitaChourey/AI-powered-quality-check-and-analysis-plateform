describe("Video Upload Flow", () => {
  it("uploads a video and displays output", () => {
    cy.visit("http://localhost:3000");

    cy.get("input[type=file]").selectFile("cypress/fixtures/sample.mp4");
    cy.contains("Upload").click();

    cy.contains("Processing...").should("exist");
    cy.contains("Annotated Video").should("exist");
  });
});
