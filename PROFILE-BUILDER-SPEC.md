# FCPC Agent Profile Builder & Mini-Site Spec

Status: v1, approved for build (Oct 12, 2026). Prompts and options may be adjusted later.

## Purpose
Agents create the bio for their personal mini-site through a guided builder, structured like the Agent Story Builder (/advisor-story): one prompt per section, one answer each. The agency template assembles the answers into a polished first-person bio. Principle: polish the structure, preserve the personality.

## Copy rules (apply to all builder and mini-site text)
- Use "agent," never "advisor" or "specialist."
- No em dashes in running sentences. Use periods.
- Conservative, accurate claims. No hype, no pressure language.
- No carrier names, product mechanics, dollar amounts, or income figures.

## Part 1: Profile details (no writing)
| Field | Type | Required |
|---|---|---|
| First name | text | yes |
| Last name | text | yes |
| Photo | file upload (optional for now; most agents have no photo yet) | no |
| Phone | tel | yes |
| Email | email | yes |
| Booking link | url | no |
| States licensed | multi-select of US states + DC | yes |
| Products offered | checkboxes: Life Insurance, Indexed Annuities, Final Expense, Supplemental Health | yes |

## Part 2: Bio sections

### 1. Roots (max 200 characters)
Prompt: Where are you from, or where did you grow up? One or two sentences.
Example: I grew up in Prince George's County, the oldest of four kids in a house where every dollar had a job.

### 2. Before FCPC (max 250 characters)
Prompt: What were you doing before you became an agent?
Example: I spent eleven years as a federal contracting specialist, so I know the benefits system from the inside.

### 3. Why this work (max 400 characters)
Prompt: When did protecting families become personal for you? Describe the moment or the reason.
Example: When my uncle passed, his FEGLI coverage barely covered the funeral. I watched my aunt lose the house. I decided no family I could reach would go through that unprepared.

### 4. Who you serve (pick up to 3, plus optional line max 150 characters)
Options:
- Federal employees
- DC government employees
- State and local government employees
- Families with young children
- Pre-retirees and retirees
- Business owners
- Private-sector professionals

### 5. What clients can expect (pick exactly 2)
Options:
- I'll explain your options in plain language.
- I'll show you what you already have before recommending anything new.
- I'll respect your time and your decisions.
- I'll stay in touch as your life changes.
- I'll be here long after the paperwork is signed.

### 6. Outside of work (max 150 characters)
Prompt: One line about your family, faith, community, or what you enjoy.
Example: Most Saturdays you'll find me coaching my daughter's soccer team.

### 7. Why join my team (max 300 characters)
Prompt: Why would you invite someone to do this work with you? No income figures.
Example: This work gave me a way to help my community and build something of my own. I'm looking for people who want the same.
Validation: warn and block submission if the answer contains "$", a number followed by "k" or "K", or the words "income," "earn," "salary," "six figures," "seven figures."

## Part 3: Bio assembly (first person)

```
Hi, I'm {First name}.
{Roots} {Before FCPC}

{Why this work}

Today I work with {who you serve, joined naturally: "A", "A and B", "A, B, and C", lowercased after the first word except proper nouns like DC}. {Optional serve line}

What you can expect from me
• {Commitment 1}
• {Commitment 2}

{Outside of work}

I'm licensed in {states, joined naturally}.
[Book a conversation]
```

"Join my team" section (separate block on the mini-site):
```
Join My Team
{Why join my team}
{Agency standard opportunity copy: pull 2–3 sentences from opportunity.html, unchanged}
[Learn about the opportunity]
```

## Part 4: Story Builder import
Agents may load their saved Story Builder JSON to pre-fill Roots, Before FCPC, and Why this work. Map only where a Story Builder section clearly matches; otherwise leave the field empty. Imported text that exceeds the character limit is loaded but flagged for trimming.

## Part 5: Output (Stage 1)
- Live preview of the assembled bio beside (desktop) or below (mobile) the form.
- "Save my profile" downloads a JSON file: fcpc-profile-{firstname}-{lastname}.json
- Instructions tell the agent to email the file (and photo, if any) to info@fcpc.life for review.
- Agency reviews, then adds the approved record to the agents data file and redeploys.

## Part 6: Mini-site
- URL: /agent/{slug}, slug = firstname-lastname (lowercase, hyphenated).
- One shared template; data comes from an approved-agents data file (Stage 1), later from Zoho (Stage 2).
- Design follows the site design system (forest/gold, Playfair/Inter, max-w-[1400px], rounded-3xl cards, .btn-forest/.btn-gold).
- No photo: the layout must look intentional without one. No initials circles, no placeholder avatars.
- Two doors:
  - "Work with me" → contact.html?agent={agentCode}
  - "Join my team" → opportunity.html?agent={agentCode}
  (Zoho form wiring and attribution come later; the agent code in the URL is the hook.)
- Unknown slug → friendly "Agent not found" message with a link to find-agent.html.
- Standard sitewide nav, footer, and disclaimers, including the Agent Directory Disclosure.
