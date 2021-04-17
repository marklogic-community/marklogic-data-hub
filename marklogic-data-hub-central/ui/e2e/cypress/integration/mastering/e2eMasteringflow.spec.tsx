import {Application} from "../../support/application.config";
import loadPage from "../../support/pages/load";
import runPage from "../../support/pages/run";
import LoginPage from "../../support/pages/login";
import {
  entityTypeModal,
  entityTypeTable,
  propertyModal,
  propertyTable,
} from "../../support/components/model/index";
import modelPage from "../../support/pages/model";
import {confirmationModal, createEditStepDialog, multiSlider, toolbar, tiles} from "../../support/components/common/index";
import {ConfirmationType} from "../../support/types/modeling-types";
import curatePage from "../../support/pages/curate";
import {
  createEditMappingDialog,
  mappingStepDetail
} from "../../support/components/mapping/index";
import {matchingStepDetail, rulesetSingleModal, thresholdModal} from "../../support/components/matching/index";
import mergingStepDetail from "../../support/components/merging/merging-step-detail";
import mergeStrategyModal from "../../support/components/merging/merge-strategy-modal";
import mergeRuleModal from "../../support/components/merging/merge-rule-modal";
import browsePage from "../../support/pages/browse";

const loadStepName = "loadPatient";
const flowName= "patientFlow";
const mapStep = "patientMap";
const matchStep = "patientMatch";
const mergeStep = "patientMerge";

describe("Validate E2E Mastering Flow", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });
  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer", "hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest();
    cy.waitForAsyncRequest();
    cy.intercept("/api/jobs/**").as("getJobs");
  });
  afterEach(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  after(() => {
    cy.loginAsDeveloper().withRequest();
    cy.deleteSteps("ingestion", "loadPatient");
    cy.deleteSteps("mapping", "patientMap");
    cy.deleteSteps("matching", "patientMatch");
    cy.deleteSteps("merging", "patientMerge");
    cy.deleteFlows("patientFlow");
    cy.deleteEntities("Patient");
    cy.deleteRecordsInFinal("loadPatient", "patientMap", "patientMatch", "patientMerge");
    cy.deleteRecordsInFinal("sm-Patient-archived", "sm-Patient-mastered", "sm-Patient-merged", "sm-Patient-auditing", "sm-Patient-notification");
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Create a load Step", () => {
    cy.waitUntil(() => toolbar.getLoadToolbarIcon()).click();
    cy.waitUntil(() => loadPage.stepName("ingestion-step").should("be.visible"));
    loadPage.loadView("th-large").click();
    loadPage.addNewButton("card").click();
    loadPage.stepNameInput().type(loadStepName);
    loadPage.stepDescriptionInput().type(`${loadStepName} description`);
    loadPage.stepSourceNameInput().type("patientSourceName");
    loadPage.stepSourceNameType().type("patientSourceType");
    loadPage.uriPrefixInput().type("/patient/");
    loadPage.saveButton().click();
    cy.findByText(loadStepName).should("be.visible");
  });
  it("Add load Step to New Flow", () => {
    loadPage.addStepToNewFlow(loadStepName);
    cy.waitForAsyncRequest();
    cy.findByText("New Flow").should("be.visible");
    runPage.setFlowName(flowName);
    runPage.setFlowDescription(`${flowName} description`);
    loadPage.confirmationOptions("Save").click();
    cy.waitForAsyncRequest();
    cy.verifyStepAddedToFlow("Load", loadStepName, flowName);
    runPage.runStep(loadStepName);
    cy.waitUntil(() => cy.get("input[type=\"file\"]"));
    cy.get("input[type=\"file\"]").attachFile(["patients/first-name-double-metaphone1.json", "patients/first-name-double-metaphone2.json", "patients/first-name-synonym1.json", "patients/first-name-synonym2.json", "patients/last-name-address-reduce1.json", "patients/last-name-address-reduce2.json", "patients/last-name-dob-custom1.json", "patients/last-name-dob-custom2.json", "patients/last-name-plus-zip-boost1.json", "patients/last-name-plus-zip-boost2.json", "patients/last-name-slight-match1.json", "patients/last-name-slight-match2.json", "patients/ssn-match1.json", "patients/ssn-match2.json"], {force: true});
    cy.waitForAsyncRequest();
    Cypress.config("defaultCommandTimeout", 120000);
    cy.wait("@getJobs").its("response.statusCode").should("eq", 200);
    Cypress.config("defaultCommandTimeout", 10000);
    cy.verifyStepRunResult("success", "Ingestion", loadStepName);
    //Verify step name appears as a collection facet in explorer
    runPage.explorerLink().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForCardToLoad();
    browsePage.getTotalDocuments().should("eq", 14);
    browsePage.getFacet("collection").should("exist");
    browsePage.getFacetItemCheckbox("collection", loadStepName).should("to.exist");
  });
  it("Create a new entity", () => {
    cy.waitUntil(() => toolbar.getModelToolbarIcon()).click();
    entityTypeTable.waitForTableToLoad();
    cy.waitUntil(() => modelPage.getAddEntityButton()).click();
    entityTypeModal.newEntityName("Patient");
    entityTypeModal.newEntityDescription("An entity for patients");
    entityTypeModal.getAddButton().click();
  });
  it("Add properties", () => {
    propertyTable.getAddPropertyButton("Patient").should("be.visible").click();
    propertyModal.newPropertyName("FirstName");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getAddPropertyButton("Patient").should("be.visible").click();
    propertyModal.newPropertyName("LastName");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getAddPropertyButton("Patient").should("be.visible").click();
    propertyModal.newPropertyName("SSN");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getAddPropertyButton("Patient").should("be.visible").click();
    propertyModal.newPropertyName("ZipCode");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getAddPropertyButton("Patient").should("be.visible").click();
    propertyModal.newPropertyName("Address");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("string").click();
    propertyModal.getSubmitButton().click();
    propertyTable.getAddPropertyButton("Patient").should("be.visible").click();
    propertyModal.newPropertyName("DateOfBirth");
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown("More date types").click();
    propertyModal.getCascadedTypeFromDropdown("date").click();
    propertyModal.getSubmitButton().click();
  });
  it("Save Patient entity", () => {
    entityTypeTable.getSaveEntityIcon("Patient").click();
    confirmationModal.getSaveEntityText().should("be.visible");
    confirmationModal.getYesButton(ConfirmationType.SaveEntity).click();
    confirmationModal.getSaveEntityText().should("exist");
    confirmationModal.getSaveEntityText().should("not.exist");
  });
  it("Create mapping step", () => {
    toolbar.getCurateToolbarIcon().click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Patient").should("be.visible"));
    curatePage.toggleEntityTypeId("Patient");
    cy.waitUntil(() => curatePage.addNewStep().click());
    createEditMappingDialog.setMappingName(mapStep);
    createEditMappingDialog.setMappingDescription("An order mapping with custom interceptors");
    createEditMappingDialog.setCollectionInput(loadStepName);
    createEditMappingDialog.saveButton().click({force: true});
    cy.waitForAsyncRequest();
    cy.waitUntil(() => curatePage.dataPresent().should("be.visible"));
    curatePage.verifyStepDetailsOpen(mapStep);
  });
  it("Map source to entity", () => {
    mappingStepDetail.setXpathExpressionInput("FirstName", "FirstName");
    mappingStepDetail.setXpathExpressionInput("LastName", "LastName");
    mappingStepDetail.setXpathExpressionInput("SSN", "SSN");
    mappingStepDetail.setXpathExpressionInput("ZipCode", "ZipCode");
    mappingStepDetail.setXpathExpressionInput("Address", "Address");
    mappingStepDetail.setXpathExpressionInput("DateOfBirth", "DateOfBirth");
    curatePage.dataPresent().should("be.visible");
    mappingStepDetail.expandSource().click({force: true});
    // Test the mappings
    cy.waitUntil(() => mappingStepDetail.testMap().should("be.enabled"));
    cy.waitUntil(() => mappingStepDetail.expandEntity()).click();
    mappingStepDetail.testMap().click();
    mappingStepDetail.goBackToCurateHomePage();
  });
  it("Add Map step to existing flow Run", () => {
    curatePage.toggleEntityTypeId("Patient");
    curatePage.runStepInCardView(mapStep).click();
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    Cypress.config("defaultCommandTimeout", 120000);
    cy.wait("@getJobs").its("response.statusCode").should("eq", 200);
    Cypress.config("defaultCommandTimeout", 10000);
    cy.verifyStepRunResult("success", "Mapping", mapStep);
    //Explore Mapped data
    runPage.explorerLink().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForTableToLoad();
    browsePage.getTotalDocuments().should("eq", 14);
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacet("collection").should("exist");
    browsePage.getFacetItemCheckbox("collection", mapStep).should("to.exist");
  });
  it("Create a new match step", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Patient").should("be.visible"));
    curatePage.toggleEntityTypeId("Patient");
    curatePage.selectMatchTab("Patient");
    curatePage.addNewStep().should("be.visible").click();
    createEditStepDialog.stepNameInput().type(matchStep);
    createEditStepDialog.stepDescriptionInput().type("match patient step example", {timeout: 2000});
    createEditStepDialog.setCollectionInput(mapStep);
    createEditStepDialog.saveButton("matching").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(matchStep);
  });
  it("Add Thresholds", () => {
    curatePage.openStepDetails(matchStep);
    matchingStepDetail.addThresholdButton().click();
    thresholdModal.setThresholdName("Match");
    thresholdModal.selectActionDropdown("Merge");
    thresholdModal.saveButton().click();
    cy.waitForAsyncRequest();
    multiSlider.getHandleName("Match").trigger("mousedown", {force: true});
    cy.findByTestId("threshold-slider-ticks").find(`div[style*="left: 18.1818%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("Match").trigger("mouseup", {force: true});
    cy.waitForAsyncRequest();
    matchingStepDetail.addThresholdButton().click();
    thresholdModal.setThresholdName("Likely Match");
    thresholdModal.selectActionDropdown("Notify");
    thresholdModal.saveButton().click();
    cy.waitForAsyncRequest();
    multiSlider.getHandleName("Likely Match").trigger("mousedown", {force: true});
    cy.findByTestId("threshold-slider-ticks").find(`div[style*="left: 8.08081%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("Likely Match").trigger("mouseup", {force: true});
    cy.waitForAsyncRequest();
    matchingStepDetail.addThresholdButton().click();
    thresholdModal.setThresholdName("Slight Match");
    thresholdModal.selectActionDropdown("Custom");
    thresholdModal.setUriText("/custom-modules/custom/custom-match-action.sjs");
    thresholdModal.setFunctionText("customMatch");
    thresholdModal.saveButton().click();
    cy.waitForAsyncRequest();
    multiSlider.getHandleName("Slight Match").trigger("mousedown", {force: true});
    cy.findByTestId("threshold-slider-ticks").find(`div[style*="left: 3.0303%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("Slight Match").trigger("mouseup", {force: true});
    cy.waitForAsyncRequest();
  });
  it("Add Rulesets", () => {
    matchingStepDetail.addNewRulesetSingle();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectPropertyToMatch("LastName");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    multiSlider.getHandleName("LastName").trigger("mousedown", {force: true});
    cy.findByTestId("threshold-slider-ticks").find(`div[style*="left: 9.09091%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("LastName").trigger("mouseup", {force: true});
    cy.waitForAsyncRequest();
    matchingStepDetail.addNewRulesetSingle();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectPropertyToMatch("SSN");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    multiSlider.getHandleName("SSN").trigger("mousedown", {force: true});
    cy.findByTestId("threshold-slider-ticks").find(`div[style*="left: 19.1919%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("SSN").trigger("mouseup", {force: true});
    cy.waitForAsyncRequest();
    matchingStepDetail.addNewRulesetSingle();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectPropertyToMatch("FirstName");
    rulesetSingleModal.selectMatchTypeDropdown("doubleMetaphone");
    rulesetSingleModal.setDictionaryUri("/dictionary/first-names.xml");
    rulesetSingleModal.setDistanceThreshold("100");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    multiSlider.getHandleName("FirstName").trigger("mousedown", {force: true});
    cy.findByTestId("threshold-slider-ticks").find(`div[style*="left: 9.09091%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("FirstName").trigger("mouseup", {force: true});
    cy.waitForAsyncRequest();
    matchingStepDetail.addNewRulesetSingle();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectPropertyToMatch("DateOfBirth");
    rulesetSingleModal.selectMatchTypeDropdown("custom");
    rulesetSingleModal.setUriText("/custom-modules/custom/dob-match.xqy");
    rulesetSingleModal.setFunctionText("dob-match");
    rulesetSingleModal.setNamespaceText("http://marklogic.com/smart-mastering/algorithms");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    multiSlider.getHandleName("DateOfBirth").trigger("mousedown", {force: true});
    cy.findByTestId("threshold-slider-ticks").find(`div[style*="left: 9.09091%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("DateOfBirth").trigger("mouseup", {force: true});
    cy.waitForAsyncRequest();
    matchingStepDetail.addNewRulesetSingle();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectPropertyToMatch("FirstName");
    rulesetSingleModal.selectMatchTypeDropdown("synonym");
    rulesetSingleModal.setThesaurus("/thesaurus/nicknames.xml");
    rulesetSingleModal.saveButton().click();
    cy.wait(1000);
    cy.waitForAsyncRequest();
    cy.findAllByTestId("FirstName-active").eq(1).trigger("mousedown", {force: true});
    cy.findByTestId("threshold-slider-ticks").find(`div[style*="left: 9.09091%;"]`).trigger("mousemove", {force: true});
    cy.findAllByTestId("FirstName-active").eq(1).trigger("mouseup", {force: true});
    cy.waitForAsyncRequest();
    matchingStepDetail.addNewRulesetSingle();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectPropertyToMatch("ZipCode");
    rulesetSingleModal.selectMatchTypeDropdown("zip");
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    multiSlider.getHandleName("ZipCode").trigger("mousedown", {force: true});
    cy.findByTestId("threshold-slider-ticks").find(`div[style*="left: 9.09091%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("ZipCode").trigger("mouseup", {force: true});
    cy.waitForAsyncRequest();
    matchingStepDetail.addNewRulesetSingle();
    matchingStepDetail.getSinglePropertyOption();
    rulesetSingleModal.selectPropertyToMatch("Address");
    rulesetSingleModal.selectMatchTypeDropdown("exact");
    rulesetSingleModal.reduceButton().click();
    rulesetSingleModal.saveButton().click();
    cy.waitForAsyncRequest();
    multiSlider.getHandleName("Address").trigger("mousedown", {force: true});
    cy.findByTestId("threshold-slider-ticks").find(`div[style*="left: 4.0404%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("Address").trigger("mouseup", {force: true});
    cy.waitForAsyncRequest();
    mappingStepDetail.goBackToCurateHomePage();
  });
  it("Add Match step to existing flow Run", () => {
    curatePage.toggleEntityTypeId("Patient");
    curatePage.selectMatchTab("Patient");
    curatePage.runStepInCardView(matchStep).click();
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    Cypress.config("defaultCommandTimeout", 120000);
    cy.wait("@getJobs").its("response.statusCode").should("eq", 200);
    Cypress.config("defaultCommandTimeout", 10000);
    cy.verifyStepRunResult("success", "Matching", matchStep);
    tiles.closeRunMessage();
  });
  it("Create a new merge step ", () => {
    cy.waitUntil(() => toolbar.getCurateToolbarIcon()).click();
    cy.waitUntil(() => curatePage.getEntityTypePanel("Patient").should("be.visible"));
    curatePage.toggleEntityTypeId("Patient");
    curatePage.selectMergeTab("Patient");
    curatePage.addNewStep().should("be.visible").click();
    createEditStepDialog.stepNameInput().type(mergeStep, {timeout: 2000});
    createEditStepDialog.stepDescriptionInput().type("merge patient step example", {timeout: 2000});
    createEditStepDialog.setCollectionInput(matchStep);
    createEditStepDialog.saveButton("merging").click();
    cy.waitForAsyncRequest();
    curatePage.verifyStepNameIsVisible(mergeStep);
  });
  it("Add strategy", () => {
    curatePage.openStepDetails(mergeStep);
    mergingStepDetail.addStrategyButton().click();
    mergeStrategyModal.setStrategyName("retain-single-value");
    mergeStrategyModal.addSliderOptionsButton().click();
    multiSlider.getHandleName("Length").should("be.visible");
    multiSlider.getHandleName("Length").trigger("mousedown", {force: true});
    cy.findByTestId("undefined-slider-ticks").find(`div[style*="left: 9.09091%;"]`).trigger("mousemove", {force: true});
    multiSlider.getHandleName("Length").trigger("mouseup", {force: true});
    mergeStrategyModal.maxValue("1");
    mergeStrategyModal.saveButton().click();
    cy.waitForAsyncRequest();
    cy.waitUntil(() => cy.findAllByText("retain-single-value").should("have.length.gt", 0));
    cy.findByText("retain-single-value").should("exist");
  });
  it("add merge rules ", () => {
    mergingStepDetail.addMergeRuleButton().click();
    mergeRuleModal.selectPropertyToMerge("Address");
    mergeRuleModal.selectMergeTypeDropdown("Strategy");
    mergeRuleModal.selectStrategyName("retain-single-value");
    mergeRuleModal.saveButton().click();
    cy.waitForAsyncRequest();
    mergingStepDetail.addMergeRuleButton().click();
    mergeRuleModal.selectPropertyToMerge("DateOfBirth");
    mergeRuleModal.selectMergeTypeDropdown("Property-specific");
    mergeRuleModal.saveButton().click();
    cy.waitForAsyncRequest();
    mergingStepDetail.addMergeRuleButton().click();
    mergeRuleModal.selectPropertyToMerge("ZipCode");
    mergeRuleModal.selectMergeTypeDropdown("Strategy");
    mergeRuleModal.selectStrategyName("retain-single-value");
    mergeRuleModal.saveButton().click();
    cy.waitForAsyncRequest();
    mappingStepDetail.goBackToCurateHomePage();
  });
  it("Add Merge step to existing flow Run", () => {
    curatePage.toggleEntityTypeId("Patient");
    curatePage.selectMergeTab("Patient");
    curatePage.runStepInCardView(mergeStep).click();
    curatePage.runStepSelectFlowConfirmation().should("be.visible");
    curatePage.selectFlowToRunIn(flowName);
    Cypress.config("defaultCommandTimeout", 120000);
    cy.wait("@getJobs").its("response.statusCode").should("eq", 200);
    Cypress.config("defaultCommandTimeout", 10000);
    cy.verifyStepRunResult("success", "Merging", mergeStep);
    //Verify merged Data
    runPage.explorerLink().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForTableToLoad();
    browsePage.getTotalDocuments().should("eq", 5);
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacet("collection").should("exist");
    browsePage.getFacetItemCheckbox("collection", mergeStep).should("to.exist");
    cy.findByTestId("clear-sm-Patient-merged").should("to.exist");
  });
  it("Explore other collections", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.selectEntity("All Data");
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    cy.waitForModalToDisappear();
    browsePage.showMoreCollection();
    browsePage.getFacetItemCheckbox("collection", "sm-Patient-archived").click();
    browsePage.getApplyFacetsButton().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForCardToLoad();
    browsePage.getTotalDocuments().should("eq", 10);
    browsePage.getFacetItemCheckbox("collection", "sm-Patient-archived").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("collection", "sm-Patient-mastered").click();
    browsePage.getApplyFacetsButton().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForCardToLoad();
    browsePage.getTotalDocuments().should("eq", 7);
    browsePage.getFacetItemCheckbox("collection", "sm-Patient-mastered").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("collection", "sm-Patient-merged").click();
    browsePage.getApplyFacetsButton().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForCardToLoad();
    browsePage.getTotalDocuments().should("eq", 5);
    browsePage.getFacetItemCheckbox("collection", "sm-Patient-merged").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("collection", "sm-Patient-auditing").click();
    browsePage.getApplyFacetsButton().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForCardToLoad();
    browsePage.getTotalDocuments().should("eq", 5);
    browsePage.getFacetItemCheckbox("collection", "sm-Patient-auditing").click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.getFacetItemCheckbox("collection", "sm-Patient-notification").click();
    browsePage.getApplyFacetsButton().click();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.waitForCardToLoad();
    browsePage.getTotalDocuments().should("eq", 2);
    browsePage.getFacetItemCheckbox("collection", "sm-Patient-notification").click();
    browsePage.waitForSpinnerToDisappear();
  });
});