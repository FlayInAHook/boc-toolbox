import { Heading, Link } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { getSonarQubeProjects, sanityLocalTeamAtom } from "../../queries/sanity";
import FrostedGlassCard from "../FrostedGlassCard";
import { Tooltip } from "../ui/tooltip";




const SonarQubeQualityGates: React.FC = () => {

  const {isPending: sonarQubeProjectsIsPending, data: sonarQubeProjectData, error: sonarQubeProjectError} = useQuery({
    queryKey: ["sonarQubeProjects"],
    queryFn: getSonarQubeProjects,
  });

  const localTeam = useAtomValue(sanityLocalTeamAtom);

  if (sonarQubeProjectsIsPending) return new Array(9).fill(0).map((_, i) => <FrostedGlassCard key={i} />);
  if (sonarQubeProjectError) return <div>Error: {sonarQubeProjectError.message}</div>;

  if (!localTeam) return <div>Team not found</div>;

  const filteredProjects = sonarQubeProjectData.filter((project) => localTeam.config.sonarQubeProjects?.includes(project.key));

  return filteredProjects.map((project) => {
    const bugsLastWeek = project.measures[project.measures.length-8]?.bugs ?? "N/A";
    const bugs = project.measures[project.measures.length-1]?.bugs ?? "N/A";
    const securityHotspotsLastWeek = project.measures[project.measures.length-8]?.securityHotspots ?? "N/A";
    const securityHotspots = project.measures[project.measures.length-1]?.securityHotspots ?? "N/A";
    const bugsLink = `https://docker03ag.boc.group:9091/project/issues?id=${project.key}&resolved=false&types=BUG`;
    const securityHotspotsLink = `https://docker03ag.boc.group:9091/security_hotspots?id=${project.key}`;
    return <FrostedGlassCard  key={project.key} textAlign={"left"}>
      <Heading color={bugs != 0 || securityHotspots != 0 ? "red.200": ""} size="3xl" mb={3}>{project.name}</Heading>
      <Tooltip content={`Last week: ${bugsLastWeek}`} instant>
        <Link fontSize={"md"} href={bugsLink} target="_blank" color={bugs != 0 ? "red.200": ""}>
          Bugs: {bugs} {getProjectionArrow(bugs, bugsLastWeek)}
        </Link>
      </Tooltip>
      <Tooltip content={`Last week: ${securityHotspotsLastWeek}`} instant>
        <Link fontSize={"md"} href={securityHotspotsLink} target="_blank" color={securityHotspots != 0 ? "red.200": ""} whiteSpaceCollapse={"preserve"}>
          Security Hotspots: {securityHotspots} {getProjectionArrow(securityHotspots, securityHotspotsLastWeek)}
        </Link>
      </Tooltip>
      
    </FrostedGlassCard>
  });
};

export default SonarQubeQualityGates;


export function getProjectionArrow(value: number, lastValue: number) {
  if (value > lastValue) {
    return "⇑"//"🔼";
  } else if (value < lastValue) {
    return "⇓" //"🔽";
  } else {
    return "⇔"//"⏸️";
  }
}