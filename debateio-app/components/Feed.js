import Post from "./Post";
import {
  VStack,
  StackDivider,
  Box,
  Text,
  HStack,
  Spacer,
} from "@chakra-ui/react";

export default function Feed(props) {
  const post = {
    user: "debateguy123",
    question: "Why? Why? Why?",
    open: true,
  };

  const closedPost = {
    user: "debateguy123",
    question: "Why? Why? Why?",
    open: false,
  };

  return (
    <Box padding="5">
      <Box borderWidth="1px" borderRadius="lg" h="50px" width="100%">
        <HStack justifyContent>
          <Text padding="3">User</Text>
          <Spacer />
          <Text padding="3">Question</Text>
          <Spacer />
          <Text padding="3">Status</Text>
        </HStack>
      </Box>
      <VStack
        divider={<StackDivider borderColor="gray.200" />}
        spacing={4}
        align="stretch"
        padding="5"
      >
        <Post post={post} />
        <Post post={closedPost} />
        <Post post={post} />
        <Post post={post} />
        <Post post={post} />
        <Post post={post} />
        <Post post={post} />
        <Post post={closedPost} />
        <Post post={closedPost} />
        <Post post={post} />
        <Post post={post} />
        <Post post={post} />
      </VStack>
    </Box>
  );
}
