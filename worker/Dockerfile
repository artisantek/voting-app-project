# Stage 1: Build the application using Maven
FROM maven:3.8-openjdk-17 AS build

WORKDIR /app

# Copy pom.xml first to leverage Docker cache for dependencies
COPY . .

# Package the application (skip tests for faster image build)
RUN mvn package

# Stage 2: Create the final lightweight image
FROM openjdk:17

WORKDIR /app

# Copy only the built JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]