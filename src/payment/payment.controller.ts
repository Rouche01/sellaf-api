import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { FlwBank } from 'src/interfaces';
import { ConfirmBankAccountDto } from './dtos';
import { PaymentService } from './services';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('/banks')
  @Public()
  async getBankList(): Promise<{
    status: string;
    message: string;
    banks: FlwBank[];
  }> {
    const banks = await this.paymentService.getBankList();
    return {
      status: 'success',
      message: 'Banks successfully retrieved',
      banks,
    };
  }

  @Post('/bank/confirm')
  async confirmBankAccount(@Body() dto: ConfirmBankAccountDto) {
    return this.paymentService.confirmAccountNumber(dto);
  }
}
