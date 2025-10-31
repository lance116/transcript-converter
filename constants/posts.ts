import type { Post } from '@/lib/types'

/**
 * The five static LinkedIn posts that serve as reference content.
 * These posts are permanently embedded in the app and define the "reference universe"
 * that customers react to during Google Meet transcripts.
 *
 * Each post represents a distinct content style, tone, and format.
 */
export const REFERENCE_POSTS: Post[] = [
  {
    id: 1,
    title: "B2B GTM Playbook",
    content: `The B2B GTM Playbook Every Founder Needs

Most B2B companies fail because they don't have a clear go-to-market strategy.

Here's the complete playbook we use at Workflows.io:

1. Content Marketing (Months 1-6)
   • Start with educational blog posts
   • Build SEO authority in your niche
   • Repurpose content across LinkedIn, Twitter
   • Goal: 10K monthly organic visitors

2. Paid Advertising (Months 4-12)
   • LinkedIn Ads for decision-makers
   • Google Ads for high-intent keywords
   • Retargeting campaigns
   • Goal: $50 CAC or lower

3. Outbound Sales (Months 6-18)
   • Build targeted prospect lists
   • Multi-channel outreach (email, LinkedIn, phone)
   • Personalized messaging at scale
   • Goal: 20% response rate

4. Strategic Partnerships (Months 12-24)
   • Identify complementary products
   • Co-marketing initiatives
   • Integration partnerships
   • Goal: 30% of new revenue from partners

The key is sequencing. Don't try to do everything at once.

Start with content, add paid ads, layer in outbound, then build partnerships.

[Includes a graph showing revenue growth across these channels over 24 months]`,
    characteristics: [
      "Long-form educational content",
      "Framework-driven and structured",
      "Operational and tactical",
      "Heavy use of bullets and numbered lists",
      "Data-driven with metrics and timelines",
      "Professional, consultant-like tone",
      "Includes visual data (graph)"
    ]
  },
  {
    id: 2,
    title: "Content Journey Story",
    content: `How I grew from 0 to 27K followers 📈

0️⃣ Started posting randomly
• No strategy
• Barely any engagement
• Felt like shouting into the void

1️⃣ Studied what worked
• Read top creators daily
• Noticed patterns
• Saved posts that resonated

2️⃣ Stopped trying to sell
• Started teaching instead
• Shared actual value
• Trusted the algorithm

3️⃣ Made it visual
• Added images to every post
• Used emojis strategically
• Created infographics

The result?
→ 27K engaged followers
→ 50+ inbound leads per month
→ $500K in new revenue

You don't need to be perfect.
You just need to be consistent and valuable.

[Animated image showing follower growth curve]`,
    characteristics: [
      "Personal narrative and storytelling",
      "Conversational and motivational tone",
      "Liberal use of emojis",
      "Numbered journey structure",
      "Short, punchy sentences",
      "Focuses on results and transformation",
      "Warm and encouraging voice",
      "Visual content (animated image)"
    ]
  },
  {
    id: 3,
    title: "SaaS Retention",
    content: `SaaS companies lose 40% of customers in the first 6 months.

Here's why: Month 6 is the churn inflection point.

Our data from analyzing 200+ B2B SaaS companies shows:
• Month 1-3: 15% churn (onboarding issues)
• Month 4-6: 25% churn (value realization gap)
• Month 7-12: 10% churn (competitive switching)

The month 6 cliff is real.

What works to prevent it:
1. Heavy discount at month 5 (15-20% off annual plan)
2. Executive check-in calls at month 4
3. Advanced feature training at month 3
4. Extend trial period for hesitant users

The math: Reducing month 6 churn by just 10% → 30% increase in LTV.

Don't wait for renewal season. The battle is won in months 3-5.`,
    characteristics: [
      "Data-driven and analytical",
      "Short, direct opening hook",
      "Heavy use of statistics and metrics",
      "Problem → solution structure",
      "Consultant/expert positioning",
      "Tactical recommendations",
      "Professional and authoritative tone",
      "No emojis or visual fluff"
    ]
  },
  {
    id: 4,
    title: "Focus & Productivity",
    content: `I cut 85% of my task list.

Revenue doubled.

Here's what I kept:

→ Writing content
→ Talking to customers
→ Shipping product

Everything else was noise.

Meetings? Cut.
Reports? Cut.
"Strategy sessions"? Cut.

The trap: Busy work feels productive.

The truth: Only 3 things move the needle.

Find your 3.
Cut the rest.

Most founders are drowning in tasks that don't matter.

Link to the writing system I use (45,000+ people use it): [link]`,
    characteristics: [
      "Minimalist and punchy",
      "Very short sentences",
      "Tight rhythm and pacing",
      "Aspirational and motivational",
      "Direct, no-BS tone",
      "Focuses on elimination and focus",
      "Includes a subtle CTA with social proof"
    ]
  },
  {
    id: 5,
    title: "Case Study Lead Gen",
    content: `Case Study: How we helped a $100M+ ARR SaaS company increase SQLs by 15%

The Problem:
Their blog was getting 200K visitors/month, but conversion rate was only 0.8%.

What We Did:
✅ Redesigned CTAs with urgency language
✅ Added exit-intent popups with lead magnets
✅ Built comparison pages targeting bottom-funnel keywords
✅ Implemented retargeting sequences

The Results:
• Conversion rate: 0.8% → 2.1%
• SQLs increased by 15%
• Pipeline grew by $4.2M in 6 months
• ROI: 8.3x

The most impactful change? Comparison pages.

They targeted prospects already evaluating solutions. We created:
→ "[Their Product] vs Competitor A"
→ "[Their Product] vs Competitor B"
→ "Best alternatives to [Competitor]"

These pages converted at 6.2% (vs 0.8% site average).

Want the full case study? Comment "CASE STUDY" and I'll send it over.

[Professional image: Graph showing conversion rate improvement]`,
    characteristics: [
      "Case study format with clear structure",
      "Professional and corporate tone",
      "Heavy use of metrics and results",
      "Credibility through scale ($100M+ ARR)",
      "Mix of storytelling and data",
      "Clear problem → solution → results flow",
      "Strong CTA for engagement",
      "Visual element (graph)",
      "Growth marketing / consultant positioning"
    ]
  }
]

/**
 * Helper function to format posts for AI context injection
 * Returns a formatted string representation of all posts
 */
export function getPostsContext(): string {
  return REFERENCE_POSTS.map(post =>
    `POST ${post.id}: ${post.title}\n\n${post.content}\n\nCharacteristics: ${post.characteristics.join(', ')}`
  ).join('\n\n---\n\n')
}
