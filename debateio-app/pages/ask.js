import { Container, Button, VStack, Box, Input } from "@chakra-ui/react";

export default function Ask() {
  function handleSubmit(event) {
    event.preventDefault();
    console.log("question submitted");
  }

  return (
    <VStack spacing="10" my={10}>
      <Box borderWidth="1px" borderRadius="lg" h="50px" width="75%">
        <Input
          width="100%"
          height="100%"
          placeholder="Write your question here..."
        />
      </Box>
      <Button color="teal">Debate!</Button>
    </VStack>
  );
}
