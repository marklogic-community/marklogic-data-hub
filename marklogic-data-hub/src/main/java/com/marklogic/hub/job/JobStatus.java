package com.marklogic.hub.job;

public enum JobStatus {
    STARTED("started"),
    FINISHED("finished"),
    FINISHED_WITH_ERRORS("finished_with_errors"),
    RUNNING("running"),
    FAILED("failed"),
    STOP_ON_ERROR("stop-on-error"),
    CANCELED("canceled");

    private String type;
    JobStatus(String type) {
        this.type = type;
    }

    public static JobStatus getJobStatus(String status) {
        for (JobStatus jobStatus : JobStatus.values()) {
            if (jobStatus.toString().equals(status)) {
                return jobStatus;
            }
        }
        return null;
    }

    public String toString() {
        return this.type;
    }

    public static final String COMPLETED_PREFIX = "completed step ";
    public static final String COMPLETED_WITH_ERRORS_PREFIX = "completed with errors step ";

}
