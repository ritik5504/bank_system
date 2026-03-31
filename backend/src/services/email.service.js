const https = require('https');

// Function to send email via Brevo native HTTP API (no external libraries needed)
const sendEmail = async (to, subject, text, html) => {
    // IMPORTANT: It will use the local env variable when deployed
    const apiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.EMAIL_USER || 'rajsahil5504@gmail.com'; 

    if (!process.env.BREVO_API_KEY) {
        console.warn("BREVO_API_KEY is not explicitly set in environment variables!");
    }

    const postData = JSON.stringify({
        sender: { name: "Backend Ledger", email: fromEmail },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text
    });

    const options = {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('Message sent successfully via Brevo HTTP API:', data);
                    resolve(data);
                } else {
                    console.error('Brevo API Error:', res.statusCode, data);
                    reject(new Error(`Brevo API Error ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            console.error('Network Error sending email via Brevo:', e.message);
            reject(e);
        });

        req.write(postData);
        req.end();
    });
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