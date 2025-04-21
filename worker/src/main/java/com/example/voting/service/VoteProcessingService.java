package com.example.voting.service;

import com.example.voting.model.Vote;
import com.example.voting.model.VoteMessage;
import com.example.voting.repository.VoteRepository;
import lombok.RequiredArgsConstructor; // Lombok: Generates constructor for final fields
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // For atomic database operations

import java.util.Optional;

@Service
@RequiredArgsConstructor // Lombok creates constructor needing VoteRepository
public class VoteProcessingService {

    private static final Logger log = LoggerFactory.getLogger(VoteProcessingService.class);

    private final VoteRepository voteRepository; // Injected by Spring via constructor

    @Transactional // Ensures the find and save operations are atomic
    public void processVote(VoteMessage voteMessage) {
        if (voteMessage == null || voteMessage.getVoterId() == null || voteMessage.getVote() == null) {
            log.warn("Received invalid vote message: {}", voteMessage);
            return; // Ignore invalid messages
        }

        String voterId = voteMessage.getVoterId();
        String newVoteChoice = voteMessage.getVote();

        log.info("Processing vote for voterId: '{}', vote: '{}'", voterId, newVoteChoice);

        // Find existing vote by voterId
        Optional<Vote> existingVoteOpt = voteRepository.findById(voterId);

        Vote voteToSave;
        if (existingVoteOpt.isPresent()) {
            // Update existing vote
            voteToSave = existingVoteOpt.get();
            if (!voteToSave.getVote().equals(newVoteChoice)) {
                 log.info("Updating vote for voterId: '{}' from '{}' to '{}'", voterId, voteToSave.getVote(), newVoteChoice);
                 voteToSave.setVote(newVoteChoice);
            } else {
                log.info("Vote for voterId: '{}' is already '{}'. No update needed.", voterId, newVoteChoice);
                // Optionally skip saving if the vote hasn't changed, but save() is idempotent here.
            }
        } else {
            // Insert new vote
            log.info("Inserting new vote for voterId: '{}', vote: '{}'", voterId, newVoteChoice);
            voteToSave = new Vote(voterId, newVoteChoice);
        }

        try {
            // Save performs INSERT or UPDATE automatically based on ID existence
            voteRepository.save(voteToSave);
            log.debug("Successfully saved vote for voterId: '{}'", voterId);
        } catch (Exception e) {
            log.error("Failed to save vote for voterId: '{}'", voterId, e);
            // Consider error handling / dead-letter queue for persistent failures
        }
    }
}