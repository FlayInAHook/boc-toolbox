import { Box, HTMLChakraProps } from "@chakra-ui/react";


type LineProps = { direction?: "horizontal" | "vertical" } & HTMLChakraProps<"div">;

const Line: React.FC<LineProps> = ({ direction = "horizontal", ...props }) => {
  return (
    <Box 
      display="block"
      height={direction === "horizontal" ? "1px" : "100%"}
      width={direction === "vertical" ? "1px" : "100%"}
      backgroundColor="gray.600"
      borderTopWidth={direction === "horizontal" ? "1px" : "0"}
      borderLeftWidth={direction === "vertical" ? "1px" : "0"}
      borderStyle="solid"
      borderColor="gray.600"
      padding={0}
      margin={0}
      {...props} 
    />
  );
};


export default Line;