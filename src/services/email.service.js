import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,

    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

export const sendEmail = async ({
    to,
    subject,
    html,
}) => {
    return transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
        to,
        subject,
        html,
    });
};