"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { defaultVehicles, type Vehicle } from "../lib/site-data";

const WHATSAPP_NUMBER = "5511917856525";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("pt-BR");

function whatsappLink(message: string) {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(defaultVehicles);
  const [heroIndex, setHeroIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("featured");
  const [showAll, setShowAll] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [cookieVisible, setCookieVisible] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/site-data")
      .then((response) => response.json())
      .then((payload: { vehicles?: Vehicle[] }) => {
        if (active && payload.vehicles?.length) setVehicles(payload.vehicles);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const heroVehicles = useMemo(() => {
    const featured = vehicles.filter((vehicle) => vehicle.featured);
    return (featured.length ? featured : vehicles).slice(0, 6);
  }, [vehicles]);

  useEffect(() => {
    if (heroVehicles.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(
      () => setHeroIndex((current) => (current + 1) % heroVehicles.length),
      5200,
    );
    return () => window.clearInterval(interval);
  }, [heroVehicles.length]);

  useEffect(() => {
    if (heroIndex >= heroVehicles.length) setHeroIndex(0);
  }, [heroIndex, heroVehicles.length]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCookieVisible(window.localStorage.getItem("cds-cookie-consent") !== "accepted");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedVehicle(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const brands = useMemo(
    () => Array.from(new Set(vehicles.map((vehicle) => vehicle.brand))).sort(),
    [vehicles],
  );

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = query.toLocaleLowerCase("pt-BR").trim();
    const result = vehicles.filter((vehicle) => {
      const searchable = `${vehicle.brand} ${vehicle.model} ${vehicle.version}`.toLocaleLowerCase("pt-BR");
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesBrand = !brand || vehicle.brand === brand;
      const matchesPrice = !maxPrice || vehicle.price <= Number(maxPrice);
      return matchesQuery && matchesBrand && matchesPrice;
    });

    return [...result].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "year") return b.year - a.year;
      if (sort === "km") return a.km - b.km;
      return Number(b.featured) - Number(a.featured) || b.id - a.id;
    });
  }, [brand, maxPrice, query, sort, vehicles]);

  const hasFilters = Boolean(query || brand || maxPrice);
  const displayedVehicles = showAll || hasFilters ? filteredVehicles : filteredVehicles.slice(0, 8);
  const activeHero = heroVehicles[heroIndex] ?? defaultVehicles[0];

  function clearFilters() {
    setQuery("");
    setBrand("");
    setMaxPrice("");
    setSort("featured");
  }

  function handleLeadForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = [
      "Olá! Quero vender meu veículo com a CDS Car.",
      `Nome: ${form.get("name")}`,
      `Telefone: ${form.get("phone")}`,
      `Veículo: ${form.get("brand")} ${form.get("model")}`,
      `Ano: ${form.get("year")}`,
      `Quilometragem: ${form.get("km")} km`,
      `Valor desejado: ${form.get("value")}`,
    ].join("\n");
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  }

  function acceptCookies() {
    window.localStorage.setItem("cds-cookie-consent", "accepted");
    setCookieVisible(false);
  }

  return (
    <main>
      <div className="utility-bar">
        <div className="page-shell utility-inner">
          <span>Rua Fernando Falcão, 102 • Mooca, São Paulo</span>
          <div>
            <a href="tel:+5511940067474">(11) 94006-7474</a>
            <span className="utility-divider" aria-hidden="true" />
            <span>Seg–Sex 8h–18h • Sáb 9h–13h</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="page-shell header-inner">
          <a className="brand-link" href="#inicio" aria-label="CDS Car — início">
            <img src="/images/brand/cds-car-logo.png" alt="CDS Car Intermediações" />
          </a>
          <nav className={`main-nav ${mobileOpen ? "is-open" : ""}`} aria-label="Navegação principal">
            <a href="#estoque" onClick={() => setMobileOpen(false)}>Comprar</a>
            <a href="#vender" onClick={() => setMobileOpen(false)}>Vender</a>
            <a href="#financiamento" onClick={() => setMobileOpen(false)}>Financiar</a>
            <a href="#empresa" onClick={() => setMobileOpen(false)}>A CDS</a>
            <a href="#contato" onClick={() => setMobileOpen(false)}>Contato</a>
          </nav>
          <a className="header-cta" href={whatsappLink("Olá! Vim pelo site da CDS Car e gostaria de atendimento.")} target="_blank" rel="noreferrer">
            Falar no WhatsApp
          </a>
          <button
            className="menu-button"
            type="button"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-slides" aria-hidden="true">
          {heroVehicles.map((vehicle, index) => (
            <img className={`hero-image ${index === heroIndex ? "is-active" : ""}`} src={vehicle.image} alt="" key={vehicle.id} />
          ))}
        </div>
        <div className="hero-overlay" />
        <div className="page-shell hero-content hero-content-premium">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow">Curadoria CDS Car • Mooca</span>
            <h1>Escolhas melhores.<br />Negócios mais seguros.</h1>
            <p>Veículos selecionados, avaliação transparente e uma equipe que conduz compra, venda, crédito e seguro do primeiro contato à entrega.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#estoque">Explorar oportunidades</a>
              <a className="button button-ghost" href="#vender">Avaliar meu veículo</a>
            </div>
            <div className="trust-row" aria-label="Diferenciais CDS Car">
              <span>Laudo cautelar aprovado</span>
              <span>Sem leilão</span>
              <span>Sem sinistro</span>
            </div>
          </div>
          <aside className="hero-offer" aria-label="Veículo em destaque">
            <div className="hero-offer-top"><span>Destaque do estoque</span><em>{String(heroIndex + 1).padStart(2, "0")} / {String(heroVehicles.length).padStart(2, "0")}</em></div>
            <p>{activeHero.brand}</p>
            <h2>{activeHero.model}</h2>
            <span className="hero-offer-version">{activeHero.version}</span>
            <div className="hero-offer-specs"><span>{activeHero.year}</span><span>{number.format(activeHero.km)} km</span><span>{activeHero.transmission}</span></div>
            <strong>{money.format(activeHero.price)}</strong>
            <button type="button" onClick={() => setSelectedVehicle(activeHero)}>Ver condições deste veículo</button>
          </aside>
        </div>
        <div className="page-shell hero-controls">
          <button type="button" aria-label="Veículo anterior" onClick={() => setHeroIndex((heroIndex - 1 + heroVehicles.length) % heroVehicles.length)}>←</button>
          <div>{heroVehicles.map((vehicle, index) => <button className={index === heroIndex ? "is-active" : ""} type="button" aria-label={`Mostrar ${vehicle.brand} ${vehicle.model}`} onClick={() => setHeroIndex(index)} key={vehicle.id} />)}</div>
          <button type="button" aria-label="Próximo veículo" onClick={() => setHeroIndex((heroIndex + 1) % heroVehicles.length)}>→</button>
        </div>
      </section>

      <section className="search-wrap" aria-label="Busca de veículos">
        <div className="page-shell">
          <div className="search-card">
            <div className="search-heading">
              <span className="eyebrow">Oportunidades CDS Car</span>
              <h2>Encontre seu próximo grande negócio</h2>
            </div>
            <div className="search-grid">
              <label className="search-field search-field-wide">
                <span>O que você procura?</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: SUV, Honda HR-V, automático" />
              </label>
              <label className="search-field">
                <span>Marca</span>
                <select value={brand} onChange={(event) => setBrand(event.target.value)}>
                  <option value="">Todas as marcas</option>
                  {brands.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="search-field">
                <span>Preço máximo</span>
                <select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}>
                  <option value="">Qualquer preço</option>
                  <option value="50000">Até R$ 50 mil</option>
                  <option value="70000">Até R$ 70 mil</option>
                  <option value="100000">Até R$ 100 mil</option>
                  <option value="150000">Até R$ 150 mil</option>
                  <option value="250000">Até R$ 250 mil</option>
                </select>
              </label>
              <a className="button button-search" href="#estoque">Buscar ofertas</a>
            </div>
            <div className="quick-searches">
              <span>Buscas rápidas:</span>
              <button type="button" onClick={() => { setQuery("SUV"); setShowAll(true); }}>SUVs</button>
              <button type="button" onClick={() => { setMaxPrice("70000"); setShowAll(true); }}>Até R$ 70 mil</button>
              <button type="button" onClick={() => { setQuery("automático"); setShowAll(true); }}>Automáticos</button>
              <button type="button" onClick={() => { setQuery("moto"); setShowAll(true); }}>Motos</button>
            </div>
          </div>
        </div>
      </section>

      <section className="services section-pad" aria-labelledby="services-title">
        <div className="page-shell">
          <div className="section-heading centered">
            <span className="eyebrow">Uma jornada completa</span>
            <h2 id="services-title">Do interesse à chave na mão.</h2>
            <p>A CDS reúne veículo, negociação, crédito e proteção em uma experiência conduzida por especialistas.</p>
          </div>
          <div className="service-grid">
            <a className="service-card" href="#estoque">
              <span className="service-number">01</span>
              <h3>Comprar com confiança</h3>
              <p>Uma seleção criteriosa para você decidir com clareza e sair dirigindo sem surpresas.</p>
              <strong>Encontrar meu veículo <span aria-hidden="true">→</span></strong>
            </a>
            <a className="service-card" href="#vender">
              <span className="service-number">02</span>
              <h3>Vender melhor</h3>
              <p>Posicionamento comercial, atendimento dos interessados e negociação conduzida por quem entende.</p>
              <strong>Receber uma avaliação <span aria-hidden="true">→</span></strong>
            </a>
            <a className="service-card" href="#financiamento">
              <span className="service-number">03</span>
              <h3>Financiar e proteger</h3>
              <p>Condições sob medida e apoio da CDS Corretora para você fechar o negócio completo.</p>
              <strong>Montar minha condição <span aria-hidden="true">→</span></strong>
            </a>
          </div>
        </div>
      </section>

      <section className="inventory section-pad" id="estoque" aria-labelledby="inventory-title">
        <div className="page-shell">
          <div className="inventory-top">
            <div className="section-heading">
              <span className="eyebrow">Seleção atualizada</span>
              <h2 id="inventory-title">Oportunidades que valem a visita</h2>
              <p>{filteredVehicles.length} {filteredVehicles.length === 1 ? "veículo encontrado" : "veículos encontrados"}</p>
            </div>
            <label className="sort-field">
              <span>Ordenar por</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="featured">Mais recentes</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="year">Ano</option>
                <option value="km">Menor quilometragem</option>
              </select>
            </label>
          </div>

          {hasFilters && (
            <div className="active-filters">
              <span>Filtros ativos</span>
              {query && <button type="button" onClick={() => setQuery("")}>Busca: {query} ×</button>}
              {brand && <button type="button" onClick={() => setBrand("")}>Marca: {brand} ×</button>}
              {maxPrice && <button type="button" onClick={() => setMaxPrice("")}>Até {money.format(Number(maxPrice))} ×</button>}
              <button className="clear-filter" type="button" onClick={clearFilters}>Limpar tudo</button>
            </div>
          )}

          {displayedVehicles.length > 0 ? (
            <div className="vehicle-grid">
              {displayedVehicles.map((vehicle) => (
                <article className="vehicle-card" key={vehicle.id}>
                  <button className="vehicle-image-button" type="button" onClick={() => setSelectedVehicle(vehicle)} aria-label={`Ver detalhes de ${vehicle.brand} ${vehicle.model}`}>
                    <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`} loading="lazy" />
                    <span className="fuel-pill">{vehicle.fuel}</span>
                    {vehicle.km === 0 && <span className="zero-km-pill">0 km</span>}
                  </button>
                  <div className="vehicle-body">
                    <p className="vehicle-brand">{vehicle.brand}</p>
                    <h3>{vehicle.model}</h3>
                    <p className="vehicle-version">{vehicle.version}</p>
                    <div className="vehicle-specs">
                      <span>{vehicle.year}</span>
                      <span>{number.format(vehicle.km)} km</span>
                      <span>{vehicle.transmission}</span>
                    </div>
                    <strong className="vehicle-price">{money.format(vehicle.price)}</strong>
                    <button className="vehicle-action" type="button" onClick={() => setSelectedVehicle(vehicle)}>Ver detalhes</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Nenhum veículo encontrado</h3>
              <p>Tente mudar os filtros ou fale com nossa equipe — podemos ajudar a encontrar o veículo certo.</p>
              <button className="button button-primary" type="button" onClick={clearFilters}>Limpar filtros</button>
            </div>
          )}

          {!hasFilters && filteredVehicles.length > 8 && (
            <div className="load-more-wrap">
              <button className="button button-outline" type="button" onClick={() => setShowAll((value) => !value)}>
                {showAll ? "Mostrar destaques" : `Ver todos os ${filteredVehicles.length} veículos`}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="about section-pad" id="empresa" aria-labelledby="about-title">
        <div className="page-shell about-grid">
          <div className="about-copy">
            <span className="eyebrow">Reputação construída em cada negócio</span>
            <h2 id="about-title">A segurança de uma boa escolha começa antes da chave.</h2>
            <p className="lead">Na CDS Car, cada veículo precisa fazer sentido para o nosso estoque antes de fazer sentido para você.</p>
            <p>Trabalhamos na intermediação de veículos, trazendo segurança, conforto e garantia aos nossos clientes. Selecionamos somente carros de procedência, sem passagem por leilão e sem sinistros. Todos os nossos veículos possuem laudo cautelar aprovado.</p>
            <p>A CDS Intermediações é composta por duas empresas, CDS Car e CDS Corretora de Seguros, trazendo comodidade e praticidade para você fazer tudo no mesmo lugar. Não perca tempo: compre seu veículo com quem entende do assunto.</p>
            <div className="about-points">
              <div><strong>25</strong><span>veículos no estoque atual</span></div>
              <div><strong>100%</strong><span>com laudo cautelar aprovado</span></div>
              <div><strong>1 só lugar</strong><span>carro, crédito e seguro</span></div>
            </div>
          </div>
          <div className="commercial-proof">
            <span className="commercial-proof-kicker">Padrão CDS</span>
            <h3>Mais critério na entrada.<br />Mais confiança na saída.</h3>
            <div className="commercial-proof-steps">
              <div><span>01</span><section><strong>Histórico verificado</strong><p>Procedência, documentação e condições avaliadas antes do anúncio.</p></section></div>
              <div><span>02</span><section><strong>Negociação transparente</strong><p>Informação clara, atendimento consultivo e sem pressão desnecessária.</p></section></div>
              <div><span>03</span><section><strong>Solução completa</strong><p>Compra, venda, financiamento e seguro coordenados no mesmo lugar.</p></section></div>
            </div>
            <a className="button button-primary" href={whatsappLink("Olá! Quero conhecer o padrão de atendimento da CDS Car.")} target="_blank" rel="noreferrer">Conversar com um especialista</a>
          </div>
        </div>
      </section>

      <section className="sell section-pad" id="vender" aria-labelledby="sell-title">
        <div className="page-shell sell-grid">
          <div className="sell-copy">
            <span className="eyebrow light">Venda seu carro</span>
            <h2 id="sell-title">Seu carro vale mais quando é bem apresentado.</h2>
            <p>Temos a solução completa para você vender seu carro ganhando mais. Garantimos um processo seguro e dedicamos um consultor especialista que cuidará da sua venda do começo ao fim.</p>
            <ul>
              <li>Avaliação personalizada do seu veículo</li>
              <li>Divulgação e negociação conduzidas por especialistas</li>
              <li>Pagamento seguro e acompanhamento em todas as etapas</li>
            </ul>
            <span className="form-note">Após enviar, nossa equipe solicitará as fotos do veículo pelo WhatsApp.</span>
          </div>
          <form className="sell-form" onSubmit={handleLeadForm}>
            <div className="form-heading">
              <span>Receba uma avaliação</span>
              <strong>Conte sobre o seu veículo</strong>
            </div>
            <div className="form-grid">
              <label><span>Seu nome</span><input name="name" required placeholder="Nome completo" /></label>
              <label><span>Telefone</span><input name="phone" required inputMode="tel" placeholder="(11) 99999-9999" /></label>
              <label><span>Marca</span><input name="brand" required placeholder="Ex.: Volkswagen" /></label>
              <label><span>Modelo</span><input name="model" required placeholder="Ex.: T-Cross" /></label>
              <label><span>Ano</span><input name="year" required inputMode="numeric" placeholder="2022" /></label>
              <label><span>Quilometragem</span><input name="km" required inputMode="numeric" placeholder="45.000" /></label>
              <label className="full-field"><span>Valor desejado</span><input name="value" placeholder="R$ 0,00" /></label>
            </div>
            <label className="consent-check"><input type="checkbox" required /> <span>Autorizo o contato da CDS Car sobre esta avaliação.</span></label>
            <button className="button button-primary full-button" type="submit">Enviar avaliação pelo WhatsApp</button>
          </form>
        </div>
      </section>

      <section className="finance section-pad" id="financiamento" aria-labelledby="finance-title">
        <div className="page-shell finance-grid">
          <div className="finance-card-main">
            <span className="eyebrow">Financiamento</span>
            <h2 id="finance-title">Crédito inteligente para uma decisão confortável.</h2>
            <p>Simule as condições para o veículo que deseja e receba atendimento personalizado para encontrar a melhor alternativa.</p>
            <a className="button button-primary" href={whatsappLink("Olá! Quero simular o financiamento de um veículo com a CDS Car.")} target="_blank" rel="noreferrer">Simular financiamento</a>
          </div>
          <div className="finance-steps">
            <div><span>1</span><section><strong>Escolha o veículo</strong><p>Conte qual modelo chamou sua atenção.</p></section></div>
            <div><span>2</span><section><strong>Informe seus dados</strong><p>Nossa equipe orienta a análise com segurança.</p></section></div>
            <div><span>3</span><section><strong>Compare as condições</strong><p>Defina entrada e quantidade de parcelas.</p></section></div>
          </div>
        </div>
      </section>

      <section className="contact section-pad" id="contato" aria-labelledby="contact-title">
        <div className="page-shell">
          <div className="section-heading centered">
            <span className="eyebrow">Venha nos conhecer</span>
            <h2 id="contact-title">A CDS Car está na Mooca</h2>
            <p>Fale com nossa equipe ou faça uma visita. Teremos prazer em atender você.</p>
          </div>
          <div className="contact-grid">
            <div className="map-card">
              <iframe
                title="Mapa da CDS Car na Mooca"
                src="https://www.google.com/maps?q=Rua%20Fernando%20Falc%C3%A3o%2C%20102%2C%20Mooca%2C%20S%C3%A3o%20Paulo&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="contact-info">
              <div className="contact-block"><span>Endereço</span><strong>Rua Fernando Falcão, 102</strong><p>Mooca — São Paulo — SP</p><a href="https://maps.google.com/?q=Rua+Fernando+Falcão+102+Mooca+São+Paulo" target="_blank" rel="noreferrer">Abrir rota →</a></div>
              <div className="contact-block"><span>Telefones</span><strong><a href="tel:+5511940067474">(11) 94006-7474</a></strong><strong><a href="tel:+5511917856525">(11) 91785-6525</a></strong></div>
              <div className="contact-block"><span>Horário de atendimento</span><strong>Segunda à sexta: 8h às 18h</strong><p>Sábado: 9h às 13h</p></div>
              <a className="button button-whatsapp" href={whatsappLink("Olá! Gostaria de falar com a equipe da CDS Car.")} target="_blank" rel="noreferrer">Chamar no WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="page-shell footer-grid">
          <div className="footer-brand">
            <img src="/images/brand/cds-car-logo.png" alt="CDS Car Intermediações" />
            <p>Intermediação de veículos com segurança, conforto e procedência.</p>
            <div className="social-links">
              <a href="https://www.instagram.com/cdscar_intermediacoes/" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://www.facebook.com/profile.php?id=100088245022360" target="_blank" rel="noreferrer">Facebook</a>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
          <div className="footer-links"><strong>Navegue</strong><a href="#inicio">Home</a><a href="#empresa">Empresa</a><a href="#estoque">Veículos</a><a href="#vender">Venda seu carro</a></div>
          <div className="footer-links"><strong>Atendimento</strong><a href="#financiamento">Financiamento</a><a href="#contato">Localização</a><a href="#contato">Fale conosco</a><a href="#privacidade">Política de privacidade</a><a href="/admin">Área administrativa</a></div>
          <div className="footer-contact"><strong>CDS Car</strong><p>Rua Fernando Falcão, 102<br />Mooca — São Paulo — SP</p><a href="tel:+5511940067474">(11) 94006-7474</a><a href="tel:+5511917856525">(11) 91785-6525</a></div>
        </div>
        <div className="page-shell privacy-panel" id="privacidade">
          <details>
            <summary>Política de Privacidade</summary>
            <div className="privacy-content">
              <p>Com o intuito de manter a privacidade e a segurança das informações de seus usuários, a CDS Intermediações adota as seguintes regras:</p>
              <h3>Sobre o uso de suas informações pessoais</h3>
              <ul>
                <li>A CDS Intermediações trata todas as informações de seus usuários com a máxima confidencialidade.</li>
                <li>Não divulgamos, sem prévia autorização, informações pessoais e/ou o e-mail do usuário que se cadastrar em páginas que requerem o preenchimento desses dados.</li>
                <li>Não cedemos ou comercializamos qualquer informação individual de nossos usuários a terceiros.</li>
                <li>Utilizamos as informações preenchidas pelos usuários apenas para comunicação sobre interesse em nossos produtos e dúvidas em geral.</li>
                <li>Para cancelar seu cadastro em nosso banco de dados, entre em contato através dos nossos canais de atendimento.</li>
                <li>Preservamos a identidade do usuário e mantemos sigilo enquanto ele navega em nossas páginas.</li>
              </ul>
              <h3>Google Analytics e remarketing</h3>
              <p>Podemos utilizar o Google Analytics para acompanhar métricas de tráfego e melhorar o conteúdo do site. Esse serviço utiliza cookies para avaliar a utilização do site e compilar relatórios. O Google poderá transferir essas informações a terceiros quando exigido por lei ou quando esses terceiros processarem dados em nome do Google.</p>
              <p>Serviços de remarketing podem utilizar cookies primários e de terceiros para informar, otimizar e exibir anúncios com base em visitas anteriores ao site.</p>
              <h3>Facebook, Instagram e LinkedIn</h3>
              <p>Os dados solicitados neste site podem incluir nome, números de identificação pessoal, endereço, telefone, e-mail e outras informações necessárias para atender ao propósito desta política. Funcionários da CDS Intermediações poderão entrar em contato por e-mail ou telefone para responder dúvidas ou apresentar produtos e serviços.</p>
              <p>Em campanhas de publicidade, podemos usar cookies e tecnologias semelhantes, como pixels e tags de anúncios, para reconhecer interações com nossos serviços. Toda informação cadastrada será armazenada em ambiente seguro e controlado e não será divulgada sem autorização, salvo por exigência legal ou determinação judicial.</p>
              <h3>Recusando cookies</h3>
              <p>Você pode recusar cookies nas configurações do seu navegador e desativar anúncios com base em interesses por meio da <a href="https://tools.google.com/dlpage/gaoptout/" target="_blank" rel="noreferrer">ferramenta do Google</a>. Em caso de dúvidas sobre esta política ou as práticas do site, entre em contato conosco.</p>
            </div>
          </details>
        </div>
        <div className="footer-bottom"><div className="page-shell"><span>© {new Date().getFullYear()} CDS Intermediações. Todos os direitos reservados.</span><span>CDS Car • Mooca, São Paulo</span></div></div>
      </footer>

      <a className="floating-whatsapp" href={whatsappLink("Olá! Vim pelo site da CDS Car e gostaria de atendimento.")} target="_blank" rel="noreferrer" aria-label="Falar com a CDS Car pelo WhatsApp"><span>WA</span><strong>Fale conosco</strong></a>

      {selectedVehicle && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedVehicle(null)}>
          <div className="vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="vehicle-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setSelectedVehicle(null)} aria-label="Fechar detalhes">×</button>
            <div className="modal-image"><img src={selectedVehicle.image} alt={`${selectedVehicle.brand} ${selectedVehicle.model}`} /></div>
            <div className="modal-content">
              <span className="eyebrow">{selectedVehicle.brand}</span>
              <h2 id="vehicle-modal-title">{selectedVehicle.model}</h2>
              <p className="modal-version">{selectedVehicle.version}</p>
              <strong className="modal-price">{money.format(selectedVehicle.price)}</strong>
              <div className="modal-specs">
                <div><span>Ano</span><strong>{selectedVehicle.year}</strong></div>
                <div><span>Quilometragem</span><strong>{number.format(selectedVehicle.km)} km</strong></div>
                <div><span>Câmbio</span><strong>{selectedVehicle.transmission}</strong></div>
                <div><span>Combustível</span><strong>{selectedVehicle.fuel}</strong></div>
                <div><span>Cor</span><strong>{selectedVehicle.color}</strong></div>
              </div>
              <div className="modal-trust"><strong>Veículo selecionado pela CDS Car</strong><span>Procedência comprovada e laudo cautelar aprovado.</span></div>
              <a className="button button-whatsapp full-button" href={whatsappLink(`Olá! Tenho interesse no ${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year} anunciado por ${money.format(selectedVehicle.price)}.`)} target="_blank" rel="noreferrer">Tenho interesse neste veículo</a>
              <a className="modal-phone" href="tel:+5511940067474">Ou ligue: (11) 94006-7474</a>
            </div>
          </div>
        </div>
      )}

      {cookieVisible && (
        <aside className="cookie-banner" aria-label="Aviso de cookies">
          <div><strong>Sua privacidade é importante</strong><p>Usamos cookies para melhorar sua experiência e entender o desempenho do site. Saiba mais em nossa <a href="#privacidade">Política de Privacidade</a>.</p></div>
          <button className="button button-primary" type="button" onClick={acceptCookies}>Entendi</button>
        </aside>
      )}
    </main>
  );
}
