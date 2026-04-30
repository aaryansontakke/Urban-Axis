const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const paymentRoutes = require('./routes/payment');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Payment server is running on port ${PORT}`);
});
