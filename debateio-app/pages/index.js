import Question from "../components/question/Question";
import Add from "../components/feed/Add";
import Feed from "../components/feed/Feed";
import Header from "../components/home/Header";
import React, { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [questions, setQuestions] = useState([]);

  function addQuestion(question) {
    console.log("Question added!");
    setQuestions([...questions, question]);
  }

  return (
    <>
      <Header />
      <Feed />
    </>
  );
}
