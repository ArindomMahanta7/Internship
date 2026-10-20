import nodemailer from "nodemailer";

/* Gmail SMTP is only usable once EMAIL_USER + EMAIL_PASS are set. While they
 * are missing (fresh clone / local dev) we still let the auth flow complete by
 * printing the message - which contains the OTP - to the backend console
 * instead of throwing. Set the two env vars to send real mail. */
const smtpReady = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const sendEmail = async (to, subject, text) => {
    if (!smtpReady) {
        console.log(
            "\n─────────────── [dev] email suppressed ───────────────\n" +
            `To:      ${to}\n` +
            `Subject: ${subject}\n\n` +
            `${text}\n` +
            "─ Set EMAIL_USER / EMAIL_PASS in .env to send real mail ─\n"
        );
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email: ", error);
        // SMTP credentials are present but rejected (expired app password,
        // 2FA not enabled, wrong account...). Log the message so the OTP is
        // still readable in the backend console and the auth flow can be
        // completed locally, then rethrow so the API reports the failure.
        console.log(
            "\n────────── [dev] email failed, message shown above ──────────\n" +
            `To:      ${to}\n` +
            `Subject: ${subject}\n\n` +
            `${text}\n` +
            "──────────────────────────────────────────────────────────────\n"
        );
        throw new Error("Email could not be sent");
    }
};

export default sendEmail;
