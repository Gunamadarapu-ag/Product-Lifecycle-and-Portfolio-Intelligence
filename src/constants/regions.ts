/**
 * The Top-Down Drilldown used to show fictional global regions (APAC, EMEA,
 * LATAM, Americas) with invented managers and plants, independently
 * hand-duplicated across 4 files. The database only has these 7 European
 * countries, in 3 real regions (dim_country.region) — see
 * assortment/SKUHoldingsMatrix.tsx's COUNTRIES and data/generator/config.py's
 * COUNTRIES for the same grouping. This is now the one place that data lives.
 *
 * The contacts and plant names below are still illustrative (this is a GTM
 * demo, not a real org chart) — what changed is the geography they're
 * attached to, which now matches the database instead of contradicting it.
 */
export interface RegionInfo {
  name: string;
  countries: string[];
  manager: string;
  email: string;
  role: string;
  plant: string;
}

export const REGIONS_CONFIG: Record<string, RegionInfo> = {
  'Southern Europe': {
    name: 'Southern Europe',
    countries: ['Italy', 'Spain'],
    manager: 'Elena Marchetti',
    email: 'elena.marchetti@aciesglobal.com',
    role: 'Regional Supply Lead — Southern Europe',
    plant: 'Milan Distribution Hub',
  },
  'Western Europe': {
    name: 'Western Europe',
    countries: ['Germany', 'France', 'Netherlands'],
    manager: 'Lukas Hoffmann',
    email: 'lukas.hoffmann@aciesglobal.com',
    role: 'Regional Supply Lead — Western Europe',
    plant: 'Rotterdam Logistics Hub',
  },
  'Central Europe': {
    name: 'Central Europe',
    countries: ['Austria', 'Poland'],
    manager: 'Katarzyna Nowak',
    email: 'katarzyna.nowak@aciesglobal.com',
    role: 'Regional Supply Lead — Central Europe',
    plant: 'Vienna Distribution Hub',
  },
};

export const REGION_KEYS = Object.keys(REGIONS_CONFIG);

/** The 3 real regions, in the order fn_regional_fulfillment/fn_regional_performance don't guarantee. */
export const REGION_ORDER = ['Southern Europe', 'Western Europe', 'Central Europe'];
