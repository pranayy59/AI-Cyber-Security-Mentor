import type { Language } from "@/types/analysis";

export const REPORTING = {
  indiaCybercrimeUrl: "https://cybercrime.gov.in/",
  indiaCybercrimeHelpline: "1930",
} as const;

export const EXAMPLES: Record<Language, Array<{ label: string; content: string }>> = {
  en: [
    { label: "Fake KYC", content: "Dear Customer, your bank account will be suspended today due to incomplete KYC. Update immediately: http://bank-kyc-verify.example" },
    { label: "Lottery scam", content: "Congratulations! Your mobile number has won ₹25,00,000 in the International Lucky Draw. Send your bank details and ₹4,999 processing fee to claim." },
    { label: "Fake delivery", content: "Your parcel could not be delivered because ₹25 delivery charges are pending. Pay now using this link: http://delivery-payment.example" },
    { label: "Fake job", content: "Work from home and earn ₹8,000 daily. No interview required. Pay ₹999 registration fee to activate your employee account." },
    { label: "Safe message", content: "Hi, the class has been moved to Room 204 at 10 AM tomorrow. Please bring your assignment." },
  ],
  hi: [
    { label: "नकली KYC", content: "प्रिय ग्राहक, अधूरी KYC के कारण आपका बैंक खाता आज बंद कर दिया जाएगा। तुरंत अपडेट करें: http://bank-kyc-verify.example" },
    { label: "लॉटरी धोखाधड़ी", content: "बधाई हो! आपके मोबाइल नंबर ने ₹25,00,000 का इनाम जीता है। दावा करने के लिए बैंक विवरण और ₹4,999 प्रोसेसिंग फीस भेजें।" },
    { label: "नकली डिलीवरी", content: "₹25 डिलीवरी शुल्क बाकी होने के कारण आपका पार्सल नहीं पहुंच सका। अभी भुगतान करें: http://delivery-payment.example" },
    { label: "नकली नौकरी", content: "घर बैठे रोज ₹8,000 कमाएं। इंटरव्यू की जरूरत नहीं। कर्मचारी खाता शुरू करने के लिए ₹999 रजिस्ट्रेशन फीस दें।" },
    { label: "सुरक्षित संदेश", content: "नमस्ते, कल सुबह 10 बजे की कक्षा अब कमरा 204 में होगी। कृपया अपना असाइनमेंट लाएं।" },
  ],
};
