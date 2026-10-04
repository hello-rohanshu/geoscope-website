# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Unreleased]
### Added
### Changed
### Fixed
### Removed -->

## [0.2.0] - 2026-09-20

### Added
- Mobile compatibility
- A basic but consistent design guideline
- Title card: "Geoscope" at the end of the site
- An interactive three.js Earth which morphs into an icosahedron, and then unfolds into the Dymaxion map, revealing map UI controls and an overlay panel
- A full page starry canvas which pretends to be the aforementioned Earth sphere's background, as well as the site's, while responding to any interaction with the Earth.
- Map overlay data layer option 2016 night light density from NASA 'Black Marble'

### Changed
- Revamped the entire backend of the site
- Changed and improved the Story of Humanity timeline cards UI and UX to adhere to the new design
- Changed and improved Design Science Revolution progress to show Internet, Supergrid, and N/A as three key checkpoint-milestones of our journey

### Fixed
- The site will no longer feel like a 1FPS slog. Fixed performance by cleaning up packages and rendering.

### Removed
- Removed the 5 portal cards as they were too far away from newly defined minimal aesthetics. Replaced with a 'work in progress' blurred out component.
- Removed the old laggy Dymaxion map setup as the new unfold setup replaces its functionality fully

## [0.1.0] - 2025-12-04

### Added
- 5 infographic panels, showing humanity's current situation at a glance, currently with dummy data: Life Support, Crew Harmony, Fuel System, Navigation, and Population
- Aforementioned panels are atop a Cesium 3D Earth background
- Story of humanity timeline cards based on Bucky's Operating Manual for Spaceship Earth book
- A Dymaxion map displaying population density data of 2024 via a GeoTIFF file
- A proof-of-concept Design Science Revolution progress bar