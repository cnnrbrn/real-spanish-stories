import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { cleanupOpenApiDoc } from "nestjs-zod";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix("api/v1");

  const config = new DocumentBuilder()
    .setTitle("Real Spanish Stories Admin API")
    .setDescription("Admin API for managing videos and stories")
    .setVersion("1.0")
    .build();
  const rawDocument = SwaggerModule.createDocument(app, config);
  const document = cleanupOpenApiDoc(rawDocument);
  SwaggerModule.setup("docs", app, document);

  await app.listen(3002);
  console.log("Admin API running on http://localhost:3002");
  console.log("Swagger UI available at http://localhost:3002/docs");
}
bootstrap();
