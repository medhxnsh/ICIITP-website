FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/iciitp-api-1.0.0.jar app.jar
RUN mkdir -p /app/data/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
