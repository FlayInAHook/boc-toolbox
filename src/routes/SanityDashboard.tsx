import { Heading, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { GoQuestion } from 'react-icons/go'
import FadedCard from '../components/FadedCard'
import PatternBackground from '../components/PatterBackground'
import BlackDuckQualityGates from '../components/SanityDashboard/BlackDuckQualityGates'
import SanitySettingsChooser from '../components/SanityDashboard/SanitySettingsChooser'
import SanityTeamInteractions from '../components/SanityDashboard/SanityTeamInteractions'
import SonarQubeQualityGates from '../components/SanityDashboard/SonarQubeQualityGates'
import SonarQubeTodos from '../components/SanityDashboard/SonarQubeTodos'
import { Tooltip } from '../components/ui/tooltip'

export const Route = createFileRoute('/SanityDashboard')({
  component: SanityDashboard,
})

const PAGE_INFO = {
  description: <Text>This dashboard provides an quick overview of the current state of projects.<br/>
                You're able to create teams and choose observable projects and team members.<br/>
                It currently suppports SonarQube and BlackDuck projects.</Text>
}

function SanityDashboard() {


  return (
    <PatternBackground pattern='isometric' textAlign="center" fontSize="xl" w="100vw" h="100vh" overflowX={"hidden"}>
      <VStack p="20px">
        <HStack>
          <Heading size="6xl" letterSpacing="tight" mb="30px" >
            Sanity Dashboard
          </Heading>
          <Tooltip content={PAGE_INFO.description} instant >
            <GoQuestion style={{alignSelf: 'flex-start', fontSize: "28px"}}/>
          </Tooltip>
        </HStack>
        <SanityTeamInteractions />
        <Heading size="5xl" letterSpacing="tight" mb="10px" >
          SonarQube
        </Heading>
        <HStack alignItems={"flex-start"} gap={48} marginBottom={"50px"}>
          <VStack flex="1 1 0">
            <Heading size="4xl" letterSpacing="tight" >
              Quality Gates
            </Heading>
            <FadedCard overflowPercent={35} w={"100%"}>
              <SanitySettingsChooser setting="sonarQubeProjects" marginBottom={"10px"} />
              <SimpleGrid columns={3} gap={4}>
                <SonarQubeQualityGates />
              </SimpleGrid>  
            </FadedCard>
          </VStack>
          <VStack flex="1 1 0">
            <Heading size="4xl" letterSpacing="tight" >
              Todos
            </Heading>
            <FadedCard overflowPercent={35} w={"100%"}>
              <SanitySettingsChooser setting="members" marginBottom={"10px"} />
              <SimpleGrid columns={3} gap={4}>
                <SonarQubeTodos />
              </SimpleGrid>      
            </FadedCard>
          </VStack>
        </HStack>
        <Heading size="4xl" letterSpacing="tight" >
          BlackDuck - Quality Gates
        </Heading>
        <FadedCard overflowPercent={35}>
          <SanitySettingsChooser setting="blackDuckProjects" marginBottom={"10px"} />
          <SimpleGrid columns={3} gap={4}>
            <BlackDuckQualityGates />
          </SimpleGrid>
        </FadedCard>
        
      </VStack>
    </PatternBackground>
  )
}