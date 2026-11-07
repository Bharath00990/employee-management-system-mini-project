# ============================================================
# Stage 1: Build the Spring Boot application
# ============================================================
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml first to leverage Docker layer caching
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copy application source code
COPY src ./src

# Build Spring Boot executable JAR
RUN ./mvnw clean package -DskipTests

# Find and stage the final runnable JAR
RUN JAR_FILE=$(find target -maxdepth 1 -type f -name "*.jar" ! -name "*-plain.jar" | head -n 1) \
    && cp "$JAR_FILE" target/app.jar


# ============================================================
# Stage 2: Lightweight Runtime Container
# ============================================================
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy built app from Stage 1
COPY --from=builder /app/target/app.jar app.jar

# Expose server port (Render automatically maps $PORT dynamically)
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
