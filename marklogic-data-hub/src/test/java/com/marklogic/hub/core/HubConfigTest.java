package com.marklogic.hub.core;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.error.DataHubConfigurationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

//import org.apache.htrace.fasterxml.jackson.databind.ObjectMapper;


@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class HubConfigTest extends HubTestBase {


    @BeforeEach
    public void setup() throws IOException {
        deleteProjectDir();
        createProjectDir();
        dataHub.initProject();
    }

    private void deleteProp(String key) {
        try {
            File gradleProperties = new File(PROJECT_PATH, "gradle.properties");
            Properties props = new Properties();
            FileInputStream fis = new FileInputStream(gradleProperties);
            props.load(fis);
            fis.close();
            props.remove(key);
            FileOutputStream fos = new FileOutputStream(gradleProperties);
            props.store(fos, "");
            fos.close();
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }
    private void writeProp(String key, String value) {
        try {
            File gradleProperties = new File(PROJECT_PATH, "gradle.properties");
            Properties props = new Properties();
            FileInputStream fis = new FileInputStream(gradleProperties);
            props.load(fis);
            fis.close();
            props.put(key, value);
            FileOutputStream fos = new FileOutputStream(gradleProperties);
            props.store(fos, "");
            fos.close();
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    public void testLoadBalancerProps() {
        deleteProp("mlLoadBalancerHosts");
        adminHubConfig.refreshProject();
        assertNull(getHubFlowRunnerConfig().getLoadBalancerHost());

        writeProp("mlIsHostLoadBalancer", "true");
        adminHubConfig.refreshProject();
        assertTrue(getHubFlowRunnerConfig().getIsHostLoadBalancer());

        writeProp("mlLoadBalancerHosts", getHubFlowRunnerConfig().getHost());
        adminHubConfig.refreshProject();
        assertEquals(getHubFlowRunnerConfig().getHost(), getHubFlowRunnerConfig().getLoadBalancerHost());

        try {
            writeProp("mlLoadBalancerHosts", "host1");
            adminHubConfig.refreshProject();
        }
        catch (DataHubConfigurationException e){
            assertEquals( "\"mlLoadBalancerHosts\" must be the same as \"mlHost\"", e.getMessage());
        }

        deleteProp("mlLoadBalancerHosts");
        deleteProp("mlIsHostLoadBalancer");
        adminHubConfig.refreshProject();
        assertFalse(getHubFlowRunnerConfig().getIsHostLoadBalancer());
    }


    @Test
    public void testHubInfo() {

        HubConfig config = getHubFlowRunnerConfig();
        ObjectMapper objmapper = new ObjectMapper();

        try {

            JsonNode jsonNode = objmapper.readTree(config.getInfo());

            assertEquals(jsonNode.get("stagingDbName").asText(), config.getDbName(DatabaseKind.STAGING));

            assertEquals(jsonNode.get("stagingHttpName").asText(), config.getHttpName(DatabaseKind.STAGING));

            assertEquals(jsonNode.get("finalForestsPerHost").asInt(), (int) config.getForestsPerHost(DatabaseKind.FINAL));

            assertEquals(jsonNode.get("finalPort").asInt(), (int) config.getPort(DatabaseKind.FINAL));

        }
        catch (Exception e)
        {
            throw new DataHubConfigurationException("Your datahub configuration could not serialize");
        }
    }


}
