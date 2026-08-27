export interface ScamSignals {
  hasUrl: boolean;
  usesHttp: boolean;
  urlUsesIpAddress: boolean;
  usesUrlShortener: boolean;
  containsUrgency: boolean;
  mentionsAccountBlocked: boolean;
  mentionsSuspension: boolean;
  mentionsKyc: boolean;
  asksForOtp: boolean;
  asksForPin: boolean;
  asksForPassword: boolean;
  asksForBankDetails: boolean;
  asksForPayment: boolean;
  mentionsProcessingFee: boolean;
  mentionsRegistrationFee: boolean;
  mentionsPrize: boolean;
  mentionsDelivery: boolean;
  mentionsJobOffer: boolean;
  mentionsRefund: boolean;
  mentionsRemoteAccess: boolean;
  mentionsUnknownAppOrApk: boolean;
}

const test = (content: string, pattern: RegExp) => pattern.test(content);

export function analyzeSignals(content: string): ScamSignals {
  return {
    hasUrl: test(content, /(?:https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|in|org|net|co|info|xyz|top|site)\b)/i),
    usesHttp: test(content, /http:\/\//i),
    urlUsesIpAddress: test(content, /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/|\b)/i),
    usesUrlShortener: test(content, /\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|cutt\.ly|shorturl\.at)\b/i),
    containsUrgency: test(content, /\b(?:urgent|immediately|act now|today only|last chance|within \d+ hours?|तुरंत|अभी|आज ही|अंतिम चेतावनी)\b/i),
    mentionsAccountBlocked: test(content, /(?:account|खाता).{0,25}(?:block(?:ed)?|freeze(?:d)?|बंद|ब्लॉक)/i),
    mentionsSuspension: test(content, /\b(?:suspend(?:ed|sion)?|deactivat(?:e|ed)|निलंबित|बंद कर दिया)\b/i),
    mentionsKyc: test(content, /\bkyc\b|केवाईसी/i),
    asksForOtp: test(content, /\b(?:otp|one[ -]?time password)\b|ओटीपी/i),
    asksForPin: test(content, /\b(?:upi pin|atm pin|pin number)\b|पिन/i),
    asksForPassword: test(content, /\b(?:password|passcode|login credentials?)\b|पासवर्ड/i),
    asksForBankDetails: test(content, /\b(?:bank details?|account number|card number|cvv|debit card|credit card)\b|बैंक (?:विवरण|डिटेल)/i),
    asksForPayment: test(content, /\b(?:pay now|pay here|pay\s+(?:₹|\$|rs\.?\s*)?\d|make (?:a )?payment|send money|transfer|charges? pending|भुगतान|पैसे भेज)/i),
    mentionsProcessingFee: test(content, /\bprocessing fee\b|प्रोसेसिंग फीस/i),
    mentionsRegistrationFee: test(content, /\bregistration fee\b|रजिस्ट्रेशन फीस/i),
    mentionsPrize: test(content, /\b(?:lottery|prize|winner|won|lucky draw|jackpot)\b|लॉटरी|इनाम|विजेता/i),
    mentionsDelivery: test(content, /\b(?:parcel|delivery|courier|shipment)\b|पार्सल|डिलीवरी|कूरियर/i),
    mentionsJobOffer: test(content, /\b(?:job offer|work from home|earn .{0,15}(?:daily|per day)|no interview)\b|घर बैठे|नौकरी का प्रस्ताव/i),
    mentionsRefund: test(content, /\b(?:refund|cashback|reimbursement)\b|रिफंड|धनवापसी/i),
    mentionsRemoteAccess: test(content, /\b(?:anydesk|teamviewer|quicksupport|remote access|screen shar(?:e|ing))\b/i),
    mentionsUnknownAppOrApk: test(content, /\b(?:apk|install (?:this|the) app|unknown app|sideload)\b|ऐप इंस्टॉल/i),
  };
}
