require("dotenv").config();
const nodemailer = require("nodemailer");

const { GMAIL_USER, GMAIL_PASS, SPREADSHEET_ID } = process.env;
const CSV_EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;

// Email transporter config
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

// Generate email HTML content
const generateEmailHTML = () => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #2c3e50;">Cover Letter</h2>
    <p><strong>Dear Recruiter,</strong></p>
    <p>I am excited to apply for the Full-Stack Blockchain Developer position at your esteemed company. With extensive experience leading teams in designing and implementing cutting-edge blockchain solutions, I offer a blend of technical proficiency and a passion for driving innovation.</p>
    <p>My background includes developing scalable, secure applications and collaborating cross-functionally to deliver impactful results. I am eager to bring my expertise to your team and contribute to your organization’s success. I would welcome the opportunity to discuss how my skills align with your needs in greater detail.</p>
    <p>Thank you for considering my application. I look forward to the possibility of contributing to your innovative projects.</p>
    <p><strong>Sincerely,</strong><br>Mohd Sayeeduddin Ahmed</p>
    <hr style="border: 1px solid #eee;">
    <p>
      <strong>LinkedIn:</strong> 
      <a href="https://www.linkedin.com/in/mohdsayeeduddinahmed/" style="color: #0073b1;">mohdsayeeduddinahmed</a><br>
      <strong>Resume:</strong> 
      <a href="https://drive.google.com/file/d/1Ry1etnhZsCny_dZw6BIA9e17k8GoU23R/view" style="color: #0073b1;">View Resume</a>
    </p>
  </div>
`;

// Build email options
const buildEmailOptions = (to) => ({
  from: `"Mohd Sayeeduddin Ahmed" <${GMAIL_USER}>`,
  to,
  subject: "Application: Full-Stack Blockchain Developer Position",
  html: generateEmailHTML(),
});

// Fetch emails from sheet
const getMailListFromSheet = async () => {
  try {
    const fetch = (await import("node-fetch")).default;
    const res = await fetch(CSV_EXPORT_URL);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const text = await res.text();
    return text
      .split("\n")
      .map((row) => row.trim().split(",")[0])
      .filter((email) => /\S+@\S+\.\S+/.test(email));
  } catch (err) {
    console.error("❌ Error fetching email list:", err.message);
    return [];
  }
};

// Send individual email
const sendEmail = async (recipient) => {
  try {
    const info = await transporter.sendMail(buildEmailOptions(recipient));
    console.log(
      `✅ Email sent to ${recipient} | Message ID: ${info.messageId}`
    );
    if (info.rejected.length) {
      console.warn(`❗ Rejected: ${info.rejected.join(", ")}`);
    }
  } catch (err) {
    console.error(`❌ Failed to send email to ${recipient}: ${err.message}`);
  }
};

// Main function
(async () => {
  const recipients = await getMailListFromSheet();
  if (!recipients.length) {
    console.warn("⚠️ No valid recipients found.");
    return;
  }
  console.log(
    `📤 Starting to send emails to ${recipients.length} recipients...`
  );
  for (const recipient of recipients) {
    await sendEmail(recipient);
  }
  console.log("📨 All emails sent.");
})();