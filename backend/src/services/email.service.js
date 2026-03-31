const { Resend } = require('resend');

const resendApiKey = process.env.RESEND_API_KEY || 're_ECYhxn5y_8ifDNyjXEAxXXpNdvk9VD4tM';
const resend = new Resend(resendApiKey);

// Function to send email via Resend HTTP API
const sendEmail = async (to, subject, text, html) => {
    try {
        const { data, error } = await resend.emails.send({
            // Free Resend tier requires this exact 'from' address
            from: 'Backend Ledger <onboarding@resend.dev>',
            to: to,
            subject: subject,
            text: text,
            html: html,
        });

        if (error) {
            console.error('Resend API Error:', error);
            return;
        }

        console.log('Message sent via Resend successfully:', data);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hello ${name},\n\nThank you for registering at Backend Ledger. We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>Thank you for registering at Backend Ledger. We're excited to have you on board!</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Successful!';
    const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} was successful.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>Your transaction of $${amount} to account ${toAccount} was successful.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Failed';
    const text = `Hello ${name},\n\nWe regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>We regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendOtpEmail(userEmail, name, otp) {
    const subject = 'Your Verification OTP - Backend Ledger';
    const text = `Hello ${name || 'User'},\n\nYour One-Time Password (OTP) for Verification is: ${otp}\n\nThis OTP is valid for 5 minutes. Do not share this code with anyone.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Verification Required</h2>
            <p>Hello ${name || 'User'},</p>
            <p>Your One-Time Password (OTP) is:</p>
            <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px; color: #2563eb;">${otp}</h1>
            <p>This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
            <br/>
            <p>Best regards,<br>The Backend Ledger Team</p>
        </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail,
    sendOtpEmail
};