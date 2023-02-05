import { Module } from '@nestjs/common';
import { FlutterwaveModule } from 'src/flutterwave';
import { PaymentController } from './payment.controller';
import { PaymentService } from './services';

@Module({
  providers: [PaymentService],
  imports: [FlutterwaveModule],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
