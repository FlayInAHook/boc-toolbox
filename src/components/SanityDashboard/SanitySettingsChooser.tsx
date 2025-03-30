import { Collapsible, HStack, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { MultiValue, Select } from "chakra-react-select";
import { useAtom, useAtomValue } from "jotai";
import clone from "nanoclone";
import { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { getBlackduckProjects, getSonarQubeProjects, getSonarQubeUsers, getTeams, sanityLocalTeamAtom, sanityLocalTeamConfigInSyncAtom } from "../../queries/sanity";

interface SanitySettingsChooserProps extends Collapsible.RootProps {
  setting: "members" | "sonarQubeProjects" | "blackDuckProjects";
}

const SanitySettingsChooser: React.FC<SanitySettingsChooserProps> = ({ setting, ...props }) => {
  const { isPending: teamsIsPeding, data: teamsData, error: teamsError } = useQuery({
    queryKey: ['sanityTeams'],
    queryFn: getTeams,
  });

  const {isPending: sonarQubeProjectsIsPending, data: sonarQubeProjectData, error: sonarQubeProjectError} = useQuery({
    queryKey: ["sonarQubeProjects"],
    queryFn: getSonarQubeProjects,
  });

  const {isPending: sonarQubeUsersIsPending, data: sonarQubeUsersData, error: sonarQubeUsersError} = useQuery({
    queryKey: ["sonarQubeUsers"],
    queryFn: getSonarQubeUsers,
  });

  const {isPending: blackDuckProjectsIsPending, data: blackDuckProjectsData, error: blackDuckProjectsError} = useQuery({
    queryKey: ["blackDuckProjects"],
    queryFn: getBlackduckProjects,
  });

  const [localTeam, setLocalTeam] = useAtom(sanityLocalTeamAtom);
  const sanityLocalTeamConfigInSync = useAtomValue(sanityLocalTeamConfigInSyncAtom);
  const [settingsVisible, setSettingsVisible] = useState(false);

  if (teamsIsPeding || sonarQubeProjectsIsPending || sonarQubeUsersIsPending || blackDuckProjectsIsPending) return <div>Loading...</div>;
  if (teamsError || sonarQubeProjectError || sonarQubeUsersError || blackDuckProjectsError) return <div>Error: {teamsError?.message ?? sonarQubeProjectError?.message ?? sonarQubeUsersError?.message ?? blackDuckProjectsError?.message}</div>;

  if (!localTeam) return <div>Team not found</div>;

  let options: { value: string; label: string }[] = [];

  switch (setting) {
    case "members":
      options = sonarQubeUsersData?.map((user) => ({ value: user.name, label: user.name })) ?? [];
      break;
    case "sonarQubeProjects":
      options = sonarQubeProjectData?.map((project) => ({ value: project.key, label: project.name })) ?? [];
      break;
    case "blackDuckProjects":
      options = blackDuckProjectsData?.map((project) => ({ value: project.versionID, label: project.name })) ?? [];
      break;
  }

  function handleSelectChange(selected: MultiValue<any>) {
    localTeam!.config[setting] = selected.map((option) => option.value);
    setLocalTeam(clone(localTeam));
  }

  function handleSelectAll() {
    localTeam!.config[setting] = options.map((option) => option.value);
    setLocalTeam(clone(localTeam));
  }


  // Custom dropdown indicator with Select All button
  const CustomDropdownIndicator = (props: any) => {
    const { innerProps, selectProps } = props;
    return (
      <HStack gap={1} pr={2} tabIndex={-1} zIndex={200} pointerEvents={"auto"} color={"gray.400"}>
        <Text
          as="button"
          onClick={(e) => {
            e.stopPropagation()
            handleSelectAll();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          fontSize="sm"
          fontWeight="medium"
          _hover={{ textDecoration: "underline" }}
          mr={2}
          pb={"2px"}
        >
          Select All
        </Text>
        {selectProps.components.DropdownIndicator && (
          <div {...innerProps}>
            {props.selectProps.menuIsOpen ? (
              <MdKeyboardArrowUp size="1.25em" />
            ) : (
              <MdKeyboardArrowDown size="1.25em" />
            )}
          </div>
        )}
      </HStack>
    );
  };

  return (
    <Collapsible.Root {...props}>
      <Collapsible.Trigger>
        <HStack onClick={() => setSettingsVisible(!settingsVisible)} >
          <Text>{settingsVisible ? "hide configuration" : "show configuration"}</Text>
          {settingsVisible ? <MdKeyboardArrowUp style={{marginTop: "3px"}}/> : <MdKeyboardArrowDown style={{marginTop: "3px"}}/>}
        </HStack>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Select
          isMulti
          options={options}
          value={options.filter((option) => localTeam.config[setting]?.includes(option.value))}
          onChange={handleSelectChange}
          menuPortalTarget={document.body}
          components={{ DropdownIndicator: CustomDropdownIndicator }}
          //styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
        />
      </Collapsible.Content>
    </Collapsible.Root>
  )
};

export default SanitySettingsChooser;