import { Box, HStack, Spacer, Text, Button } from "@chakra-ui/react";

export default function Post(props) {
  const { post } = props;
  return (
    <Box h="50px">
      <HStack>
        <Text>{post.user}</Text>
        <Spacer />
        <Text color="gray.700">{post.question}</Text>
        <Spacer />
        <Text>
          {post.open ? (
            <Button colorScheme="green">Debate</Button>
          ) : (
            <Button colorScheme="red">Spectate</Button>
          )}
        </Text>
      </HStack>
    </Box>
  );
}
