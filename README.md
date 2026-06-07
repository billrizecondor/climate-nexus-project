# Global Climate Risk Index Visualization

An interactive mock dashboard that visualizes synthetic climate risk scores for countries and territories around the world.

The website lets users switch between four sector-specific risk views:

- **Energy**: yellow risk scale
- **Water**: blue risk scale
- **Land**: green risk scale
- **Society**: red risk scale

Each country has a synthetic `0-100` risk score for every sector. Higher values represent higher climate-related risk. The dataset is mock data created for visualization and portfolio demonstration purposes.

## Preview The Website
To run the website locally:

1. Open command line (Windows key + R) then run: cmd
2. Change directory to project folder location. Example: cd "C:\Users\[name of the project folder]"
3. Type: python -m http.server 8000 --directory site
4. Open your browser and go to http://localhost:8000

From the project root, run:

```powershell
python -m http.server 8000 --directory site
```

Then open:

```text
http://localhost:8000
```

The local server is needed because the page loads the JSON dataset from `site/assets/data/`.

## Project Structure

```text
climate_risk_index/      Python package placeholder for future data processing
config/                  Sector definitions and project settings
data/processed/          Synthetic country risk dataset in CSV format
site/                    Interactive HTML, CSS, JS, and browser-ready JSON data
docs/                    Methodology and data dictionary notes
scripts/                 Future Python pipeline entry points
tests/                   Starter tests for the Python package
```

## Dataset

Main data files:

- `data/processed/sample_country_sector_risk_scores.csv`
- `site/assets/data/sample_country_sector_risk_scores.json`

Fields:

```text
country, iso3, energy_risk, water_risk, land_risk, society_risk
```

## Notes

This is an early portfolio-ready mockup. The current scores are synthetic but shaped to feel plausible for a global climate-risk visualization. Future versions can replace the mock data with sourced indicators and a formal scoring methodology.
