import { createSystem, defaultConfig, defineConfig, defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      utgui: {
        fontSize: "lg",
        px: 6,
        py: 3,
        color: "red.500"
      },
    },
  },
});

const config = defineConfig({
  theme: {
    recipes: {
      button: buttonRecipe,
    },
  },
});

const themeSystem = createSystem(defaultConfig, config);
export default themeSystem;