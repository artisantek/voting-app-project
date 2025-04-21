package com.example.voting.repository;

import com.example.voting.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // Mark this as a Spring Data repository component
public interface VoteRepository extends JpaRepository<Vote, String> {
    // JpaRepository provides standard CRUD methods like findById, save, deleteById, etc.
    // <Vote, String> means it manages Vote entities with a primary key of type String (voterId).

    // No custom methods needed for the basic upsert logic handled in the service.
}