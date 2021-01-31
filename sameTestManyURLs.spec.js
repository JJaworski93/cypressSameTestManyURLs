/// <reference types="cypress" />

describe('Performing same automation test set on many different URLs', () => {


    const expectedSiteVersion = '987654321';

    const envConfig = Cypress.env();
    const envKeys = Object.keys(envConfig);

    for (const key of envKeys) {
    const env = envConfig[key];

    // if you want to perform test only on url1.com you can use:
    // const key = '';
    // const env = envConfig['URL1.com'];


    it(`test site version for: ${key}`, () => {
        cy.request(`${env.url}/site/version`)
            .its('body').should('include', expectedSiteVersion);
    })


    it(`login & bet placement test: ${key}`, () => {
        // in case of any browser related issue, we can create TODO and handle exception with:
        // TODO: remove this command, after firefox issue will be resolved
        cy.on('uncaught:exception', () => false);

        // inline {timeout: 15000} or {force: true} is not always necessary and should be avoided if possible
        // first we check login function for all URLs
        cy.visit(`${env.url}`);
        cy.get('[href*="labelhost/login"]', { timeout: 15000 }).should("exist");
        cy.get('[href*="labelhost/login"]').click({force: true});
        cy.get('lh-login').should("exist");
        cy.get('#username').type(`${env.username}`);
        cy.get('#password').type(`${env.password}`);
        cy.get('.login').click();

        // we want to be sure that login window is closed after successful login
        cy.get('lh-login-dialog').should("not.exist");

        // after logging in, in case there are some additional checks for specific URL, we can use flags that we set up in cypress.json file:
        if (env.requiresPaymentHistory) {
            cy.get('#monthly-payment-hist').find('.btn').should("exist");
            cy.get('#monthly-payment-hist').find('.btn').click();
        }

        if (env.requiresAccVerificationCH) {
            cy.get('.dlg-verification').find('.btn-light').should("exist");
            cy.get('.dlg-verification').find('.btn-light').click();
        }

        // now we can perform regular tests on all URLs
        // we want to be sure that page was loaded, so we can make a quick check:
        cy.get('.main-items').should("exist");

        // now let's say we test betting platforms and we want to place a bet with minimum stake on all the platforms
        cy.window()
            .its('clientConfig')
            .then((cfg) => {
                const minStake = cfg.msSportsUser.configSettings.minimumStake;
                console.log(minStake);
                cy.get('.grid-option').should("exist");
                cy.get('.grid-option').eq(0).click();
                cy.get('.stake-input-value').should("exist");
                cy.get('.stake-input-value').type(minStake);
                cy.get('#betplacement-btn').click();
                cy.get('#betplacement-msg').contains('Bet placement successful');
            })
        })

    }
})
