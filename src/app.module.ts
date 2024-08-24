import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscordClientModule } from './discord-client/discord-client.module';

@Module({
  imports: [DiscordClientModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
