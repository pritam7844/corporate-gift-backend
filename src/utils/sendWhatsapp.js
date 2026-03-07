import axios from 'axios';

export const sendWhatsapp = async (toPhoneNumber, message) => {
  try {
    // Note: You will need to replace this URL and headers with your actual 
    // WhatsApp provider (like Twilio, MessageBird, or Meta) once you register with them.
    
    const apiUrl = process.env.WHATSAPP_API_URL; 
    const apiKey = process.env.WHATSAPP_API_KEY;

    if (!apiUrl || !apiKey) {
      console.log('WhatsApp credentials missing. Skipping WhatsApp notification.');
      return;
    }

    const payload = {
      to: toPhoneNumber,
      type: 'text',
      text: {
        body: message
      }
    };

    await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`WhatsApp message sent to ${toPhoneNumber}`);
  } catch (error) {
    console.error(`Error sending WhatsApp: ${error.message}`);
  }
};