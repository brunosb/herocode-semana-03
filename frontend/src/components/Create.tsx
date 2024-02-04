"use client";
import { FormEvent, useRef } from "react";
import Button from "./Button";
import { Input } from "./Input";
import { useRouter } from "next/navigation";

export function Create() {
  const name = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleCreateRoom(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (name.current && name.current.value !== "") {
      sessionStorage.setItem("username", name.current.value);
      const roomId = generateRandomString();
      router.push(`/room/${roomId}`);
    }
  }

  function generateRandomString() {
    return (
      Math.random().toString(36).substring(2, 7) +
      Math.random().toString(36).substring(2, 7)
    );
  }

  return (
    <form onSubmit={handleCreateRoom} className="space-y-8">
      <Input placeholder="Seu nome" type="text" ref={name} />
      <Button title="Entrar" type="submit" />
    </form>
  );
}
