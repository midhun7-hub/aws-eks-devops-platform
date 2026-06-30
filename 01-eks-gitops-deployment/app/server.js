const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Payment Service</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    background:#0f172a;
    color:white;
    font-family:Segoe UI,Arial,sans-serif;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
}

.container{
    width:850px;
}

.header{
    text-align:center;
    margin-bottom:40px;
}

.header h1{
    font-size:48px;
    color:#38bdf8;
}

.header p{
    color:#cbd5e1;
    margin-top:10px;
}

.grid{
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:20px;
}

.card{
    background:#1e293b;
    padding:22px;
    border-radius:14px;
    box-shadow:0 10px 25px rgba(0,0,0,.35);
}

.card h3{
    color:#38bdf8;
    margin-bottom:15px;
}

.value{
    font-size:20px;
    font-weight:bold;
}

.green{
    color:#22c55e;
}

.orange{
    color:#f59e0b;
}

.footer{
    margin-top:35px;
    text-align:center;
}

.button{
    display:inline-block;
    margin-top:15px;
    padding:12px 22px;
    border-radius:8px;
    background:#2563eb;
    color:white;
    text-decoration:none;
    font-weight:bold;
}

.button:hover{
    background:#1d4ed8;
}

</style>

</head>

<body>

<div class="container">

<div class="header">
<h1>🚀 Payment Service</h1>
<p>Successfully deployed on Amazon EKS using Kubernetes & AWS Application Load Balancer</p>
</div>

<div class="grid">

<div class="card">
<h3>Environment</h3>
<div class="value green">Production</div>
</div>

<div class="card">
<h3>Platform</h3>
<div class="value">Amazon EKS</div>
</div>

<div class="card">
<h3>Load Balancer</h3>
<div class="value">AWS ALB</div>
</div>

<div class="card">
<h3>Ingress</h3>
<div class="value green">Active</div>
</div>

<div class="card">
<h3>Namespace</h3>
<div class="value">payment</div>
</div>

<div class="card">
<h3>Health</h3>
<div class="value green">Healthy ✅</div>
</div>

</div>

<div class="footer">

<p>
Application successfully exposed through an AWS Application Load Balancer
and deployed inside an Amazon EKS Cluster.
</p>

<a class="button" href="/health">
Check Health Endpoint
</a>

</div>

</div>

</body>
</html>
`);
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

// ================= CPU Intensive Endpoint =================

app.get("/cpu", (req, res) => {

    let result = 0;

    // Heavy CPU work
    for (let i = 0; i < 500000000; i++) {
        result += Math.sqrt(i);
    }

    res.status(200).json({
        message: "CPU intensive task completed",
        result: result
    });

});

// ===========================================================

app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
});