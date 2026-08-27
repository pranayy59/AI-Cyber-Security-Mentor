import { analysisSchema } from "@/lib/schema";
import type { ScamSignals } from "@/lib/analyze-signals";
import type { AnalysisResult, Language, RiskLevel } from "@/types/analysis";

type CategoryKey =
  | "bankKyc"
  | "credentials"
  | "lottery"
  | "job"
  | "delivery"
  | "payment"
  | "socialEngineering"
  | "none";

type SignalKey =
  | "url"
  | "insecureUrl"
  | "ipUrl"
  | "shortUrl"
  | "urgency"
  | "accountThreat"
  | "kyc"
  | "otp"
  | "pin"
  | "password"
  | "bankDetails"
  | "payment"
  | "processingFee"
  | "registrationFee"
  | "prize"
  | "delivery"
  | "job"
  | "refund"
  | "remoteAccess"
  | "unknownApp";

const COPY = {
  en: {
    categories: {
      bankKyc: "Bank / KYC Phishing",
      credentials: "Credential Theft / Phishing",
      lottery: "Lottery / Advance Fee Scam",
      job: "Fake Job Scam",
      delivery: "Fake Delivery Scam",
      payment: "Payment Scam",
      socialEngineering: "Suspicious Link / Social Engineering",
      none: "None",
    },
    categoryDescriptions: {
      bankKyc: "Scammers pose as a bank or KYC team and use account warnings to pressure people into revealing OTPs, passwords, or banking details.",
      credentials: "Phishing scams imitate a trusted service to steal login details, OTPs, passwords, or other sensitive information.",
      lottery: "Lottery and advance-fee scams promise a prize, then demand a fee or financial details before the supposed reward can be claimed.",
      job: "Fake job scams offer attractive work without proper verification, then ask for registration fees, payments, or personal information.",
      delivery: "Fake delivery scams claim a parcel has a problem and push people to open a link, pay a small fee, or share sensitive details.",
      payment: "Payment scams pressure people to send money or disclose financial information for an unexpected or misleading request.",
      socialEngineering: "Social engineering messages use trust, urgency, or curiosity to persuade people to click suspicious links or take unsafe actions.",
      none: "No scam pattern was detected in the visible message.",
    },
    summaries: {
      SAFE: "No common scam indicators were found in this message.",
      SUSPICIOUS: "This message contains signals that should be independently verified.",
      DANGEROUS: "This message contains multiple strong indicators of a scam attempt.",
    },
    reasons: {
      url: "It contains a link whose destination was not opened.",
      insecureUrl: "The visible link uses unencrypted HTTP.",
      ipUrl: "The visible link uses an IP address instead of a normal domain.",
      shortUrl: "It uses a shortened link that hides the destination.",
      urgency: "It creates pressure to act immediately.",
      accountThreat: "It threatens that an account will be blocked or suspended.",
      kyc: "It uses KYC verification as a reason to take action.",
      otp: "It asks for or mentions sharing an OTP.",
      pin: "It asks for or mentions sharing a PIN.",
      password: "It asks for or mentions sharing a password.",
      bankDetails: "It requests banking or card information.",
      payment: "It requests an unexpected payment or money transfer.",
      processingFee: "It asks for a processing fee.",
      registrationFee: "It asks for a registration fee.",
      prize: "It promises an unexpected prize or lottery reward.",
      delivery: "It uses a parcel or delivery problem to prompt action.",
      job: "It makes an unusually easy or high-paying job offer.",
      refund: "It uses an unexpected refund or cashback claim.",
      remoteAccess: "It asks for remote access or screen sharing.",
      unknownApp: "It asks for an unknown app or APK to be installed.",
    },
    warnings: {
      url: "Unknown link",
      insecureUrl: "Non-HTTPS link",
      ipUrl: "IP-address link",
      shortUrl: "Shortened link",
      urgency: "Urgency",
      accountThreat: "Account threat",
      kyc: "KYC request",
      otp: "OTP request",
      pin: "PIN request",
      password: "Password request",
      bankDetails: "Bank information request",
      payment: "Payment request",
      processingFee: "Processing fee",
      registrationFee: "Registration fee",
      prize: "Unexpected prize",
      delivery: "Delivery problem",
      job: "Unverified job offer",
      refund: "Unexpected refund",
      remoteAccess: "Remote-access request",
      unknownApp: "Unknown app or APK",
    },
    actions: {
      SAFE: "No immediate scam indicators were found. Still verify any unexpected request for sensitive information through an official channel.",
      SUSPICIOUS: "Do not use links or contact details in the message. Independently verify the request through the organization's official app, website or phone number.",
      DANGEROUS: "Do not click the link or share OTP, PIN, passwords or banking details. Stop contact and verify through an official channel. If money is involved, contact your bank and cybercrime reporting channels immediately.",
    },
    safeReason: "No common scam signals were detected in the visible text.",
  },
  hi: {
    categories: {
      bankKyc: "बैंक / KYC फ़िशिंग",
      credentials: "गोपनीय जानकारी चोरी / फ़िशिंग",
      lottery: "लॉटरी / एडवांस फीस धोखाधड़ी",
      job: "नकली नौकरी धोखाधड़ी",
      delivery: "नकली डिलीवरी धोखाधड़ी",
      payment: "भुगतान धोखाधड़ी",
      socialEngineering: "संदिग्ध लिंक / सोशल इंजीनियरिंग",
      none: "कोई नहीं",
    },
    categoryDescriptions: {
      bankKyc: "धोखेबाज़ बैंक या KYC टीम बनकर खाते पर कार्रवाई की धमकी देते हैं और OTP, पासवर्ड या बैंक जानकारी हासिल करने का दबाव बनाते हैं।",
      credentials: "फ़िशिंग में धोखेबाज़ किसी भरोसेमंद सेवा की नकल करके लॉगिन जानकारी, OTP, पासवर्ड या दूसरी संवेदनशील जानकारी चुराने की कोशिश करते हैं।",
      lottery: "लॉटरी और एडवांस फीस धोखाधड़ी में इनाम का वादा करके उसे पाने से पहले फीस या वित्तीय जानकारी मांगी जाती है।",
      job: "नकली नौकरी धोखाधड़ी में बिना सही सत्यापन के आकर्षक काम का प्रस्ताव देकर रजिस्ट्रेशन फीस, भुगतान या निजी जानकारी मांगी जाती है।",
      delivery: "नकली डिलीवरी धोखाधड़ी में पार्सल की समस्या बताकर संदिग्ध लिंक खोलने, छोटी फीस देने या संवेदनशील जानकारी साझा करने का दबाव बनाया जाता है।",
      payment: "भुगतान धोखाधड़ी में किसी अनपेक्षित या भ्रामक अनुरोध के बहाने पैसे भेजने या वित्तीय जानकारी देने का दबाव बनाया जाता है।",
      socialEngineering: "सोशल इंजीनियरिंग संदेश भरोसे, जल्दबाज़ी या जिज्ञासा का फायदा उठाकर संदिग्ध लिंक खोलने या असुरक्षित कदम उठाने के लिए मनाते हैं।",
      none: "दिखाई देने वाले संदेश में कोई धोखाधड़ी पैटर्न नहीं मिला।",
    },
    summaries: {
      SAFE: "इस संदेश में धोखाधड़ी के सामान्य संकेत नहीं मिले।",
      SUSPICIOUS: "इस संदेश में ऐसे संकेत हैं जिनकी स्वतंत्र रूप से पुष्टि करनी चाहिए।",
      DANGEROUS: "इस संदेश में धोखाधड़ी के कई मजबूत संकेत हैं।",
    },
    reasons: {
      url: "इसमें एक लिंक है, जिसका गंतव्य खोला नहीं गया।",
      insecureUrl: "दिखाई देने वाला लिंक असुरक्षित HTTP का उपयोग करता है।",
      ipUrl: "लिंक सामान्य डोमेन के बजाय IP पते का उपयोग करता है।",
      shortUrl: "छोटा किया गया लिंक असली गंतव्य छिपाता है।",
      urgency: "यह तुरंत कार्रवाई करने का दबाव बनाता है।",
      accountThreat: "यह खाता बंद या निलंबित करने की धमकी देता है।",
      kyc: "यह कार्रवाई के लिए KYC सत्यापन का बहाना देता है।",
      otp: "यह OTP साझा करने के लिए कहता या उसका उल्लेख करता है।",
      pin: "यह PIN साझा करने के लिए कहता या उसका उल्लेख करता है।",
      password: "यह पासवर्ड साझा करने के लिए कहता या उसका उल्लेख करता है।",
      bankDetails: "यह बैंक या कार्ड की जानकारी मांगता है।",
      payment: "यह अचानक भुगतान या पैसे भेजने को कहता है।",
      processingFee: "यह प्रोसेसिंग फीस मांगता है।",
      registrationFee: "यह रजिस्ट्रेशन फीस मांगता है।",
      prize: "यह अचानक लॉटरी या इनाम मिलने का दावा करता है।",
      delivery: "यह कार्रवाई कराने के लिए पार्सल या डिलीवरी समस्या बताता है।",
      job: "यह असामान्य रूप से आसान या अधिक कमाई वाली नौकरी देता है।",
      refund: "यह अचानक रिफंड या कैशबैक का दावा करता है।",
      remoteAccess: "यह रिमोट एक्सेस या स्क्रीन शेयरिंग मांगता है।",
      unknownApp: "यह अनजान ऐप या APK इंस्टॉल करने को कहता है।",
    },
    warnings: {
      url: "अनजान लिंक",
      insecureUrl: "असुरक्षित HTTP लिंक",
      ipUrl: "IP पते वाला लिंक",
      shortUrl: "छोटा किया गया लिंक",
      urgency: "जल्दबाज़ी का दबाव",
      accountThreat: "खाता बंद करने की धमकी",
      kyc: "KYC अनुरोध",
      otp: "OTP अनुरोध",
      pin: "PIN अनुरोध",
      password: "पासवर्ड अनुरोध",
      bankDetails: "बैंक जानकारी का अनुरोध",
      payment: "भुगतान अनुरोध",
      processingFee: "प्रोसेसिंग फीस",
      registrationFee: "रजिस्ट्रेशन फीस",
      prize: "अचानक इनाम",
      delivery: "डिलीवरी समस्या",
      job: "असत्यापित नौकरी प्रस्ताव",
      refund: "अचानक रिफंड",
      remoteAccess: "रिमोट एक्सेस अनुरोध",
      unknownApp: "अनजान ऐप या APK",
    },
    actions: {
      SAFE: "तुरंत धोखाधड़ी का संकेत नहीं मिला। फिर भी संवेदनशील जानकारी के किसी अप्रत्याशित अनुरोध की आधिकारिक माध्यम से पुष्टि करें।",
      SUSPICIOUS: "संदेश के लिंक या संपर्क विवरण का उपयोग न करें। संस्था के आधिकारिक ऐप, वेबसाइट या फोन नंबर से स्वतंत्र रूप से पुष्टि करें।",
      DANGEROUS: "लिंक पर क्लिक न करें और OTP, PIN, पासवर्ड या बैंक जानकारी साझा न करें। संपर्क बंद करें और आधिकारिक माध्यम से पुष्टि करें। पैसे का मामला हो तो तुरंत बैंक और साइबर अपराध चैनल से संपर्क करें।",
    },
    safeReason: "दिखाई देने वाले टेक्स्ट में धोखाधड़ी के सामान्य संकेत नहीं मिले।",
  },
} as const;

function detectedSignalKeys(signals: ScamSignals): SignalKey[] {
  const keys: SignalKey[] = [];
  const add = (detected: boolean, key: SignalKey) => { if (detected) keys.push(key); };
  add(signals.hasUrl, "url");
  add(signals.usesHttp, "insecureUrl");
  add(signals.urlUsesIpAddress, "ipUrl");
  add(signals.usesUrlShortener, "shortUrl");
  add(signals.containsUrgency, "urgency");
  add(signals.mentionsAccountBlocked || signals.mentionsSuspension, "accountThreat");
  add(signals.mentionsKyc, "kyc");
  add(signals.asksForOtp, "otp");
  add(signals.asksForPin, "pin");
  add(signals.asksForPassword, "password");
  add(signals.asksForBankDetails, "bankDetails");
  add(signals.asksForPayment, "payment");
  add(signals.mentionsProcessingFee, "processingFee");
  add(signals.mentionsRegistrationFee, "registrationFee");
  add(signals.mentionsPrize, "prize");
  add(signals.mentionsDelivery, "delivery");
  add(signals.mentionsJobOffer, "job");
  add(signals.mentionsRefund, "refund");
  add(signals.mentionsRemoteAccess, "remoteAccess");
  add(signals.mentionsUnknownAppOrApk, "unknownApp");
  return keys;
}

function chooseCategory(signals: ScamSignals): CategoryKey {
  const sensitive = signals.asksForOtp || signals.asksForPin || signals.asksForPassword || signals.asksForBankDetails;
  if (signals.mentionsKyc || ((signals.mentionsAccountBlocked || signals.mentionsSuspension) && (signals.hasUrl || sensitive))) return "bankKyc";
  if (signals.mentionsPrize && (signals.mentionsProcessingFee || signals.asksForPayment || signals.asksForBankDetails)) return "lottery";
  if (signals.mentionsJobOffer && (signals.mentionsRegistrationFee || signals.asksForPayment)) return "job";
  if (signals.mentionsDelivery && (signals.asksForPayment || signals.hasUrl)) return "delivery";
  if (sensitive || signals.mentionsRemoteAccess || signals.mentionsUnknownAppOrApk) return "credentials";
  if (signals.asksForPayment || signals.mentionsProcessingFee || signals.mentionsRegistrationFee) return "payment";
  if (signals.hasUrl || signals.containsUrgency || signals.mentionsRefund || signals.mentionsPrize || signals.mentionsJobOffer || signals.mentionsDelivery) return "socialEngineering";
  return "none";
}

function classify(signals: ScamSignals): { riskLevel: RiskLevel; riskScore: number } {
  const sensitive = signals.asksForOtp || signals.asksForPin || signals.asksForPassword || signals.asksForBankDetails;
  const accountThreat = signals.mentionsAccountBlocked || signals.mentionsSuspension;
  const dangerous =
    signals.mentionsRemoteAccess ||
    (signals.mentionsUnknownAppOrApk && (signals.hasUrl || signals.containsUrgency)) ||
    (sensitive && (signals.containsUrgency || signals.hasUrl || accountThreat || signals.mentionsPrize)) ||
    (signals.mentionsKyc && (signals.containsUrgency || accountThreat || signals.hasUrl)) ||
    (accountThreat && signals.hasUrl) ||
    (signals.mentionsPrize && (signals.mentionsProcessingFee || signals.asksForPayment || signals.asksForBankDetails)) ||
    (signals.mentionsJobOffer && (signals.mentionsRegistrationFee || signals.asksForPayment)) ||
    (signals.mentionsDelivery && signals.asksForPayment && signals.hasUrl);

  const detected = detectedSignalKeys(signals).length;
  if (dangerous) return { riskLevel: "DANGEROUS", riskScore: Math.min(95, 77 + detected * 2) };

  const suspicious =
    (signals.hasUrl && signals.containsUrgency) ||
    signals.asksForPayment ||
    signals.mentionsProcessingFee ||
    signals.mentionsRegistrationFee ||
    signals.usesUrlShortener ||
    signals.urlUsesIpAddress ||
    signals.mentionsUnknownAppOrApk ||
    signals.mentionsRefund ||
    signals.mentionsPrize ||
    signals.mentionsJobOffer ||
    signals.mentionsDelivery ||
    signals.mentionsKyc ||
    accountThreat ||
    sensitive;

  if (suspicious) return { riskLevel: "SUSPICIOUS", riskScore: Math.min(65, 40 + detected * 3) };
  return { riskLevel: "SAFE", riskScore: signals.hasUrl ? 24 : 12 };
}

export function analyzeWithFallback(
  _content: string,
  language: Language,
  signals: ScamSignals,
): AnalysisResult {
  const copy = COPY[language];
  const { riskLevel, riskScore } = classify(signals);
  const categoryKey = riskLevel === "SAFE" ? "none" : chooseCategory(signals);
  const detected = detectedSignalKeys(signals);
  const prioritized = detected.sort((a, b) => {
    const priority: SignalKey[] = ["otp", "pin", "password", "bankDetails", "remoteAccess", "unknownApp", "payment", "processingFee", "registrationFee", "accountThreat", "urgency", "kyc", "prize", "job", "delivery", "ipUrl", "shortUrl", "insecureUrl", "url", "refund"];
    return priority.indexOf(a) - priority.indexOf(b);
  });

  const result: AnalysisResult = {
    riskLevel,
    riskScore,
    category: copy.categories[categoryKey],
    categoryDescription: copy.categoryDescriptions[categoryKey],
    summary: copy.summaries[riskLevel],
    reasons: riskLevel === "SAFE" ? [copy.safeReason] : prioritized.slice(0, 4).map((key) => copy.reasons[key]),
    action: copy.actions[riskLevel],
    warningSigns: riskLevel === "SAFE" ? [] : prioritized.slice(0, 6).map((key) => copy.warnings[key]),
  };

  return analysisSchema.parse(result);
}
