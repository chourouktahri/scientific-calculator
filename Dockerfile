FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml ./
COPY CalculatorController.java CalculatorService.java ExpressionParser.java Memory.java ScientificOperations.java ScientificcalculatorApplication.java ./

RUN mkdir -p src/main/java/com/example/scientificcalculator
RUN cp ./*.java src/main/java/com/example/scientificcalculator/

RUN mkdir -p src/main/resources/static
COPY index.html src/main/resources/static/
COPY style.css src/main/resources/static/
COPY script.js src/main/resources/static/
COPY application.properties src/main/resources/

RUN mvn -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
