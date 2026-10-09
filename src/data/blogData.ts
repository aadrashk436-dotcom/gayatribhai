import type { BlogPost } from "../types"

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    slug: "connoisseurs-guide-french-linen-shirts",
    title:
      "The Connoisseur’s Guide to French Linen: Why Weight, Weave & Slub Matter",
    subtitle:
      "Understanding natural flax fibers, moisture breathability, and why true artisanal linen gets softer with every summer wear.",
    excerpt:
      "Not all linen is born equal. In an era dominated by synthetic microfibers, pure European flax stands as the apex of warm-weather menswear. Here is the discerning guide to evaluating density, slub texture, and drape.",
    content: [
      "When temperatures climb above 32°C and humidity thickens the air, synthetic fabrics trap moisture, cling to the skin, and degrade rapidly. Pure flax linen, cultivated across Normandy and northern France, possesses a hollow fiber core that naturally wicks moisture away from the torso while promoting continuous air circulation.",
      "The distinguishing mark of genuine artisanal linen is its characteristic 'slub'—the subtle, organic thickness variations along the yarn that reflect traditional mechanical carding rather than sterile chemical homogenization. When you run your hand across an AVYR shirt, that tactile grain tells you the fiber hasn’t been stripped of its natural pectin.",
      "A common misconception is that heavier linen is uncomfortable in peak summer. In truth, an optimal 140–165 GSM (grams per square meter) weight provides the necessary body for a clean drape, preventing the shirt from clinging to your back during alfresco lunches or beachside soirees.",
      "With each wash, the crystalline cellulose in natural flax relaxes, meaning your shirt actually gains softness and character over seasons, rather than wearing out like common fast-fashion cottons.",
    ],
    keyTakeaways: [
      "Natural flax fibers wick 20% of their weight in moisture before feeling damp.",
      "Organic slub variations are the authentic hallmark of artisanal mechanical spinning.",
      "140–165 GSM strikes the perfect equilibrium between airy ventilation and sharp silhouette drape.",
      "Avoid polyester blends: synthetic filaments seal natural fiber pores and cause overheating.",
    ],
    author: {
      name: "Rohan Varma",
      role: "Textile Historian & Master Draper",
      avatar: "RV",
    },
    category: "Fabric Science",
    coverImage: "/assets/site_banners/slide1_desktop.jpg",
    readTime: "5 min read",
    date: "April 18, 2026",
    tags: [
      "French Linen",
      "Fabric Guide",
      "Summer Menswear",
      "Artisanal Weave",
    ],
    featured: true,
    relatedProductIds: [
      "69ba28a30b819d3f52ce23a2",
      "69b945bd07dee5c7ea02d951",
      "69b8fa732e73711956501254",
    ],
  },
  {
    id: "blog-2",
    slug: "cuban-collar-revival-resort-dressing-guide",
    title: "The Cuban Collar Revival: Sculpting The Modern Riviera Silhouette",
    subtitle:
      "From Havana lounges to Mediterranean coastlines: how the open camp collar redefined relaxed masculine sophistication.",
    excerpt:
      "The camp collar—often dubbed the Cuban collar—has evolved from vintage mid-century lounge uniform into the defining silhouette of luxury resortwear. Discover how to style it with effortless panache.",
    content: [
      "There is an intentional ease in the open, notched lapel of a Cuban collar. Unlike rigid band collars or stiff button-downs, the camp collar gently frames the collarbone, encouraging an effortless posture that instantly signals vacation state of mind.",
      "Originating in 1950s Havana as the traditional 'guayabera' shirt designed to keep gentlemen cool in Caribbean heat, today’s resort edit combines this relaxed neck structure with modern tailored sleeves and straight box-cut hems meant to be worn untucked.",
      "To style the Cuban collar effortlessly, pair it with ecru pleated linen trousers and braided leather loafers for sunset cocktails. For a beach club afternoon, layer it unbuttoned over a ribbed white tank top with drawstring swim shorts and tortoiseshell sunglasses.",
      "Our artisans enhance this silhouette by anchoring the collar points with hand-tacked edge stitching, ensuring the collar lays flat against the chest without curling after a swim in the Mediterranean.",
    ],
    keyTakeaways: [
      "Open notched collar structure maximizes neck ventilation and flatters chest framing.",
      "Engineered straight hem allows sharp untucked styling without sloppy tail drapery.",
      "Flawlessly versatile: pairs with relaxed drawstring shorts or tailored summer suiting.",
      "Hand-tacked collar points resist curling even in tropical coastal humidity.",
    ],
    author: {
      name: "Dev Malhotra",
      role: "Creative Director & Stylist",
      avatar: "DM",
    },
    category: "Style Guides",
    coverImage: "/assets/site_banners/slide2_desktop.jpg",
    readTime: "4 min read",
    date: "April 14, 2026",
    tags: ["Resort Wear", "Cuban Collar", "Vacation Styling", "Camp Shirt"],
    featured: false,
    relatedProductIds: [
      "69b8fa732e73711956501254",
      "69b87fc153c30650d32fcfc3",
      "69b87455d787018c15ae48dc",
    ],
  },
  {
    id: "blog-3",
    slug: "art-of-hand-embroidery-behind-the-atelier",
    title:
      "The Vanishing Art of Hand-Guided Needlecraft in Contemporary Menswear",
    subtitle:
      "Inside our Surat atelier, where generational master karigars spend up to 48 hours breathing life into single shirts.",
    excerpt:
      "In a world where computer-programmed looms pump out thousands of identical stiff motifs every hour, the human touch of hand-guided embroidery is an act of quiet rebellion. Step into our makers' sanctuary.",
    content: [
      "Step into our Surat workshop on any weekday morning, and the rhythm is distinctly human: the soft hum of pedal-powered framing, the rustle of imported cotton linen bolts, and the rhythmic plunge of fine steel needles guided entirely by the karigar's eye.",
      "Unlike rigid industrial embroidery patches that leave a stiff cardboard-like backing against your skin, hand-guided threadwork moves organically with the weave of the fabric. Every leaf curve, vine contour, and geometric border possesses micro-variations that make each shirt a numbered, one-of-a-kind art piece.",
      "Master artisan Zameer, who has practiced threadcraft for over 32 years, explains: 'When a machine embroiders, it simply replicates math. When a craftsman embroiders, he reads the grain of the linen, adjusting thread tension so the shirt breathes and bends with the wearer.'",
      "By commissioning limited micro-batches rather than mass retail runs, AVYR preserves fair-wage generational livelihoods while giving conscious patrons garments worthy of being treasured for decades.",
    ],
    keyTakeaways: [
      "Hand-guided needlework yields supple, skin-soft motif backing with zero cardboard stiffness.",
      "Micro-variations ensure no two shirts in the collection are mechanically cloned.",
      "Each shirt supports fair generational artisan wages and keeps heritage craftsmanship thriving.",
      "Tension-adjusted threading moves naturally with your posture without puckering.",
    ],
    author: {
      name: "Ananya Sen",
      role: "Atelier Curator & Craft Advocate",
      avatar: "AS",
    },
    category: "Craft & Atelier",
    coverImage: "/assets/site_media/instagram_lookbook_ing3.jpg",
    readTime: "6 min read",
    date: "April 08, 2026",
    tags: [
      "Artisan Craft",
      "Hand Embroidery",
      "Sustainable Fashion",
      "Slow Living",
    ],
    featured: false,
    relatedProductIds: [
      "69ba28a30b819d3f52ce23a2",
      "69b945bd07dee5c7ea02d951",
      "69b85c189b6574fcf13db147",
    ],
  },
  {
    id: "blog-4",
    slug: "styling-statement-shirts-tropical-evenings",
    title:
      "Dressing After Twilight: Styling Statement Shirts for Tropical Evenings",
    subtitle:
      "Transitioning from sunset yachts to candlelit dinner terraces with midnight palettes and tonal stitch finishes.",
    excerpt:
      "Too often, evening menswear defaults to monochrome suits and predictable dark tees. Discover how rich botanical motifs and gold stitch accents command understated charisma after dusk.",
    content: [
      "The warm tropical evening demands a different sartorial frequency. You want commanding sophistication without looking like you’re attending a boardroom meeting or suffering through stuffy synthetic blazers.",
      "Deep indigos, forest olives, and midnight charcoals accented with subtle tonal embroidery offer depth under warm ambient restaurant lighting. The threadwork catches candle glow subtly without shouting for attention.",
      "Pair a dark botanical embroidered shirt with off-white Belgian linen trousers. The stark contrast anchors the look, drawing natural appreciation toward the craftsmanship of the collar and yoke.",
      "Complete the ensemble with minimal accessories: a slim vintage timepiece, woven leather sandals or Belgian loafers, and leave the top two buttons nonchalantly undone.",
    ],
    keyTakeaways: [
      "Dark natural dyes absorb warm indoor and candlelit lighting with luxurious depth.",
      "High-contrast pairings (midnight shirts + ivory trousers) create an unforgettable aesthetic balance.",
      "Natural coconut shell or smoked horn buttons elevate evening button closures.",
      "Keep outerwear minimal: let the hand-stitched detailing be the focal conversation starter.",
    ],
    author: {
      name: "Arjun Mehta",
      role: "Menswear Stylist & Collector",
      avatar: "AM",
    },
    category: "Style Guides",
    coverImage: "/assets/site_banners/slide3_desktop.jpg",
    readTime: "4 min read",
    date: "April 02, 2026",
    tags: [
      "Evening Wear",
      "Night Outfits",
      "Luxe Menswear",
      "Statement Shirts",
    ],
    featured: false,
    relatedProductIds: [
      "69b87fc153c30650d32fcfc3",
      "69b87455d787018c15ae48dc",
      "69b83b380ef3077e6f31f99c",
    ],
  },
  {
    id: "blog-5",
    slug: "slow-fashion-manifesto-clothing-that-lasts",
    title: "The Slow Fashion Manifesto: Why We Produce Only 50 Pieces Per Drop",
    subtitle:
      "Rejecting the churn of endless seasonal inventory to protect our artisans and eliminate textile landfill waste.",
    excerpt:
      "Over 100 billion garments are produced globally each year, with 85% destined for incineration or dumps. AVYR operates on a radical counter-principle: patience, small batches, and timeless craftsmanship.",
    content: [
      "The contemporary fashion cycle runs on a hyper-speed treadmill that burns through raw resources, degrades soil health, and devalues the dignity of garment workers. New collections appear every 14 days, designed to look outdated within a month.",
      "At AVYR, we release limited editions of just 30 to 50 numbered pieces per design. When a drop sells out, we do not mechanically flood the market. Instead, we consult our master karigars to determine when they can thoughtfully craft the next capsule.",
      "This intentional pacing guarantees that zero unsold garments sit in discount clearance bins or landfills. It also gives each patron the confidence that their shirt won't be seen on fifty other people at the same airport lounge or beach resort.",
      "True luxury is not about ubiquity; it is about rarity, provenance, and knowing whose hands shaped what you wear against your skin.",
    ],
    keyTakeaways: [
      "Small 30–50 piece batch runs eliminate overproduction and environmental waste.",
      "Garments are designed to endure years of wear, not weeks of fleeting trends.",
      "Fair transparent wages support generational artisan families across Gujarat.",
      "Provenance and exclusivity are woven into every numbered garment label.",
    ],
    author: {
      name: "Karan Singhania",
      role: "Founder, AVYR Atelier",
      avatar: "KS",
    },
    category: "Resort Life",
    coverImage: "/assets/site_banners/home_banner_secondary.jpeg",
    readTime: "5 min read",
    date: "March 28, 2026",
    tags: [
      "Slow Fashion",
      "Sustainability",
      "Limited Edition",
      "Artisan Economy",
    ],
    featured: false,
    relatedProductIds: [
      "69ba28a30b819d3f52ce23a2",
      "69b8fa732e73711956501254",
      "69b87fc153c30650d32fcfc3",
    ],
  },
]
