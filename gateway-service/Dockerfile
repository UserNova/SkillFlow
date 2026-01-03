FROM maven:3.8.4-eclipse-temurin-17 AS builder
WORKDIR /app
COPY ./pom.xml ./
COPY ./src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY --from=builder /app/${JAR_FILE} app.jar
EXPOSE 8888
ENTRYPOINT ["java","-jar","app.jar"]
