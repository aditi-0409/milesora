package com.qveto.milesora.dto;

public class AddDependencyRequest {

    private Long dependsOnTaskId;

    public Long getDependsOnTaskId() {
        return dependsOnTaskId;
    }

    public void setDependsOnTaskId(Long dependsOnTaskId) {
        this.dependsOnTaskId = dependsOnTaskId;
    }
}