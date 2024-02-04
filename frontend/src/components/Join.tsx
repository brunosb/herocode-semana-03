"use client";
import { FormEvent, useRef } from "react";
import Button from "./Button";
import { Input } from "./Input";
import { useRouter } from "next/navigation";

export function Join() {
  const name = useRef<HTMLInputElement>(null);
  const id = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleJoinRoom(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      name.current &&
      name.current.value !== "" &&
      id.current &&
      id.current.value !== ""
    ) {
      sessionStorage.setItem("username", name.current.value);
      const roomId = id.current.value;
      window.location.href = `/room/${roomId}`;
    }
  }

  return (
    <form onSubmit={handleJoinRoom} className="space-y-8">
      <Input placeholder="Seu nome" type="text" ref={name} />
      <Input placeholder="Seu ID da reunião" type="text" ref={id} />

      <Button title="Entrar" type="submit" />
    </form>
  );
}
