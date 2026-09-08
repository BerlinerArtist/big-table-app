import type { ReactNode } from "react";
import { gumroadPurchaseUrl, PRICE_LABEL } from "../lib/access";

const COVER_IMAGE = "https://public-files.gumroad.com/wzrhectlsuc5c64pa61d3z2vhzrp";

const OCCASION_NAMES = [
  "Romantic Anniversary Dinner", "Adult Birthday Party", "Funeral", "Christmas Dinner",
  "Kids' Birthday Party", "Cocktail Party & Nibbles", "Garden Party & Summer BBQ",
  "Valentine's Dinner", "Graduation Supper", "Farewell & Going Away", "Welcome Home Feast",
  "Engagement Dinner", "Upscale Dinner Party", "Promotion Celebration", "First Date Night In",
  "Baby Shower", "Home Wedding Reception", "New Year's Eve", "Thanksgiving & Harvest",
  "Spring Table", "Housewarming Party", "Retirement Celebration", "The Big Match",
  "Halloween", "Mother's Day Brunch", "Father's Day BBQ", "Gender Reveal", "Open House",
  "Shabbat Dinner", "Nowruz", "Chosen Family Dinner", "Midsommar", "Lunar New Year",
  "Diwali", "Carnival", "Juneteenth", "Día de los Muertos", "Eid al-Fitr",
];

function GumroadCta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <a className={`sales-cta ${className}`.trim()} href={gumroadPurchaseUrl()} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export default function SalesPage(props: { onPreview: () => void; onOpenGuide: () => void }) {
  return (
    <main className="sales-page">
      <nav className="sales-nav" aria-label="The Big Table">
        <a className="sales-brand" href="#top" aria-label="The Big Table home">
          <span>The</span> Big Table
        </a>
        <div className="sales-nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#preview">Try it free</a>
          <a href="#included">What’s included</a>
        </div>
        <GumroadCta className="sales-nav-cta">Get access · {PRICE_LABEL}</GumroadCta>
      </nav>

      <section className="sales-hero" id="top">
        <div className="sales-hero-copy">
          <p className="sales-eyebrow">An adaptive celebration kitchen guide</p>
          <h1>A table for everyone.<br /><em>A plan for you.</em></h1>
          <p className="sales-lede">
            The Big Table helps the person bringing people together cook with calm — from dinner for two to a room of sixty.
          </p>
          <div className="sales-hero-actions">
            <button className="sales-secondary" onClick={props.onPreview}>Try one free recipe <span>↓</span></button>
            <GumroadCta>Unlock all 38 occasions · {PRICE_LABEL}</GumroadCta>
          </div>
          <p className="sales-proof-line">One payment · Yours forever · 30-day, no-questions refund</p>
        </div>
        <div className="sales-hero-art" aria-label="The Big Table interactive kitchen guide cover">
          <div className="sales-art-glow" />
          <img src={COVER_IMAGE} alt="The Big Table: 38 occasions for 2–60 guests" />
          <div className="sales-art-stamp">38 occasions<br />2–60 guests</div>
        </div>
      </section>

      <section className="sales-host-statement">
        <p className="sales-eyebrow">For the person who makes room</p>
        <h2>The people remember the host.<br /><em>Not the maths behind dinner.</em></h2>
        <p>
          Guest lists change. Dietary needs change. The occasions that matter rarely arrive with a perfectly measured recipe.
          The Big Table adjusts the plan so you can stay present at your own table.
        </p>
      </section>

      <section className="sales-feature-section" id="how-it-works">
        <div className="sales-section-head">
          <p className="sales-eyebrow">Built for real gatherings</p>
          <h2>One recipe. <em>Any table size.</em></h2>
        </div>
        <div className="sales-feature-grid">
          <article>
            <span className="sales-feature-number">01</span>
            <h3>Move one slider</h3>
            <p>Set your guest count. Every ingredient recalculates live, from intimate dinners to celebrations for 60.</p>
          </article>
          <article>
            <span className="sales-feature-number">02</span>
            <h3>Plan the whole day</h3>
            <p>Choose the time you want to serve. The guide works backwards so you know what to start and when.</p>
          </article>
          <article>
            <span className="sales-feature-number">03</span>
            <h3>Keep every guest covered</h3>
            <p>Smart Swaps make room for vegetarian, pescatarian, and pasta-loving guests without losing the menu.</p>
          </article>
          <article>
            <span className="sales-feature-number">04</span>
            <h3>Shop with certainty</h3>
            <p>Your shopping list follows your chosen number of guests. Switch between US and metric units in one tap.</p>
          </article>
        </div>
      </section>

      <section className="sales-preview" id="preview">
        <div className="sales-preview-card">
          <div className="sales-preview-label">Your free table</div>
          <p className="sales-eyebrow">Romantic Anniversary Dinner · 2–12 guests</p>
          <h2>Try a complete interactive recipe — <em>free.</em></h2>
          <p>
            Move the guest slider. See the ingredients change. Switch US and metric. Open the shopping list.
            This is a real chapter from The Big Table, with no card and no email required.
          </p>
          <button className="sales-secondary sales-preview-button" onClick={props.onPreview}>
            Try the free recipe <span>→</span>
          </button>
        </div>
        <div className="sales-demo-card" aria-hidden="true">
          <div className="sales-demo-topline">THE BIG TABLE <span>METRIC · US</span></div>
          <div className="sales-demo-dish">Pomegranate &amp; Ras El Hanout<br />Braised Lamb Shoulder</div>
          <div className="sales-demo-rule" />
          <div className="sales-demo-row"><strong>8</strong><em>people</em><span>scales 2–12</span></div>
          <div className="sales-demo-slider"><i /></div>
          <div className="sales-demo-ingredients"><span>Bone-in lamb shoulder</span><b>3 kg</b><span>Pomegranate molasses</span><b>4 tbsp</b><span>Garlic cloves</span><b>16</b></div>
        </div>
      </section>

      <section className="sales-included" id="included">
        <div className="sales-section-head">
          <p className="sales-eyebrow">The full edition</p>
          <h2>One purchase. <em>Every gathering.</em></h2>
        </div>
        <div className="sales-included-body">
          <div className="sales-count-block"><strong>38</strong><span>occasions across every culture and calendar</span></div>
          <ul>
            <li>All 38 interactive celebration recipes</li>
            <li>Live ingredient scaling from 2–60 guests</li>
            <li>US and metric units throughout</li>
            <li>Smart Swaps and shopping lists for every recipe</li>
            <li>Plan Your Day timelines, notes, and printable Kitchen Packs</li>
            <li>Optional sign-in to keep notes, guest counts, and check-offs in sync across devices</li>
            <li>Future updates included</li>
          </ul>
        </div>
        <p className="sales-occasion-roll">
          {OCCASION_NAMES.map((name, i) => (
            <span key={name}>
              {name}
              {i < OCCASION_NAMES.length - 1 && <span className="sales-occasion-dot"> · </span>}
            </span>
          ))}
        </p>
      </section>

      <section className="sales-reviews" aria-label="Verified customer reviews">
        <p className="sales-eyebrow">From the table</p>
        <h2>Five stars from the people who host.</h2>
        <div className="sales-review-grid">
          <blockquote>
            <span>★★★★★</span>
            <p>“Entertaining can be such a hassle—this makes you feel like your Mom is holding your hand for the entire process. Strongly recommend.”</p>
            <footer>James · Verified Gumroad buyer</footer>
          </blockquote>
          <blockquote>
            <span>★★★★★</span>
            <p>“Great E-Book for all foodlovers and people who love to cook for others and themselves! Great pictures as well.”</p>
            <footer>Anonymous · Verified Gumroad buyer</footer>
          </blockquote>
        </div>
      </section>

      <section className="sales-price">
        <p className="sales-eyebrow">Simple pricing</p>
        <h2>Everything at the table.<br /><em>{PRICE_LABEL}, once.</em></h2>
        <p className="sales-price-copy">No subscription. No installation. Your Gumroad purchase sends a licence key by email, and The Big Table opens in your browser.</p>
        <GumroadCta className="sales-price-cta">Get The Big Table · {PRICE_LABEL}</GumroadCta>
        <p className="sales-price-note">30-day, no-questions refund · Future updates included</p>
      </section>

      <section className="sales-faq" id="faq">
        <p className="sales-eyebrow">Before you pull up a chair</p>
        <h2>A few useful answers.</h2>
        <div className="sales-faq-grid">
          <details>
            <summary>What do I receive after purchase?</summary>
            <p>Gumroad emails your licence key. Open The Big Table in a modern browser, select “Already own it? Open the guide,” and enter the key once to unlock every occasion.</p>
          </details>
          <details>
            <summary>Is it a download or an app?</summary>
            <p>The Big Table is a browser-based kitchen guide. There is no separate app to install. It works on desktop, tablet, and mobile in modern browsers.</p>
          </details>
          <details>
            <summary>Do I need an account?</summary>
            <p>No. The guide works on one device without signing in. An optional email sign-in lets your notes, guest counts, serve times, and shopping check-offs follow you across devices.</p>
          </details>
          <details>
            <summary>What if it is not right for me?</summary>
            <p>You have 30 days to request a full, no-questions refund.</p>
          </details>
        </div>
      </section>

      <section className="sales-final">
        <p className="sales-eyebrow">Make room for more</p>
        <h2>Nobody left hungry.<br /><em>Nobody left behind.</em></h2>
        <GumroadCta>Unlock all 38 occasions · {PRICE_LABEL}</GumroadCta>
        <button className="sales-owned-link" onClick={props.onOpenGuide}>Already own The Big Table? Open the guide →</button>
      </section>

      <footer className="sales-footer">
        <span><em>The</em> Big Table</span>
        <span>Every culture · Every gathering</span>
        <button onClick={props.onOpenGuide}>Open the guide</button>
      </footer>
    </main>
  );
}
