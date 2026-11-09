export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Agar form submit hota hai
    if (url.pathname === "/api/enquiry" && request.method === "POST") {
      try {
        const data = await request.json();
        
        // Tumhari Telegram Details
        const BOT_TOKEN = "9169423487:AAF-Cd0Y1i-V9XNCMLw64oX5DWjIHSj51w8"; 
        const CHAT_ID = "7795154567";

        const message = `
📸 *New Website Enquiry*
-------------------------
*Name:* ${data.name}
*Phone:* ${data.phone}
*Event:* ${data.eventType}
*Message:* ${data.message}
        `;

        // Telegram API ko request bhejna
        const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(tgUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
           
          })
        });

        if (response.ok) {
          return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
        } else {
          const errorText = await response.text();
          return new Response(JSON.stringify({ success: false, error: errorText }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Baaki saari requests (Website ke pages aur photos) normally serve karo
    return env.ASSETS.fetch(request);
  }
};