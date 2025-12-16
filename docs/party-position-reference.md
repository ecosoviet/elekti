# Party position reference

Purpose: explain the numeric scores in src/data/party_positions.json against the 12 axes in src/data/axes.json so each party’s stance is easy to justify.

## How to read the scores

- Range: -1 (full tilt to negative pole) to 1 (full tilt to positive pole); 0 = neutral/centred.
- Interpretation wording below uses: |score| >= 0.6 “strongly leans”, 0.2–0.59 “leans”, < 0.2 “slightly leans/centred”.
- Axes and poles are defined once in the legend; per-party tables list the raw score and a short interpretation toward the relevant pole.

## Axis legend

| Axis ID                      | Name                                               | Positive pole ( +1 )                                                  | Negative pole ( -1 )                                                      |
| ---------------------------- | -------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| economic_left_right          | Economic Left ↔ Right                              | Progressive taxation, redistribution, expanded social services        | Low taxation, minimal state intervention, market-led growth               |
| state_vs_market              | State Control ↔ Market Economics                   | State ownership/regulation, public-sector leadership                  | Privatisation, deregulation, private-sector leadership                    |
| land_and_ownership           | Land & Property Rights                             | Expropriation without compensation, communal precedence, rapid reform | Market-rate transactions, private property rights, commercial agriculture |
| labour_rights                | Labour Rights ↔ Market Flexibility                 | Strong unionisation, wage floors, job protection                      | Labour flexibility, minimal restrictions, lower wage floors               |
| law_order_vs_liberty         | Law & Order ↔ Civil Liberties                      | Civil liberties prioritised, protest rights, scrutiny of state power  | Strong policing, order prioritised, limits on disruptive protest          |
| democratic_institutions      | Institutional Independence & Governance            | Judicial/electoral autonomy, oversight, anti-corruption               | Executive flexibility, cadre deployment, centralised control              |
| environment_energy           | Environmental Protection ↔ Energy Pragmatism       | Aggressive climate targets, rapid renewable transition                | Pragmatic energy mix, coal/fossil flexibility, economic prioritisation    |
| social_progressivism         | Social Progressivism ↔ Conservatism                | Progressive values, LGBTQ+ rights, gender equality                    | Traditional/conservative values, minimal state role in social morality    |
| global_vs_local              | Global Integration ↔ Economic Nationalism          | Global cooperation, open borders, multilateralism, free trade         | Economic nationalism, border control, protectionism                       |
| transformation_vs_continuity | Radical Transformation ↔ Incremental Reform        | Radical, rapid systemic change                                        | Continuity, incremental reform, stability                                 |
| urban_development            | Public Urban Planning ↔ Market-Led Development     | Public transport, dense/mixed-use, affordable housing                 | Car-friendly, private-property focus, market-led sprawl                   |
| equity_and_inclusion         | Affirmative Action & BEE ↔ Meritocratic Neutrality | Active targeting to address inequality, strong BEE                    | Minimal state-mandated targets, colour-blind/merit-first approach         |

## Party tables

### ANC

| Axis                         | Score | Interpretation                                            |
| ---------------------------- | ----- | --------------------------------------------------------- |
| economic_left_right          | 0.3   | Leans positive toward progressive taxation/redistribution |
| state_vs_market              | 0.2   | Slightly leans positive toward state control/regulation   |
| land_and_ownership           | 0.5   | Leans positive toward rapid land reform/expropriation     |
| labour_rights                | 0.4   | Leans positive toward stronger labour protections         |
| law_order_vs_liberty         | -0.1  | Centred with slight lean toward order/strong policing     |
| democratic_institutions      | -0.55 | Leans negative toward executive control/cadre deployment  |
| environment_energy           | -0.1  | Near-neutral with slight lean toward pragmatic energy mix |
| social_progressivism         | 0.3   | Leans positive toward progressive social rights           |
| global_vs_local              | -0.1  | Near-neutral with slight lean toward economic nationalism |
| transformation_vs_continuity | 0.5   | Leans positive toward rapid transformation                |
| urban_development            | 0.3   | Leans positive toward public-transit/dense development    |
| equity_and_inclusion         | 0.5   | Leans positive toward affirmative action/BEE              |

### DA

| Axis                         | Score | Interpretation                                                         |
| ---------------------------- | ----- | ---------------------------------------------------------------------- |
| economic_left_right          | -0.8  | Strongly leans negative toward low taxation/market-led growth          |
| state_vs_market              | -0.7  | Strongly leans negative toward privatisation/market leadership         |
| land_and_ownership           | -0.7  | Strongly leans negative toward private property/market transactions    |
| labour_rights                | -0.6  | Strongly leans negative toward labour flexibility/minimal restrictions |
| law_order_vs_liberty         | -0.2  | Leans negative toward order/strong policing                            |
| democratic_institutions      | 0.8   | Strongly leans positive toward institutional autonomy/oversight        |
| environment_energy           | 0.5   | Leans positive toward aggressive climate/renewables                    |
| social_progressivism         | 0.7   | Strongly leans positive toward progressive social rights               |
| global_vs_local              | 0.6   | Strongly leans positive toward global cooperation/free trade           |
| transformation_vs_continuity | -0.5  | Leans negative toward incremental reform/stability                     |
| urban_development            | -0.1  | Centred with slight lean toward car-friendly/market-led                |
| equity_and_inclusion         | -0.6  | Strongly leans negative toward meritocratic neutrality                 |

### EFF

| Axis                         | Score | Interpretation                                                     |
| ---------------------------- | ----- | ------------------------------------------------------------------ |
| economic_left_right          | 0.9   | Strongly leans positive toward progressive taxation/redistribution |
| state_vs_market              | 0.9   | Strongly leans positive toward state ownership/regulation          |
| land_and_ownership           | 1.0   | Fully positive toward expropriation/rapid reform                   |
| labour_rights                | 0.8   | Strongly leans positive toward strong unions/protection            |
| law_order_vs_liberty         | 0.4   | Leans positive toward civil liberties priority                     |
| democratic_institutions      | -0.6  | Strongly leans negative toward executive control                   |
| environment_energy           | 0.6   | Strongly leans positive toward aggressive climate/renewables       |
| social_progressivism         | 0.5   | Leans positive toward progressive social rights                    |
| global_vs_local              | -0.8  | Strongly leans negative toward economic nationalism/protectionism  |
| transformation_vs_continuity | 1.0   | Fully positive toward radical transformation                       |
| urban_development            | 0.7   | Strongly leans positive toward public transit/dense development    |
| equity_and_inclusion         | 0.9   | Strongly leans positive toward affirmative action/BEE              |

### IFP

| Axis                         | Score | Interpretation                                                     |
| ---------------------------- | ----- | ------------------------------------------------------------------ |
| economic_left_right          | -0.1  | Near-neutral with slight lean toward low taxation/market-led       |
| state_vs_market              | -0.2  | Slightly leans negative toward privatisation/market leadership     |
| land_and_ownership           | 0.1   | Near-neutral with slight lean toward rapid reform                  |
| labour_rights                | 0.0   | Neutral between labour protection and flexibility                  |
| law_order_vs_liberty         | 0.1   | Near-neutral with slight lean toward civil liberties               |
| democratic_institutions      | 0.2   | Slightly leans positive toward institutional autonomy              |
| environment_energy           | 0.1   | Near-neutral with slight lean toward aggressive climate/renewables |
| social_progressivism         | -0.5  | Leans negative toward traditional/conservative values              |
| global_vs_local              | 0.0   | Neutral between global openness and nationalism                    |
| transformation_vs_continuity | -0.3  | Leans negative toward incremental reform/stability                 |
| urban_development            | 0.0   | Neutral between public planning and market-led sprawl              |
| equity_and_inclusion         | 0.1   | Near-neutral with slight lean toward affirmative action            |

### MK

| Axis                         | Score | Interpretation                                                     |
| ---------------------------- | ----- | ------------------------------------------------------------------ |
| economic_left_right          | 0.8   | Strongly leans positive toward progressive taxation/redistribution |
| state_vs_market              | 0.7   | Strongly leans positive toward state ownership/regulation          |
| land_and_ownership           | 0.9   | Strongly leans positive toward expropriation/rapid reform          |
| labour_rights                | 0.7   | Strongly leans positive toward strong unions/protection            |
| law_order_vs_liberty         | -0.6  | Strongly leans negative toward order/strong policing               |
| democratic_institutions      | -0.7  | Strongly leans negative toward executive control                   |
| environment_energy           | -0.2  | Slightly leans negative toward pragmatic energy mix                |
| social_progressivism         | -0.4  | Leans negative toward traditional/conservative values              |
| global_vs_local              | -0.7  | Strongly leans negative toward economic nationalism/protectionism  |
| transformation_vs_continuity | 0.9   | Strongly leans positive toward radical transformation              |
| urban_development            | 0.6   | Strongly leans positive toward public transit/dense development    |
| equity_and_inclusion         | 0.8   | Strongly leans positive toward affirmative action/BEE              |

### PA

| Axis                         | Score | Interpretation                                                 |
| ---------------------------- | ----- | -------------------------------------------------------------- |
| economic_left_right          | -0.3  | Leans negative toward low taxation/market-led growth           |
| state_vs_market              | -0.3  | Leans negative toward privatisation/market leadership          |
| land_and_ownership           | -0.1  | Near-neutral with slight lean toward private property          |
| labour_rights                | -0.2  | Slightly leans negative toward labour flexibility              |
| law_order_vs_liberty         | -0.4  | Leans negative toward order/strong policing                    |
| democratic_institutions      | 0.0   | Neutral between autonomy and executive flexibility             |
| environment_energy           | -0.1  | Slightly leans negative toward pragmatic energy mix            |
| social_progressivism         | -0.6  | Strongly leans negative toward traditional/conservative values |
| global_vs_local              | -0.4  | Leans negative toward economic nationalism/protectionism       |
| transformation_vs_continuity | 0.0   | Neutral between radical change and continuity                  |
| urban_development            | -0.1  | Near-neutral with slight lean toward market-led development    |
| equity_and_inclusion         | 0.2   | Slightly leans positive toward affirmative action              |

### VF PLUS

| Axis                         | Score | Interpretation                                                      |
| ---------------------------- | ----- | ------------------------------------------------------------------- |
| economic_left_right          | -0.7  | Strongly leans negative toward low taxation/market-led growth       |
| state_vs_market              | -0.6  | Strongly leans negative toward privatisation/market leadership      |
| land_and_ownership           | -0.9  | Strongly leans negative toward private property/market transactions |
| labour_rights                | -0.7  | Strongly leans negative toward labour flexibility                   |
| law_order_vs_liberty         | -0.3  | Leans negative toward order/strong policing                         |
| democratic_institutions      | 0.4   | Leans positive toward institutional autonomy/oversight              |
| environment_energy           | -0.2  | Slightly leans negative toward pragmatic energy mix                 |
| social_progressivism         | -0.9  | Strongly leans negative toward conservative values                  |
| global_vs_local              | -0.4  | Leans negative toward economic nationalism/protectionism            |
| transformation_vs_continuity | -0.6  | Leans negative toward continuity/incremental reform                 |
| urban_development            | -0.5  | Leans negative toward car-friendly/market-led development           |
| equity_and_inclusion         | -0.9  | Strongly leans negative toward meritocratic neutrality              |

### ActionSA

| Axis                         | Score | Interpretation                                                  |
| ---------------------------- | ----- | --------------------------------------------------------------- |
| economic_left_right          | -0.4  | Leans negative toward low taxation/market-led growth            |
| state_vs_market              | -0.4  | Leans negative toward privatisation/market leadership           |
| land_and_ownership           | -0.3  | Leans negative toward private property/market transactions      |
| labour_rights                | -0.3  | Leans negative toward labour flexibility                        |
| law_order_vs_liberty         | -0.2  | Leans negative toward order/strong policing                     |
| democratic_institutions      | 0.7   | Strongly leans positive toward institutional autonomy/oversight |
| environment_energy           | 0.2   | Slightly leans positive toward aggressive climate/renewables    |
| social_progressivism         | -0.2  | Slightly leans negative toward traditional/conservative values  |
| global_vs_local              | 0.4   | Leans positive toward global cooperation/free trade             |
| transformation_vs_continuity | -0.4  | Leans negative toward continuity/incremental reform             |
| urban_development            | -0.1  | Near-neutral with slight lean toward market-led development     |
| equity_and_inclusion         | -0.3  | Leans negative toward meritocratic neutrality                   |

### ACDP

| Axis                         | Score | Interpretation                                          |
| ---------------------------- | ----- | ------------------------------------------------------- |
| economic_left_right          | -0.5  | Leans negative toward low taxation/market-led growth    |
| state_vs_market              | -0.5  | Leans negative toward privatisation/market leadership   |
| land_and_ownership           | -0.2  | Slightly leans negative toward private property         |
| labour_rights                | -0.1  | Near-neutral with slight lean toward labour flexibility |
| law_order_vs_liberty         | -0.3  | Leans negative toward order/strong policing             |
| democratic_institutions      | 0.5   | Leans positive toward institutional autonomy/oversight  |
| environment_energy           | 0.0   | Neutral between aggressive climate and pragmatic mix    |
| social_progressivism         | -0.8  | Strongly leans negative toward conservative values      |
| global_vs_local              | 0.1   | Near-neutral with slight lean toward global openness    |
| transformation_vs_continuity | -0.2  | Slightly leans negative toward continuity               |
| urban_development            | 0.0   | Neutral between public planning and market-led          |
| equity_and_inclusion         | -0.4  | Leans negative toward meritocratic neutrality           |

### UFC

| Axis                         | Score | Interpretation                                         |
| ---------------------------- | ----- | ------------------------------------------------------ |
| economic_left_right          | 0.0   | Neutral between redistribution and market-led          |
| state_vs_market              | 0.0   | Neutral between state control and market leadership    |
| land_and_ownership           | 0.0   | Neutral between rapid reform and private property      |
| labour_rights                | 0.1   | Near-neutral with slight lean toward labour protection |
| law_order_vs_liberty         | 0.1   | Near-neutral with slight lean toward civil liberties   |
| democratic_institutions      | 0.3   | Leans positive toward institutional autonomy           |
| environment_energy           | 0.4   | Leans positive toward aggressive climate/renewables    |
| social_progressivism         | 0.4   | Leans positive toward progressive social rights        |
| global_vs_local              | 0.2   | Slightly leans positive toward global cooperation      |
| transformation_vs_continuity | 0.2   | Slightly leans positive toward transformation          |
| urban_development            | 0.2   | Slightly leans positive toward public planning         |
| equity_and_inclusion         | 0.3   | Leans positive toward affirmative action/BEE           |

### UDM

| Axis                         | Score | Interpretation                                                  |
| ---------------------------- | ----- | --------------------------------------------------------------- |
| economic_left_right          | 0.1   | Near-neutral with slight lean toward redistribution             |
| state_vs_market              | 0.0   | Neutral between state control and market leadership             |
| land_and_ownership           | 0.3   | Leans positive toward rapid land reform                         |
| labour_rights                | 0.1   | Near-neutral with slight lean toward labour protection          |
| law_order_vs_liberty         | 0.3   | Leans positive toward civil liberties priority                  |
| democratic_institutions      | 0.8   | Strongly leans positive toward institutional autonomy/oversight |
| environment_energy           | 0.3   | Leans positive toward aggressive climate/renewables             |
| social_progressivism         | 0.3   | Leans positive toward progressive social rights                 |
| global_vs_local              | 0.2   | Slightly leans positive toward global cooperation               |
| transformation_vs_continuity | 0.2   | Slightly leans positive toward transformation                   |
| urban_development            | 0.2   | Slightly leans positive toward public planning                  |
| equity_and_inclusion         | 0.3   | Leans positive toward affirmative action/BEE                    |

### SACP

| Axis                         | Score | Interpretation                                                  |
| ---------------------------- | ----- | --------------------------------------------------------------- |
| economic_left_right          | 1.0   | Fully positive toward progressive taxation/redistribution       |
| state_vs_market              | 1.0   | Fully positive toward state ownership/regulation                |
| land_and_ownership           | 0.8   | Strongly leans positive toward expropriation/rapid reform       |
| labour_rights                | 1.0   | Fully positive toward strong unions/protection                  |
| law_order_vs_liberty         | -0.5  | Leans negative toward order/strong policing                     |
| democratic_institutions      | 0.4   | Leans positive toward institutional autonomy/oversight          |
| environment_energy           | 0.5   | Leans positive toward aggressive climate/renewables             |
| social_progressivism         | 0.7   | Strongly leans positive toward progressive social rights        |
| global_vs_local              | 0.5   | Leans positive toward global cooperation/free trade             |
| transformation_vs_continuity | 1.0   | Fully positive toward radical transformation                    |
| urban_development            | 0.8   | Strongly leans positive toward public transit/dense development |
| equity_and_inclusion         | 0.9   | Strongly leans positive toward affirmative action/BEE           |

### ATM

| Axis                         | Score | Interpretation                                                 |
| ---------------------------- | ----- | -------------------------------------------------------------- |
| economic_left_right          | -0.3  | Leans negative toward low taxation/market-led growth           |
| state_vs_market              | -0.2  | Slightly leans negative toward privatisation/market leadership |
| land_and_ownership           | -0.1  | Near-neutral with slight lean toward private property          |
| labour_rights                | -0.2  | Slightly leans negative toward labour flexibility              |
| law_order_vs_liberty         | -0.6  | Strongly leans negative toward order/strong policing           |
| democratic_institutions      | 0.2   | Slightly leans positive toward institutional autonomy          |
| environment_energy           | 0.0   | Neutral between aggressive climate and pragmatic mix           |
| social_progressivism         | -0.8  | Strongly leans negative toward conservative values             |
| global_vs_local              | -0.5  | Leans negative toward economic nationalism/protectionism       |
| transformation_vs_continuity | -0.2  | Slightly leans negative toward continuity                      |
| urban_development            | 0.0   | Neutral between public planning and market-led                 |
| equity_and_inclusion         | -0.1  | Near-neutral with slight lean toward meritocratic neutrality   |

### Al Jama-ah

| Axis                         | Score | Interpretation                                                     |
| ---------------------------- | ----- | ------------------------------------------------------------------ |
| economic_left_right          | 0.2   | Slightly leans positive toward progressive taxation/redistribution |
| state_vs_market              | 0.1   | Near-neutral with slight lean toward state control                 |
| land_and_ownership           | 0.3   | Leans positive toward rapid land reform                            |
| labour_rights                | 0.2   | Slightly leans positive toward labour protection                   |
| law_order_vs_liberty         | 0.2   | Slightly leans positive toward civil liberties priority            |
| democratic_institutions      | 0.1   | Near-neutral with slight lean toward institutional autonomy        |
| environment_energy           | 0.2   | Slightly leans positive toward aggressive climate/renewables       |
| social_progressivism         | -0.7  | Strongly leans negative toward conservative values                 |
| global_vs_local              | 0.1   | Near-neutral with slight lean toward global openness               |
| transformation_vs_continuity | 0.3   | Leans positive toward transformation                               |
| urban_development            | 0.2   | Slightly leans positive toward public planning                     |
| equity_and_inclusion         | 0.4   | Leans positive toward affirmative action/BEE                       |

### NCC

| Axis                         | Score | Interpretation                                                     |
| ---------------------------- | ----- | ------------------------------------------------------------------ |
| economic_left_right          | 0.0   | Neutral between redistribution and market-led                      |
| state_vs_market              | 0.0   | Neutral between state control and market leadership                |
| land_and_ownership           | 0.0   | Neutral between rapid reform and private property                  |
| labour_rights                | 0.0   | Neutral between labour protection and flexibility                  |
| law_order_vs_liberty         | 0.1   | Near-neutral with slight lean toward civil liberties               |
| democratic_institutions      | 0.3   | Leans positive toward institutional autonomy                       |
| environment_energy           | 0.1   | Near-neutral with slight lean toward aggressive climate/renewables |
| social_progressivism         | 0.1   | Near-neutral with slight lean toward progressive values            |
| global_vs_local              | 0.0   | Neutral between global openness and nationalism                    |
| transformation_vs_continuity | 0.1   | Near-neutral with slight lean toward transformation                |
| urban_development            | 0.1   | Near-neutral with slight lean toward public planning               |
| equity_and_inclusion         | 0.3   | Leans positive toward affirmative action/BEE                       |

### PAC

| Axis                         | Score | Interpretation                                                     |
| ---------------------------- | ----- | ------------------------------------------------------------------ |
| economic_left_right          | 0.7   | Strongly leans positive toward progressive taxation/redistribution |
| state_vs_market              | 0.6   | Strongly leans positive toward state ownership/regulation          |
| land_and_ownership           | 0.9   | Strongly leans positive toward expropriation/rapid reform          |
| labour_rights                | 0.6   | Strongly leans positive toward strong unions/protection            |
| law_order_vs_liberty         | 0.4   | Leans positive toward civil liberties priority                     |
| democratic_institutions      | -0.1  | Centred with slight lean toward executive control                  |
| environment_energy           | 0.3   | Leans positive toward aggressive climate/renewables                |
| social_progressivism         | 0.2   | Slightly leans positive toward progressive social rights           |
| global_vs_local              | -0.6  | Strongly leans negative toward economic nationalism/protectionism  |
| transformation_vs_continuity | 0.8   | Strongly leans positive toward radical transformation              |
| urban_development            | 0.5   | Leans positive toward public transit/dense development             |
| equity_and_inclusion         | 0.8   | Strongly leans positive toward affirmative action/BEE              |
