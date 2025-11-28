export type CategoriaTecnico = "Rastreador" | "Informatica";

export type Registration = {
  name: string;
  email: string;
  cpf: string;
  rg: string;
  birthDate: string;
  phoneNumber: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  category: CategoriaTecnico;
  itRate3h?: number;
  itAdditionalHour?: number;
  itDaily?: number;
  itMileage?: number;
  trackerMileage?: number;
  trackerInstallationRate?: number;
};

export type Empresa = {
  name: string;
  cnpj: string;
  contact?: string;
  contactNumber?: string;
  responsaveis?: { nome: string; numero: string }[];
  documentos?: { nome: string; url: string }[];
  paymentDate?: string;
  trackerEnabled?: boolean;
  valores?: {
    itRate3h?: number;
    itHalfDaily?: number;
    itDaily?: number;
    itAdditionalHour?: number;
    itMileage?: number;
    trackerInstallationRate?: number;
    itToleranceMinutes?: number;
  };
  itRate3h?: number;
  itHalfDaily?: number;
  itDaily?: number;
  itAdditionalHour?: number;
  itMileage?: number;
  trackerInstallationRate?: number;
  itToleranceMinutes?: number;
};
