const DATA_URL = "assets/data/sample_country_sector_risk_scores.json";

const SECTORS = {
  energy_risk: {
    label: "Energy Risk",
    shortLabel: "Energy",
    color: "#d89b00",
    softColor: "#fff5cf",
    colorscale: [
      [0, "#fff8db"],
      [0.22, "#ffe38a"],
      [0.45, "#ffc73d"],
      [0.7, "#e49b00"],
      [1, "#9a5f00"],
    ],
  },
  water_risk: {
    label: "Water Risk",
    shortLabel: "Water",
    color: "#1479c9",
    softColor: "#e2f1ff",
    colorscale: [
      [0, "#e8f6ff"],
      [0.25, "#9fd8ff"],
      [0.5, "#48aee8"],
      [0.72, "#1479c9"],
      [1, "#084173"],
    ],
  },
  land_risk: {
    label: "Land Risk",
    shortLabel: "Land",
    color: "#268248",
    softColor: "#e3f5e7",
    colorscale: [
      [0, "#edf9e8"],
      [0.25, "#bde8b3"],
      [0.5, "#70c277"],
      [0.72, "#268248"],
      [1, "#0f4628"],
    ],
  },
  society_risk: {
    label: "Society Risk",
    shortLabel: "Society",
    color: "#c63f36",
    softColor: "#ffe4e0",
    colorscale: [
      [0, "#fff0ed"],
      [0.25, "#ffbbb1"],
      [0.5, "#f07464"],
      [0.72, "#c63f36"],
      [1, "#741c19"],
    ],
  },
};

const BAR_COLORS = {
  energy_risk: "#d89b00",
  water_risk: "#1479c9",
  land_risk: "#268248",
  society_risk: "#c63f36",
};

const state = {
  countries: [],
  activeSector: "energy_risk",
  selectedIso3: null,
};

const elements = {
  map: document.querySelector("#risk-map"),
  profile: document.querySelector("#country-profile"),
  topCountries: document.querySelector("#top-countries"),
  sectorButtons: document.querySelectorAll("[data-sector]"),
  search: document.querySelector("#country-search"),
  countryCount: document.querySelector("#country-count"),
  activeSectorLabel: document.querySelector("#active-sector-label"),
  mapTitle: document.querySelector("#map-title"),
};

function setTheme(sectorKey) {
  const sector = SECTORS[sectorKey];
  document.documentElement.style.setProperty("--sector", sector.color);
  document.documentElement.style.setProperty("--sector-soft", sector.softColor);
}

function getScore(country, sectorKey = state.activeSector) {
  return Number(country[sectorKey]);
}

function getRiskLevel(score) {
  if (score >= 75) return "Very high";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  if (score >= 25) return "Low";
  return "Very low";
}

function formatScore(value) {
  return Number(value).toFixed(1);
}

function getSelectedCountry() {
  return state.countries.find((country) => country.iso3 === state.selectedIso3) ?? state.countries[0];
}

function renderMap() {
  const sector = SECTORS[state.activeSector];
  const locations = state.countries.map((country) => country.iso3);
  const values = state.countries.map((country) => getScore(country));
  const text = state.countries.map((country) => country.country);

  if (!window.Plotly) {
    elements.map.innerHTML = `
      <div class="empty-state">
        The map library could not be loaded. The ranking and country profile are still available.
      </div>
    `;
    return;
  }

  const data = [
    {
      type: "choropleth",
      locationmode: "ISO-3",
      locations,
      z: values,
      text,
      customdata: state.countries.map((country) => [
        country.iso3,
        formatScore(country.energy_risk),
        formatScore(country.water_risk),
        formatScore(country.land_risk),
        formatScore(country.society_risk),
      ]),
      zmin: 0,
      zmax: 100,
      colorscale: sector.colorscale,
      marker: {
        line: {
          color: "#ffffff",
          width: 0.35,
        },
      },
      colorbar: {
        title: {
          text: "Risk",
          side: "right",
        },
        thickness: 12,
        len: 0.72,
        outlinewidth: 0,
        tickfont: {
          color: "#5f6c66",
        },
      },
      hovertemplate: [
        "<b>%{text}</b>",
        `${sector.shortLabel}: %{z:.1f}`,
        "Energy: %{customdata[1]}",
        "Water: %{customdata[2]}",
        "Land: %{customdata[3]}",
        "Society: %{customdata[4]}",
        "<extra></extra>",
      ].join("<br>"),
    },
  ];

  const layout = {
    margin: { t: 8, r: 10, b: 8, l: 10 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    geo: {
      projection: { type: "natural earth" },
      showframe: false,
      showcoastlines: false,
      showcountries: true,
      countrycolor: "#ffffff",
      showland: true,
      landcolor: "#edf0eb",
      showocean: true,
      oceancolor: "#f8fbfd",
      bgcolor: "#ffffff",
    },
  };

  const config = {
    displayModeBar: false,
    responsive: true,
  };

  Plotly.react(elements.map, data, layout, config);

  elements.map.on("plotly_click", (event) => {
    const point = event.points?.[0];
    const iso3 = point?.location;
    if (!iso3) return;
    state.selectedIso3 = iso3;
    renderProfile();
  });
}

function renderProfile() {
  const country = getSelectedCountry();
  if (!country) {
    elements.profile.innerHTML = `<div class="empty-state">No country data loaded yet.</div>`;
    return;
  }

  const sector = SECTORS[state.activeSector];
  const activeScore = getScore(country);
  const rows = Object.entries(SECTORS)
    .map(([key, meta]) => {
      const score = getScore(country, key);
      return `
        <div class="sector-row">
          <div class="sector-row-header">
            <span>${meta.shortLabel}</span>
            <span>${formatScore(score)}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${score}%; --bar-color: ${BAR_COLORS[key]}"></div>
          </div>
        </div>
      `;
    })
    .join("");

  elements.profile.innerHTML = `
    <div>
      <p class="profile-kicker">${country.iso3}</p>
      <h2 class="country-name">${country.country}</h2>
    </div>
    <div class="score-hero">
      <div class="score-ring">${formatScore(activeScore)}</div>
      <p>
        ${sector.label} is rated <strong>${getRiskLevel(activeScore)}</strong> on a synthetic 0-100 scale.
        Higher values indicate greater climate-related risk.
      </p>
    </div>
    <div class="sector-bars">${rows}</div>
  `;
}

function renderTopCountries() {
  const top = [...state.countries]
    .sort((a, b) => getScore(b) - getScore(a))
    .slice(0, 7);

  elements.topCountries.innerHTML = top
    .map(
      (country) => `
        <li>
          <button type="button" data-iso3="${country.iso3}">${country.country}</button>
          <span>${formatScore(getScore(country))}</span>
        </li>
      `,
    )
    .join("");

  elements.topCountries.querySelectorAll("[data-iso3]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedIso3 = button.dataset.iso3;
      renderProfile();
    });
  });
}

function renderHeadings() {
  const sector = SECTORS[state.activeSector];
  elements.activeSectorLabel.textContent = sector.label;
  elements.mapTitle.textContent = `${sector.shortLabel} risk by country`;
}

function setActiveSector(sectorKey) {
  state.activeSector = sectorKey;
  setTheme(sectorKey);

  elements.sectorButtons.forEach((button) => {
    const isActive = button.dataset.sector === sectorKey;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-checked", String(isActive));
  });

  renderHeadings();
  renderMap();
  renderProfile();
  renderTopCountries();
}

function bindEvents() {
  elements.sectorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveSector(button.dataset.sector);
    });
  });

  elements.search.addEventListener("input", () => {
    const query = elements.search.value.trim().toLowerCase();
    const match = state.countries.find((country) => country.country.toLowerCase().includes(query));
    if (!query || !match) return;
    state.selectedIso3 = match.iso3;
    renderProfile();
  });

  window.addEventListener("resize", () => {
    if (window.Plotly && elements.map) {
      Plotly.Plots.resize(elements.map);
    }
  });
}

async function init() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Could not load ${DATA_URL}`);
    }

    state.countries = await response.json();
    state.selectedIso3 = "PHL";
    elements.countryCount.textContent = state.countries.length;

    bindEvents();
    setActiveSector(state.activeSector);
  } catch (error) {
    elements.profile.innerHTML = `
      <div class="empty-state">
        The dataset could not be loaded. Run this page from a local web server so the JSON file can be fetched.
      </div>
    `;
    elements.map.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
}

init();
