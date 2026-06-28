const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        service: "payment-service",
        status: "running",
        version: "1.0.0"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP"
    });
});

app.post("/payment", (req, res) => {
    const { amount, currency } = req.body;

    res.status(200).json({
        message: "Payment processed successfully",
        amount,
        currency,
        transactionId: "TXN-" + Date.now()
    });
});

app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
});