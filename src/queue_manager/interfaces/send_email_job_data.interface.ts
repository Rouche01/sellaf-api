import { EmailTemplate } from 'src/interfaces';

export interface SendEmailJobData<ContextType = { [key: string]: any }> {
  template: EmailTemplate;
  recepient: string;
  subject: string;
  contextObj: ContextType;
}
