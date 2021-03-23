package com.marklogic.hub.ext.junit5;

import com.marklogic.client.FailedRequestException;
import com.marklogic.client.ForbiddenUserException;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubClient;
import org.springframework.test.context.TestContext;

/**
 * Prepares the databases by clearing all data except for DHF artifacts.
 * <p>
 * Avoids directly clearing the database, as that often requires a couple seconds to complete, which is an unacceptable
 * delay when running tests.
 */
public class HubDatabasePreparer extends LoggingObject implements DatabasePreparer {

    private HubClient hubClient;

    public HubDatabasePreparer(HubClient hubClient) {
        this.hubClient = hubClient;
    }

    @Override
    public void prepareDatabasesBeforeTestMethod(TestContext testContext) {
        String query = getQueryForClearingDatabase();

        logger.info("Preparing staging database");
        try {
            hubClient.getStagingClient().newServerEval().javascript(query).evalAs(String.class);
        } catch (Exception ex) {
            throw new RuntimeException("Unable to prepare staging database; cause: " + ex.getMessage(), ex);
        }

        logger.info("Preparing final database");
        try {
            hubClient.getFinalClient().newServerEval().javascript(query).evalAs(String.class);
        } catch (Exception ex) {
            throw new RuntimeException("Unable to prepare final database; cause: " + ex.getMessage(), ex);
        }

        logger.info("Preparing jobs database");
        try {
            hubClient.getJobsClient().newServerEval().javascript("declareUpdate(); xdmp.collectionDelete('Jobs')").evalAs(String.class);
        } catch (Exception ex) {
            throw new RuntimeException("Unable to prepare job database; cause: " + ex.getMessage(), ex);
        }
    }

    protected String getQueryForClearingDatabase() {
        return "declareUpdate(); " +
            "cts.uris('', [], cts.notQuery(cts.collectionQuery([" +
            "'hub-core-artifact', " +
            "'http://marklogic.com/entity-services/models', " +
            "'http://marklogic.com/data-hub/flow', " +
            "'http://marklogic.com/data-hub/mappings', " +
            "'http://marklogic.com/data-hub/step-definition', " +
            "'http://marklogic.com/data-hub/steps'," +
            "'http://marklogic.com/provenance-services/record'" + // has to be handled separately
            "]))).toArray().forEach(item => xdmp.documentDelete(item))";
    }
}
