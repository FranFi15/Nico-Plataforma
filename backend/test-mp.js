import fetch from 'node-fetch';

async function test() {
  const token = 'APP_USR-7930916942766715-073115-92592a991c573fed499e8744df0891f1-184737908';
  try {
    const res = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        back_url: 'https://nico-plataforma.onrender.com/payments/status',
        reason: 'Suscripcion Mensual',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 1990,
          currency_id: 'ARS',
        },
        payer_email: 'test_user_789456@gmail.com',
        status: 'pending',
        external_reference: '60d5ecb8b392134'
      })
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch(e) {
    console.error("Error:", e);
  }
}

test();
