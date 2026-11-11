"use client";

import { useState, type FormEvent } from "react";
import { whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

const topics = [
  "New CCTV installation",
  "CCTV repair or service",
  "PoE or network setup",
  "Computer or IT support",
  "Bulk order",
];

export function EnquiryForm() {
  const [topic, setTopic] = useState(topics[0]);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [details, setDetails] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const message = [
      `Hello Krishna Enterprises, I need help with: ${topic}.`,
      `Name: ${name}`,
      `Area: ${area}`,
      details && `Details: ${details}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(whatsappUrl(message), "_blank", "noreferrer");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 text-ink sm:p-7">
      <label className="block">
        <span className="mb-1.5 block font-semibold">What do you need?</span>
        <select value={topic} onChange={(event) => setTopic(event.target.value)} className="field">
          {topics.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-semibold">Your name</span>
          <input
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="field"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-semibold">Your area</span>
          <input
            required
            value={area}
            onChange={(event) => setArea(event.target.value)}
            placeholder="e.g. Arun Nagar"
            className="field"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block font-semibold">
          Details <span className="font-normal text-muted">(optional)</span>
        </span>
        <textarea
          rows={3}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Number of cameras, what stopped working, and so on"
          className="field"
        />
      </label>
      <button type="submit" className="btn btn-wa w-full">
        <WhatsAppIcon /> Send on WhatsApp
      </button>
    </form>
  );
}
