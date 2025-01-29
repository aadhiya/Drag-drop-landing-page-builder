describe('Landing Page Builder - Duplicate and Delete Blocks', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000'); // Ensure correct URL
      cy.get('.draggable-box').should('exist'); // Ensure blocks are loaded
    });
  
    it('Should duplicate a block successfully', () => {
      // Count initial number of blocks
      cy.get('.draggable-box').then(($blocks) => {
        const initialCount = $blocks.length;
  
        // Click the Duplicate button of the first block
        cy.get('.draggable-box').first().within(() => {
          cy.contains('Duplicate').should('be.visible').click();
        });
  
        // Verify the number of blocks increased by 1
        cy.get('.draggable-box').should('have.length', initialCount + 1);
      });
    });
  
    it('Should delete a block successfully', () => {
      // Count initial number of blocks
      cy.get('.draggable-box').then(($blocks) => {
        const initialCount = $blocks.length;
  
        // Click the Delete button of the first block
        cy.get('.draggable-box').first().within(() => {
          cy.contains('Delete').scrollIntoView().click({ force: true });
        });
  
        // Verify the number of blocks decreased by 1
        cy.get('.draggable-box').should('have.length', initialCount - 1);
      });
    });
  });
  