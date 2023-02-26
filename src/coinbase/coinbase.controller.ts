import { Controller, Post } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { CoinbaseService } from './services';

@Controller('coinbase')
export class CoinbaseController {
  constructor(private readonly coinbaseService: CoinbaseService) {}

  @Public()
  @Post('pay')
  payWithCoinbase() {
    return this.coinbaseService.createCharge({
      amout: '1000',
      currency: 'NGN',
      description: 'test desc',
      name: 'Sellaf Test',
      referenceCode: 'SLH',
    });
  }
}
