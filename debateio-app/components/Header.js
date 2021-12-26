import { Heading, Flex, Box, Spacer, Button } from "@chakra-ui/react";
import Link from "next/link";

function Header() {
  return (
    <Flex>
      <Box p="2">
        <Link href="/">
          <a>
            <Heading size="md">Debate.io</Heading>
          </a>
        </Link>
      </Box>
      <Spacer />
      <Box>
        <Button colorScheme="teal" mr="4">
          Sign Up
        </Button>
        <Button colorScheme="teal">Log in</Button>
      </Box>
    </Flex>
  );
}

export default Header;
