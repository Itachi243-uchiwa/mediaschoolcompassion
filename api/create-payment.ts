import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, description, locale } = req.body as {
    amount?: string;
    description?: string;
    locale?: string;
  };

  // Validate amount
  const parsed = parseFloat(amount ?? "");
  if (isNaN(parsed) || parsed < 1 || parsed > 9999) {
    return res.status(400).json({ error: "Montant invalide (min 1€, max 9999€)" });
  }

  const mollieKey = process.env.MOLLIE_API_KEY;
  if (!mollieKey) {
    return res.status(500).json({ error: "Configuration paiement manquante" });
  }

  // Build redirect & webhook URLs from request origin
  const appUrl =
    process.env.APP_URL ||
    (req.headers["x-forwarded-proto"] && req.headers["x-forwarded-host"]
      ? `${req.headers["x-forwarded-proto"]}://${req.headers["x-forwarded-host"]}`
      : "https://yourapp.vercel.app");

  const formattedAmount = parsed.toFixed(2);

  try {
    const mollieRes = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mollieKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          currency: "EUR",
          value: formattedAmount,
        },
        description: description || "Don volontaire — Media School Compassion",
        redirectUrl: `${appUrl}/don/merci`,
        cancelUrl: `${appUrl}/don/annule`,
        webhookUrl: `${appUrl}/api/mollie-webhook`,
        locale: locale || "fr_BE",
        metadata: {
          type: "donation",
          source: "media-school-compassion",
        },
      }),
    });

    if (!mollieRes.ok) {
      const errBody = await mollieRes.text();
      console.error("Mollie error:", errBody);
      return res.status(502).json({ error: "Erreur lors de la création du paiement" });
    }

    const payment = await mollieRes.json() as {
      id: string;
      _links: { checkout: { href: string } };
    };

    return res.status(200).json({
      paymentId: payment.id,
      checkoutUrl: payment._links.checkout.href,
    });
  } catch (err) {
    console.error("Payment creation failed:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
