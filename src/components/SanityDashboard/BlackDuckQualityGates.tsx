import { Heading, Link } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { BLACKDUCK_VERSION_URL, getBlackduckProjects, sanityLocalTeamAtom } from "../../queries/sanity";
import FrostedGlassCard from "../FrostedGlassCard";
import { Tooltip } from "../ui/tooltip";




const BlackDuckQualityGates: React.FC = () => {

  const {isPending: blackDuckProjectsIsPending, data: blackDuckProjectData, error: blackDuckProjectError} = useQuery({
    queryKey: ["blackDuckProjects"],
    queryFn: getBlackduckProjects,
  });

  const localTeam = useAtomValue(sanityLocalTeamAtom);

  if (blackDuckProjectsIsPending) return new Array(9).fill(0).map((_, i) => <FrostedGlassCard key={i} />);
  if (blackDuckProjectError) return <div>Error: {blackDuckProjectError.message}</div>;

  if (!localTeam) return <div>Team not found</div>;

  const filteredProjects = blackDuckProjectData.filter((project) => localTeam.config.blackDuckProjects?.includes(project.versionID));

  return filteredProjects.map((project) => {
    const licenseRisksWeekBefore = project.risks[project.risks.length-8]?.licenseRisks ?? {high: "N/A", medium: "N/A", low: "N/A"};
    const licenseRisks = project.risks[project.risks.length-1].licenseRisks;
    const isLicenseRed = licenseRisks.high != 0 || licenseRisks.medium != 0;
    const licenseTextLastWeek = `Last week: ${licenseRisksWeekBefore.high} high, ${licenseRisksWeekBefore.medium} medium, ${licenseRisksWeekBefore.low} low`;
    const licenseText = `License Risks: ${licenseRisks.high} high ${getProjectionArrow(licenseRisks.high, licenseRisksWeekBefore.high)}, 
                        ${licenseRisks.medium} medium ${getProjectionArrow(licenseRisks.medium, licenseRisksWeekBefore.medium)}, ${licenseRisks.low} low ${getProjectionArrow(licenseRisks.low, licenseRisksWeekBefore.low)}`;

    const securityRisksWeekBefore = project.risks[project.risks.length-8]?.securityRisks ?? {critical: "N/A", high: "N/A", medium: "N/A", low: "N/A"};
    const securityRisks = project.risks[project.risks.length-1].securityRisks;
    const isSecurityRed = securityRisks.critical != 0 || securityRisks.high != 0 || securityRisks.medium != 0;
    const securityTextLastWeek = `Last week: ${securityRisksWeekBefore.critical} critical, ${securityRisksWeekBefore.high} high, ${securityRisksWeekBefore.medium} medium, ${securityRisksWeekBefore.low} low`;
    const securityText = `Security Risks: ${securityRisks.critical} critical ${getProjectionArrow(securityRisks.critical, securityRisksWeekBefore.critical)}, 
                        ${securityRisks.high} high ${getProjectionArrow(securityRisks.high, securityRisksWeekBefore.high)}, 
                        ${securityRisks.medium} medium ${getProjectionArrow(securityRisks.medium, securityRisksWeekBefore.medium)}, 
                        ${securityRisks.low} low ${getProjectionArrow(securityRisks.low, securityRisksWeekBefore.low)}`;

    const versionName = project.versionName;
    const versionUrl = BLACKDUCK_VERSION_URL.replace("%PROJECT%", project.id).replace("%VERSION%", project.versionID);

    const securityAndLicenseUrl = versionUrl + "?" + Object.entries(licenseRisks).map(([key, value]) => value > 0 ? `filter=licenseRisk:${key}` : null)
                                                    .concat(Object.entries(securityRisks).map(([key, value]) => value > 0 ? `filter=securityRisk:${key}` : null))
                                                    .filter((value) => value != null).join("&");
    const securityUrl = versionUrl + "?filter=securityRisk:critical&filter=securityRisk:high&filter=securityRisk:medium&filter=securityRisk:low";
    const licenseUrl = versionUrl + "?filter=licenseRisk:high&filter=licenseRisk:medium&filter=licenseRisk:low";
    return <FrostedGlassCard  key={project.versionID} textAlign={"left"}>
      <Heading color={isLicenseRed || isSecurityRed ? "red.200": ""} size="2xl" mb={3}><Link href={versionUrl + "?filter="} target="_blank">{project.name} ({versionName})</Link></Heading>
      <Tooltip content={securityTextLastWeek} instant>
        <Link color={isSecurityRed ? "red.200": ""} href={securityUrl} target="_blank">{securityText}</Link>
      </Tooltip>
      <Tooltip content={licenseTextLastWeek} instant>
        <Link color={isLicenseRed ? "red.200": ""} href={licenseUrl} target="_blank" >{licenseText}</Link>
      </Tooltip>
      
    </FrostedGlassCard>
  });
};

export default BlackDuckQualityGates;


export function getProjectionArrow(value: number, lastValue: number) {
  if (value > lastValue) {
    return "⇑"//"🔼";
  } else if (value < lastValue) {
    return "⇓" //"🔽";
  } else {
    return "⇔"//"⏸️";
  }
}