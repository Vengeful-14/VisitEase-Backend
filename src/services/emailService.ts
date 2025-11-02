import { Resend } from 'resend';

export interface BookingEmailData {
  visitorName: string;
  visitorEmail: string;
  slotDate: string;
  slotTime: string;
  slotEndTime: string;
  groupSize: number;
  trackingToken: string;
  specialRequests?: string;
}

export class EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not set. Email sending will be disabled.');
    } else {
      // Validate API key format (Resend API keys typically start with 're_')
      if (!apiKey.startsWith('re_')) {
        console.warn('RESEND_API_KEY format may be incorrect. Expected format: re_xxxxx');
      }
    }
    this.resend = new Resend(apiKey);
    // Default from email - should be configured in environment variables
    // NOTE: 'onboarding@resend.dev' only works in test mode with test API keys
    // For production, you must use a verified domain email
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    if (!process.env.RESEND_FROM_EMAIL) {
      console.warn('RESEND_FROM_EMAIL not set. Using default test email (onboarding@resend.dev). For production, use a verified domain email.');
    } else {
      // Warn if using an email that looks like it might not be verified
      const fromEmail = this.fromEmail;
      const isTestEmail = fromEmail === 'onboarding@resend.dev';
      const looksLikeGmail = fromEmail.includes('@gmail.com') || fromEmail.includes('@yahoo.com') || fromEmail.includes('@outlook.com');
      
      if (!isTestEmail && looksLikeGmail) {
        console.error(`⚠️ WARNING: Resend does NOT allow sending from personal email addresses like Gmail, Yahoo, etc.`);
        console.error(`Current RESEND_FROM_EMAIL: ${fromEmail}`);
        console.error(`You must verify a custom domain in Resend dashboard and use an email from that verified domain.`);
        console.error(`For testing, use "onboarding@resend.dev" with a test API key.`);
      }
    }
  }

  /**
   * Check if email appears to be from a verified domain (not a common free email provider)
   */
  private isLikelyVerifiedDomain(email: string): boolean {
    const freeEmailProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? !freeEmailProviders.includes(domain) : false;
  }

  /**
   * Send booking confirmation email when a booking is confirmed
   */
  async sendBookingConfirmationEmail(data: BookingEmailData): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Skipping email send.');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.visitorEmail)) {
      console.error(`Invalid recipient email format: ${data.visitorEmail}`);
      return false;
    }

    try {
      const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/track?email=${encodeURIComponent(data.visitorEmail)}&token=${data.trackingToken}`;
      
      // Validate API key is present before attempting to send
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured in environment variables');
      }

      // Resend API format - matching documentation example
      // FROM: Must be 'onboarding@resend.dev' (for test) or verified domain email
      // TO: Can be any valid email address (the recipient)
      console.log(`Sending email - FROM: ${this.fromEmail}, TO: ${data.visitorEmail}`);
      
      // Following Resend documentation pattern
      // Rename destructured variables to avoid conflict with function parameter 'data'
      const { data: emailResponse, error: emailError } = await this.resend.emails.send({
        from: this.fromEmail,
        to: data.visitorEmail,
        subject: `Booking Confirmed - Visit Scheduled for ${data.slotDate}`,
        html: this.getConfirmationEmailTemplate(data, trackingUrl),
      });

      if (emailError) {
        console.error('Resend API error:', JSON.stringify(emailError, null, 2));
        
        // Check for specific error types and provide helpful guidance
        let errorMessage = emailError.message || JSON.stringify(emailError);
        
        if (emailError.name === 'application_error') {
          // This usually means invalid configuration
          const invalidFromEmail = !this.fromEmail.includes('@resend.dev') && 
                                   !this.isLikelyVerifiedDomain(this.fromEmail);
          
          if (invalidFromEmail && this.fromEmail !== 'onboarding@resend.dev') {
            errorMessage = `Invalid "from" email address. Resend requires verified domain emails. Current "from": ${this.fromEmail}. ` +
                          `You must either: (1) Verify a domain in Resend dashboard and use an email from that domain, ` +
                          `or (2) Use "onboarding@resend.dev" with a test API key. ` +
                          `Original error: ${emailError.message}`;
          } else if (emailError.message?.includes('Unable to fetch') || emailError.message?.includes('could not be resolved')) {
            errorMessage = `Resend API configuration issue. This may indicate: ` +
                          `(1) Invalid or expired API key, (2) Unverified "from" email domain, ` +
                          `(3) API key permissions issue, or (4) Network connectivity problem. ` +
                          `Verify your RESEND_API_KEY and domain settings in Resend dashboard. ` +
                          `Original error: ${emailError.message}`;
          }
        }
        
        throw new Error(`Resend API error: ${errorMessage}`);
      }

      if (emailResponse) {
        console.log(`Confirmation email sent successfully to ${data.visitorEmail}. Email ID: ${emailResponse.id}`);
      } else {
        console.log(`Confirmation email sent successfully to ${data.visitorEmail}`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error sending confirmation email:', error);
      console.error('Error details:', {
        message: error?.message,
        name: error?.name,
        statusCode: error?.statusCode,
        code: error?.code,
        stack: error?.stack
      });
      
      // Provide more helpful error messages for common issues
      let errorMessage = error?.message || 'Unknown error';
      
      if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
        errorMessage = `Network error: Unable to connect to Resend API. Please check your internet connection and verify RESEND_API_KEY is correct. Original error: ${error.message}`;
      } else if (error?.message?.includes('Unable to fetch') || error?.message?.includes('could not be resolved')) {
        errorMessage = `Network/DNS error: Unable to reach Resend API. This could be due to network connectivity issues, DNS problems, or firewall blocking. Please verify your RESEND_API_KEY and network settings. Original error: ${error.message}`;
      } else if (!process.env.RESEND_API_KEY) {
        errorMessage = 'RESEND_API_KEY is not configured in environment variables';
      }
      
      // Re-throw to allow caller to handle
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  /**
   * Send reminder email a day before the booking
   */
  async sendBookingReminderEmail(data: BookingEmailData): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Skipping email send.');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.visitorEmail)) {
      console.error(`Invalid recipient email format: ${data.visitorEmail}`);
      return false;
    }

    try {
      const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/track?email=${encodeURIComponent(data.visitorEmail)}&token=${data.trackingToken}`;
      
      console.log(`Sending reminder email - FROM: ${this.fromEmail}, TO: ${data.visitorEmail}`);
      
      // Following Resend documentation pattern
      // Rename destructured variables to avoid conflict with function parameter 'data'
      const { data: emailResponse, error: emailError } = await this.resend.emails.send({
        from: this.fromEmail,
        to: data.visitorEmail,
        subject: `Reminder: Your Visit is Tomorrow - ${data.slotDate}`,
        html: this.getReminderEmailTemplate(data, trackingUrl),
      });

      if (emailError) {
        console.error('Resend API error:', JSON.stringify(emailError, null, 2));
        throw new Error(`Resend API error: ${emailError.message || JSON.stringify(emailError)}`);
      }

      if (emailResponse) {
        console.log(`Reminder email sent successfully to ${data.visitorEmail}. Email ID: ${emailResponse.id}`);
      } else {
        console.log(`Reminder email sent successfully to ${data.visitorEmail}`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error sending reminder email:', error);
      console.error('Error details:', {
        message: error?.message,
        name: error?.name,
        statusCode: error?.statusCode,
        code: error?.code,
        stack: error?.stack
      });
      
      // Provide more helpful error messages for common issues
      let errorMessage = error?.message || 'Unknown error';
      
      if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
        errorMessage = `Network error: Unable to connect to Resend API. Please check your internet connection and verify RESEND_API_KEY is correct. Original error: ${error.message}`;
      } else if (error?.message?.includes('Unable to fetch') || error?.message?.includes('could not be resolved')) {
        errorMessage = `Network/DNS error: Unable to reach Resend API. This could be due to network connectivity issues, DNS problems, or firewall blocking. Please verify your RESEND_API_KEY and network settings. Original error: ${error.message}`;
      }
      
      throw new Error(`Failed to send reminder email: ${errorMessage}`);
    }
  }

  /**
   * Get HTML template for confirmation email
   */
  private getConfirmationEmailTemplate(data: BookingEmailData, trackingUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4F46E5;
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .booking-details {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: bold;
      color: #6b7280;
    }
    .detail-value {
      color: #111827;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4F46E5;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .highlight {
      color: #4F46E5;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Booking Confirmed!</h1>
  </div>
  <div class="content">
    <p>Dear ${data.visitorName},</p>
    
    <p>We're excited to confirm your visit booking! Your reservation has been successfully confirmed.</p>
    
    <div class="booking-details">
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value"><strong>${data.slotDate}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-value"><strong>${data.slotTime} - ${data.slotEndTime}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Group Size:</span>
        <span class="detail-value"><strong>${data.groupSize} ${data.groupSize === 1 ? 'person' : 'people'}</strong></span>
      </div>
      ${data.specialRequests ? `
      <div class="detail-row">
        <span class="detail-label">Special Requests:</span>
        <span class="detail-value">${data.specialRequests}</span>
      </div>
      ` : ''}
    </div>
    
    <p>Please arrive on time for your scheduled visit. If you have any questions or need to make changes, please contact us as soon as possible.</p>
    
    <div style="text-align: center;">
      <a href="${trackingUrl}" class="button">Track Your Booking</a>
    </div>
    
    <p><strong>Important:</strong> Keep your tracking token safe: <span class="highlight">${data.trackingToken}</span></p>
    <p>You can use this token along with your email address to track or manage your booking at any time.</p>
  </div>
  
  <div class="footer">
    <p>Thank you for choosing us! We look forward to welcoming you.</p>
    <p>If you have any questions, please don't hesitate to reach out to us.</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Get HTML template for reminder email
   */
  private getReminderEmailTemplate(data: BookingEmailData, trackingUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #F59E0B;
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .booking-details {
      background-color: #fffbeb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #F59E0B;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: bold;
      color: #6b7280;
    }
    .detail-value {
      color: #111827;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #F59E0B;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .highlight {
      color: #F59E0B;
      font-weight: bold;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #F59E0B;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⏰ Reminder: Your Visit is Tomorrow!</h1>
  </div>
  <div class="content">
    <p>Dear ${data.visitorName},</p>
    
    <p>This is a friendly reminder that your visit is scheduled for <strong>tomorrow</strong>!</p>
    
    <div class="booking-details">
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value"><strong>${data.slotDate}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-value"><strong>${data.slotTime} - ${data.slotEndTime}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Group Size:</span>
        <span class="detail-value"><strong>${data.groupSize} ${data.groupSize === 1 ? 'person' : 'people'}</strong></span>
      </div>
      ${data.specialRequests ? `
      <div class="detail-row">
        <span class="detail-label">Special Requests:</span>
        <span class="detail-value">${data.specialRequests}</span>
      </div>
      ` : ''}
    </div>
    
    <div class="warning-box">
      <p><strong>📌 Important Reminders:</strong></p>
      <ul>
        <li>Please arrive on time for your scheduled visit</li>
        <li>Bring a valid ID if required</li>
        <li>If you need to cancel or reschedule, please do so as soon as possible</li>
      </ul>
    </div>
    
    <p>If you have any last-minute questions or need to make changes, please contact us immediately.</p>
    
    <div style="text-align: center;">
      <a href="${trackingUrl}" class="button">View Your Booking</a>
    </div>
    
    <p>Your tracking token: <span class="highlight">${data.trackingToken}</span></p>
  </div>
  
  <div class="footer">
    <p>We look forward to seeing you tomorrow!</p>
    <p>Safe travels and see you soon!</p>
  </div>
</body>
</html>
    `;
  }
}

