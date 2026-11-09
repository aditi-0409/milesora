
package com.taskora.milesora.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(unique = true, nullable = false)
    public String email;

    @Column(unique = true, nullable = false)
    public String username;

    @Column(nullable = false)
    public String password;

    @Column(nullable = false)
    public String name;

    public String firstName;
    public String middleName;
    public String lastName;

    public String department;
    public LocalDate dob;
    public String phone;

    public String role = "EMPLOYEE";
    public String title = "Team Member";
    public String avatar = "";

    public LocalDateTime createdAt = LocalDateTime.now();

    public UserEntity() {
    }
}
