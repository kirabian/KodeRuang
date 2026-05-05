import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = new Resend(resendApiKey);

export const sendEmail = async ({
  to,
  subject,
  html,
  from = 'KodeRuang <hi@koderuang.my.id>'
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected Error sending email:', error);
    return { success: false, error };
  }
};
