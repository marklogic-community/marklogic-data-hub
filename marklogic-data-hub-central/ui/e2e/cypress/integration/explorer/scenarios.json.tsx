/// <reference types="cypress"/>

import viewPage from '../../support/pages/view';
import browsePage from '../../support/pages/browse';
import detailPage from '../../support/pages/detail';
import homePage from "../../support/pages/home";
import { Application } from '../../support/application.config';
import { toolbar } from "../../support/components/common";
import 'cypress-wait-until';


describe('json scenario for snippet on browse documents page', () => {

  var facets: string[] = ['collection', 'flow'];

  //login with valid account and go to /browse page
  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.clickFacetView();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
  });

  it('select "all entities" verify docs, hub/entity properties', () => {
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should('be.greaterThan', 25);
    browsePage.getDocuments().each(function (item, i) {
      browsePage.getDocumentEntityName(i).should('exist');
      browsePage.getDocumentPKey(i).should('exist');
      browsePage.getDocumentPKeyValue(i).should('exist');
      browsePage.getDocumentSnippet(i).should('exist');
      browsePage.getDocumentCreatedOn(i).should('exist');
      browsePage.getDocumentSources(i).should('exist');
      browsePage.getDocumentFileType(i).should('exist');
    })
    facets.forEach(function (item) {
      browsePage.getFacet(item).should('exist');
      browsePage.getFacetItems(item).should('exist');
    })
      //Verify page number persists when navigating back from detail view
     browsePage.clickPaginationItem(2);
     browsePage.search('10256');
     browsePage.getTotalDocuments().should('be.equal', 1);
     browsePage.getInstanceViewIcon().click();
     detailPage.getInstanceView().should('exist');
     detailPage.getDocumentTable().should('exist');
     detailPage.clickBackButton();
     browsePage.getSelectedEntity().should('contain', 'All Entities');
     browsePage.getSelectedPaginationNumber().should('contain', '1');
     browsePage.getSearchText().should('have.value', '10256')
     browsePage.getFacetView().should('have.css', 'background-color', 'rgb(68, 73, 156)')
  });

  it('select Person entity and verify entity, docs, hub/entity properties', () => {
    browsePage.selectEntity('Person');
    browsePage.getSelectedEntity().should('contain', 'Person');
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should('be.greaterThan', 5);
    browsePage.getDocuments().each(function (item, i) {
      browsePage.getDocumentEntityName(i).should('exist');
      browsePage.getDocumentPKey(i).should('exist');
      browsePage.getDocumentPKeyValue(i).should('exist');
      browsePage.getDocumentSnippet(i).should('exist');
      browsePage.getDocumentCreatedOn(i).should('exist');
      browsePage.getDocumentSources(i).should('exist');
      browsePage.getDocumentFileType(i).should('exist');
    })
    facets.forEach(function (item) {
      browsePage.getFacet(item).should('exist');
      browsePage.getFacetItems(item).should('exist');
    })
  });

  it('apply facet search and verify docs, hub/entity properties', () => {
    browsePage.selectEntity('All Entities');
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    browsePage.getHubPropertiesExpanded();
    browsePage.getExpandableSnippetView();
    browsePage.getTotalDocuments().should('be.greaterThan', 25);
    browsePage.getShowMoreLink().first().click();
    browsePage.getFacetItemCheckbox('collection', 'Person').click();
    browsePage.getSelectedFacets().should('exist');
    browsePage.getGreySelectedFacets('Person').should('exist');
    browsePage.getFacetApplyButton().should('exist');
    browsePage.getClearGreyFacets().should('exist');
    browsePage.getFacetApplyButton().click();
    browsePage.getTotalDocuments().should('be.equal', 14);
    browsePage.getClearAllButton().should('exist');
    browsePage.getFacetSearchSelectionCount('collection').should('contain', '1');
    browsePage.clearFacetSearchSelection('Person');
  });

  it('apply facet search and clear individual grey facet', () => {
    browsePage.selectEntity('All Entities');
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should('be.greaterThan', 25);
    browsePage.getShowMoreLink().first().click();
    browsePage.getFacetItemCheckbox('collection', 'Person').click();
    browsePage.getGreySelectedFacets('Person').click();
    browsePage.getTotalDocuments().should('be.greaterThan', 25);
  });

  it('apply facet search and clear all grey facets', () => {
    browsePage.selectEntity('All Entities');
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should('be.greaterThan', 25);
    browsePage.getShowMoreLink().first().click();
    browsePage.getFacetItemCheckbox('collection', 'Person').click();
    browsePage.getFacetItemCheckbox('collection', 'Customer').click();
    browsePage.getGreySelectedFacets('Person').should('exist');
    browsePage.getGreySelectedFacets('Customer').should('exist');
    browsePage.getClearGreyFacets().click();
    browsePage.getTotalDocuments().should('be.greaterThan', 25);
  });

  it('search for a simple text/query and verify content', () => {
    browsePage.search('Powers');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getDocumentEntityName(0).should('exist');
    //browsePage.getDocumentId(0).should('exist');
    browsePage.getDocumentSnippet(0).should('exist');
    browsePage.getDocumentCreatedOn(0).should('exist');
    browsePage.getDocumentSources(0).should('exist');
    browsePage.getDocumentFileType(0).should('exist')
  });

  it('verify instance view of the document with pk', () => {
    browsePage.search('Powers');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getInstanceViewIcon().click();
    detailPage.getInstanceView().should('exist');
    detailPage.getDocumentTimestamp().should('exist');
    detailPage.getDocumentID().should('contain', '104');
    detailPage.getDocumentSource().should('contain', 'loadCustomersJSON');
    detailPage.getDocumentFileType().should('contain', 'json');
    detailPage.getDocumentTable().should('exist');
    detailPage.getDocumentEntity().should('contain', 'Customer');

  });

  it('verify instance view of the document without pk', () => {
    browsePage.search('1990 Taylor St');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getInstanceViewIcon().click();
    detailPage.getInstanceView().should('exist');
    detailPage.getDocumentEntity().should('contain', 'Person');
    detailPage.getDocumentTimestamp().should('exist');
    detailPage.getDocumentSource().should('contain', 'loadPersonJSON');
    detailPage.getDocumentFileType().should('contain', 'json');
    detailPage.getDocumentTable().should('exist');
    detailPage.getDocumentUri().should('contain', '/json/persons/last-name-dob-custom1.json');
  });

  it('verify source view of the document', () => {
    browsePage.search('Powers');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getSourceViewIcon().click();
    detailPage.getSourceView().click();
    detailPage.getDocumentJSON().should('exist');
  });

});


describe('json scenario for table on browse documents page', () => {

  var facets: string[] = ['collection', 'flow'];

  //login with valid account and go to /browse page
  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForTableToLoad();
  });

  it('select "all entities" and verify table default columns', () => {
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    browsePage.getHubPropertiesExpanded();
    browsePage.getExpandableTableView();
    browsePage.getTotalDocuments().should('be.greaterThan', 25)
    browsePage.getColumnTitle(2).should('contain', 'Identifier');
    browsePage.getColumnTitle(3).should('contain', 'Entity');
    browsePage.getColumnTitle(4).should('contain', 'File Type');
    browsePage.getColumnTitle(5).should('contain', 'Created');

    facets.forEach(function (item) {
      browsePage.getFacet(item).should('exist');
      browsePage.getFacetItems(item).should('exist');
    })
  });

  it('select "all entities" and verify table', () => {
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should('be.greaterThan', 25)
    //check table rows
    browsePage.getTableRows().should('have.length', 20);
    //check table columns
    browsePage.getTableColumns().should('have.length', 5);
  });

  it('select Person entity and verify table', () => {
    browsePage.selectEntity('Person');
    browsePage.getSelectedEntity().should('contain', 'Person');
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should('be.greaterThan', 5)
    //check table rows
    browsePage.getTableRows().should('have.length', 14);
    //check table columns
    browsePage.getTableColumns().should('to.have.length.of.at.most', 6);
  });


  it('search for a simple text/query and verify content', () => {
    browsePage.search('Alice');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getTableRows().should('have.length', 1);
  });

  it('verify instance view of the document without pk', () => {
    browsePage.selectEntity('Person');
    browsePage.search('Alice');
    browsePage.getFacetItemCheckbox('fname', 'Alice').click();
    browsePage.getGreySelectedFacets('Alice').should('exist');
    browsePage.getFacetApplyButton().click();
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getTableViewInstanceIcon().click();
    detailPage.getInstanceView().should('exist');
    detailPage.getDocumentEntity().should('contain', 'Person');
    detailPage.getDocumentUri().should('contain', '/json/persons/last-name-dob-custom1.json');
    detailPage.getDocumentTimestamp().should('exist');
    detailPage.getDocumentSource().should('contain', 'loadPersonJSON');
    detailPage.getDocumentFileType().should('contain', 'json');
    detailPage.getDocumentTable().should('exist');
    //Verify navigating back from detail view should persist search options
    detailPage.clickBackButton();
    browsePage.getSelectedEntity().should('contain', 'Person');
    browsePage.getClearFacetSearchSelection('Alice').should('exist');
    browsePage.getSearchText().should('have.value', 'Alice')
    browsePage.getTableView().should('have.css', 'background-color', 'rgb(68, 73, 156)')
  });

  it('verify instance view of the document with pk', () => {
    browsePage.search('10248');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getTableViewInstanceIcon().click();
    detailPage.getInstanceView().should('exist');
    detailPage.getDocumentEntity().should('contain', 'Order');
    detailPage.getDocumentID().should('contain', '10248');
    detailPage.getDocumentTimestamp().should('exist');
    detailPage.getDocumentSource().should('contain', 'ingest-orders');
    detailPage.getDocumentFileType().should('contain', 'json');
    detailPage.getDocumentTable().should('exist');
  });

  it('verify source view of the document', () => {
    browsePage.selectEntity('Customer');
    browsePage.search('Adams Cole');
    browsePage.getFacetItemCheckbox('name', 'loadCustomersJSON').click();
    browsePage.getGreySelectedFacets('loadCustomersJSON').should('exist');
    browsePage.getFacetApplyButton().click();
    browsePage.getTotalDocuments().should('be.equal', 2);
    browsePage.getTableViewSourceIcon().click();
    detailPage.getSourceView().click();
    detailPage.getDocumentJSON().should('exist');
    detailPage.getDocumentEntity().should('contain', 'Customer');
    detailPage.getDocumentTimestamp().should('exist');
    detailPage.getDocumentSource().should('contain', 'loadCustomersJSON');
    detailPage.getDocumentFileType().should('contain', 'json');
    //Verify navigating back from detail view should persist search options
    detailPage.clickBackButton();
    browsePage.getSelectedEntity().should('contain', 'Customer');
    browsePage.getClearFacetSearchSelection('loadCustomersJSON').should('exist');
    browsePage.getSearchText().should('have.value', 'Adams Cole');
    browsePage.getTableView().should('have.css', 'background-color', 'rgb(68, 73, 156)');
  });

  it('search for multiple facets, switch to snippet view, delete a facet, switch to table view, verify search query', () => {
    browsePage.selectEntity('Customer');
    browsePage.getSelectedEntity().should('contain', 'Customer');
    browsePage.getFacetItemCheckbox('name', 'Adams Cole').click();
    browsePage.getFacetItemCheckbox('email', 'adamscole@nutralab.com').click();
    browsePage.getSelectedFacets().should('exist');
    browsePage.getGreySelectedFacets('Adams Cole').should('exist');
    browsePage.getFacetApplyButton().click();
    browsePage.clickFacetView();
    browsePage.getClearFacetSearchSelection('Adams Cole').should('contain', 'name: Adams Cole');
    browsePage.getClearFacetSearchSelection('adamscole@nutralab.com').should('exist');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.clearFacetSearchSelection('adamscole@nutralab.com')
    browsePage.clickTableView();
    browsePage.getClearFacetSearchSelection('Adams Cole').should('exist');
    browsePage.getTotalDocuments().should('be.equal', 2);
  });

});
