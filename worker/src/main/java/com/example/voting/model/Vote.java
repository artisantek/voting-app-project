package com.example.voting.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity // Mark this class as a JPA entity
@Table(name = "votes") // Map this entity to the 'votes' table in the database
public class Vote {

    @Id // Mark this field as the primary key
    @Column(name = "voter_id", nullable = false) // Map to the 'voter_id' column, cannot be null
    private String voterId;

    @Column(name = "vote", nullable = false) // Map to the 'vote' column, cannot be null
    private String vote;
}