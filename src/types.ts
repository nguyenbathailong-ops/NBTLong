export interface InteractiveNote {
  id: string;
  keyword: string;
  imageUrl: string;
}

export interface SurgicalTemplate {
  id: string;
  procedureName: string;
  surgeon: string;
  icd10: string;
  preOpDiagnosis: string;
  postOpDiagnosis: string;
  findings: string;
  description: string;
  interactiveNotes?: InteractiveNote[];
  lastUsed?: number;
  createdAt: number;
}
