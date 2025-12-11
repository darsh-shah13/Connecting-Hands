import apiClient from '@/services/apiClient';

export interface UserResponse {
  id: string;
  display_name: string;
  created_at: string;
}

export interface SessionResponse {
  id: string;
  share_code: string;
  inviter_user_id: string;
  partner_user_id: string | null;
  created_at: string;
  paired_at: string | null;
}

export interface HandModelResponse {
  id: string;
  session_id: string;
  owner_user_id: string;
  storage_key: string;
  file_size_bytes: number;
  content_type: string;
  created_at: string;
  retrieved_at: string | null;
  confirmed_at: string | null;
  download_url: string | null;
}

export interface PollResponse {
  session: SessionResponse;
  latest_model: HandModelResponse | null;
  has_new_model: boolean;
}

export const sharingApi = {
  async createUser(displayName: string): Promise<UserResponse> {
    const { data } = await apiClient.post<UserResponse>('/users', {
      display_name: displayName,
    });
    return data;
  },

  async createSession(inviterUserId: string): Promise<SessionResponse> {
    const { data } = await apiClient.post<SessionResponse>('/sessions', {
      inviter_user_id: inviterUserId,
    });
    return data;
  },

  async joinSession(shareCode: string, partnerUserId: string): Promise<SessionResponse> {
    const { data } = await apiClient.post<SessionResponse>('/sessions/join', {
      share_code: shareCode,
      partner_user_id: partnerUserId,
    });
    return data;
  },

  async uploadModelBase64(sessionId: string, ownerUserId: string, glbBase64: string) {
    const { data } = await apiClient.post<HandModelResponse>(
      `/sessions/${sessionId}/hand-models/base64`,
      {
        owner_user_id: ownerUserId,
        glb_base64: glbBase64,
      }
    );
    return data;
  },

  async pollSession(sessionId: string, afterHandModelId?: string | null): Promise<PollResponse> {
    const { data } = await apiClient.get<PollResponse>(`/sessions/${sessionId}/poll`, {
      params: {
        after_hand_model_id: afterHandModelId ?? undefined,
      },
    });
    return data;
  },

  async getHandModel(
    handModelId: string,
    viewerUserId?: string | null
  ): Promise<HandModelResponse> {
    const { data } = await apiClient.get<HandModelResponse>(`/hand-models/${handModelId}`, {
      params: {
        viewer_user_id: viewerUserId ?? undefined,
      },
    });
    return data;
  },

  async confirmDelivery(handModelId: string, partnerUserId: string): Promise<HandModelResponse> {
    const form = new FormData();
    form.append('partner_user_id', partnerUserId);

    const { data } = await apiClient.post<HandModelResponse>(
      `/hand-models/${handModelId}/confirm`,
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data;
  },
};
