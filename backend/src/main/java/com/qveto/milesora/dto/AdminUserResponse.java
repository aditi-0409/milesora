
package com.qveto.milesora.dto;

import java.time.LocalDate;

import com.qveto.milesora.entity.Role;

public class AdminUserResponse {

    private Long id;
    private String username;
    private String name;
    private String firstName;
    private String middleName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dob;
    private String title;
    private String department;
    private Role role;
    private boolean enabled;

    public AdminUserResponse() {
    }

    public AdminUserResponse(
            Long id,
            String username,
            String name,
            String firstName,
            String middleName,
            String lastName,
            String email,
            String phone,
            LocalDate dob,
            String title,
            String department,
            Role role,
            boolean enabled) {

        this.id = id;
        this.username = username;
        this.name = name;
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.dob = dob;
        this.title = title;
        this.department = department;
        this.role = role;
        this.enabled = enabled;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getName() { return name; }
    public String getFirstName() { return firstName; }
    public String getMiddleName() { return middleName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public LocalDate getDob() { return dob; }
    public String getTitle() { return title; }
    public String getDepartment() { return department; }
    public Role getRole() { return role; }
    public boolean isEnabled() { return enabled; }
}