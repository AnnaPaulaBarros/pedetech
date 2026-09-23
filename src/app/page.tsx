'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Category = {
  id: string;
  name: string;
  icon: string;
};

type Service = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  estimatedTime: string;
  badge?: string;
  included: string[];
  revisions: number;
};

type AccessMode = 'client' | 'admin';

type AdminOrder = {
  id: string;
  total: number;
  deposit: number;
  status: string;
  created_at: string;
};

const categories: Category[] = [
  { id: 'all', name: 'Tudo', icon: '✨' },
  { id: 'brand', name: 'Identidade Visual', icon: '🎨' },
  { id: 'digital', name: 'Presença Digital', icon: '💻' },
  { id: 'marketing', name: 'Marketing', icon: '📱' },
  { id: 'finance', name: 'Organização Financeira', icon: '💰' },
  { id: 'automation', name: 'Automação e Tecnologia', icon: '🤖' },
];

const services: Service[] = [
  {
    id: 1,
    name: 'Logo',
    category: 'Identidade Visual',
    description: 'Criação de uma identidade visual marcante com conceito, direção estética e aplicações iniciais.',
    price: 30,
    estimatedTime: '3-5 dias',
    badge: 'Mais escolhido',
    included: ['Conceito visual', '2 opções iniciais', 'Versões adaptáveis'],
    revisions: 2,
  },
  {
    id: 2,
    name: 'Identidade Visual',
    category: 'Identidade Visual',
    description: 'Sistema completo de marca com paleta, tipografia, guia e elementos visuais para comunicação.',
    price: 50,
    estimatedTime: '7-10 dias',
    included: ['Logo', 'Paleta', 'Tipografia', 'Manual básico'],
    revisions: 3,
  },
  {
    id: 3,
    name: 'Landing Page',
    category: 'Presença Digital',
    description: 'Página de destaque para captar leads, apresentar serviços e converter visitas em clientes.',
    price: 90,
    estimatedTime: '5-7 dias',
    included: ['Design responsivo', 'CTA', 'Formulário', 'SEO básico'],
    revisions: 3,
  },
  {
    id: 4,
    name: 'Site Institucional',
    category: 'Presença Digital',
    description: 'Estrutura completa para mostrar sua empresa, produtos e diferenciais com alto nível de credibilidade.',
    price: 150,
    estimatedTime: '10-14 dias',
    badge: 'Mais escolhido',
    included: ['Homepage', 'Páginas internas', 'Contato', 'SEO inicial'],
    revisions: 4,
  },
  {
    id: 5,
    name: 'Kit Instagram',
    category: 'Marketing',
    description: 'Template visual para dar consistência ao perfil e facilitar a criação de conteúdos.',
    price: 35,
    estimatedTime: '3-4 dias',
    included: ['Templates editáveis', 'Feed', 'Stories', 'Manual de uso'],
    revisions: 2,
  },
  {
    id: 6,
    name: 'Catálogo Digital',
    category: 'Marketing',
    description: 'Catálogo com produtos, fotos e organização visual para vender com mais clareza.',
    price: 40,
    estimatedTime: '4-6 dias',
    included: ['Páginas por categoria', 'Botões de contato', 'Arquivos prontos'],
    revisions: 2,
  },
  {
    id: 7,
    name: 'Planilha Financeira',
    category: 'Organização Financeira',
    description: 'Estrutura simples para organizar fluxo de caixa, despesas e receitas do negócio.',
    price: 25,
    estimatedTime: '2-3 dias',
    included: ['Fluxo de caixa', 'Controle de despesas', 'Indicadores'],
    revisions: 2,
  },
  {
    id: 8,
    name: 'Dashboard Financeiro',
    category: 'Organização Financeira',
    description: 'Painel visual para acompanhar faturamento, metas e desempenho em tempo real.',
    price: 60,
    estimatedTime: '5-7 dias',
    included: ['Indicadores', 'Gráficos', 'Metas', 'Visão mensal'],
    revisions: 3,
  },
  {
    id: 9,
    name: 'Chatbot',
    category: 'Automação e Tecnologia',
    description: 'Assistente virtual para responder dúvidas e guiar clientes com rapidez e consistência.',
    price: 80,
    estimatedTime: '5-8 dias',
    included: ['Fluxos de atendimento', 'Respostas automáticas', 'Configuração'],
    revisions: 3,
  },
  {
    id: 10,
    name: 'Automação WhatsApp',
    category: 'Automação e Tecnologia',
    description: 'Automatize mensagens, lembretes e atendimento no WhatsApp com estrutura funcional.',
    price: 100,
    estimatedTime: '6-9 dias',
    included: ['Mensagens automáticas', 'Fluxos simples', 'Integração'],
    revisions: 3,
  },
];

const servicesByCategory: Record<string, string[]> = {
  confeitaria: ['Logo', 'Identidade Visual', 'Landing Page', 'Catálogo Digital', 'Kit Instagram', 'Planilha Financeira'],
  loja: ['Logo', 'Site Institucional', 'Catálogo Digital', 'Dashboard Financeiro', 'Automação WhatsApp'],
  servicos: ['Logo', 'Landing Page', 'Kit Instagram', 'Chatbot', 'Planilha Financeira'],
  restaurante: ['Logo', 'Identidade Visual', 'Catálogo Digital', 'Site Institucional', 'Automação WhatsApp'],
};

const steps = [
  { number: '01', title: 'Escolha', text: 'Escolha as soluções que sua empresa precisa.' },
  { number: '02', title: 'Simule', text: 'Monte seu pedido e veja o valor em tempo real.' },
  { number: '03', title: 'Peça', text: 'Pague o sinal e acompanhe o desenvolvimento.' },
  { number: '04', title: 'Aprove', text: 'Revise a prévia, solicite alterações ou aprove o projeto.' },
];

const defaultMessages = [
  {
    sender: 'bot',
    text: 'Olá! Sou a PedeTech AI. Posso recomendar soluções para sua empresa e ajudar a montar seu pedido.',
  },
  {
    sender: 'user',
    text: 'Tenho uma pequena confeitaria e ainda não tenho nada.',
  },
  {
    sender: 'bot',
    text: 'Para começar, recomendo uma identidade visual, um catálogo digital e um kit para Instagram. Se você pretende receber pedidos online, também podemos adicionar uma landing page.',
  },
];

const answersConfig = [
  { key: 'type', label: 'Qual é o seu tipo de negócio?', options: ['Confeitaria', 'Loja de roupas', 'Consultoria', 'Restaurante', 'Outro'] },
  { key: 'logo', label: 'Sua empresa já possui logo?', options: ['Sim', 'Não'] },
  { key: 'identity', label: 'Já possui identidade visual?', options: ['Sim', 'Não'] },
  { key: 'website', label: 'Possui site?', options: ['Sim', 'Não'] },
  { key: 'sell', label: 'Pretende vender pela internet?', options: ['Sim', 'Não'] },
  { key: 'social', label: 'Utiliza redes sociais?', options: ['Sim', 'Não'] },
  { key: 'finance', label: 'Precisa organizar as finanças?', options: ['Sim', 'Não'] },
  { key: 'automation', label: 'Precisa automatizar atendimento?', options: ['Sim', 'Não'] },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [cart, setCart] = useState<Record<number, number>>({ 1: 1, 5: 1 });
  const [answers, setAnswers] = useState<Record<string, string>>({
    type: 'Confeitaria',
    logo: 'Não',
    identity: 'Não',
    website: 'Não',
    sell: 'Sim',
    social: 'Sim',
    finance: 'Sim',
    automation: 'Não',
  });
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [customer, setCustomer] = useState({
    name: 'Maria Souza',
    email: 'maria@doceria.com',
    phone: '+351 912 345 678',
    company: 'Doceria Flor de Açúcar',
  });
  const [chatMessages, setChatMessages] = useState(defaultMessages);
  const [chatInput, setChatInput] = useState('');
  const [changeRequest, setChangeRequest] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [accessMode, setAccessMode] = useState<AccessMode>('client');
  const [catalogServices, setCatalogServices] = useState<Service[]>(services);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState('maria@doceria.com');
  const [authPassword, setAuthPassword] = useState('');
  const [authUser, setAuthUser] = useState<{ id: string; email?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([]);

  useEffect(() => {
    let ignore = false;

    async function loadServices() {
      try {
        const { data, error } = await supabase.from('services').select('*');
        if (error) throw error;

        if (!ignore && data && data.length > 0) {
          const mapped = data.map((item: Record<string, unknown>, index: number) => ({
            id: index + 1,
            name: String(item.name ?? `Serviço ${index + 1}`),
            category: String(item.category ?? 'Presença Digital'),
            description: String(item.description ?? 'Solução da plataforma PedeTech.'),
            price: Number(item.price ?? 0),
            estimatedTime: String(item.estimated_time ?? '3-5 dias'),
            included: ['Entrega do projeto', 'Checklist de implementação'],
            revisions: 2,
          }));
          setCatalogServices(mapped);
        }
      } catch {
        setCatalogServices(services);
      } finally {
        if (!ignore) setServicesLoading(false);
      }
    }

    loadServices();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!ignore && data.session?.user) {
        setAuthUser({ id: data.session.user.id, email: data.session.user.email });
        setAuthEmail(data.session.user.email ?? '');
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser({ id: session.user.id, email: session.user.email });
        setAuthEmail(session.user.email ?? '');
      } else {
        setAuthUser(null);
      }
    });

    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return catalogServices;
    const lookup = {
      brand: 'Identidade Visual',
      digital: 'Presença Digital',
      marketing: 'Marketing',
      finance: 'Organização Financeira',
      automation: 'Automação e Tecnologia',
    };
    return catalogServices.filter((service) => service.category === lookup[selectedCategory as keyof typeof lookup]);
  }, [catalogServices, selectedCategory]);

  const subtotal = useMemo(() => {
    return Object.entries(cart).reduce((total, [serviceId, quantity]) => {
      const service = catalogServices.find((item) => item.id === Number(serviceId));
      return total + (service ? service.price * quantity : 0);
    }, 0);
  }, [cart, catalogServices]);

  const discount = subtotal >= 250 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;
  const deposit = 50;
  const remaining = Math.max(total - deposit, 0);

  const recommendedServices = useMemo(() => {
    const businessType = (answers.type || '').toLowerCase();
    const matches = servicesByCategory[businessType] ?? servicesByCategory.confeitaria;
    return catalogServices.filter((service) => matches.includes(service.name));
  }, [answers.type, catalogServices]);

  const addService = (serviceId: number) => {
    setCart((current) => ({
      ...current,
      [serviceId]: (current[serviceId] ?? 0) + 1,
    }));
  };

  const removeService = (serviceId: number) => {
    setCart((current) => {
      const next = { ...current };
      if (!next[serviceId]) return current;
      if (next[serviceId] === 1) {
        delete next[serviceId];
      } else {
        next[serviceId] = next[serviceId] - 1;
      }
      return next;
    });
  };

  const addRecommended = (serviceName: string) => {
    const match = catalogServices.find((item) => item.name === serviceName);
    if (match) addService(match.id);
  };

  const handleSuggestion = () => {
    setChatMessages((current) => [
      ...current,
      { sender: 'user', text: chatInput || 'Quero montar um pedido com foco em crescimento.' },
      {
        sender: 'bot',
        text: 'Para o seu negócio, recomendo começar com uma identidade visual e uma presença digital clara. Depois, você pode complementar com marketing e organização financeira conforme crescer.',
      },
    ]);
    setChatInput('');
  };

  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    if (error) {
      setAuthMessage('Não foi possível entrar. Verifique o e-mail e a senha no Supabase.');
    } else if (data.user) {
      setAuthUser({ id: data.user.id, email: data.user.email });
      setAuthMessage(accessMode === 'admin' ? 'Sessão administrativa iniciada.' : 'Sessão do cliente iniciada.');
      if (accessMode === 'admin') loadAdminOrders();
    }

    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthMessage('Sessão encerrada.');
    setAdminOrders([]);
  };

  const loadAdminOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, total, deposit, status, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAdminOrders(data as AdminOrder[]);
    }
  };

  const handleCreateOrder = async () => {
    setOrderMessage('');

    if (!authUser) {
      setAccessMode('client');
      setOrderMessage('Entre na sua conta antes de confirmar o pedido.');
      return;
    }

    const { error: userError } = await supabase.from('users').upsert({
      id: authUser.id,
      name: customer.name,
      email: customer.email || authUser.email,
      phone: customer.phone,
      company: customer.company,
    });

    if (userError) {
      setOrderMessage('Não foi possível salvar seus dados. Confira as tabelas do Supabase.');
      return;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: authUser.id,
        total,
        deposit,
        remaining,
        status: 'aguardando_pagamento',
      })
      .select('id')
      .single();

    if (orderError || !order) {
      setOrderMessage('Não foi possível criar o pedido. Tente novamente.');
      return;
    }

    const { error: itemsError } = await supabase.from('order_items').insert(
      cartItems.map((item) => ({
        order_id: order.id,
        price: item.price,
        quantity: cart[item.id],
      })),
    );

    if (itemsError) {
      setOrderMessage('Pedido criado, mas os itens precisam ser revisados no painel.');
      return;
    }

    setOrderMessage(`Pedido ${order.id.slice(0, 8)} criado com sucesso.`);
    setCheckoutStep(3);
  };

  const cartItems = catalogServices.filter((service) => cart[service.id]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900/70 shadow-[0_0_35px_rgba(34,211,238,0.2)]">
              <Image src="/logo-pedetech.png" alt="PedeTech logo" width={120} height={120} className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">PedeTech</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Pediu. Estruturou. Cresceu.</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#como-funciona">Como funciona</a>
            <a href="#solucoes">Soluções</a>
            <a href="#simulador">Simulador</a>
            <a href="#cliente">Área do cliente</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAccessMode('client')}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200"
            >
              Entrar
            </button>
            <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">Monte seu pedido</button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setAccessMode('client')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                accessMode === 'client'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'border border-white/10 bg-slate-950 text-slate-200'
              }`}
            >
              Área do cliente
            </button>
            <button
              onClick={() => setAccessMode('admin')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                accessMode === 'admin'
                  ? 'bg-emerald-400 text-slate-950'
                  : 'border border-white/10 bg-slate-950 text-slate-200'
              }`}
            >
              Admin PedeTech
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {accessMode === 'client' ? 'Login do cliente' : 'Login administrativo'}
              </p>
              <div className="mt-4 space-y-3">
                <input value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="seu@email.com" type="email" className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
                <input value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="Senha" type="password" className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
                <button onClick={handleAuth} disabled={authLoading || !authEmail || !authPassword} className="w-full rounded-full bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
                  {authLoading ? 'Entrando...' : accessMode === 'client' ? 'Entrar como cliente' : 'Entrar como admin'}
                </button>
                {authUser ? <button onClick={handleSignOut} className="w-full rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Sair ({authUser.email})</button> : null}
                {authMessage ? <p className="text-sm text-cyan-200">{authMessage}</p> : null}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fluxo atual</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-xl border border-white/10 bg-slate-900 p-3">
                  {accessMode === 'client'
                    ? 'Cliente: visualiza projeto, paga sinal e acompanha produção.'
                    : 'Admin: acompanha pedidos, status, pagamentos e aprovação.'}
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900 p-3">
                  {servicesLoading ? 'Carregando catálogo do Supabase...' : 'Catálogo disponível com fallback local ativo.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),transparent_30%),radial-gradient(circle_at_right,_rgba(52,211,153,0.18),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-2 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                <Image src="/logo-pedetech.png" alt="PedeTech logo" width={160} height={160} className="h-full w-full object-contain" />
              </div>
              <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
                Marketplace de soluções empresariais
              </span>
            </div>
            <h1 className="mt-6 max-w-xl text-5xl font-black tracking-tight text-white md:text-6xl">
              Pediu. <span className="text-cyan-300">Estruturou.</span> Cresceu.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Tudo o que sua empresa precisa para começar, organizar e crescer em um só pedido.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition hover:-translate-y-0.5">
                Monte seu pedido
              </button>
              <button className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                Conheça nossas soluções
              </button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-300">
              <div><span className="font-bold text-white">2.3k</span> pedidos</div>
              <div><span className="font-bold text-white">4.9/5</span> avaliação</div>
              <div><span className="font-bold text-white">72h</span> média de onboarding</div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
              <div className="rounded-[28px] border border-white/10 bg-slate-900 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Seu pedido</p>
                    <p className="mt-2 text-xl font-bold text-white">Carrinho de soluções</p>
                  </div>
                  <div className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">Disponível</div>
                </div>

                <div className="space-y-3">
                  {cartItems.length ? cartItems.map((service) => (
                    <div key={service.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-lg">
                          {service.category === 'Identidade Visual' ? '🎨' : service.category === 'Marketing' ? '📱' : service.category === 'Organização Financeira' ? '💰' : service.category === 'Automação e Tecnologia' ? '🤖' : '💻'}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{service.name}</p>
                          <p className="text-xs text-slate-400">{service.estimatedTime}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-cyan-300">{formatCurrency(service.price)}</p>
                        <p className="text-xs text-slate-400">x{cart[service.id]}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-slate-800/50 p-6 text-center text-sm text-slate-400">
                      Ainda não há serviços no pedido.
                    </div>
                  )}
                </div>

                <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>Desconto</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-2 text-base font-bold text-white">
                    <span>Total do projeto</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Como funciona</p>
          <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Montar um projeto nunca foi tão simples</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-lg font-black text-cyan-300">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-3 text-slate-300">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="solucoes" className="bg-slate-900/80 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">Categorias de soluções</p>
              <h2 className="mt-3 text-3xl font-black text-white">Tudo que sua empresa precisa em um mesmo marketplace</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    selectedCategory === category.id
                      ? 'border-cyan-300 bg-cyan-400/10 text-cyan-200'
                      : 'border-white/10 bg-slate-950 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.length ? filteredServices.map((service) => (
              <article key={service.id} className="group rounded-[28px] border border-white/10 bg-slate-950 p-5 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-950/90">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">{service.category}</p>
                    <h3 className="mt-2 text-2xl font-bold text-white">{service.name}</h3>
                  </div>
                  {service.badge ? (
                    <span className="rounded-full bg-amber-400/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                      {service.badge}
                    </span>
                  ) : null}
                </div>

                <p className="text-sm leading-7 text-slate-300">{service.description}</p>

                <div className="mt-5 space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between"><span>Prazo</span><strong className="text-white">{service.estimatedTime}</strong></div>
                  <div className="flex justify-between"><span>Revisões</span><strong className="text-white">{service.revisions}</strong></div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <p className="text-sm text-slate-400">A partir de</p>
                    <p className="text-2xl font-black text-cyan-300">{formatCurrency(service.price)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveService(service);
                        setModalOpen(true);
                      }}
                      className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                    >
                      Detalhes
                    </button>
                    <button
                      onClick={() => addService(service.id)}
                      className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/50 p-8 text-center text-slate-400 md:col-span-2 xl:col-span-3">
                Nenhum serviço disponível nesta categoria.
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="simulador" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-slate-900 p-6 md:p-10">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Simulador inteligente</p>
              <h2 className="mt-3 text-3xl font-black text-white">Monte seu projeto</h2>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              Soluções recomendadas para sua empresa
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-5">
              {answersConfig.map((question) => (
                <div key={question.key} className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                  <label className="mb-3 block text-sm font-medium text-slate-200">{question.label}</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {question.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => setAnswers((current) => ({ ...current, [question.key]: option }))}
                        className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                          answers[question.key] === option
                            ? 'border-cyan-300 bg-cyan-400/10 text-cyan-200'
                            : 'border-white/10 bg-slate-900 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/8 to-emerald-500/8 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Sua recomendação</p>
              <h3 className="mt-4 text-2xl font-black text-white">{answers.type || 'Confeitaria'} começando do zero</h3>
              <div className="mt-5 space-y-3">
                {recommendedServices.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                    <span className="text-slate-200">{item.name}</span>
                    <button onClick={() => addRecommended(item.name)} className="rounded-full bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950">
                      Adicionar
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => recommendedServices.forEach((item) => addRecommended(item.name))} className="flex-1 rounded-full bg-cyan-400 px-4 py-3 font-semibold text-slate-950">
                  Adicionar tudo
                </button>
                <button className="rounded-full border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-200">
                  Selecionar individualmente
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="rounded-[28px] border border-white/10 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Seu pedido</p>
                <h3 className="mt-2 text-2xl font-black text-white">Resumo do projeto</h3>
              </div>
            </div>
            <div className="space-y-3">
              {cartItems.length ? cartItems.map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950 p-3">
                  <div>
                    <p className="font-semibold text-white">{service.name}</p>
                    <p className="text-xs text-slate-400">Qtd: {cart[service.id]} • {formatCurrency(service.price)}</p>
                  </div>
                  <button onClick={() => removeService(service.id)} className="text-sm text-rose-300">Remover</button>
                </div>
              )) : <p className="text-slate-400">Nenhum serviço adicionado.</p>}
            </div>

            <div className="mt-6 space-y-2 rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm text-slate-300">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>Desconto</span><span>-{formatCurrency(discount)}</span></div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-base font-bold text-white"><span>Total do projeto</span><span>{formatCurrency(total)}</span></div>
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <p className="text-sm text-slate-300">Para iniciar</p>
              <p className="mt-1 text-3xl font-black text-cyan-300">{formatCurrency(deposit)}</p>
              <p className="mt-2 text-sm text-slate-300">Após aprovação: {formatCurrency(remaining)}</p>
            </div>

            <button className="mt-6 w-full rounded-full bg-cyan-400 px-4 py-3 font-semibold text-slate-950">
              Continuar para pagamento
            </button>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-900 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Fluxo de pagamento</p>
            <h3 className="mt-3 text-3xl font-black text-white">Checkout demonstrativo</h3>

            <div className="mt-6 flex items-center gap-3 text-sm text-slate-300">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === checkoutStep ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                    {step}
                  </div>
                  {step < 3 ? <div className="h-px w-8 bg-white/10" /> : null}
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-6 rounded-2xl border border-white/10 bg-slate-950 p-5">
              {checkoutStep === 1 && (
                <div>
                  <h4 className="mb-4 text-lg font-bold text-white">1. Resumo</h4>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm text-slate-300">
                        <span>{item.name}</span>
                        <span>{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 border-t border-white/10 pt-4 text-sm text-slate-300">
                    <div className="flex justify-between"><span>Total</span><span>{formatCurrency(total)}</span></div>
                    <div className="flex justify-between"><span>Sinal</span><span>{formatCurrency(deposit)}</span></div>
                  </div>
                </div>
              )}

              {checkoutStep === 2 && (
                <div>
                  <h4 className="mb-4 text-lg font-bold text-white">2. Dados do cliente</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm text-slate-300">Nome<input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white" /></label>
                    <label className="text-sm text-slate-300">E-mail<input value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white" /></label>
                    <label className="text-sm text-slate-300">Telefone<input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white" /></label>
                    <label className="text-sm text-slate-300">Nome da empresa<input value={customer.company} onChange={(e) => setCustomer({ ...customer, company: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white" /></label>
                  </div>
                </div>
              )}

              {checkoutStep === 3 && (
                <div>
                  <h4 className="mb-4 text-lg font-bold text-white">3. Pagamento</h4>
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-4">
                    <div className="flex justify-between text-sm text-slate-300"><span>Total do projeto</span><span>{formatCurrency(total)}</span></div>
                    <div className="mt-2 flex justify-between text-sm text-slate-300"><span>Sinal para iniciar</span><span>{formatCurrency(deposit)}</span></div>
                    <div className="mt-2 flex justify-between text-sm text-slate-300"><span>Restante após aprovação</span><span>{formatCurrency(remaining)}</span></div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900 p-4">
                    <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Pagamento demonstrativo</div>
                    <div className="rounded-xl border border-dashed border-white/10 bg-slate-950 p-3 text-sm text-slate-200">Cartão •••• 4242</div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between gap-3">
              <button onClick={() => setCheckoutStep((value) => Math.max(value - 1, 1))} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Voltar</button>
              <button
                onClick={() => checkoutStep < 3 ? setCheckoutStep((value) => value + 1) : handleCreateOrder()}
                className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                {checkoutStep < 3 ? 'Continuar' : 'Pagar sinal'}
              </button>
            </div>
            {orderMessage ? <p className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-sm text-cyan-200">{orderMessage}</p> : null}
          </div>
        </div>
      </section>

      <section id="cliente" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-slate-900 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Área do cliente</p>
              <h2 className="mt-3 text-3xl font-black text-white">Olá, Maria</h2>
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200">Status: Em produção</div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-4">
            {[
              { label: 'Projeto', value: 'Doceria Flor de Açúcar' },
              { label: 'Status', value: 'Em produção' },
              { label: 'Valor total', value: formatCurrency(total) },
              { label: 'Pago', value: formatCurrency(deposit) },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-3 text-lg font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950 p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Timeline do projeto</h3>
              <span className="text-sm text-cyan-300">Pendente: {formatCurrency(remaining)}</span>
            </div>
            <div className="space-y-4">
              {[
                'Pedido realizado',
                'Sinal pago',
                'Em produção',
                'Prévia disponível',
                'Aprovação',
                'Pagamento final',
                'Projeto concluído',
              ].map((item, index) => {
                const active = item === 'Em produção';
                const done = index <= 1 || item === 'Em produção';
                return (
                  <div key={item} className="flex items-center gap-4">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-cyan-400 text-slate-950' : active ? 'border border-cyan-400 bg-cyan-500/10 text-cyan-200' : 'border border-white/10 text-slate-500'}`}>
                      {done ? '✓' : active ? '●' : '○'}
                    </div>
                    <span className={done ? 'text-white' : 'text-slate-400'}>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-[26px] border border-emerald-400/25 bg-emerald-500/5 p-5">
            <p className="text-xl font-black text-white">Sua prévia está pronta!</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-full bg-emerald-400 px-4 py-2 font-semibold text-slate-950">Visualizar prévia</button>
              <button className="rounded-full border border-white/10 bg-slate-950 px-4 py-2 font-semibold text-white">Solicitar alteração</button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <p className="font-semibold text-white">Você aprova este projeto?</p>
                <div className="mt-4 flex gap-3">
                  <button className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950">✓ Aprovar</button>
                  <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">↻ Solicitar alteração</button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <p className="font-semibold text-white">Descreva o que você gostaria de alterar.</p>
                <textarea value={changeRequest} onChange={(e) => setChangeRequest(e.target.value)} className="mt-3 h-24 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-white" placeholder="Ex: Gostaria de adicionar mais fotos e deixar o texto mais comercial..." />
                <button className="mt-3 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">Salvar solicitação</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900/80 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">Admin PedeTech</p>
              <h2 className="mt-3 text-3xl font-black text-white">Dashboard administrativo</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {[
              ['Total de pedidos', '184'],
              ['Pedidos novos', '26'],
              ['Em produção', '42'],
              ['Aguardando aprovação', '12'],
              ['Receita', '€18.4k'],
              ['Valores pendentes', '€6.2k'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-3 text-2xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-white/10 bg-slate-950 p-5">
              <h3 className="text-xl font-bold text-white">Serviços mais vendidos</h3>
              <div className="mt-4 space-y-3">
                {['Logo', 'Site Institucional', 'Automação WhatsApp', 'Dashboard Financeiro', 'Kit Instagram'].map((service, index) => (
                  <div key={service} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-300">#{index + 1}</div>
                      <span className="text-slate-200">{service}</span>
                    </div>
                    <span className="text-sm text-slate-400">{24 - index * 4} vendas</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950 p-5">
              <h3 className="text-xl font-bold text-white">Gerenciamento</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-3">Serviços: criar, editar, excluir, ativar/desativar</div>
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-3">Pedidos: visualizar, alterar status, consultar histórico</div>
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-3">Clientes: nome, empresa, e-mail, pedidos e status</div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-white">Pedidos recentes</h3>
              <button onClick={loadAdminOrders} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Atualizar</button>
            </div>
            {adminOrders.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    <tr><th className="pb-3">Pedido</th><th className="pb-3">Data</th><th className="pb-3">Total</th><th className="pb-3">Status</th></tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {adminOrders.map((order) => (
                      <tr key={order.id} className="border-t border-white/10">
                        <td className="py-3 font-mono text-xs text-cyan-200">{order.id.slice(0, 8)}</td>
                        <td className="py-3">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3">{formatCurrency(Number(order.total))}</td>
                        <td className="py-3">{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="mt-4 text-sm text-slate-400">Entre como admin para carregar pedidos do Supabase.</p>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-slate-900 p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">PedeTech AI</p>
              <h2 className="mt-3 text-3xl font-black text-white">Consultor virtual</h2>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Online</div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950 p-4">
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <div key={`${message.sender}-${index}`} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    message.sender === 'user' ? 'bg-cyan-400 text-slate-950' : 'border border-white/10 bg-slate-900 text-slate-200'
                  }`}>
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pergunte à IA sobre seu negócio..."
                className="flex-1 rounded-full border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              />
              <button onClick={handleSuggestion} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">Enviar</button>
            </div>
          </div>
        </div>
      </section>

      {modalOpen && activeService ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-900 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{activeService.category}</p>
                <h3 className="mt-2 text-3xl font-black text-white">{activeService.name}</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-300">Fechar</button>
            </div>

            <p className="mt-5 text-slate-300">{activeService.description}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Prazo estimado</p><p className="mt-2 text-lg font-bold text-white">{activeService.estimatedTime}</p></div>
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Revisões</p><p className="mt-2 text-lg font-bold text-white">{activeService.revisions}</p></div>
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Preço</p><p className="mt-2 text-lg font-bold text-cyan-300">{formatCurrency(activeService.price)}</p></div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">O que está incluído</p>
              <ul className="mt-3 space-y-2 text-slate-300">
                {activeService.included.map((item) => (
                  <li key={item} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-400" />{item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => { addService(activeService.id); setModalOpen(false); }} className="rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Adicionar ao pedido</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
