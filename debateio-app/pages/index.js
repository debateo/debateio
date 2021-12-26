import { Container, Button, Box, Center } from "@chakra-ui/react";
import Feed from "../components/Feed";
import Header from "../components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Link href="/ask">
        <Center my={4}>
          <Button>Ask a Question</Button>
        </Center>
      </Link>
      <Feed />
    </>
  );
}
