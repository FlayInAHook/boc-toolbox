

import { Badge, Button, HStack, HTMLChakraProps, Input, Popover, Separator, Switch, Text, VStack } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Select } from "chakra-react-select";
import { useAtom } from "jotai";
import clone from 'nanoclone';
import { useState } from "react";
import isEqual from "react-fast-compare";
import { addTeam, getTeams, sanityLocalTeamAtom, updateTeamConfig } from "../../queries/sanity";

interface PatternBackgroundProps extends Omit<HTMLChakraProps<"div">, "direction"> {

}

const SanityTeamInteractions: React.FC<PatternBackgroundProps> = ({ ...props }) => {

  const queryClient = useQueryClient();

  const { isPending: teamsIsPeding, data: teamsData, error: teamsError } = useQuery({
    queryKey: ['sanityTeams'],
    queryFn: getTeams,
  });

  const addTeamMutation = useMutation({
    mutationFn: addTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['sanityTeams']});
    }
  })

  const updateTeamConfigMutation = useMutation({
    mutationFn: updateTeamConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['sanityTeams']});
    }
  });

  const [localTeam, setLocalTeam] = useAtom(sanityLocalTeamAtom);
  const [addTeamPopoverOpen, setAddTeamPopoverOpen] = useState(false)
  const [overrideTeamPopoverOpen, setOverrideTeamPopoverOpen] = useState(false)
  const [resetLocalPopoverOpen, setResetLocalPopoverOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamCopyConfig, setNewTeamCopyConfig] = useState(false);
  

  if (teamsIsPeding) return <div>Loading...</div>;
  if (teamsError) return <div>Error: {teamsError.message}</div>;

  const teamsOptions = teamsData.sort((a, b) => a.name.localeCompare(b.name)).map((team) => ({ value: team.name, label: team.name }));
  const currentOptionsTeam = teamsOptions.find((team) => team.value === localTeam?.name) ?? null;
  const isLocalTeamInSync = isEqual(localTeam, teamsData.find((team) => team.name === localTeam?.name));

  const handleTeamChange = (selectedOption: { value: string; label: string } | null) => {
    const team = teamsData.find((team) => team.name === selectedOption?.value) ?? null;
    setLocalTeam(clone(team));
  };


  const handleAddTeam = () => {
    let newTeam;
    if (newTeamCopyConfig) {
      newTeam = { name: newTeamName, config: clone(localTeam?.config) ?? {} };
    } else {
      newTeam = { name: newTeamName, config: {} };
    }
    setLocalTeam(newTeam);
    addTeamMutation.mutate(newTeam);

    setNewTeamName("");
    setNewTeamCopyConfig(false);
    setAddTeamPopoverOpen(false);
  };

  const handleOverrideTeamConfig = () => {
    if (!localTeam) return;
    updateTeamConfigMutation.mutate(localTeam);

    setOverrideTeamPopoverOpen(false);
  };

  const handleOverrideLocalConfig = () => {
    const team = teamsData.find((team) => team.name === localTeam?.name) ?? null;
    setLocalTeam(clone(team));
    setResetLocalPopoverOpen(false);
  };

  return (
    <VStack {...props}>
      <HStack>
        <Select
          options={teamsOptions}
          value={currentOptionsTeam}
          placeholder="Select team"
          selectedOptionColorPalette={"white"}
          onChange={handleTeamChange}
          menuPortalTarget={document.body}
          chakraStyles={{ menuList: base => ({ ...base, minWidth: "max-content" }) }}
        />
        <Popover.Root open={addTeamPopoverOpen} onOpenChange={(e) => setAddTeamPopoverOpen(e.open)}>
          <Popover.Trigger>
            <Button variant={"outline"}>Add new Team</Button>
          </Popover.Trigger>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.CloseTrigger />
              <Popover.Arrow>
                <Popover.ArrowTip />
              </Popover.Arrow>
              <Popover.Body >
                <Popover.Title textAlign={"left"} fontSize={"md"}>Add a new Team</Popover.Title>
                <Separator mb={"10px"} mt={"2px"} />
                <VStack gap={4} alignItems={"flex-start"}>
                  <Input placeholder="Team Name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
                  <Switch.Root checked={newTeamCopyConfig} onCheckedChange={(e) => setNewTeamCopyConfig(e.checked)}>
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label>Use current configuration</Switch.Label>
                  </Switch.Root>
                  <Button onClick={handleAddTeam}>Add Team</Button>
                </VStack>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Root>
      </HStack>
      <HStack>
        <Badge colorPalette={isLocalTeamInSync ? "green" : "red"} fontSize={"md"}>{isLocalTeamInSync ? "In Sync" : "Out of Sync"}</Badge>
        <Popover.Root open={overrideTeamPopoverOpen} onOpenChange={(e) => setOverrideTeamPopoverOpen(e.open)}>
          <Popover.Trigger>
            <Button variant={"outline"} disabled={!localTeam || isLocalTeamInSync} >Override Team Config with Local State</Button>
          </Popover.Trigger>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.CloseTrigger />
              <Popover.Arrow>
                <Popover.ArrowTip />
              </Popover.Arrow>
              <Popover.Body textAlign={"left"}>
                <Popover.Title textAlign={"left"} fontSize={"md"}>Override Team Config</Popover.Title>
                <Separator mb={"10px"} mt={"2px"} />
                <Text mb={"5px"}>Are you sure you want to override the team configuration with the local state?</Text>
                <Button onClick={handleOverrideTeamConfig}>Override Team Config</Button>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Root>
        <Popover.Root open={resetLocalPopoverOpen} onOpenChange={(e) => setResetLocalPopoverOpen(e.open)}>
          <Popover.Trigger>
            <Button variant={"outline"} disabled={!localTeam || isLocalTeamInSync}>Reset Local State</Button>
          </Popover.Trigger>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.CloseTrigger />
              <Popover.Arrow>
                <Popover.ArrowTip />
              </Popover.Arrow>
              <Popover.Body textAlign={"left"}>
                <Popover.Title textAlign={"left"} fontSize={"md"}>Reset Local State</Popover.Title>
                <Separator mb={"10px"} mt={"2px"} />
                <Text mb={"5px"}>Are you sure you want to reset the local state?</Text>
                <Button onClick={handleOverrideLocalConfig}>Reset Local State</Button>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Root>
        
      </HStack>
    </VStack>
  );
};

export default SanityTeamInteractions;