import crimeInstitutions from "./crime-institutions.json";
import cultureIdentity from "./culture-identity.json";
import digitalTech from "./digital-tech.json";
import economicInclusion from "./economic-inclusion.json";
import economyFiscal from "./economy-fiscal.json";
import environmentEnergy from "./environment-energy.json";
import foodAgriculture from "./food-agriculture.json";
import foreignTrade from "./foreign-trade.json";
import infrastructureUrban from "./infrastructure-urban.json";
import labourWorkplace from "./labour-workplace.json";
import ownershipLand from "./ownership-land.json";
import rightsFreedoms from "./rights-freedoms.json";
import socialInclusion from "./social-inclusion.json";
import socialWelfare from "./social-welfare.json";
import votingBehaviour from "./voting-behaviour.json";
import youthEducation from "./youth-education.json";

export default [
  ...economyFiscal,
  ...socialWelfare,
  ...ownershipLand,
  ...labourWorkplace,
  ...crimeInstitutions,
  ...rightsFreedoms,
  ...environmentEnergy,
  ...foreignTrade,
  ...infrastructureUrban,
  ...digitalTech,
  ...foodAgriculture,
  ...youthEducation,
  ...socialInclusion,
  ...economicInclusion,
  ...cultureIdentity,
  ...votingBehaviour,
];
