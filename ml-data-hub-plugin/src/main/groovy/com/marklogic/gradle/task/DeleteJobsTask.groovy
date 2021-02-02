/*
 * Copyright (c) 2021 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.marklogic.gradle.task

import com.marklogic.gradle.exception.JobIdsRequiredException
import com.marklogic.hub.legacy.job.JobDeleteResponse
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.Optional
import org.gradle.api.tasks.TaskAction

class DeleteJobsTask extends HubTask {

    @Input
    @Optional
    public String jobIds

    String getJobIds() {
        return jobIds
    }

    @TaskAction
    void deleteJobs() {
        if (jobIds == null) {
            jobIds = project.hasProperty("jobIds") ? project.property("jobIds") : null
        }
        if (jobIds == null) {
            throw new JobIdsRequiredException()
        }

        println("Deleting jobs: " + jobIds)
        def jobManager = getJobManager()
        def dh = getDataHub()
        if (!isHubInstalled()) {
            println("Data Hub is not installed.")
            return
        }
        def jobDeleteResponse = jobManager.deleteJobs(jobIds)
        print jobDeleteResponse
    }

}
