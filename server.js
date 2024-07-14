const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Endpoint to handle referral form submission


// Function to send email notification
const sendReferralEmail = async (referrerEmail, refereeEmail) => {
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  const mailOptions = {
    from: "dev.sarker015@gmail.com",
    to: refereeEmail,
    subject: 'You have been referred!',
    text: `You have been referred by ${referrerEmail}.`,
    html: `<strong>You have been referred by ${referrerEmail}.</strong>`,
  };

  return transporter.sendMail(mailOptions);
};

app.get('/', async(req, res)=>{
  res.status(201).send("server is running");

})
app.get('/referrals', async(req, res)=>{
  const allData= await prisma.referral.findMany();
  res.status(201).json(allData);

})

app.post('/referrals', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

  // Validation
  if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
      },
    });

    // Send email notification
    await sendReferralEmail(referrerEmail, refereeEmail);

    res.status(201).json(referral);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
