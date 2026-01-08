// Clinical Visit Summary Types

export interface Patient {
    _id: string;
    name: string;
    email: string;
    dateOfBirth?: string;
    lastVisit?: string;
    totalVisits: number;
}

export interface Doctor {
    _id: string;
    name: string;
    email: string;
    specialty?: string;
}

export interface Visit {
    _id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    visitDate: string;
    summary: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVisitData {
    patientId: string;
    visitDate: string;
    summary: string;
}

export interface AISearchResult {
    visitId: string;
    visitDate: string;
    doctorName: string;
    patientName: string;
    snippet: string;
    relevanceScore: number;
}

export interface VisitListResponse {
    success: boolean;
    data: {
        visits: Visit[];
        total: number;
    };
}

export interface PatientListResponse {
    success: boolean;
    data: {
        patients: Patient[];
        total: number;
    };
}

export interface VisitDetailResponse {
    success: boolean;
    data: {
        visit: Visit;
    };
}

export interface AISearchResponse {
    success: boolean;
    data: {
        results: AISearchResult[];
        query: string;
    };
}
