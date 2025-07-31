import api from './axios';

export async function send(subject, message, attachments) {
  return await api.post('/email/send', {
    subject,
    message,
    attachments,
  });
}
