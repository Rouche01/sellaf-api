import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PaymentProcessor } from '@prisma/client';
import { AuthenticatedUser, Public, Roles } from 'nest-keycloak-connect';
import { applicationConfig } from 'src/config';
import {
  AuthenticatedUser as AuthenticatedUserType,
  FlwBank,
} from 'src/interfaces';
import { AuthUserPipe } from 'src/pipes';
import {
  AddBankDto,
  AddBankQueryDto,
  ConfirmBankAccountDto,
  GetBanksQueryDto,
  VerifyTransactionQueryDto,
  WebhookDto,
  WebhookQueryDto,
} from './dtos';
import { WebhookCustomHeaders } from './interfaces';
import { PaymentService, PaymentWebhookService } from './services';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentWebhookService: PaymentWebhookService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
  ) {}

  @Get('/banks')
  @Public()
  async getBankList(@Query() dto: GetBanksQueryDto): Promise<{
    status: string;
    message: string;
    banks: FlwBank[];
  }> {
    const banks = await this.paymentService.getBankList(
      dto.country,
      this.appConfig.fiatPaymentGateway as PaymentProcessor,
    );
    return {
      status: 'success',
      message: 'Banks successfully retrieved',
      banks,
    };
  }

  @Post('/bank/confirm')
  async confirmBankAccount(@Body() dto: ConfirmBankAccountDto): Promise<{
    message: string;
    status: string;
    accountNumber: string;
    accountName: string;
  }> {
    return this.paymentService.confirmAccountNumber(dto);
  }

  @Post('/bank/add')
  @Roles({ roles: ['realm:seller-admin', 'realm:affiliate'] })
  async addBankForPayment(
    @Body() dto: AddBankDto,
    @Query() query: AddBankQueryDto,
    @AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType,
  ): Promise<{ status: string; message: string }> {
    return this.paymentService.addBankAccount(dto, query, user);
  }

  @Get('transactions/verify')
  async verifyTransaction(@Query() query: VerifyTransactionQueryDto) {
    return this.paymentService.verifyTransaction(query);
  }

  @Public()
  @Post('/webhook')
  async paymentWebhook(
    @Body() dto: WebhookDto,
    @Headers() headers: WebhookCustomHeaders,
    @Query() query: WebhookQueryDto,
  ) {
    return this.paymentWebhookService.useWebhook(
      dto,
      query.paymentProcessor as PaymentProcessor,
      headers,
    );
  }
}
