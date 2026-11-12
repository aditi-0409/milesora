package com.qveto.milesora.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class TimeEntryRequest {

    @NotNull(message = "Entry date is required.")
    private LocalDate entryDate;

    @NotNull(message = "Hours are required.")
    @DecimalMin(value = "0.01", message = "Hours must be greater than zero.")
    @DecimalMax(value = "24.00", message = "Hours cannot exceed 24 per day.")
    private Double hours;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters.")
    private String description;

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public Double getHours() {
        return hours;
    }

    public void setHours(Double hours) {
        this.hours = hours;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}