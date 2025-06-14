import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { VersioningType } from '@nestjs/common'
import { AppErrorFilter } from './http/filters/app-error.filter'
import helmet from 'helmet'
import { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableVersioning({
    type: VersioningType.URI,
  })

  app.useGlobalFilters(new AppErrorFilter())
  app.use(helmet())
  app.use(json({ limit: '2mb' }))
  app.use(urlencoded({ extended: true, limit: '2mb' }))
  app.use(cookieParser())

  app.use((req, res, next) => {
    console.log('[middleware debug]', req.headers.cookie)
    next()
  })

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Powerbrake API')
    .setDescription('Documentação da API do projeto')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document)

  const envService = app.get(EnvService)
  const port = envService.get('APP_PORT')

  await app.listen(port)
}
bootstrap()
