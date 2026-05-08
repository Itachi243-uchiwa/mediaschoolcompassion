import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, courseTitle } = req.body as {
    email: string;
    courseTitle: string;
  };

  if (!email || !courseTitle) return res.status(400).json({ error: "Données manquantes" });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ error: "Configuration email manquante (RESEND_API_KEY)" });

  const from = process.env.RESEND_FROM_EMAIL || "Compassion Média School <onboarding@resend.dev>";
  const resend = new Resend(resendKey);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr>
          <td style="background:#f97316;padding:32px;text-align:center">
            <img src="https://mediaschoolcompassion.vercel.app/Digital%20School%20Logo.png" alt="Média School" height="80" style="border-radius:12px" />
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px">
            <h1 style="margin:0 0 8px;color:#111827;font-size:22px">Inscription confirmée !</h1>
            <p style="margin:0 0 20px;color:#6b7280;font-size:14px">Merci pour votre intérêt.</p>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7">
              Votre inscription a bien été enregistrée pour la formation
              <strong style="color:#f97316"> ${courseTitle}</strong>.
            </p>
            <p style="margin:0 0 32px;color:#374151;font-size:15px;line-height:1.7">
              Vous serez averti par email dès que les premiers modules seront disponibles. En attendant, vous pouvez explorer les autres formations déjà accessibles sur la plateforme.
            </p>
            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;margin-bottom:32px">
              <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.6">
                📚 <strong>Média School Compassion</strong> propose des formations gratuites accessibles à tous. Votre curiosité nous encourage à continuer.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center">
            <p style="margin:0;color:#9ca3af;font-size:12px">Média School Compassion · Bruxelles</p>
            <p style="margin:4px 0 0;color:#9ca3af;font-size:12px">Vous recevez cet email car vous avez demandé à être averti.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from,
      to: email,
      subject: `✅ Inscription confirmée — ${courseTitle}`,
      html,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Confirmation email failed:", err);
    return res.status(500).json({ error: "Erreur d'envoi de l'email de confirmation" });
  }
}
