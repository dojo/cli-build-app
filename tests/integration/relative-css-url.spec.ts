describe('relative-css-url', () => {
	function testUrl(dir: string) {
		cy.visit(`/test-app/output/${dir}`);
		cy.get('#div').should(
			'contain',
			`Built with Build Time Render: true
Currently Rendered by BTR: false`
		);
		cy.get('i.fab').should('have.css', 'font-family', '"Font Awesome 5 Brands"');
	}

	it('dist', () => {
		testUrl('dist-app');
		testUrl('dist-app-evergreen');
		testUrl('dist-pwa');
		testUrl('dist-pwa-evergreen');
	});

	it('dev', () => {
		testUrl('dev-app');
		testUrl('dev-app-evergreen');
		testUrl('dev-pwa');
		testUrl('dev-pwa-evergreen');
	});
});
