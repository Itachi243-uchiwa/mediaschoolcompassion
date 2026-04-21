import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Mollie webhook — appelé automatiquement par Mollie quand le statut d'un paiement change.
 * Pour les dons simples, on log juste le résultat.
 * Tu peux étendre ici pour sauvegarder en Firestore, envoyer un email, etc.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { id: paymentId } = req.body as { id?: string };

  if (!paymentId) {
    return res.status(400).end();
  }

  const mollieKey = process.env.MOLLIE_API_KEY;
  if (!mollieKey) {
    return res.status(500).end();
  }

  try {
    // Fetch payment details from Mollie to verify status
    const mollieRes = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mollieKey}` },
    });

    if (!mollieRes.ok) {
      console.error("Webhook: failed to fetch payment", paymentId);
      return res.status(200).end(); // Always return 200 to Mollie
    }

    const payment = await mollieRes.json() as {
      id: string;
      status: string;
      amount: { value: string; currency: string };
      metadata?: Record<string, string>;
    };

    console.log(
      `[Mollie Webhook] Payment ${payment.id} — status: ${payment.status} — ${payment.amount.value} ${payment.amount.currency}`
    );

    // TODO: Extend this to save donation to Firestore, send a thank-you email, etc.
    // Example:
    // if (payment.status === "paid") {
    //   await saveDonationToFirestore(payment);
    // }

  } catch (err) {
    console.error("Webhook error:", err);
  }

  // Always return 200 to Mollie, otherwise it will retry
  return res.status(200).end();
}
