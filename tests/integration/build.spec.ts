describe('build', () => {
	function testUrl(dir: string, isDist: boolean, isPwa: boolean) {
		cy.visit(`/test-app/output/${dir}/`);
		cy.get('#app-root').should('contain', 'Lazy Widget using dojorc configuration');
		cy.get('#div').should('have.css', 'background-color', 'rgba(0, 0, 0, 0.5)');
		cy.get('#vars').should('have.css', 'outline-color', 'rgba(255, 0, 0, 0.5)');
		cy.get('link[href^="lazy"]').should('exist');
		cy.get('link[href^="widgets"]').should('exist');
		cy.get('link[href^="src/Foo"]').should('exist');
		cy.get('link[href^="src/RoutedWidget"]').should('exist');
		cy.get('link[href^="ignored"]').should('not.exist');
		cy.get('#div[nodeenv=production]').should(isDist ? 'exist' : 'not.exist');
		cy.get('#div[has-prod=prod]').should(isDist ? 'exist' : 'not.exist');
		cy.get('#div[dojo-debug=true]').should(isDist ? 'not.exist' : 'exist');
		cy.get('#div[has-ci=ci]').should(isDist ? 'not.exist' : 'exist');
		cy.get('#div').should(
			'contain',
			`Built with Build Time Render: true
Currently Rendered by BTR: false`
		);

		cy.get('meta[name="mobile-web-app-capable"]').should(isPwa ? 'exist' : 'not.exist');
		cy.get('meta[name="apple-mobile-web-app-capable"]').should(isPwa ? 'exist' : 'not.exist');
		cy.get('meta[name="apple-mobile-web-app-title"]').should(isPwa ? 'exist' : 'not.exist');
		cy.get('meta[name="apple-mobile-web-app-status-bar-style"]').should(isPwa ? 'exist' : 'not.exist');
		cy.get('link[rel="apple-touch-icon"]').should('have.length', isPwa ? 2 : 0);

		cy.get('#nodeBtr').should('contain', 'hello from a text file');
		cy.get('#nodeBtrCache').should('contain', 'hello from a text file');
	}

	describe('dist', () => {
		it('dist-app', () => {
			testUrl('dist-app', true, false);
		});
		it('dist-app-evergreen', () => {
			testUrl('dist-app-evergreen', true, false);
		});
		it('dist-pwa', () => {
			testUrl('dist-pwa', true, true);
		});
		it('dist-pwa-evergreen', () => {
			testUrl('dist-pwa-evergreen', true, true);
		});
	});

	describe('dev', () => {
		it('dev-app', () => {
			testUrl('dev-app', false, false);
		});
		it('dev-app-evergreen', () => {
			testUrl('dev-app-evergreen', false, false);
		});
		it('dev-pwa', () => {
			testUrl('dev-pwa', false, true);
		});
		it('dev-pwa-evergreen', () => {
			testUrl('dev-pwa-evergreen', false, true);
		});
	});

	describe('css variables', () => {
		it('correctly inlines and resolves external variables for legacy builds', () => {
			cy.request('/test-app/output/dev-app/main.css').then((response) => {
				const css = response.body;
				expect(css).to.contain('color:var(--foreground-color);');
				expect(css).to.contain('color:#00f;');
				expect(css).to.contain('color:var(--primary);');
				expect(css).to.contain('color:red;');
			});
		});
		it('correctly inlines and resolves external variables for evergreen builds', () => {
			cy.request('/test-app/output/dev-app-evergreen/main.css').then((response) => {
				const css = response.body;
				expect(css).to.contain('color:var(--foreground-color);');
				expect(css).to.contain('color:#00f;');
				expect(css).to.contain('color:var(--primary);');
				expect(css).to.contain('color:red;');
			});
		});
	});

	describe('static only features', () => {
		it('ignores add calls for static only features', () => {
			cy.request('/test-app/output/dev-app-evergreen/bootstrap.js').then((response) => {
				const js = response.body;

				expect(js).to.contain("add('build-elide', false);");
			});
		});
	});
});
