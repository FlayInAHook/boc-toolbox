import { Box, HTMLChakraProps } from "@chakra-ui/react";

type PatternBackgroundProps =  {
  children?: React.ReactNode
} & HTMLChakraProps<"div">;

const FrostedGlassCard: React.FC<PatternBackgroundProps> = ({ children, ...props }) => {
    return (
        <Box backgroundImage="linear-gradient(to right top, oklch(0.205 0 0) 0%, rgba(38, 38, 38, 0.6) 50%, rgba(23, 23, 23, 0.6) 100%)" 
          borderRadius="md" boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)" 
          p={4} 
          backdropFilter={"blur(1px)"}
          borderWidth="1px"
          borderStyle="solid"
          borderColor="gray.600"
          _hover={{
            _after: {
              content: '""',
              display: "block",
              pointerEvents: "none",
              backgroundColor: "color-mix(in oklab,#fff 5%,transparent)",
              borderRadius: "md",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            },
          }}
          {...props}
        >
            {children}
        </Box>
    );
};

export default FrostedGlassCard;