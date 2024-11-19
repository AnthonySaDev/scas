"use client";
import { useState } from "react";

export default function RegisterDefibrillatorForm() {
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");

  // Função para envio do formulário
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log({
      name,
      latitude,
      longitude,
      description,
    });
    // Aqui você pode integrar com Supabase para salvar os dados
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <h2 className="font-bold text-2xl mb-4">Registrar Novo Desfibrilador</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          Nome
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
            placeholder="Nome do desfibrilador"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          Latitude
          <input
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="border p-2 rounded"
            placeholder="Latitude"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          Longitude
          <input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="border p-2 rounded"
            placeholder="Longitude"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          Descrição
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded resize-none"
            placeholder="Descrição do desfibrilador"
            required
          />
        </label>
        <button type="submit" className="bg-primary text-black p-2 rounded mt-2">
          Registrar
        </button>
      </form>
    </div>
  );
}
