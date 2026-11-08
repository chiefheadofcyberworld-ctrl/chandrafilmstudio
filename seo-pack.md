# Chandra Film Studio: SEO Pack (Dinara, Rohtas, Bihar)

Domain: https://chandrafilmstudio.in
Phone: +919798112812

## 1. Title + Meta + Canonical (har page ke `<head>` mein)

### Home (index.html)
```html
<title>Wedding Photographer in Dinara, Rohtas | Chandra Film Studio</title>
<meta name="description" content="Candid wedding photography & cinematic films in Dinara, Rohtas, Bihar. Chandra Film Studio turns your moments into timeless stories. Enquire on WhatsApp.">
<link rel="canonical" href="https://chandrafilmstudio.in/">
```

### About (about.html)
```html
<title>About Us | Chandra Film Studio, Dinara, Rohtas</title>
<meta name="description" content="Meet Chandra Film Studio, a Dinara (Rohtas, Bihar) wedding photography and cinematography team focused on candid, timeless storytelling.">
<link rel="canonical" href="https://chandrafilmstudio.in/about.html">
```

### Services (services.html)
```html
<title>Wedding Photography & Film Services in Dinara, Bihar</title>
<meta name="description" content="Wedding, pre-wedding, haldi, mehendi and sangeet photography plus cinematic films in Dinara, Rohtas. See our services and book your date.">
<link rel="canonical" href="https://chandrafilmstudio.in/services.html">
```

### Gallery (gallery.html)
```html
<title>Wedding Photo Gallery | Chandra Film Studio, Dinara</title>
<meta name="description" content="Browse real wedding, haldi, mehendi and sangeet photos by Chandra Film Studio, Dinara, Rohtas. Candid moments, fine-art finish.">
<link rel="canonical" href="https://chandrafilmstudio.in/gallery.html">
```

### Videos (videos.html)
```html
<title>Wedding Films & Cinematography | Chandra Film Studio</title>
<meta name="description" content="Watch cinematic wedding films, teasers and highlight reels by Chandra Film Studio, Dinara, Rohtas, Bihar. Your story, shot like a movie.">
<link rel="canonical" href="https://chandrafilmstudio.in/videos.html">
```

### Pricing (pricing.html)
```html
<title>Wedding Photography Packages & Pricing in Dinara, Bihar</title>
<meta name="description" content="Transparent wedding photography and film packages in Dinara, Rohtas from Chandra Film Studio. Compare plans and get a quote on WhatsApp.">
<link rel="canonical" href="https://chandrafilmstudio.in/pricing.html">
```

### Contact (contact.html)
```html
<title>Contact & Book Your Wedding Shoot | Chandra Film Studio</title>
<meta name="description" content="Book Chandra Film Studio for your wedding in Dinara, Rohtas, Bihar. Call +91 97981 12812 or WhatsApp to check date availability.">
<link rel="canonical" href="https://chandrafilmstudio.in/contact.html">
```

## 2. Open Graph + Twitter (har page pe; title/description/url page ke hisaab se badlo)
```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="Chandra Film Studio">
<meta property="og:title" content="Wedding Photographer in Dinara, Rohtas | Chandra Film Studio">
<meta property="og:description" content="Candid wedding photography & cinematic films in Dinara, Rohtas, Bihar.">
<meta property="og:url" content="https://chandrafilmstudio.in/">
<meta property="og:image" content="https://chandrafilmstudio.in/images/og-cover.jpg">
<meta name="twitter:card" content="summary_large_image">
```
OG image: 1200x630 px, 200 KB se kam, best wedding photo.

## 3. LocalBusiness Schema (sirf Home page ke `<head>` mein)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Photographer",
  "name": "Chandra Film Studio",
  "url": "https://chandrafilmstudio.in/",
  "image": "https://chandrafilmstudio.in/images/og-cover.jpg",
  "logo": "https://chandrafilmstudio.in/images/logo.png",
  "description": "Wedding photography and cinematography studio in Dinara, Rohtas, Bihar.",
  "telephone": "+919798112812",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Dinara",
    "addressRegion": "Bihar",
    "addressCountry": "IN"
  },
  "areaServed": ["Dinara", "Rohtas", "Bihar"]
}
</script>
```
Instagram/YouTube links ready ho jaayein to `"sameAs": ["https://instagram.com/...", "https://youtube.com/@..."]` add kar dena (comma ke saath, `areaServed` ke baad).

## 4. WhatsApp link (buttons ke liye)
```html
<a href="https://wa.me/919798112812?text=Hello%20Chandra%20Film%20Studio%2C%20I%20want%20to%20enquire%20about%20wedding%20photography." target="_blank" rel="noopener">WhatsApp Us</a>
```

## 5. Image SEO checklist
- File name: `haldi-ceremony-photography-dinara.webp`
- Alt: `alt="Haldi ceremony photography in Dinara, Rohtas by Chandra Film Studio"`
- Gallery images mein `loading="lazy"`, hero image mein nahi.
- Width/height attributes do.

## 6. Deploy ke baad
1. Google Search Console mein `chandrafilmstudio.in` add karo, sitemap submit karo.
2. Google Business Profile banao (category: Wedding photographer, area: Dinara, Rohtas).
3. Same Name/Phone/Address har directory pe (Justdial, Sulekha, WedMeGood).
4. pagespeed.web.dev pe mobile test karo.
