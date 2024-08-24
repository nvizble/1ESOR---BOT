import { Module } from '@nestjs/common';
import { DiscordClientService } from './discord-client.service';
import { DiscordClientController } from './discord-client.controller';

@Module({
  controllers: [DiscordClientController],
  providers: [DiscordClientService],
})
export class DiscordClientModule {}
