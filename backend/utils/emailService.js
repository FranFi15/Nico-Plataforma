import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
const FROM_EMAIL = 'Nico <hola@nsentrenamiento.com>'; // Ajustar según preferencia del usuario
const ADMIN_EMAIL = 'nicosesmaplay6@gmail.com';

export const sendAdminNotification = async (subject, htmlContent) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: subject,
      html: htmlContent,
    });
    console.log(`Admin notification sent: ${subject}`);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};

export const sendWelcomeEmail = async (user) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: '¡Bienvenido a NS Entrenamiento!',
      html: `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0f172a;">¡Hola, ${user.name}!</h1>
          <p>Nos alegra mucho darte la bienvenida a NS Entrenamiento. Tu cuenta ha sido creada exitosamente.</p>
          <p>Ya puedes acceder a la plataforma y aprender con nosotros.</p>
          <br/>
          <p>Un saludo,</p>
          <p><strong>El equipo de NS Entrenamiento</strong></p>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendMembershipSubscribedEmail = async (user) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: '¡Tu Membresía está activa!',
      html: `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981;">¡Felicidades, ${user.name}!</h1>
          <p>Tu membresía ha sido activada con éxito.</p>
          <p>Ahora tienes acceso completo a todo el contenido exclusivo y beneficios de la plataforma.</p>
          <br/>
          <p>Un saludo,</p>
          <p><strong>El equipo de NS Entrenamiento</strong></p>
        </div>
      `,
    });
    console.log(`Membership subscribed email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending membership email:', error);
  }
};

export const sendMembershipCancelledEmail = async (user) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: 'Tu Membresía ha finalizado',
      html: `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f43f5e;">Hola, ${user.name}</h1>
          <p>Te informamos que tu membresía ha llegado a su fin o ha sido cancelada.</p>
          <p>Si deseas volver a disfrutar de todos los beneficios, ¡puedes renovar tu membresía en cualquier momento!</p>
          <br/>
          <p>Un saludo,</p>
          <p><strong>El equipo de NS Entrenamiento</strong></p>
        </div>
      `,
    });
    console.log(`Membership cancelled email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending membership cancellation email:', error);
  }
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: 'Recuperación de Contraseña - NS Entrenamiento',
      html: `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0f172a;">Hola, ${user.name}</h1>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #1f75f5ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
          </div>
          <p style="font-size: 13px; color: #64748b;">Si no solicitaste esto, puedes ignorar este correo. El enlace caducará en 15 minutos.</p>
          <br/>
          <p>Un saludo,</p>
          <p><strong>El equipo de NS Entrenamiento</strong></p>
        </div>
      `,
    });
    console.log(`Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

export const sendNewContentEmail = async (users, content, url) => {
  if (!process.env.RESEND_API_KEY || users.length === 0) return;

  const bccEmails = users.map(u => u.email).filter(e => e); // Evitar mostrar los correos de todos a todos

  if (bccEmails.length === 0) return;

  const contentTypeName =
    content.contentType === 'course' ? 'Nuevo Curso' :
      content.contentType === 'workshop' ? 'Nuevo Workshop' :
        content.contentType === 'blog' ? 'Nuevo Artículo' : 'Nuevo Contenido';

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: 'noreply@nsentrenamiento.com', // El TO principal no importa mucho si usamos BCC
      bcc: bccEmails,
      subject: `Novedad en NS Entrenamiento: ${content.title}`,
      html: `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8fafc; padding: 10px 20px; border-radius: 8px; margin-bottom: 20px;">
            <span style="color: #3b82f6; font-weight: bold; font-size: 12px; text-transform: uppercase;">${contentTypeName}</span>
          </div>
          <h1 style="color: #0f172a; margin-top: 0;">${content.title}</h1>
          <p>Acabamos de publicar nuevo contenido que podría interesarte.</p>
          ${content.description ? `<p style="color: #64748b;">${content.description}</p>` : ''}
          <div style="margin-top: 30px;">
            <a href="${url}" style="background-color: #1f75f5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ver contenido</a>
          </div>
          <br/><br/>
          <p>Un saludo,</p>
          <p><strong>El equipo de NS Entrenamiento</strong></p>
        </div>
      `,
    });
    console.log(`New content email sent to ${bccEmails.length} users`);
  } catch (error) {
    console.error('Error sending new content email:', error);
  }
};

export const sendNewsEmail = async (users, news) => {
  if (!process.env.RESEND_API_KEY || users.length === 0) return;

  const bccEmails = users.map(u => u.email).filter(e => e);

  if (bccEmails.length === 0) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: 'noreply@nsentrenamiento.com',
      bcc: bccEmails,
      subject: `Noticia en el Muro: ${news.title}`,
      html: `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8fafc; padding: 10px 20px; border-radius: 8px; margin-bottom: 20px;">
            <span style="color: #10b981; font-weight: bold; font-size: 12px; text-transform: uppercase;">Novedades del Muro</span>
          </div>
          <h1 style="color: #0f172a; margin-top: 0;">${news.title}</h1>
          ${news.description ? `<p style="color: #334155; font-size: 16px; line-height: 1.5;">${news.description}</p>` : ''}
          <div style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'https://nico-plataforma-frontend.vercel.app'}/charlas-zoom" style="background-color: #1f75f5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ver en la plataforma</a>
          </div>
          <br/><br/>
          <p>Un saludo,</p>
          <p><strong>El equipo de NS Entrenamiento</strong></p>
        </div>
      `,
    });
    console.log(`News email sent to ${bccEmails.length} users`);
  } catch (error) {
    console.error('Error sending news email:', error);
  }
};

