export interface EmailJobData<ContextType = { [key: string]: any }> {
  template: string;
  recepient: string;
  subject: string;
  contextObj: ContextType;
}
