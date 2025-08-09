# shopify hackathon

## **1. Overview**

- **Product Name:** Outfit Fit Battler (Shop Mini)
- **Purpose:** Enable users to upload or create outfits (“fits”) within the Shop app, then battle them in category-based competitions for votes and comments.

---

## **2. Problem Statement**

Users want a social and interactive way to share outfit styles, receive feedback, and engage with a community—right within the shopping experience.

---

## **3. Goals & Objectives**

- Implement **upload flow** where users:
  - Upload a photo
  - Auto-detect items in the fit (scan)
  - Optionally search the shop catalog manually for items
- Provide **battle modes**:
  - **Category Battles:** Users select a category (e.g., “performative fits”) and submit their fit into it.
  - **Which fit is better:** Users upload two fits and invite the community to vote and comment.

---

## **4. Core Features**

### 4.1. Landing Page

- Nice background
  - Create: When clicked on the button, the user is directed to a page where they are able to select two different outfits from list of available products on the Shop app. The page has two sides: Option A & Option B and a “VS” in the middle. More information in section 4.2.
  - Vote:
    - two options:
      - head-to-head: 1v1 battles with other users (later versions)
      - which fit is better: help people decide which fit is better
  - Recents: Be able to see the voting results on the polls that you have created and then be able to add outfits to the already existing cart in shop minis.
  - Saved: List of items saved when voting (items that users like when they are voting on other people)

### 4.2 Create Flow

- Each side(A & B) has 3 add buttons where users can select items for their potential items. The first button queries a product search for overcoats/shirts, the second queries a product search for tshirts/inners and the third button queries it for bottoms. Once they select the product, the add button should be replaced by the image of the product they selected.
- After the user is done selecting their potential two outfits, they are able to click the “publish” button to send the outfit for VOTING by other users. We must validate that a description was added for the poll and the user has selected a product on each of the add buttons; if it's empty we show an error asking them to complete all sections.

### 4.3 Voting

- two modes, (top drop down but we default to the “which fit is better”)
  - which fit is better
    - show user name + badge
    - description
    - two fits that they uploaded (option A & B and a “VS” in the middle similar to the create poll screen)
    - a voting option below and once they vote it shows the percentage of votes for each option and then it switches to the next poll.
    - features include:
      - comment on each fit [for later versions]
      - bookmark option [saves the outfit on their saved page on the landing screen]
  - head-to-head battles
    - top option for categories ( default to “all” but you can select individual categories ) [e.g. performative, casual, formal, etc.]
    - two fits side by side, click to vote
      - after you choose, a percentage bar shows up that shows how other people voted (votes + percentage)
    - no description, but we have a commenting feature for the battle (general comments) [can add this later]
    - for p1 we could also add reactions

### 4.4 Recents

- We also have tabs for battles / choose which fit
- It's a list of all the polls that you have published and it shows the results in percentage of each poll so that helps you decide. Then you can decide on it and add the products that you have selected into the cart in the Shop Minis.

### 4.5 Saved

- It's a list of all the outfits that you have voted on and saved, with a similar option to Recents where you can add them to your cart.

## **5. Fit Upload Flow**

- **Photo Upload & Scan:**
  - User uploads photo
  - Remove background
  - System auto-detects outfit items (e.g., tops, shoes)
- **Manual Item Selection:**
  - User searches the Shop catalog and tags items manually.

## **6. Battle Types**

- **Category Battle:**
  - Choose a battle category
  - Submit fit, open to votes
- **Head-to-Head Vote Battle:**
  - Upload two fits
  - Community votes + comments

## **7. Community Interaction**

- Voting system (simple taps)
- Comment thread under each submitted fit

## **8. User Flow Summary**

1. Start
2. Landing Page, choose mode
3. Upload or search + create fit
4. Select battle type
5. Submit and share
6. Engage with votes/comments
7. View results/highlights

## **9. MVP Scope**

- **Mode**: Only the “Which fit is better” mode is included. Category battles and head‑to‑head community battles are out of scope for MVP.
- **Creation flow**: Manual add only. No photo uploads, background removal, or auto‑detection in MVP.
- **Merchants**: A single fit can include products from multiple merchants.
- **Search categories**: Basic product search is sufficient; detailed category taxonomy and presets can be deferred.
- **Voting mechanics**:
  - One vote per user per poll.
  - User selects Option A or B; a confirm button appears to lock in the vote.
  - After confirmation, results are revealed as percentages.
- **Feed/next poll**: After voting, advance to the next recommended poll. Initial implementation can be simple (e.g., newest or random); full recommendation system deferred.
- **Results display**: Show percentage splits for A vs B after voting. Absolute counts optional for later.
- **Recents**: Shows the user’s own published polls with percentage outcomes; enable adding the chosen items to cart via Shop Minis APIs.
- **Saved**: Bookmarked outfits from other users; allow adding items to cart via Shop Minis APIs.
- **Backend**: No custom backend for MVP. Persist and retrieve data using Shop Minis platform APIs only.
- **Out of scope for MVP**: Photo upload/ML scanning, detailed moderation/reporting, per‑fit commenting, reactions, advanced taxonomy filters, complex recommendation logic, and cross‑session analytics.
