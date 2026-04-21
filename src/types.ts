export interface InteractiveNote {
  id: string;
  keyword: string;
  imageUrl: string;
}

export interface SurgicalTemplate {
  id: string;
  procedureName: string;
  diagnosis: string;
  description: string;
  interactiveNotes?: InteractiveNote[];
  lastUsed?: number;
  userId: string;
  createdAt: number;
}
