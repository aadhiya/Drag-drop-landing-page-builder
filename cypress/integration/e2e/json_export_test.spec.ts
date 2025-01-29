describe('Landing Page Builder - JSON Export', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000'); // Ensure correct URL
    });
  
    it('Should export correct JSON format on Save', () => {
      // Wait for blocks to load
      cy.get('.draggable-box').should('exist');
  
      // Step 1: Select the text block correctly
      cy.get('.draggable-box')
        .filter(':has(textarea)') // Ensure we only select text blocks
        .first()
        .as('textBlock');
  
      cy.get('@textBlock').within(() => {
        cy.get('textarea').should('exist').clear().type('Custom Text');
      });
  
      // Step 2: Select the image block correctly
      cy.get('.draggable-box')
        .filter(':has(select)') // Ensure we only select image blocks
        .first()
        .as('imageBlock');
  
      cy.get('@imageBlock').within(() => {
        cy.get('select').should('exist').select('Image 2'); // Ensure select exists before interacting
      });
  
      // Step 3: Click the Save button
      cy.contains('Save').should('exist').click();
  
      // Step 4: Verify console output
      cy.window().then((win) => {
        cy.spy(win.console, 'log').as('consoleLog');
      });
  
      cy.contains('Save').click().then(() => {
        cy.get('@consoleLog').should('be.calledWithMatch', 'Landing Page Data:');
      });
    });
  });
  