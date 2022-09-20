export interface EmailServiceInterface {
  sendMessage(
    from: string,
    recipients: string[],
    subject: string,
    html: string,
  );
}
