export type ViaCEPResponse = {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
};

export async function fetchCEP(cep: string): Promise<ViaCEPResponse | null> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;
  const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
  if (!res.ok) return null;
  const data = (await res.json()) as ViaCEPResponse;
  if (data.erro) return null;
  return data;
}
