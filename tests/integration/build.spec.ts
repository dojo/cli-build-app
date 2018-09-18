function testUrl(dir: string, isDist: boolean, isPwa: boolean) {
	cy.visit(`/test-app/output/${dir}`);
	cy.get('#div').should(
		'contain',
		`Built with Build Time Render: true
Currently Rendered by BTR: false`
	);
	cy.get('#app-root').should('contain', 'Lazy Widget using dojorc configuration');
	cy.get('#div').should('have.css', 'background-color', 'rgba(0, 0, 0, 0.5)');
	cy.get('script[src^="lazy"]').should('exist');
	cy.get('script[src^="src/Foo"]').should('exist');
	cy.get('script[src^="src/RoutedWidget"]').should('exist');
	cy.get('script[src^="src/ChildRoutedWidget"]').should('not.exist');
	cy.get('#div[nodeenv=production]').should(isDist ? 'exist' : 'not.exist');
	cy.get('#div[has-prod=prod]').should(isDist ? 'exist' : 'not.exist');
	cy.get('#div[dojo-debug=true]').should(isDist ? 'not.exist' : 'exist');
	cy.get('#div[has-ci=ci]').should(isDist ? 'not.exist' : 'exist');

	cy.get('meta[name="mobile-web-app-capable"]').should(isPwa ? 'exist' : 'not.exist');
	cy.get('meta[name="apple-mobile-web-app-capable"]').should(isPwa ? 'exist' : 'not.exist');
	cy.get('meta[name="apple-mobile-web-app-title"]').should(isPwa ? 'exist' : 'not.exist');
	cy.get('meta[name="apple-mobile-web-app-status-bar-style"]').should(isPwa ? 'exist' : 'not.exist');
	cy.get('link[rel="apple-touch-icon"]').should('have.length', isPwa ? 2 : 0);
}

describe('build', () => {
	it('dist', () => {
		testUrl('dist-app', true, false);
		testUrl('dist-app-evergreen', true, false);
		testUrl('dist-pwa', true, true);
		testUrl('dist-pwa-evergreen', true, true);
	});

	it('dev', () => {
		testUrl('dev-app', false, false);
		testUrl('dev-app-evergreen', false, false);
		testUrl('dev-pwa', false, true);
		testUrl('dev-pwa-evergreen', false, true);
	});
});
