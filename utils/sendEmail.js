import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false }
});

export const sendOrderConfirmation = async (order) => {
  const items = order.items || [];
  const itemsList = items.map(i => `• ${i.name} | Taille: ${i.size} | Qté: ${i.quantity} | ${i.price * i.quantity} MAD`).join('\n');

  // ✅ Parser la location
  let locationData = null;
  if (order.location) {
    try {
      locationData = typeof order.location === 'string' ? JSON.parse(order.location) : order.location;
      console.log('📍 Location parsée:', locationData);
    } catch (e) {a
      console.error('❌ Erreur parsing location:', e);
    }
  }

  // Email admin (TOI)
  await transporter.sendMail({
    from: `"AVELINE" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🛒 Nouvelle commande #${order.order_number} - ${order.first_name} ${order.last_name} - ${order.total} MAD`,
    html: `
      <div style="max-width:600px;font-family:sans-serif;">
        <div style="background:#0F172A;color:white;padding:25px;text-align:center;border-radius:16px 16px 0 0;">
          <h1 style="margin:0;">🛒 Nouvelle commande</h1>
          <p>N° ${order.order_number} • ${new Date(order.created_at).toLocaleString('fr-FR')}</p>
        </div>
        <div style="background:white;padding:25px;border:1px solid #eee;border-radius:0 0 16px 16px;">
          <h3>👤 Client</h3>
          <p><strong>${order.first_name} ${order.last_name}</strong><br>📧 ${order.email}<br>📱 ${order.phone}</p>
          
          <h3>📍 Adresse</h3>
          <p>${order.address}<br>${order.postal_code} ${order.city}<br>${order.country}</p>
          
          ${locationData ? `
            <div style="background:#f0fdf4;padding:15px;border-radius:12px;margin:15px 0;border:2px dashed #10b981;">
              <h3 style="color:#065f46;">🗺️ Localisation GPS</h3>
              <p><strong>Lat:</strong> ${locationData.latitude}<br><strong>Lng:</strong> ${locationData.longitude}<br><strong>Précision:</strong> ±${Math.round(locationData.accuracy)}m</p>
              <a href="https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}" target="_blank" style="display:inline-block;padding:10px 20px;background:#10b981;color:white;border-radius:50px;text-decoration:none;font-weight:600;">🗺️ Voir sur Google Maps</a>
            </div>
          ` : '<p style="color:#999;">⚠️ Localisation GPS non fournie</p>'}
          
          <h3>📦 Articles</h3>
          <pre style="background:#f5f5f5;padding:15px;border-radius:8px;">${itemsList}</pre>
          
          <div style="background:#0F172A;color:white;padding:15px;border-radius:12px;margin-top:15px;">
            ${order.discount > 0 ? `<p>Réduction: -${order.discount} MAD</p>` : ''}
            <p>Livraison: ${order.shipping === 0 ? 'Gratuite' : order.shipping + ' MAD'}</p>
            <p style="font-size:18px;"><strong>Total: ${order.total} MAD</strong></p>
            <p>Paiement: ${order.payment_method === 'paypal' ? 'PayPal' : 'À la livraison'}</p>
          </div>
          ${order.notes ? `<p>📝 Notes: ${order.notes}</p>` : ''}
        </div>
      </div>
    `
  });

  // Email client
  await transporter.sendMail({
    from: `"AVELINE" <${process.env.SMTP_USER}>`,
    to: order.email,
    subject: `✅ Confirmation #${order.order_number} - AVELINE`,
    html: `
      <div style="max-width:600px;font-family:sans-serif;">
        <div style="background:#6B0F24;color:white;padding:25px;text-align:center;border-radius:16px 16px 0 0;">
          <h1 style="margin:0;">AVELINE</h1>
        </div>
        <div style="background:white;padding:25px;border:1px solid #eee;border-radius:0 0 16px 16px;">
          <h2>Merci ${order.first_name} !</h2>
          <p>Commande <strong>#${order.order_number}</strong> confirmée.</p>
          <pre style="background:#f5f5f5;padding:15px;border-radius:8px;">${itemsList}</pre>
          <p style="font-size:18px;"><strong>Total: ${order.total} MAD</strong></p>
          <p>Livraison: ${order.address}, ${order.city}</p>
        </div>
      </div>
    `
  });

  console.log(`✅ Emails envoyés pour #${order.order_number}`);


  
};