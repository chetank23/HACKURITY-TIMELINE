import { memo } from "react";

export interface Sponsor {
  name: string;
  src: string;
}

// Still (static) sponsor
export const STILL_SPONSOR: Sponsor = {
  name: "Bharat Cares",
  src: "/bharat-cares.png",
};

// Moving (continuously flowing) sponsors
export const MOVING_SPONSORS: Sponsor[] = [
  { name: "Boston Institute of Analytics", src: "/boston-institute-of-analytics.webp" },
  { name: "Edwise International", src: "/edwise.png" },
  { name: "ISTE", src: "/iste.webp" },
  { name: "Paramount Consulting", src: "/paramount-consulting.png" },
  { name: "The Princeton Review / Manya", src: "/princeton-review-manya.jpeg" },
  { name: "Prodhee Technologies", src: "/prodhee-technologies.png" },
  { name: "VIEC", src: "/viec.png" },
];

export const SponsorsMarquee = memo(function SponsorsMarquee() {
  // Duplicate moving sponsors twice per group so each group is wide enough (~1400px),
  // ensuring a seamless infinite scroll loop with zero blank spaces.
  const groupItems = [...MOVING_SPONSORS, ...MOVING_SPONSORS];

  return (
    <div className="sponsors-header-container" aria-label="Hackathon Partners">
      <div className="sponsors-tagline">
        <span className="sponsors-tagline-dot" />
        <span className="sponsors-tagline-text">HACKATHON PARTNERS</span>
        <span className="sponsors-tagline-sep">//</span>
      </div>

      {/* Still sponsor: Bharat Cares */}
      <div className="sponsor-still-wrap" title={STILL_SPONSOR.name}>
        <div className="sponsor-badge sponsor-badge-still">
          <img
            src={STILL_SPONSOR.src}
            alt={STILL_SPONSOR.name}
            className="sponsor-logo-img"
            loading="eager"
          />
        </div>
      </div>

      <span className="sponsors-still-divider" />

      {/* Continuously moving sponsors */}
      <div className="sponsors-marquee-viewport">
        <div className="sponsors-marquee-track">
          <div className="sponsors-marquee-group">
            {groupItems.map((sponsor, idx) => (
              <div
                key={`g1-${sponsor.name}-${idx}`}
                className="sponsor-badge"
                title={sponsor.name}
              >
                <img
                  src={sponsor.src}
                  alt={sponsor.name}
                  className="sponsor-logo-img"
                  loading="eager"
                />
              </div>
            ))}
          </div>

          <div className="sponsors-marquee-group" aria-hidden="true">
            {groupItems.map((sponsor, idx) => (
              <div
                key={`g2-${sponsor.name}-${idx}`}
                className="sponsor-badge"
                title={sponsor.name}
              >
                <img
                  src={sponsor.src}
                  alt={sponsor.name}
                  className="sponsor-logo-img"
                  loading="eager"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
