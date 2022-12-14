import { isAssetError } from "next/dist/client/route-loader";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const params = {
        submit_type: "pay",
        payment_method_types: ["card"],
        billing_address_collection: "auto",
        shipping_options: [
          { shipping_rate: "shr_1LRLRNJR0ReKo6TerlQA38Vt" },
          { shipping_rate: "shr_1LQd2AJR0ReKo6TeByFOiV6r" },
        ],
        line_items: req.body.map((item) => {
          const img = item.image[0].asset._ref;
          const newImage = img
            .replace(
              "image-",
              "https://cdn.sanity.io/images/phhmwv0w/production/"
            )
            .replace("-wep", ".webp");

          return {
            price_data: {
              currency: "USD",
              product_data: {
                name: item.name,
                images: [newImage],
              },
              unit_amount: item.price * 100,
            },
            adjustable_quantity: {
              enabled: true,
              minimum: 1,
            },
            quantity: item.quantity,
          };
        }),
        mode: "payment",
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/canceled`,
      };
      // Create Checkout Sessions from body params.
      console.log(params.line_items);
      const session = await stripe.checkout.sessions.create(params);
      params.sessionId = session.id;
      res.status(200).json(session);
    } catch (error) {
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

// export default async function handler(req, res) {
//     if (req.method === 'POST') {
//       try {
//         // Create Checkout Sessions from body params.
//         const session = await stripe.checkout.sessions.create({
//           line_items: [
//             {
//               // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
//               price: '{{PRICE_ID}}',
//               quantity: 1,
//             },
//           ],
//           mode: 'payment',
//           success_url: `${req.headers.origin}/?success=true`,
//           cancel_url: `${req.headers.origin}/?canceled=true`,
//         });
//         res.redirect(303, session.url);
//       } catch (err) {
//         res.status(err.statusCode || 500).json(err.message);
//       }
//     } else {
//       res.setHeader('Allow', 'POST');
//       res.status(405).end('Method Not Allowed');
//     }
//   }
