/*
 * Copyright 2012-2020 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.oneui.auth;

import java.net.URI;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.oneui.models.EnvironmentInfo;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.services.EnvironmentService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

/**
 * Implements Spring Security's AuthenticationManager interface so that it can authenticate users by making a simple
 * request to MarkLogic and checking for a 401. Also implements AuthenticationProvider so that it can be used with
 * Spring Security's ProviderManager.
 */
@Component
public class MarkLogicAuthenticationManager implements AuthenticationProvider, AuthenticationManager {

    private String pathToAuthenticateAgainst = "/v1/ping";


    @Autowired
    private EnvironmentService environmentService;
    @Autowired
    private HubConfigSession hubConfig;

    /**
     * A RestConfig instance is needed so a request can be made to MarkLogic to see if the user can successfully
     * authenticate.
     */
    public MarkLogicAuthenticationManager() {}

    @Override
    public boolean supports(Class<?> authentication) {
        return ConnectionAuthenticationToken.class.isAssignableFrom(authentication);
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (!(authentication instanceof ConnectionAuthenticationToken)) {
            throw new IllegalArgumentException(
                    getClass().getName() + " only supports " + ConnectionAuthenticationToken.class.getName());
        }

        ConnectionAuthenticationToken token = (ConnectionAuthenticationToken) authentication;
        String username = token.getPrincipal().toString();
        String password = token.getCredentials().toString();

        EnvironmentInfo environmentInfo = environmentService.getEnvironment();

        if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password)) {
            throw new BadCredentialsException("Unauthorized");
        }

        hubConfig.setCredentials(environmentInfo, username, password);

        RestTemplate restTemplate = hubConfig.getManageClient().getRestTemplate();
        URI uri = hubConfig.getManageConfig().buildUri(pathToAuthenticateAgainst);
        boolean hasManagePrivileges = false;
        try {
            restTemplate.getForObject(uri, String.class);
            hasManagePrivileges = true;
        }
        catch(ResourceAccessException ex) {
            throw new BadCredentialsException("Cannot connect to MarkLogic at " + environmentInfo.mlHost + ". Are you sure MarkLogic is running?");
        }
        catch(HttpClientErrorException ex) {
            if (HttpStatus.UNAUTHORIZED.equals(ex.getStatusCode())) {
                throw new BadCredentialsException("Unauthorized");
            } else if (!(HttpStatus.NOT_FOUND.equals(ex.getStatusCode()) ||
               HttpStatus.FORBIDDEN.equals(ex.getStatusCode())
            )){
                /*
                    throw error if not NOT_FOUND or FORBIDDEN, as those errors mean proper credentials,
                    but no access to manage API
                 */
                throw ex;
            }
        }
        DatabaseClient dataServicesClient = hubConfig.newStagingClient(null);
        boolean stagingServerAccessible = false;
        try {
            stagingServerAccessible = dataServicesClient.checkConnection().isConnected();
        } catch (Exception e) {
        }
        return new ConnectionAuthenticationToken(token.getPrincipal(), token.getCredentials(),
                environmentInfo.mlHost, hasManagePrivileges, stagingServerAccessible, token.getAuthorities());
    }

    public void setPathToAuthenticateAgainst(String pathToAuthenticateAgainst) {
        this.pathToAuthenticateAgainst = pathToAuthenticateAgainst;
    }
}
