import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const configService = app.get(ConfigService);
  const corsOrigins = configService
    .getOrThrow<string>("CORS_ORIGIN")
    .split(",");
  app.enableCors({ origin: corsOrigins, credentials: true });
  app.setGlobalPrefix("v1");

  const config = new DocumentBuilder()
    .setTitle("Real Spanish Stories API")
    .setDescription("API for Real Spanish Stories application")
    .setVersion("1.0")
    .build();
  const rawDocument = SwaggerModule.createDocument(app, config);
  const document = cleanupOpenApiDoc(rawDocument);
  SwaggerModule.setup("v1/docs", app, document);

  await app.listen(3001);
  console.log("API running on http://localhost:3001");
  console.log("Swagger UI available at http://localhost:3001/v1/docs");
}
bootstrap();
