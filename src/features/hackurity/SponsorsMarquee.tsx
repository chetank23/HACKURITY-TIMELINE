import { memo } from "react";

export interface Sponsor {
  name: string;
  src: string;
}

export const SPONSORS: Sponsor[] = [
  { name: "Bharat Cares", src: "/bharat-cares.png" },
  { name: "Boston Institute of Analytics", src: "/boston-institute-of-analytics.webp" },
  { name: "Edwise International", src: "/edwise.png" },
  { name: "ISTE", src: "/iste.webp" },
  { name: "Paramount Consulting", src: "/paramount-consulting.png" },
  { name: "The Princeton Review / Manya", src: "/princeton-review-manya.jpeg" },
  { name: "Prodhee Technologies", src: "/prodhee-technologies.png" },
  { name: "VIEC", src: "/viec.png" },
];

export const SponsorsMarquee = memo(function SponsorsMarquee() {
  // Duplicate SPONSORS twice per group so each group is ~1600px wide,
  // preventing any blank space when the track loops at -50%.
  const groupItems = [...SPONSORS, ...SPONSORS];

  return (
    <div className="sponsors-header-container" aria-label="Hackathon Partners">
      <div className="sponsors-tagline">
        <span className="sponsors-tagline-dot" />
        <span className="sponsors-tagline-text">HACKATHON PARTNERS</span>
        <span className="sponsors-tagline-sep">//</span>
      </div>

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
