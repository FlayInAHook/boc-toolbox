import { Image, Text, VStack } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { GiBrain } from 'react-icons/gi';
import { GoQuestion } from 'react-icons/go';
import { IoSearch } from 'react-icons/io5';
import { SiSonar } from 'react-icons/si';
import { Tooltip } from '../ui/tooltip';
import { PixelCard } from './PixelCard';
import './PixelCardSet.css';
import UTGUI_LOGO from "/static/utgui.png";

function renderTooltip(tooltipContent: string) {
  return (
    <Tooltip content={tooltipContent} instant positioning={{placement: "top"}} >
      <GoQuestion style={{position: 'absolute', top: '10px', right: '10px', pointerEvents: "fill", opacity: 0.6 }} />
    </Tooltip>
  );
}

export const PixelCardSet: React.FC = () => {
  return (
    <main className="pixel-card-set">

      <Link to="/UTGUI" style={{position: 'relative'}}>
        <PixelCard
          icon={
            <VStack filter={"grayscale(1)"} opacity={0.6}>
              <Text color="#B8ADEDFF" width="200px" fontSize="2xl" visibility={'hidden'}>UTGUI by<br/> Tim & Marvin</Text>
              <Image src={UTGUI_LOGO} width="100px" />
              <Text color="#B8ADEDFF" width="200px" fontSize="2xl" visibility={'hidden'}>UTGUI by<br/> Tim & Marvin</Text>
            </VStack>
          }
          hoverIcon={
            <VStack>
              <Text color="#B8ADEDFF" width="200px" fontSize="2xl" visibility={'hidden'}>UTGUI by<br/> Tim & Marvin</Text>
              <Image src={UTGUI_LOGO} width="100px" />
              <Text color="#B8ADEDFF" width="200px" fontSize="2xl">UTGUI by<br/> Tim & Marvin</Text>
            </VStack>
          }
          activeColor="#b794f4"
          pixelCanvasProps={{
            gap: 6,
            speed: 60,
            colors: " #e9d8fd, #b794f4, #805ad5",
            noFocus: true
          }}
          extraElement={
            renderTooltip("UTGUI is a custom GUI for the Utility Tools that allow you to easily setup and manage ADOxx instances.")
          }
        />
        
      </Link>

      <Link to="/MFBSearch" style={{position: 'relative'}}>
        <PixelCard
          icon={
            <VStack>
              <Text color="#FAD361FF" width="200px" fontSize="2xl" visibility={'hidden'}>MFB Search</Text>
              <IoSearch style={{width: '100px'}} />
              <Text color="#FAD361FF" width="200px" fontSize="2xl" visibility={'hidden'}>MFB Search</Text>
            </VStack>
          }
          hoverIcon={
            <VStack>
              <Text color="#FAD361FF" width="200px" fontSize="2xl" visibility={'hidden'}>MFB Search</Text>
              <IoSearch style={{width: '100px'}} />
              <Text color="#FAD361FF" width="200px" fontSize="2xl">MFB Search</Text>
            </VStack>
          }
          activeColor='#FBCF4BFF'
          pixelCanvasProps={{
            gap: 6,
            speed: 200,
            colors: "#4285F4, #34A853, #FBBC05, #EA4335"
          }}
          extraElement={
            renderTooltip("MFB Search is a tool that allows you to search through all the CUSTOM MFBs in the Artifactory. Very useful for finding code examples of specific APIs.")
          }
        />
      </Link>

      <Link to="/SanityDashboard" style={{position: 'relative'}}>
        <PixelCard
          icon={
            <VStack>
              <Text color="#FAD361FF" width="200px" fontSize="2xl" visibility={'hidden'}>Sanity Dashboard</Text>
              <GiBrain style={{width: '100px'}} />
              <Text color="#FAD361FF" width="200px" fontSize="2xl" visibility={'hidden'}>Sanity Dashboard</Text>
            </VStack>
          }
          hoverIcon={
            <VStack>
              <Text color="#FAD361FF" width="200px" fontSize="2xl" visibility={'hidden'}>Sanity Dashboard</Text>
              <GiBrain style={{width: '100px'}} />
              <Text color="#D7F4FBFF" width="200px" fontSize="2xl">Sanity Dashboard</Text>
            </VStack>
          }
          activeColor='#CCF1FAFF'
          pixelCanvasProps={{
            gap: 6,
            speed: 200,
            colors: "#34A853, #EA4335"
          }}
          extraElement={
            renderTooltip("Sanity Dashboard is a tool to monitor Blackduck & SonarQube projects for quality gates & todos. You can easily create teams and sync up with your colleagues.")
          }
        />
      </Link>

      <Link to="/SonarQubeHotspotCopier" style={{position: 'relative'}}>
        <PixelCard
          icon={
            <VStack>
              <Text color="#FAD361FF" width="200px" fontSize="2xl" visibility={'hidden'}>SonarQube Hotpsot Copier</Text>
              <SiSonar style={{width: '100px'}} />
              <Text color="#FAD361FF" width="200px" fontSize="2xl" visibility={'hidden'}>SonarQube Hotpsot Copier</Text>
            </VStack>
          }
          hoverIcon={
            <VStack>
              <Text color="#FAD361FF" width="200px" fontSize="2xl" visibility={'hidden'}>SonarQube Hotpsot Copier</Text>
              <SiSonar style={{width: '100px'}} />
              <Text color="#3682D4FF" width="200px" fontSize="2xl">SonarQube Hotpsot Copier</Text>
            </VStack>
          }
          activeColor='#126ed3'
          pixelCanvasProps={{
            gap: 6,
            speed: 200,
            colors: "#126ed3, #d3121d"
          }}
          extraElement={
            renderTooltip("SonarQube Hotspot Copier is a tool that allows you to copy decisions on SonarQube hotspots from one project to another.")
          }
        />
      </Link>

      <PixelCard
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" fill="currentcolor" viewBox="0 0 256 256">
            <path d="M67.84,92.61,25.37,128l42.47,35.39a6,6,0,1,1-7.68,9.22l-48-40a6,6,0,0,1,0-9.22l48-40a6,6,0,0,1,7.68,9.22Zm176,30.78-48-40a6,6,0,1,0-7.68,9.22L230.63,128l-42.47,35.39a6,6,0,1,0,7.68,9.22l48-40a6,6,0,0,0,0-9.22Zm-81.79-89A6,6,0,0,0,154.36,38l-64,176A6,6,0,0,0,94,221.64a6.15,6.15,0,0,0,2,.36,6,6,0,0,0,5.64-3.95l64-176A6,6,0,0,0,162.05,34.36Z"></path>
          </svg>
        }
        activeColor="#e0f2fe"
        pixelCanvasProps={{
          gap: 10,
          speed: 25,
          colors: "#e0f2fe, #7dd3fc, #0ea5e9"
        }}
      />

      

      <PixelCard
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" fill="currentcolor" viewBox="0 0 256 256">
            <path d="M180,146H158V110h22a34,34,0,1,0-34-34V98H110V76a34,34,0,1,0-34,34H98v36H76a34,34,0,1,0,34,34V158h36v22a34,34,0,1,0,34-34ZM158,76a22,22,0,1,1,22,22H158ZM54,76a22,22,0,0,1,44,0V98H76A22,22,0,0,1,54,76ZM98,180a22,22,0,1,1-22-22H98Zm12-70h36v36H110Zm70,92a22,22,0,0,1-22-22V158h22a22,22,0,0,1,0,44Z"></path>
          </svg>
        }
        activeColor="#fef08a"
        pixelCanvasProps={{
          gap: 3,
          speed: 20,
          colors: "#fef08a, #fde047, #eab308"
        }}
      />

      <PixelCard
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" fill="currentcolor" viewBox="0 0 256 256">
            <path d="M222,67.34a33.81,33.81,0,0,0-10.64-24.25C198.12,30.56,176.68,31,163.54,44.18L142.82,65l-.63-.63a22,22,0,0,0-31.11,0l-9,9a14,14,0,0,0,0,19.81l3.47,3.47L53.14,149.1a37.81,37.81,0,0,0-9.84,36.73l-8.31,19a11.68,11.68,0,0,0,2.46,13A13.91,13.91,0,0,0,47.32,222,14.15,14.15,0,0,0,53,220.82L71,212.92a37.92,37.92,0,0,0,35.84-10.07l52.44-52.46,3.47,3.48a14,14,0,0,0,19.8,0l9-9a22.06,22.06,0,0,0,0-31.13l-.66-.65L212,91.85A33.76,33.76,0,0,0,222,67.34Zm-123.61,127a26,26,0,0,1-26,6.47,6,6,0,0,0-4.17.24l-20,8.75a2,2,0,0,1-2.09-.31l9.12-20.9a5.94,5.94,0,0,0,.19-4.31A25.91,25.91,0,0,1,56,166h70.78ZM138.78,154H65.24l48.83-48.84,36.76,36.78Zm64.77-70.59L178.17,108.9a6,6,0,0,0,0,8.47l4.88,4.89a10,10,0,0,1,0,14.15l-9,9a2,2,0,0,1-2.82,0l-60.69-60.7a2,2,0,0,1,0-2.83l9-9a10,10,0,0,1,14.14,0l4.89,4.89a6,6,0,0,0,4.24,1.75h0a6,6,0,0,0,4.25-1.77L172,52.66c8.57-8.58,22.51-9,31.07-.85a22,22,0,0,1,.44,31.57Z"></path>
          </svg>
        }
        activeColor="#fecdd3"
        pixelCanvasProps={{
          gap: 6,
          speed: 80,
          colors: "#fecdd3, #fda4af, #e11d48",
          noFocus: true
        }}
      />
      
    </main>
  );
};
