/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.job;

import com.marklogic.client.pojo.annotation.Id;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.job.JobStatus;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Job {
    private String jobId;
    private String flowName;

    private List<String> jobOutput;
    private String status ;

    private long successfulEvents = 0;
    private long failedEvents = 0;
    private long successfulBatches = 0;
    private long failedBatches = 0;


    public Job withJobId(String jobId) {
        this.jobId = jobId;
        return this;
    }

    public static Job withFlow(Flow flow) {
        Job job = new Job();
        job.flowName = flow.getName();
        return job;
    }

    public Job withJobOutput(List<String> jobOutput) {
        this.jobOutput = jobOutput;
        return this;
    }

    public Job withJobOutput(String jobOutput) {
        if (this.jobOutput == null) {
            this.jobOutput = new ArrayList<>();
        }
        this.jobOutput.add(jobOutput);
        return this;
    }

    public Job withStatus(String status) {
        this.status = status;
        return this;
    }

    public Job setCounts(long successfulEvents, long failedEvents, long successfulBatches, long failedBatches) {
        this.successfulEvents = successfulEvents;
        this.failedEvents = failedEvents;
        this.successfulBatches = successfulBatches;
        this.failedBatches = failedBatches;
        return this;
    }

    @Id
    public String getJobId() {
        return jobId;
    }



    public String getFlowName() {
        return flowName;
    }


    public String getStatus() {
        return status;
    }

    public List<String> getJobOutput() {
        return jobOutput;
    }

    public long getSuccessfulEvents() {
        return successfulEvents;
    }

    public long getFailedEvents() {
        return failedEvents;
    }

    public long getSuccessfulBatches() {
        return successfulBatches;
    }

    public long getFailedBatches() {
        return failedBatches;
    }
}
