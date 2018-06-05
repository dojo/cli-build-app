describe('build', () => {
	it('dist', () => {
		cy.visit('/test-app/output/dist');
		cy.get('#div').should(
			'contain',
			`Built with Build Time Render: true
Currently Rendered by BTR: false`
		);
		cy.get('#app-root').should('contain', 'Lazy Widget using dojorc configuration');
		cy.get('script[src^="lazy"]').should('exist');
		cy.get('script[src^="src/Foo"]').should('exist');

		cy.visit('/test-app/output/dist-evergreen');
		cy.get('#div').should(
			'contain',
			`Built with Build Time Render: true
Currently Rendered by BTR: false`
		);
		cy.get('#app-root').should('contain', 'Lazy Widget using dojorc configuration');
		cy.get('script[src^="lazy"]').should('exist');
		cy.get('script[src^="src/Foo"]').should('exist');
		cy.get('meta[name="mobile-web-app-capable"]').should('exist');
		cy.get('meta[name="apple-mobile-web-app-capable"]').should('exist');
	});

	it('dev', () => {
		cy.visit('/test-app/output/dev');
		cy.get('#div').should(
			'contain',
			`Built with Build Time Render: true
Currently Rendered by BTR: false`
		);
		cy.get('#app-root').should('contain', 'Lazy Widget using dojorc configuration');
		cy.get('script[src^="lazy"]').should('exist');
		cy.get('script[src^="src/Foo"]').should('exist');

		cy.visit('/test-app/output/dev-evergreen');
		cy.get('#div').should(
			'contain',
			`Built with Build Time Render: true
Currently Rendered by BTR: false`
		);
		cy.get('#app-root').should('contain', 'Lazy Widget using dojorc configuration');
		cy.get('script[src^="lazy"]').should('exist');
		cy.get('script[src^="src/Foo"]').should('exist');
		cy.get('meta[name="mobile-web-app-capable"]').should('exist');
		cy.get('meta[name="apple-mobile-web-app-capable"]').should('exist');
	});
});
