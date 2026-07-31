"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { Vehicle } from "../../lib/site-data";

const MAX_IMAGE_BYTES = 1_400_000;

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Não foi possível otimizar a imagem"))), "image/webp", quality);
  });
}

async function optimizePhoto(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1800;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Seu navegador não conseguiu processar a imagem");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.84, 0.74, 0.64, 0.54]) {
    const blob = await canvasToBlob(canvas, quality);
    if (blob.size <= MAX_IMAGE_BYTES) {
      return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
    }
  }
  throw new Error("A foto é muito grande. Escolha outra imagem.");
}

export default function AdminPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Vehicle | null>(null);
  const [query, setQuery] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("Carregando estoque...");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/admin/api/session", { cache: "no-store" }),
      fetch("/admin/api/vehicles", { cache: "no-store" }),
    ])
      .then(async ([sessionResponse, vehicleResponse]) => {
        if (sessionResponse.status === 401 || vehicleResponse.status === 401) {
          window.location.replace("/admin/login");
          throw new Error("Redirecionando para o login...");
        }
        if (!sessionResponse.ok || !vehicleResponse.ok) throw new Error("Não foi possível carregar o painel");
        const session = (await sessionResponse.json()) as { email: string };
        const payload = (await vehicleResponse.json()) as { vehicles: Vehicle[] };
        if (!active) return;
        setAdminEmail(session.email);
        setVehicles(payload.vehicles);
        setSelectedId(payload.vehicles[0]?.id ?? null);
        setStatus("Alterações publicadas ficam disponíveis no site em segundos.");
      })
      .catch((error) => active && setStatus(error instanceof Error ? error.message : "Não foi possível carregar o painel"));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const selected = vehicles.find((vehicle) => vehicle.id === selectedId) ?? null;
    setDraft(selected ? { ...selected } : null);
    setPhoto(null);
    setPreview("");
  }, [selectedId, vehicles]);

  useEffect(() => {
    if (!photo) return;
    const objectUrl = URL.createObjectURL(photo);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    return vehicles.filter((vehicle) =>
      `${vehicle.brand} ${vehicle.model} ${vehicle.version}`.toLocaleLowerCase("pt-BR").includes(term),
    );
  }, [query, vehicles]);

  function updateField(event: ChangeEvent<HTMLInputElement>) {
    if (!draft) return;
    const { name, value, type, checked } = event.target;
    setDraft({
      ...draft,
      [name]: type === "checkbox" ? checked : ["price", "year", "km"].includes(name) ? Number(value) : value,
    });
  }

  async function saveVehicle(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setBusy(true);
    setStatus("Salvando informações...");
    try {
      const response = await fetch("/admin/api/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle: draft }),
      });
      if (response.status === 401) {
        window.location.replace("/admin/login");
        return;
      }
      const payload = (await response.json()) as { error?: string; vehicle?: Vehicle };
      if (!response.ok || !payload.vehicle) throw new Error(payload.error ?? "Falha ao salvar");
      setVehicles((current) => current.map((item) => (item.id === draft.id ? payload.vehicle! : item)));
      setStatus("Informações salvas e publicadas.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao salvar");
    } finally {
      setBusy(false);
    }
  }

  async function uploadPhoto() {
    if (!draft || !photo) return;
    setBusy(true);
    setStatus("Enviando e publicando a nova foto...");
    try {
      const form = new FormData();
      form.set("vehicleId", String(draft.id));
      form.set("file", photo);
      const response = await fetch("/admin/api/upload", { method: "POST", body: form });
      if (response.status === 401) {
        window.location.replace("/admin/login");
        return;
      }
      const payload = (await response.json()) as { error?: string; image?: string };
      if (!response.ok || !payload.image) throw new Error(payload.error ?? "Falha no envio");
      const updated = { ...draft, image: payload.image };
      setDraft(updated);
      setVehicles((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setPhoto(null);
      setPreview("");
      setStatus("Nova foto publicada com sucesso.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha no envio");
    } finally {
      setBusy(false);
    }
  }

  async function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus("Otimizando a foto para o site...");
    try {
      const optimized = await optimizePhoto(file);
      setPhoto(optimized);
      setStatus(`Foto pronta para publicar · ${(optimized.size / 1024).toFixed(0)} KB`);
    } catch (error) {
      setPhoto(null);
      setStatus(error instanceof Error ? error.message : "Não foi possível processar a foto");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <img src="/images/brand/cds-car-logo.png" alt="CDS Car" />
          <span>Painel administrativo</span>
        </div>
        <nav>
          <a href="/" target="_blank" rel="noreferrer">Ver site</a>
          <a href="/admin/api/logout">Sair</a>
        </nav>
      </header>

      <section className="admin-intro">
        <div>
          <span className="admin-kicker">Gestão de conteúdo</span>
          <h1>Estoque e imagens sob seu controle.</h1>
          <p>Atualize fotos, informações comerciais e escolha quais veículos aparecem no carrossel principal.</p>
        </div>
        <div className="admin-account"><span>Administrador conectado</span><strong>{adminEmail || "Verificando acesso..."}</strong></div>
      </section>

      <div className="admin-status" role="status">{status}</div>

      <section className="admin-workspace">
        <aside className="admin-vehicle-list">
          <div className="admin-list-heading">
            <div><strong>Veículos</strong><span>{vehicles.length} cadastrados</span></div>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar veículo" aria-label="Buscar veículo" />
          </div>
          <div className="admin-list-scroll">
            {filtered.map((vehicle) => (
              <button
                className={vehicle.id === selectedId ? "is-selected" : ""}
                type="button"
                key={vehicle.id}
                onClick={() => setSelectedId(vehicle.id)}
              >
                <img src={vehicle.image} alt="" />
                <span><strong>{vehicle.brand} {vehicle.model}</strong><small>{vehicle.year} · R$ {vehicle.price.toLocaleString("pt-BR")}</small></span>
                {vehicle.featured && <em>Destaque</em>}
              </button>
            ))}
          </div>
        </aside>

        {draft ? (
          <form className="admin-editor" onSubmit={saveVehicle}>
            <div className="admin-editor-photo">
              <img src={preview || draft.image} alt={`${draft.brand} ${draft.model}`} />
              <div>
                <span>Foto principal</span>
                <strong>JPG, PNG ou WebP · otimização automática</strong>
                <label className="admin-file-button">
                  Escolher nova foto
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} />
                </label>
                <button type="button" onClick={uploadPhoto} disabled={!photo || busy}>Publicar foto</button>
              </div>
            </div>

            <div className="admin-editor-title">
              <div><span>Editando</span><h2>{draft.brand} {draft.model}</h2></div>
              <label className="admin-featured"><input name="featured" type="checkbox" checked={draft.featured} onChange={updateField} /><span>Exibir no carrossel inicial</span></label>
            </div>

            <div className="admin-form-grid">
              <label><span>Marca</span><input name="brand" value={draft.brand} onChange={updateField} required /></label>
              <label><span>Modelo</span><input name="model" value={draft.model} onChange={updateField} required /></label>
              <label className="admin-wide"><span>Versão</span><input name="version" value={draft.version} onChange={updateField} required /></label>
              <label><span>Preço</span><input name="price" type="number" min="0" value={draft.price} onChange={updateField} required /></label>
              <label><span>Ano</span><input name="year" type="number" min="1900" value={draft.year} onChange={updateField} required /></label>
              <label><span>Quilometragem</span><input name="km" type="number" min="0" value={draft.km} onChange={updateField} required /></label>
              <label><span>Cor</span><input name="color" value={draft.color} onChange={updateField} required /></label>
              <label><span>Câmbio</span><input name="transmission" value={draft.transmission} onChange={updateField} required /></label>
              <label><span>Combustível</span><input name="fuel" value={draft.fuel} onChange={updateField} required /></label>
            </div>
            <button className="admin-save" type="submit" disabled={busy}>{busy ? "Salvando..." : "Salvar alterações"}</button>
          </form>
        ) : (
          <div className="admin-empty"><strong>Nenhum veículo disponível</strong><p>{status}</p></div>
        )}
      </section>
    </main>
  );
}
