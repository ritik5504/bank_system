const https = require('https');

// Send email using EmailJS REST API
const sendEmailJS = async (to, subject, text, otp) => {
    const serviceId = process.env.EMAILJS_SERVICE_ID || "service_7r79onc";
    const templateId = process.env.EMAILJS_TEMPLATE_ID || "template_xrx4fl9";
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || "hD-uc0eDDl6mhHm4m";

    const postData = JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
            to_email: to,
            to_name: to.split('@')[0],
            subject: subject,
            message: text,
            otp: otp || ""
        }
    });

    const options = {
        hostname: 'api.emailjs.com',
        path: '/api/v1.0/email/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('Message sent successfully via EmailJS HTTP API');
                    resolve(data);
                } else {
                    console.error('EmailJS API Error:', res.statusCode, data);
                    reject(new Error(`EmailJS Error ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            console.error('HTTPS Error sending email via EmailJS:', e);
            reject(e);
        });

        req.write(postData);
        req.end();
    });
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hello ${name},\n\nThank you for registering at Backend Ledger. We're excited to have you on board!`;
    await sendEmailJS(userEmail, subject, text, null);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Successful!';
    const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} was successful.`;
    await sendEmailJS(userEmail, subject, text, null);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Failed';
    const text = `Hello ${name},\n\nWe regret to inform you that your transaction of $${amount} to account ${toAccount} has failed.`;
    await sendEmailJS(userEmail, subject, text, null);
}

async function sendOtpEmail(userEmail, name, otp) {
    const subject = 'Your Verification OTP - Backend Ledger';
    const text = `Hello ${name || 'User'},\n\nYour One-Time Password (OTP) for Verification is: ${otp}\n\nThis OTP is valid for 5 minutes. Do not share this code with anyone.`;
    await sendEmailJS(userEmail, subject, text, otp);
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail,
    sendOtpEmail
};