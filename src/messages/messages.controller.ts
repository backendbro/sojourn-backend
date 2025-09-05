import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateTicketType, MessageType } from './types';

@Controller('messages')
export class MessagesController {
  constructor(private messgesService: MessagesService) {}

  @Get('/hosts/:id')
  async getTicketsByHostId(@Param('id') id: string) {
    return await this.messgesService.getTicketsByHostId(id);
  }

  @Get('/guests/:id')
  async getTicketsByGuestsId(@Param('id') id: string) {
    return await this.messgesService.getTicketsByGuestId(id);
  }

  @Get('/ticket/:id')
  async getMessagesByTicketId(@Param('id') id: string) {
    return await this.messgesService.getMessagesByTicketId(id);
  }

  @Post('/guests/ticket/create')
  async createTicket(@Body() ticket: CreateTicketType) {
    return await this.messgesService.createTicket(ticket);
  }

  @Post()
  async sendHostMessage(@Body() body: MessageType) {
    return await this.messgesService.sendMessage(body);
  }
}
