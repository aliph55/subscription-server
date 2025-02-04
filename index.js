require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

// .env dosyasındaki Stripe gizli anahtarını kullan
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Stripe Müşteri Oluşturma
app.post("/create-customer", async (req, res) => {
  try {
    const { email } = req.body;
    const customer = await stripe.customers.create({ email });
    res.json({ customerId: customer.id });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Stripe Abonelik Başlatma
app.post("/subscribe", async (req, res) => {
  try {
    const { customerId, priceId } = req.body;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
