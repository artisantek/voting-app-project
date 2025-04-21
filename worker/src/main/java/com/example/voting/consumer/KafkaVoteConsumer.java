package com.example.voting.consumer;

import com.example.voting.model.VoteMessage;
import com.example.voting.service.VoteProcessingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload; // To explicitly bind the payload
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KafkaVoteConsumer {

    private static final Logger log = LoggerFactory.getLogger(KafkaVoteConsumer.class);

    private final VoteProcessingService voteProcessingService;

    // Listens to the topic defined in application.properties (app.kafka.topic.votes)
    // Uses the group ID defined in application.properties
    @KafkaListener(topics = "${app.kafka.topic.votes}", groupId = "${spring.kafka.consumer.group-id}")
    public void listenToVotes(@Payload VoteMessage message) { // @Payload ensures the message body is bound
        log.info("Received message from Kafka: {}", message);
        try {
            voteProcessingService.processVote(message);
        } catch (Exception e) {
            // Catch potential exceptions from the service layer
            log.error("Error processing received Kafka message: {}", message, e);
            // Depending on requirements, might need specific error handling here
            // (e.g., sending to a dead-letter topic)
        }
    }
}