export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

export enum TransactionSource {
  MANUAL = 'MANUAL',
  CREDIT_CARD_CSV = 'CREDIT_CARD_CSV',
}

export enum StandardCategoryKey {
  CUSTOS_FIXOS = 'CUSTOS_FIXOS',
  CONFORTO = 'CONFORTO',
  METAS = 'METAS',
  PRAZERES = 'PRAZERES',
  INVESTIMENTOS = 'INVESTIMENTOS',
  CONHECIMENTO = 'CONHECIMENTO',
}

export enum WorkspaceType {
  BUDGET = 'BUDGET',
  CUMULATIVE = 'CUMULATIVE',
}

export enum WorkspaceMemberRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
}

export enum WorkspaceInviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
}
