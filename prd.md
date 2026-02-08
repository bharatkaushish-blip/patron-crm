# Patron — Product Requirements Document

**Version:** 1.0
**Date:** February 8, 2026
**Status:** Draft

---

## 1. Product Overview & Problem Statement

### What is Patron?

Patron is a memory and follow-up assistant built for art gallery owners and art sellers. It is not a generic CRM — it is a simple, fast tool that helps art sellers remember their clients, what they like, what they bought, and when to follow up.

### The Problem

Art sellers build relationships over months and years. A collector might mention they love a certain artist at a gallery opening, buy a piece six months later, and refer a friend a year after that. The entire sales process depends on memory and timely follow-up.

Today, most art sellers track this information across scattered WhatsApp chats, Instagram DMs, scraps of paper, and mental notes. The result:

- They forget what a client likes and miss opportunities to share relevant new work
- They forget to follow up and lose warm leads
- They can't quickly recall a client's purchase history before a meeting
- When they're busy with exhibitions, follow-ups fall through the cracks entirely

Patron solves this by giving art sellers a single, simple place to capture client information and automatically reminding them when it's time to follow up.

### Core Value Proposition

**"Never forget a client. Never miss a follow-up."**

Patron is the memory that art sellers wish they had — it remembers every client detail and nudges them at the right time.

---

## 2. User Personas

### Primary Persona: Sanya (Art Gallery Owner)

- **Age:** 30s
- **Role:** Runs a small-to-mid-size art gallery
- **Tech comfort:** Low. Uses iPhone, WhatsApp, Instagram daily. Avoids "complicated" software.
- **Sales style:** Relationship-driven. Remembers faces and stories, but struggles with names and dates.
- **Pain points:**
  - Forgets to follow up with interested collectors after exhibitions
  - Can't quickly recall what a returning client bought or liked
  - Loses track of client preferences across WhatsApp and Instagram conversations
  - Doesn't have time to learn or maintain complex tools
- **What she needs:** Something she can open on her phone, quickly jot a note after a conversation, and trust that it will remind her when to follow up.
- **Quote:** "I don't need a system. I just need to remember things and not forget people."

### Secondary Persona: Raj (Solo Art Dealer)

- **Age:** 40s
- **Role:** Independent art dealer, works from home and art fairs
- **Tech comfort:** Moderate. Uses a laptop for email and spreadsheets.
- **Sales style:** Network-driven. Manages 200+ collectors across cities.
- **Pain points:**
  - Uses a spreadsheet that's grown unwieldy and unsearchable
  - Can't tag or filter clients by interest, budget, or preferred artist
  - No system for follow-up reminders — relies on calendar entries he often ignores
- **What he needs:** A searchable, filterable client database with built-in follow-up tracking, accessible from both phone and laptop.

---

## 3. User Journeys

### Journey 1: First-Time Setup (Happy Path)

1. Sanya hears about Patron from a friend
2. She visits the website on her phone and taps "Start Free Trial"
3. She signs up with her email (or Google sign-in)
4. She is asked to name her gallery (creates her organization)
5. She lands on an empty "Today" screen with a friendly prompt: "Add your first client"
6. She taps the prompt and adds a client she just spoke to
7. She adds a note about the conversation and sets a follow-up for next week
8. She's done in under 2 minutes

### Journey 2: After a Gallery Opening

1. Sanya had a busy gallery opening last night with 15+ conversations
2. The next morning, she opens Patron on her phone
3. She quickly adds 5 new clients, each with a short note ("Loved the Mehta series, wants pricing", "Collector from Mumbai, budget ~5L")
4. She sets follow-up dates for 3 of them
5. Total time: ~10 minutes
6. Three days later, she gets an email reminder about her follow-ups
7. She opens Patron, sees the follow-ups on the Today screen, and makes her calls

### Journey 3: Returning Client Visits the Gallery

1. A client walks into the gallery. Sanya remembers the face but not the details.
2. She opens Patron, searches the client's name
3. She instantly sees: last visited 4 months ago, bought a landscape piece by Artist X, interested in abstract work, budget range noted
4. She greets the client warmly with context: "How's the landscape piece looking in your living room?"
5. After the visit, she adds a new note and logs any sale

### Journey 4: Logging a Sale

1. A client decides to purchase a piece
2. Sanya opens the client's profile in Patron
3. She taps "Add Sale"
4. She enters the artwork name and price (both optional, she can fill in just what she knows)
5. She adds a note: "Gifting for anniversary, wants delivery by March 15"
6. The sale appears in the client's transaction history

### Journey 5: Weekly Review

1. Every Monday, Sanya opens Patron on her desktop browser
2. The Today screen shows 4 follow-ups due this week
3. She goes through each one, calls or messages the client
4. For each, she either adds a note about the conversation or reschedules the follow-up
5. She searches for "abstract" to find all clients interested in abstract art — she just got a new collection in

### Journey 6: Importing Existing Contacts

1. Raj has 200 clients in a spreadsheet
2. He exports it as CSV
3. In Patron Settings, he uses "Import from CSV"
4. He maps his spreadsheet columns to Patron fields (name, phone, email, notes)
5. His clients are imported. He can now search and tag them inside Patron.

---

## 4. Functional Requirements (MVP)

### 4.1 Authentication & Onboarding

| ID | Requirement |
|----|-------------|
| AUTH-1 | Users can sign up with email + password |
| AUTH-2 | Users can sign up / log in with Google OAuth |
| AUTH-3 | Email verification on sign-up |
| AUTH-4 | Password reset via email link |
| AUTH-5 | On first sign-up, user is prompted to create an organization (gallery name) |
| AUTH-6 | Session persists across browser restarts (remember me by default) |

### 4.2 Client Management

| ID | Requirement |
|----|-------------|
| CLT-1 | Users can add a new client with the following fields: name, phone number, email, location/city, age (or age range), and free-text notes. No fields are mandatory except a display name (first name or any identifier). |
| CLT-2 | Users can edit any client field at any time |
| CLT-3 | Users can delete a client (soft delete with confirmation) |
| CLT-4 | Users can add multiple tags/interests to a client (e.g., "abstract", "Husain", "large format", "budget 5-10L") |
| CLT-5 | Tags are free-text with autocomplete from previously used tags in the organization |
| CLT-6 | Users can view a list of all their clients, sorted by most recently updated |
| CLT-7 | Client list supports search by name, phone, email, tags, and notes content |
| CLT-8 | Client list supports filtering by one or more tags |
| CLT-9 | Client list supports filtering by city/location |
| CLT-10 | Each client has a profile page showing: contact info, tags, all notes (chronological), transaction history, and upcoming follow-ups |

### 4.3 Notes & Interactions

| ID | Requirement |
|----|-------------|
| NOTE-1 | Users can add a free-text note to any client. Notes capture the date/time automatically. |
| NOTE-2 | Adding a note should feel fast and lightweight — similar to sending a WhatsApp message. Tap client → type → save. |
| NOTE-3 | Each note can optionally have a follow-up date attached |
| NOTE-4 | Notes are displayed in reverse chronological order on the client profile |
| NOTE-5 | Users can edit or delete a note |
| NOTE-6 | Notes are included in the global search index |

### 4.4 Sales / Transactions

| ID | Requirement |
|----|-------------|
| SALE-1 | Users can log a sale against a client with the following fields: artwork name, sale amount, date. All fields are optional. |
| SALE-2 | Each sale has a free-text notes field for additional context (e.g., delivery instructions, gifting details) |
| SALE-3 | Sales are displayed in reverse chronological order on the client profile under a "Sales" section |
| SALE-4 | Users can edit or delete a sale entry |

### 4.5 Follow-Up Reminders

| ID | Requirement |
|----|-------------|
| FU-1 | When adding or editing a note, users can set a follow-up date |
| FU-2 | Follow-ups due today (and overdue) appear on the Today screen |
| FU-3 | A daily reminder email is sent each morning ONLY if there are follow-ups due that day. No email is sent if there are no follow-ups due. |
| FU-4 | The reminder email lists all follow-ups due today with client name and the note that triggered the follow-up |
| FU-5 | Each follow-up in the email links directly to the client's profile in Patron |
| FU-6 | Users can mark a follow-up as "done" or reschedule it to a new date |
| FU-7 | Overdue follow-ups (past due date, not marked done) remain visible on the Today screen until addressed |

### 4.6 Search

| ID | Requirement |
|----|-------------|
| SRCH-1 | A global search bar is accessible from every screen |
| SRCH-2 | Search covers: client names, phone numbers, emails, tags, notes content, and artwork names from sales |
| SRCH-3 | Search results are grouped by type (clients, notes, sales) for clarity |
| SRCH-4 | Search is fast — results should appear as the user types (debounced, < 300ms perceived) |

### 4.7 CSV Import / Export

| ID | Requirement |
|----|-------------|
| CSV-1 | Users can import clients from a CSV file |
| CSV-2 | During import, users can map CSV columns to Patron fields (name, phone, email, location, notes, tags) |
| CSV-3 | Import shows a preview of the first 5 rows before confirming |
| CSV-4 | Import handles duplicates by flagging potential matches (same name + phone) for user review |
| CSV-5 | Users can export all their client data as a CSV file |
| CSV-6 | Export includes: client fields, tags, notes, and sales history |

### 4.8 Today Screen

| ID | Requirement |
|----|-------------|
| TODAY-1 | The Today screen is the default landing page after login |
| TODAY-2 | It shows: (a) follow-ups due today, (b) overdue follow-ups, (c) quick action buttons for "Add Client" and "Add Note" |
| TODAY-3 | Each follow-up item shows the client name, the note text, and the due date |
| TODAY-4 | Tapping a follow-up takes the user to the client's profile |
| TODAY-5 | If there are no follow-ups due, the screen shows an encouraging empty state (e.g., "All caught up! No follow-ups due today.") |

### 4.9 Settings

| ID | Requirement |
|----|-------------|
| SET-1 | Users can update their gallery/organization name |
| SET-2 | Users can update their personal profile (name, email) |
| SET-3 | Users can manage their subscription (view plan, upgrade, cancel) |
| SET-4 | Users can access CSV import/export from settings |
| SET-5 | Users can log out |
| SET-6 | Users can change their password |
| SET-7 | Users can configure the time their daily reminder email is sent (default: 9:00 AM local time) |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement |
|----|-------------|
| PERF-1 | Pages must load in under 2 seconds on a 4G mobile connection |
| PERF-2 | Search results must appear in under 300ms (perceived) |
| PERF-3 | The app must handle organizations with up to 5,000 clients without degradation |
| PERF-4 | Adding a note or sale must complete in under 1 second |

### 5.2 Reliability

| ID | Requirement |
|----|-------------|
| REL-1 | 99.9% uptime target |
| REL-2 | Daily reminder emails must be sent reliably — this is a core promise of the product |
| REL-3 | Data must be backed up daily with point-in-time recovery |
| REL-4 | No data loss on browser crash or accidental navigation (auto-save drafts for notes) |

### 5.3 Security

| ID | Requirement |
|----|-------------|
| SEC-1 | All data in transit encrypted via HTTPS/TLS |
| SEC-2 | All data at rest encrypted |
| SEC-3 | Passwords hashed with bcrypt or equivalent |
| SEC-4 | Multi-tenant data isolation — no organization can access another's data |
| SEC-5 | Rate limiting on authentication endpoints |
| SEC-6 | CSRF protection on all state-changing requests |
| SEC-7 | Input sanitization to prevent XSS and injection attacks |

### 5.4 Accessibility & Compatibility

| ID | Requirement |
|----|-------------|
| ACC-1 | PWA: installable to home screen on iOS and Android |
| ACC-2 | Mobile-first design but fully functional and polished on desktop browsers |
| ACC-3 | Supports latest versions of Chrome, Safari, Firefox, and Edge |
| ACC-4 | Responsive layout: optimized for phone (375px+), tablet (768px+), and desktop (1024px+) |
| ACC-5 | Minimum WCAG 2.1 AA compliance for color contrast and touch targets |

---

## 6. Screen-by-Screen Breakdown

### 6.1 Login / Sign Up

**Purpose:** Get the user into the app with minimal friction.

- **Sign up form:** Name, email, password (or Google OAuth button)
- **Login form:** Email + password (or Google OAuth)
- **Forgot password:** Email-based reset link
- **Post-signup:** Prompt to enter gallery/organization name → redirect to Today screen
- **Design notes:** Single-screen forms. No multi-step wizards. Large touch targets. Show/hide password toggle.

### 6.2 Today Screen (Home)

**Purpose:** Show the user what needs attention today. This is their daily starting point.

**Content:**
- **Overdue section:** Follow-ups past their due date, sorted oldest first. Highlighted to draw attention.
- **Due today section:** Follow-ups due today, each showing client name, note preview, and due date.
- **Quick actions:** Floating action button (FAB) or prominent buttons for "Add Client" and "Quick Note"
- **Empty state:** Friendly message when there's nothing due. Optionally suggest adding a client or reviewing recent notes.

**Desktop adaptation:** On wider screens, the Today screen can use a two-column layout — follow-ups on the left, recent activity or quick actions on the right.

### 6.3 Clients List

**Purpose:** Find any client quickly. This is the search-first screen.

**Content:**
- **Search bar:** Prominent at the top, always visible. Searches across name, phone, email, tags, notes.
- **Filter chips:** Tappable tag/interest filters below the search bar. Tapping a tag filters the list to clients with that tag. Multiple tags can be selected (AND logic).
- **Location filter:** Dropdown or chip to filter by city/location.
- **Client cards:** Each card shows: client name, location, key tags (2-3 max), and last interaction date.
- **Sort:** Default sort by most recently updated. Option to sort alphabetically.
- **Add client button:** Prominent "+" button.

**Desktop adaptation:** On desktop, the client list can appear as a sidebar with the selected client's profile visible in the main content area (master-detail layout).

### 6.4 Client Profile

**Purpose:** Everything about one client in one place.

**Sections:**
- **Header:** Client name, location, phone (tap to call), email (tap to compose). Edit button.
- **Tags:** Displayed as chips. Tap to add/remove tags.
- **Notes timeline:** All notes in reverse chronological order. Each note shows date, text, and follow-up status (if set). Inline "Add Note" input at the top of the timeline.
- **Sales history:** All sales in reverse chronological order. Each sale shows artwork name, amount, date, and notes. "Add Sale" button.
- **Follow-ups:** Any active/upcoming follow-ups shown prominently (e.g., pinned banner: "Follow-up due March 10").

**Desktop adaptation:** Notes and sales can be shown in side-by-side columns or tabbed layout.

### 6.5 Add Note (Quick Entry)

**Purpose:** Capture a note as fast as possible. This is the most-used action in the app.

**Behavior:**
- Can be triggered from: client profile (inline), Today screen (quick action), or the global "+" button.
- If triggered from outside a client profile, user first selects a client (search/autocomplete).
- **Fields:** Text area (free-text, multi-line), optional follow-up date picker.
- **Save:** Single tap. Return to the previous screen immediately.
- **Design notes:** This must feel as fast as sending a message. No unnecessary fields, no confirmation dialogs. The keyboard should be open and ready when this screen appears on mobile.

### 6.6 Add Sale

**Purpose:** Log a sale quickly.

**Behavior:**
- Triggered from a client's profile page.
- **Fields:** Artwork name (text), sale amount (number), date (defaults to today), notes (free-text). All fields are optional.
- **Save:** Single tap. Sale appears in the client's transaction history.

### 6.7 Settings

**Purpose:** Account and organization management.

**Sections:**
- **Profile:** Edit name, email, change password
- **Gallery:** Edit organization/gallery name
- **Subscription:** View current plan, billing status, manage payment method, upgrade/cancel (links to Stripe Customer Portal)
- **Data:** CSV import, CSV export
- **Reminders:** Configure daily email reminder time (default 9 AM)
- **Account:** Log out, delete account (with confirmation and data export prompt)

---

## 7. Data Entities

These are the core data objects in the system. This is a conceptual model, not a database schema.

### Organization
- ID
- Name (gallery name)
- Created date
- Subscription status (trialing, active, past_due, canceled)
- Stripe customer ID
- Trial end date

### User
- ID
- Name
- Email
- Password (hashed)
- Organization ID (belongs to one organization)
- Role (owner — only role in MVP)
- Timezone
- Reminder time preference (default 9:00 AM)
- Created date

### Client
- ID
- Organization ID
- Name (display name — required)
- Phone number
- Email
- Location / City
- Age or age range
- Tags (list of strings)
- Created date
- Updated date

### Note
- ID
- Client ID
- Organization ID
- Text (free-text content)
- Follow-up date (optional)
- Follow-up status (pending, done — only applicable if follow-up date is set)
- Created date
- Updated date

### Sale
- ID
- Client ID
- Organization ID
- Artwork name
- Amount
- Sale date
- Notes (free-text)
- Created date
- Updated date

### Tag (derived / denormalized)
- Organization ID
- Tag name
- Usage count (number of clients with this tag — used for autocomplete ranking)

---

## 8. Permissions & Roles

### MVP: Single Owner Model

In the MVP, each organization has exactly one user — the owner. There are no staff accounts, no role differentiation, and no invitation system.

| Capability | Owner |
|------------|-------|
| Add / edit / delete clients | Yes |
| Add / edit / delete notes | Yes |
| Add / edit / delete sales | Yes |
| Search and filter | Yes |
| Import / export CSV | Yes |
| Manage subscription & billing | Yes |
| Edit organization settings | Yes |
| Invite team members | No (future) |

### Future Consideration (Post-MVP)

- **Staff role:** Can add/edit clients, notes, and sales. Cannot manage billing or delete data.
- **Invitation system:** Owner invites staff by email.
- **This is explicitly out of scope for MVP** but the data model should be designed to accommodate it (User belongs to Organization with a Role field).

---

## 9. Subscription & Billing

### Trial

- 14-day free trial starts on sign-up
- Full access to all features during trial
- No credit card required to start trial
- Reminder emails at day 7 and day 12 prompting the user to subscribe
- After trial expires: account becomes **read-only**. User can log in, view clients, search, and browse — but cannot add or edit clients, notes, or sales. A persistent banner prompts them to subscribe.

### Subscription

- Billing handled via Stripe
- Single pricing plan at launch (price TBD, likely starting at $29/month)
- Monthly billing cycle
- Users can upgrade at any time during or after trial
- Subscription management (update payment method, cancel, view invoices) via Stripe Customer Portal

### Cancellation

- User can cancel at any time from Settings
- Access continues until end of current billing period
- After billing period ends, account becomes read-only (same as expired trial)
- Data is retained for 90 days after cancellation, then permanently deleted
- User receives email before permanent deletion with option to export data

### Future Pricing Tiers

- Tier differentiation is TBD and will be informed by early user feedback
- Potential axes for tiering: client count limits, feature gating (advanced search, CSV, reminders), or team member seats
- The billing system should be built to support multiple tiers from the start even though only one is offered at launch

---

## 10. Out of Scope (MVP)

The following are explicitly **not** part of the MVP. They may be considered for future versions.

| Item | Reason |
|------|--------|
| Full inventory management | Patron is about clients, not artwork inventory |
| Accounting / invoicing | Sale logging is for memory, not financial management |
| Analytics dashboards | No charts, reports, or graphs in MVP |
| Sales pipeline / deal stages | This is not a pipeline CRM — it's a memory tool |
| Complex workflow automation | No automated sequences or drip campaigns |
| Heavy AI features | No AI-generated summaries, no auto-categorization |
| WhatsApp integration | Desired but too complex for MVP. Email reminders first. |
| Instagram integration | Same as WhatsApp — future consideration |
| Push notifications | Email reminders only in MVP |
| Team / staff accounts | Owner-only in MVP |
| Native mobile apps | PWA first. Native apps only if PWA limitations become a blocker. |
| Multi-language support | English only in MVP |
| Custom fields on clients | Free-text notes and tags cover this need for now |
| API access | No public API in MVP |

---

## 11. Open Questions & Assumptions

### Open Questions

| # | Question | Impact |
|---|----------|--------|
| 1 | What pricing tier should launch at? ($29 is assumed but not confirmed) | Stripe configuration, landing page copy |
| 2 | Should the daily reminder email be configurable per day of week (e.g., no emails on Sundays)? | Email scheduling logic |
| 3 | Is there a need for a "shared notes" concept where multiple galleries could see the same client? | Data model, privacy implications |
| 4 | Should there be an interaction type field on notes (e.g., "phone call", "gallery visit", "WhatsApp")? | Note schema, filtering |
| 5 | What currency should sale amounts use? Single currency per org, or multi-currency? | Sale data model, display formatting |
| 6 | Should the app support image attachments on notes (e.g., photo of a client at an exhibition)? | Storage infrastructure, mobile UX |
| 7 | How should the CSV import handle tags? Comma-separated in a single column, or one column per tag? | Import parsing logic |
| 8 | Do we need a "client source" field (e.g., "gallery walk-in", "referral", "Instagram")? | Client schema, future analytics |

### Assumptions

| # | Assumption |
|---|-----------|
| 1 | The primary user will use Patron on their phone most of the time, but will also use it on a desktop/laptop for longer sessions like CSV imports or weekly reviews |
| 2 | Art sellers manage fewer than 5,000 clients in most cases |
| 3 | Users are comfortable with email-based reminders (no SMS or WhatsApp needed for MVP) |
| 4 | One user per organization is sufficient for MVP launch |
| 5 | English is sufficient for the initial user base |
| 6 | Users will accept a web app (PWA) and do not require a native App Store download |
| 7 | Free-text notes + tags are flexible enough to replace the need for custom fields |
| 8 | Sale tracking is for relationship context, not financial reporting — approximate amounts are acceptable |
| 9 | The landing page and marketing site are separate from the app and not covered by this PRD |

---

*End of PRD*
