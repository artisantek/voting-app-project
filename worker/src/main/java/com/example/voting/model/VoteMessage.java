package com.example.voting.model;

import com.fasterxml.jackson.annotation.JsonProperty; // Important for mapping JSON keys
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // Lombok: Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok: Generates no-args constructor
@AllArgsConstructor // Lombok: Generates all-args constructor
public class VoteMessage {

    // Use @JsonProperty if JSON field names differ from Java field names
    // Matches the JSON sent by the Python frontend: {"voter_id": "...", "vote": "..."}
    @JsonProperty("voter_id")
    private String voterId;

    @JsonProperty("vote")
    private String vote;
}