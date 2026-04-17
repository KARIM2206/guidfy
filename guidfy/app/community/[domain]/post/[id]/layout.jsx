"use client";

import { useEffect, useState } from "react";
import { PostProvider } from "@/app/CONTEXT/Postcontext";

export default function PostLayout({ children }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("token") ?? "");
  }, []);

  if (token === null) return null;

  return <PostProvider token={token}>{children}</PostProvider>;
}