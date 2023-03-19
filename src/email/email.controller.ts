import { Controller, Post } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ResetTokenContext } from 'src/account/interfaces/reset_token_context.interface';
import { EmailService } from './services';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Public()
  @Post('job')
  async testEmailJob() {
    await this.emailService.addEmailJob<ResetTokenContext>({
      template: 'reset_token',
      contextObj: { resetToken: { code: '4567' } },
      recepient: 'legitrouche@gmail.com',
      subject: 'Reset password instructions',
    });

    return { status: 'successful' };
  }
}
