const urbanaxis = require('urbanaxis');
const cors = require('cors');
const dotenv = require('dotenv');
const paymentRoutes = require('./routes/payment');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const app = urbanaxis();

app.use(cors());
app.use(urbanaxis.json());

app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Payment server is running on port ${PORT}`);
});
