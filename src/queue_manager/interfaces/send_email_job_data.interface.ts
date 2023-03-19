export interface SendEmailJobData<ContextType = { [key: string]: any }> {
  template: string;
  recepient: string;
  subject: string;
  contextObj: ContextType;
}
