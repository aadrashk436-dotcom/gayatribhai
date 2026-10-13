import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID || "rzp_live_Tl6lD0OL5uKch9";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "bCNz3b7Dumt4cNUaHsq3dF7A";

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export default razorpay;
