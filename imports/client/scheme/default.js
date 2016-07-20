export const default_resolution  =  {
  "draft" : {
    "convergence_chunk_size" : 1000,
    "convergence_tolerance" : 0.5,
    "convergence_fewest_plants" : 10
  },
  "low" : {
    "convergence_chunk_size" : 500,
    "convergence_tolerance" : 0.05,
    "convergence_fewest_plants" : 100
  },
  "high" : {
    "convergence_chunk_size" : 50,
    "convergence_tolerance" : 0.005,
    "convergence_fewest_plants" : 500
  }
};

export const default_species = {
  "phaseolus_vulgaris": {
    "chromosome_lengths": [
      203,
      276,
      236,
      200,
      133,
      163,
      188,
      206,
      143,
      132,
      164
    ],
    "name": "Phaseolus Vulgaris"
  },
  "test_bean": {
    "chromosome_lengths": [
      101,
      172,
      133,
      100,
      133,
      163,
      188,
      106,
      143,
      132,
      164
    ],
    "name": "Test Bean"
  }}
