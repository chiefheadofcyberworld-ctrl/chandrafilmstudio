
const CLOUDINARY_CLOUD_NAME = "eri30c2g";
const CLOUDINARY_UPLOAD_PRESET = "chandra_gallery";

const jsonHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders
  });
}

function isAdmin(request, env) {
  return Boolean(
    env.ADMIN_PASSWORD &&
    request.headers.get("Authorization") === `Bearer ${env.ADMIN_PASSWORD}`
  );
}

async function cloudinarySignature(params, secret) {
  const serialized = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join("&");

  const input = new TextEncoder().encode(serialized + secret);
  const digest = await crypto.subtle.digest("SHA-1", input);

  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getGallery(env) {
  const images = [];
  let cursor;

  do {
    const options = { prefix: "gallery:" };
    if (cursor) options.cursor = cursor;

    const page = await env.TESTIMONIALS_KV.list(options);

    const records = await Promise.all(
      page.keys.map(async item => {
        const value = await env.TESTIMONIALS_KV.get(item.name);
        if (!value) return null;

        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      })
    );

    images.push(...records.filter(Boolean));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return images.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

   
    // ---------- ENQUIRY API ----------
    if (url.pathname === "/api/enquiry" && request.method === "POST") {
      try {
        // Rate limit enquiry submissions by visitor IP
        const ip = request.headers.get("cf-connecting-ip") || "unknown";

        try {
          const { success } = await env.ENQUIRY_LIMITER.limit({
            key: `enquiry:${ip}`
          });

          if (!success) {
            return jsonResponse(
              {
                success: false,
                error: "Too many enquiries. Please try again later."
              },
              429
            );
          }
        } catch (error) {
          console.error("Enquiry rate limiter unavailable:", error);
          return jsonResponse(
            {
              success: false,
              error: "Enquiry service temporarily unavailable."
            },
            503
          );
        }

        const data = await request.json();

        if (!env.TELEGRAM_BOT_TOKEN) {
          return jsonResponse(
            { success: false, error: "Enquiry service not configured" },
            500
          );
        }

        const name = typeof data.name === "string" ? data.name.trim() : "";
        const phone = typeof data.phone === "string" ? data.phone.trim() : "";
        const eventType = typeof data.eventType === "string" ? data.eventType.trim() : "";
        const messageText = typeof data.message === "string" ? data.message.trim() : "";

       // Validate name and event type
if (
  !name || name.length > 100 ||
  !eventType || eventType.length > 100
) {
  return jsonResponse(
    { success: false, error: "Please enter valid enquiry details." },
    400
  );
}

// Phone must contain exactly 10 numeric digits
if (!/^[0-9]{10}$/.test(phone)) {
  return jsonResponse(
    { success: false, error: "Phone number must contain exactly 10 digits." },
    400
  );
}

// Message must contain at least 10 words
const wordCount = messageText.split(/\s+/).filter(Boolean).length;

if (wordCount < 10 || messageText.length > 1000) {
  return jsonResponse(
    { success: false, error: "Message must contain at least 10 words and maximum 1000 characters." },
    400
  );
}

        const message = `
📸 *New Website Enquiry*
-------------------------
*Name:* ${name}
*Phone:* ${phone}
*Event:* ${eventType}
*Message:* ${messageText}
        `;

        const tgUrl =
          `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

        const response = await fetch(tgUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: "7795154567",
            text: message
          })
        });

        if (!response.ok) {
          console.error("Telegram delivery failed:", response.status);

          return jsonResponse(
            {
              success: false,
              error: "Unable to send enquiry. Please try again later."
            },
            502
          );
        }

        return jsonResponse({ success: true });

      } catch (error) {
        console.error("Enquiry processing failed:", error);

        return jsonResponse(
          { success: false, error: "Unable to process enquiry" },
          500
        );
      }
    }


    
// ---------- ADMIN LOGIN VERIFICATION ----------
if (url.pathname === "/api/admin/verify") {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Rate limit admin login attempts by visitor IP
  const ip = request.headers.get("cf-connecting-ip") || "unknown";

  try {
    const { success } = await env.ADMIN_LOGIN_LIMITER.limit({
      key: `admin-login:${ip}`
    });

    if (!success) {
      return jsonResponse(
        { error: "Too many login attempts. Please try again later." },
        429
      );
    }
  } catch (error) {
    console.error("Admin rate limiter unavailable:", error);
    return jsonResponse(
      { error: "Login temporarily unavailable. Please try again later." },
      503
    );
  }

  if (!isAdmin(request, env)) {
    return jsonResponse({ error: "Invalid password" }, 401);
  }

  return jsonResponse({ success: true });
}


    // ---------- TESTIMONIALS API ----------
    if (url.pathname === "/api/testimonials") {
      if (request.method === "GET") {
        const reviews = await env.TESTIMONIALS_KV.get("reviews");

        return new Response(reviews || "[]", {
          headers: jsonHeaders
        });
      }

      if (!isAdmin(request, env)) {
        return jsonResponse({ error: "Unauthorized Access" }, 401);
      }

      if (request.method === "POST") {
        try {
          const data = await request.json();

          const name = typeof data.name === "string" ? data.name.trim() : "";
          const event = typeof data.event === "string" ? data.event.trim() : "";
          const reviewText = typeof data.text === "string" ? data.text.trim() : "";

          if (
            !name || name.length > 80 ||
            !event || event.length > 80 ||
            !reviewText || reviewText.length > 1000
          ) {
            return jsonResponse({ error: "Invalid review data" }, 400);
          }

          const reviews = JSON.parse(
            await env.TESTIMONIALS_KV.get("reviews") || "[]"
          );

          const newReview = {
            id: crypto.randomUUID(),
            name,
            event,
            text: reviewText
          };

          reviews.unshift(newReview);

          await env.TESTIMONIALS_KV.put(
            "reviews",
            JSON.stringify(reviews)
          );

          return jsonResponse({ success: true, review: newReview });

        } catch {
          return jsonResponse({ error: "Unable to add review" }, 500);
        }
      }

      if (request.method === "DELETE") {
        try {
          const body = await request.json();
          const idToDelete = body.id;

          if (typeof idToDelete !== "string" || !idToDelete) {
            return jsonResponse({ error: "Valid review ID required" }, 400);
          }

          const reviews = JSON.parse(
            await env.TESTIMONIALS_KV.get("reviews") || "[]"
          );

          const filteredReviews = reviews.filter(
            review => review.id !== idToDelete
          );

          if (filteredReviews.length === reviews.length) {
            return jsonResponse({ error: "Review not found" }, 404);
          }

          await env.TESTIMONIALS_KV.put(
            "reviews",
            JSON.stringify(filteredReviews)
          );

          return jsonResponse({ success: true });

        } catch {
          return jsonResponse({ error: "Unable to delete review" }, 500);
        }
      }

      return new Response("Method Not Allowed", { status: 405 });
    }

    // ---------- GALLERY SIGNATURE API ----------
    if (url.pathname === "/api/gallery/sign") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      if (!isAdmin(request, env)) {
        return jsonResponse({ error: "Unauthorized Access" }, 401);
      }

      if (!env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
        return jsonResponse(
          { error: "Cloudinary credentials not configured" },
          500
        );
      }

      try {
        const timestamp = Math.floor(Date.now() / 1000);

        const params = {
          timestamp,
          upload_preset: CLOUDINARY_UPLOAD_PRESET
        };

        const signature = await cloudinarySignature(
          params,
          env.CLOUDINARY_API_SECRET
        );

        return jsonResponse({
          cloud_name: CLOUDINARY_CLOUD_NAME,
          api_key: env.CLOUDINARY_API_KEY,
          upload_preset: CLOUDINARY_UPLOAD_PRESET,
          timestamp,
          signature
        });

      } catch {
        return jsonResponse({ error: "Unable to generate signature" }, 500);
      }
    }

    // ---------- PUBLIC GALLERY + SAVE + DELETE ----------
    if (url.pathname === "/api/gallery") {

      // GET: Public gallery
      if (request.method === "GET") {
        try {
          const images = await getGallery(env);
          return jsonResponse(images);
        } catch {
          return jsonResponse({ error: "Unable to load gallery" }, 500);
        }
      }

      // POST and DELETE require admin authentication
      if (!isAdmin(request, env)) {
        return jsonResponse({ error: "Unauthorized Access" }, 401);
      }

      // POST: Save uploaded image details
      if (request.method === "POST") {
        try {
          const data = await request.json();

          const secureUrl =
            typeof data.secure_url === "string" ? data.secure_url : "";

          const publicId =
            typeof data.public_id === "string" ? data.public_id : "";

          const category =
            typeof data.category === "string" ? data.category : "";

          let parsedUrl;

          try {
            parsedUrl = new URL(secureUrl);
          } catch {
            return jsonResponse({ error: "Invalid image URL" }, 400);
          }

          if (
            parsedUrl.protocol !== "https:" ||
            parsedUrl.hostname !== "res.cloudinary.com" ||
            !parsedUrl.pathname.startsWith(
              `/${CLOUDINARY_CLOUD_NAME}/image/upload/`
            )
          ) {
            return jsonResponse({ error: "Untrusted image URL" }, 400);
          }

          if (
            !publicId ||
            publicId.length > 255 ||
            !/^[A-Za-z0-9_./-]+$/.test(publicId)
          ) {
            return jsonResponse({ error: "Invalid image ID" }, 400);
          }

          if (!["Wedding", "Events"].includes(category)) {
            return jsonResponse({ error: "Invalid category" }, 400);
          }

          const image = {
            id: crypto.randomUUID(),
            public_id: publicId,
            secure_url: secureUrl,
            category,
            createdAt: new Date().toISOString()
          };

          await env.TESTIMONIALS_KV.put(
            `gallery:${image.id}`,
            JSON.stringify(image)
          );

          return jsonResponse({ success: true, image });

        } catch {
          return jsonResponse({ error: "Unable to save gallery image" }, 500);
        }
      }

      // DELETE: Delete from Cloudinary and KV
      if (request.method === "DELETE") {
        try {
          const body = await request.json();
          const id = body.id;

          if (typeof id !== "string" || !id) {
            return jsonResponse({ error: "Valid image ID required" }, 400);
          }

          const key = `gallery:${id}`;
          const savedImage = await env.TESTIMONIALS_KV.get(key);

          if (!savedImage) {
            return jsonResponse({ error: "Image not found" }, 404);
          }

          const image = JSON.parse(savedImage);

          if (!env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
            return jsonResponse({ error: "Cloudinary credentials missing" }, 500);
          }

          const timestamp = Math.floor(Date.now() / 1000);

          const params = {
            invalidate: "true",
            public_id: image.public_id,
            timestamp
          };

          const signature = await cloudinarySignature(
            params,
            env.CLOUDINARY_API_SECRET
          );

          const form = new URLSearchParams({
            public_id: image.public_id,
            timestamp: String(timestamp),
            api_key: env.CLOUDINARY_API_KEY,
            signature,
            invalidate: "true"
          });

          const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: form
            }
          );

          const result = await cloudinaryResponse.json();

          if (!cloudinaryResponse.ok || result.result !== "ok") {
            return jsonResponse(
              { error: "Cloudinary image deletion failed", details: result.result },
              502
            );
          }

          await env.TESTIMONIALS_KV.delete(key);

          return jsonResponse({ success: true });

        } catch {
          return jsonResponse({ error: "Unable to delete gallery image" }, 500);
        }
      }

      return new Response("Method Not Allowed", { status: 405 });
    }
// Pricing Calculator API
if (url.pathname === "/api/pricing") {

  // Fetch Rates (Public)
  if (request.method === "GET") {
    try {
      const rates = await env.TESTIMONIALS_KV.get("pricing_rates");

      return new Response(rates || "{}", {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      });

    } catch (error) {
      return jsonResponse({ error: "Unable to fetch pricing rates" }, 500);
    }
  }

  // Update Rates (Admin Only)
  if (request.method === "POST") {

    if (!isAdmin(request, env)) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    try {
      const newRates = await request.json();

      if (
        !newRates ||
        typeof newRates !== "object" ||
        Array.isArray(newRates)
      ) {
        return jsonResponse({ error: "Invalid pricing data" }, 400);
      }

      // Temporary structural validation.
      // Exact allowed fields and numeric limits must match your calculator.
      const entries = Object.entries(newRates);

      if (entries.length === 0 || entries.length > 30) {
        return jsonResponse({ error: "Invalid number of pricing entries" }, 400);
      }

      for (const [key, value] of entries) {
        if (
          !/^[a-zA-Z0-9_-]{1,50}$/.test(key) ||
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value < 0 ||
          value > 10000000
        ) {
          return jsonResponse({ error: "Invalid pricing entry" }, 400);
        }
      }

      await env.TESTIMONIALS_KV.put(
        "pricing_rates",
        JSON.stringify(newRates)
      );

      return jsonResponse({ success: true });

    } catch (error) {
      return jsonResponse({ error: "Invalid request or server error" }, 400);
    }
  }

  return new Response("Method Not Allowed", {
    status: 405,
    headers: { "Allow": "GET, POST" }
  });
}
    // ---------- WEBSITE ASSETS ----------
    return env.ASSETS.fetch(request);
  }
};
